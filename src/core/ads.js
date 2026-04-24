window.CubePathAds = {
    ysdk: null,
    initialized: false,
    initPromise: null,
    isShowingAd: false,
    readySignaled: false,
    gameplayActive: false,
    gameInstance: null,
    lifecycleBound: false,
    sdkMissingWarned: false,
    interstitialCooldownMs: 70000,
    lastInterstitialAt: 0,

    setGameInstance(game) {
        this.gameInstance = game || null;
    },

    getActiveScenes() {
        const sceneManager = this.gameInstance?.scene;

        if (!sceneManager || typeof sceneManager.getScenes !== 'function') {
            return [];
        }

        try {
            return sceneManager.getScenes(true) || [];
        } catch (_error) {
            return [];
        }
    },

    notifyActiveScenes(handlerName) {
        const scenes = this.getActiveScenes();

        for (const scene of scenes) {
            const handler = scene?.[handlerName];
            if (typeof handler !== 'function') continue;

            try {
                handler.call(scene);
            } catch (error) {
                console.warn(`[Ads] Scene lifecycle handler failed: ${handlerName}`, error);
            }
        }
    },

    bindPlatformLifecycle() {
        if (this.lifecycleBound || !this.ysdk || typeof this.ysdk.on !== 'function') {
            return;
        }

        this.lifecycleBound = true;

        this.ysdk.on('game_api_pause', () => {
            this.gameplayStop();

            if (!this.isShowingAd) {
                this.notifyActiveScenes('onYandexPause');
            }
        });

        this.ysdk.on('game_api_resume', () => {
            if (!this.isShowingAd) {
                this.notifyActiveScenes('onYandexResume');
            }
        });
    },

    init() {
        if (this.ysdk) {
            return Promise.resolve(this.ysdk);
        }

        if (this.initPromise) {
            return this.initPromise;
        }

        if (typeof window.YaGames === 'undefined') {
            if (!this.sdkMissingWarned) {
                console.log('[Ads] YaGames SDK not found, using local stub');
                this.sdkMissingWarned = true;
            }
            this.initialized = false;
            return Promise.resolve(null);
        }

        this.initPromise = window.YaGames.init()
            .then((ysdk) => {
                this.ysdk = ysdk;
                this.initialized = true;
                this.bindPlatformLifecycle();
                console.log('[Ads] Yandex SDK initialized');
                return ysdk;
            })
            .catch((err) => {
                console.warn('[Ads] Yandex SDK init failed', err);
                this.ysdk = null;
                this.initialized = false;
                return null;
            })
            .finally(() => {
                this.initPromise = null;
            });

        return this.initPromise;
    },

    async signalReady() {
        if (this.readySignaled) return true;

        const ysdk = await this.init();

        if (ysdk?.features?.LoadingAPI?.ready) {
            try {
                await ysdk.features.LoadingAPI.ready();
            } catch (error) {
                console.warn('[Ads] LoadingAPI.ready failed', error);
            }
        }

        this.readySignaled = true;
        return true;
    },

    async gameplayStart() {
        if (this.gameplayActive) return true;

        const ysdk = await this.init();

        if (ysdk?.features?.GameplayAPI?.start) {
            try {
                ysdk.features.GameplayAPI.start();
            } catch (error) {
                console.warn('[Ads] GameplayAPI.start failed', error);
            }
        }

        this.gameplayActive = true;
        return true;
    },

    async gameplayStop() {
        if (!this.gameplayActive) return true;

        const ysdk = await this.init();

        if (ysdk?.features?.GameplayAPI?.stop) {
            try {
                ysdk.features.GameplayAPI.stop();
            } catch (error) {
                console.warn('[Ads] GameplayAPI.stop failed', error);
            }
        }

        this.gameplayActive = false;
        return true;
    },

    canShowInterstitial() {
        if (this.interstitialCooldownMs <= 0) return true;
        return (Date.now() - this.lastInterstitialAt) >= this.interstitialCooldownMs;
    },

    markInterstitialShown() {
        this.lastInterstitialAt = Date.now();
    },

    async showInterstitial(options = {}) {
        const {
            onOpen = null,
            onClose = null,
            onError = null,
            force = false
        } = options;

        if (this.isShowingAd) {
            if (onError) onError(new Error('busy'));
            return false;
        }

        if (!force && !this.canShowInterstitial()) {
            if (onClose) onClose(false);
            return false;
        }

        const ysdk = await this.init();

        if (!ysdk || !ysdk.adv || !ysdk.adv.showFullscreenAdv) {
            console.log('[Ads] Interstitial stub shown');
            this.markInterstitialShown();

            if (onOpen) onOpen();

            setTimeout(() => {
                if (onClose) onClose(true);
            }, 500);

            return true;
        }

        this.isShowingAd = true;

        try {
            ysdk.adv.showFullscreenAdv({
                callbacks: {
                    onOpen: () => {
                        this.markInterstitialShown();
                        if (onOpen) onOpen();
                    },
                    onClose: (wasShown = true) => {
                        this.isShowingAd = false;
                        if (onClose) onClose(wasShown);
                    },
                    onError: (error) => {
                        this.isShowingAd = false;
                        console.warn('[Ads] Interstitial error', error);
                        if (onError) onError(error);
                    },
                    onOffline: () => {
                        this.isShowingAd = false;
                        console.warn('[Ads] Interstitial offline');
                        if (onError) onError(new Error('offline'));
                    }
                }
            });

            return true;
        } catch (error) {
            this.isShowingAd = false;
            console.warn('[Ads] Interstitial exception', error);
            if (onError) onError(error);
            return false;
        }
    },

    async showRewarded(options = {}) {
        const {
            onOpen = null,
            onReward = null,
            onClose = null,
            onError = null
        } = options;

        if (this.isShowingAd) {
            if (onError) onError(new Error('busy'));
            return false;
        }

        const ysdk = await this.init();

        if (!ysdk || !ysdk.adv || !ysdk.adv.showRewardedVideo) {
            console.log('[Ads] Rewarded stub shown');
            if (onOpen) onOpen();

            setTimeout(() => {
                if (onReward) onReward();
                if (onClose) onClose(true);
            }, 700);

            return true;
        }

        this.isShowingAd = true;
        let rewardGranted = false;

        try {
            ysdk.adv.showRewardedVideo({
                callbacks: {
                    onOpen: () => {
                        if (onOpen) onOpen();
                    },
                    onRewarded: () => {
                        rewardGranted = true;
                        if (onReward) onReward();
                    },
                    onClose: () => {
                        this.isShowingAd = false;
                        if (onClose) onClose(rewardGranted);
                    },
                    onError: (error) => {
                        this.isShowingAd = false;
                        console.warn('[Ads] Rewarded error', error);
                        if (onError) onError(error);
                    }
                }
            });

            return true;
        } catch (error) {
            this.isShowingAd = false;
            console.warn('[Ads] Rewarded exception', error);
            if (onError) onError(error);
            return false;
        }
    }
};
