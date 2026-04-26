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
    countdownOverlayEl: null,
    interstitialCooldownMs: 70000,
    minGameplayBeforeInterstitialMs: 50000,
    lastInterstitialAt: 0,
    gameplayStartedAt: 0,
    accumulatedGameplayMs: 0,

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

    clearCountdownOverlay() {
        if (this.countdownOverlayEl?.remove) {
            this.countdownOverlayEl.remove();
        }

        this.countdownOverlayEl = null;
    },

    async showCountdown(options = {}) {
        const {
            seconds = 3,
            label = 'Реклама начнется через'
        } = options;

        if (!Number.isFinite(seconds) || seconds <= 0 || !document?.body) {
            return true;
        }

        this.clearCountdownOverlay();

        const translate = (value) => window.CubePathI18n?.translateText?.(value) || value;
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.inset = '0';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.background = 'rgba(18, 37, 58, 0.46)';
        overlay.style.backdropFilter = 'blur(4px)';
        overlay.style.zIndex = '99999';
        overlay.style.pointerEvents = 'none';

        const card = document.createElement('div');
        card.style.minWidth = '220px';
        card.style.maxWidth = 'min(88vw, 360px)';
        card.style.padding = '22px 24px 20px';
        card.style.borderRadius = '24px';
        card.style.background = 'linear-gradient(180deg, rgba(174,220,255,0.96), rgba(120,183,235,0.98))';
        card.style.border = '2px solid rgba(255,255,255,0.85)';
        card.style.boxShadow = '0 18px 50px rgba(35, 82, 127, 0.28)';
        card.style.textAlign = 'center';
        card.style.fontFamily = 'Georgia, "Times New Roman", serif';
        card.style.color = '#ffffff';

        const labelNode = document.createElement('div');
        labelNode.textContent = translate(label);
        labelNode.style.fontSize = '18px';
        labelNode.style.fontWeight = '700';
        labelNode.style.lineHeight = '1.25';
        labelNode.style.textShadow = '0 2px 8px rgba(44, 92, 141, 0.45)';

        const valueNode = document.createElement('div');
        valueNode.style.marginTop = '12px';
        valueNode.style.fontSize = '52px';
        valueNode.style.fontWeight = '700';
        valueNode.style.lineHeight = '1';
        valueNode.style.color = '#fff6d9';
        valueNode.style.textShadow = '0 3px 10px rgba(173, 124, 45, 0.35)';
        valueNode.style.transition = 'transform 180ms ease, opacity 180ms ease';

        const subtitleNode = document.createElement('div');
        subtitleNode.textContent = translate('Сейчас откроется реклама');
        subtitleNode.style.marginTop = '8px';
        subtitleNode.style.fontSize = '14px';
        subtitleNode.style.lineHeight = '1.25';
        subtitleNode.style.color = 'rgba(255,255,255,0.92)';

        card.append(labelNode, valueNode, subtitleNode);
        overlay.append(card);
        document.body.appendChild(overlay);
        this.countdownOverlayEl = overlay;

        return new Promise((resolve) => {
            let current = Math.max(1, Math.floor(seconds));

            const showValue = () => {
                valueNode.style.opacity = '0';
                valueNode.style.transform = 'scale(0.8)';

                window.setTimeout(() => {
                    valueNode.textContent = String(current);
                    valueNode.style.opacity = '1';
                    valueNode.style.transform = 'scale(1)';
                }, 30);
            };

            const step = () => {
                showValue();

                if (current <= 1) {
                    window.setTimeout(() => {
                        this.clearCountdownOverlay();
                        resolve(true);
                    }, 760);
                    return;
                }

                current -= 1;
                window.setTimeout(step, 760);
            };

            step();
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
        this.gameplayStartedAt = Date.now();
        return true;
    },

    async gameplayStop() {
        if (!this.gameplayActive) return true;

        if (this.gameplayStartedAt > 0) {
            this.accumulatedGameplayMs += Math.max(0, Date.now() - this.gameplayStartedAt);
        }

        this.gameplayActive = false;
        this.gameplayStartedAt = 0;

        const ysdk = await this.init();

        if (ysdk?.features?.GameplayAPI?.stop) {
            try {
                ysdk.features.GameplayAPI.stop();
            } catch (error) {
                console.warn('[Ads] GameplayAPI.stop failed', error);
            }
        }

        return true;
    },

    getTotalGameplayMs() {
        if (!this.gameplayActive || this.gameplayStartedAt <= 0) {
            return this.accumulatedGameplayMs;
        }

        return this.accumulatedGameplayMs + Math.max(0, Date.now() - this.gameplayStartedAt);
    },

    canShowInterstitial() {
        if (this.getTotalGameplayMs() < this.minGameplayBeforeInterstitialMs) return false;
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
            force = false,
            countdown = true,
            countdownLabel = 'Реклама начнется через'
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
        this.isShowingAd = true;

        await this.showCountdown({
            seconds: countdown ? 3 : 0,
            label: countdownLabel
        });

        if (!ysdk || !ysdk.adv || !ysdk.adv.showFullscreenAdv) {
            console.log('[Ads] Interstitial stub shown');
            this.markInterstitialShown();

            if (onOpen) onOpen();

            setTimeout(() => {
                this.isShowingAd = false;
                if (onClose) onClose(true);
            }, 500);

            return true;
        }

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
            onError = null,
            countdown = false,
            countdownLabel = 'Реклама начнется через'
        } = options;

        if (this.isShowingAd) {
            if (onError) onError(new Error('busy'));
            return false;
        }

        const ysdk = await this.init();
        this.isShowingAd = true;
        await this.showCountdown({
            seconds: countdown ? 3 : 0,
            label: countdownLabel
        });

        if (!ysdk || !ysdk.adv || !ysdk.adv.showRewardedVideo) {
            console.log('[Ads] Rewarded stub shown');
            if (onOpen) onOpen();

            setTimeout(() => {
                if (onReward) onReward();
                this.isShowingAd = false;
                if (onClose) onClose(true);
            }, 700);

            return true;
        }
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
