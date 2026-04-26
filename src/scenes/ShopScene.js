class ShopScene extends Phaser.Scene {
    constructor() {
        super('ShopScene');

        this.currentTab = 'boosts';
        this.tabNodes = [];
        this.contentNodes = [];
        this.hintText = null;
        this.currencyText = null;
        this.previewCube = null;
        this.previewSkinLabel = null;
        this.previewHatLabel = null;

        this.scrollContent = null;
        this.scrollMaskShape = null;
        this.scrollViewport = null;
        this.scrollY = 0;
        this.maxScrollY = 0;
        this.scrollSpeed = 56;
        this.scrollBarTrack = null;
        this.scrollBarThumb = null;
        this.scrollDragPointerId = null;
        this.scrollDragLastY = 0;
        this.scrollDragDistance = 0;
        this.scrollTapBlockUntil = 0;
        this.adInProgress = false;
        this.profile = null;
        this.layout = null;
    }

    create(data) {
        this.currentTab = data?.tab || 'boosts';
        this.tabNodes = [];
        this.contentNodes = [];
        this.hintText = null;
        this.currencyText = null;
        this.previewCube = null;
        this.previewSkinLabel = null;
        this.previewHatLabel = null;

        this.scrollContent = null;
        this.scrollMaskShape = null;
        this.scrollY = 0;
        this.maxScrollY = 0;
        this.scrollBarTrack = null;
        this.scrollBarThumb = null;
        this.scrollDragPointerId = null;
        this.scrollDragLastY = 0;
        this.scrollDragDistance = 0;
        this.scrollTapBlockUntil = 0;

        const { width, height } = this.scale;
        this.__cubePathResizeKey = `${width}x${height}`;
        this.profile = window.CubePathDevice?.getProfile?.(this) || {
            isMobile: false,
            isPortrait: false,
            touchTarget: 48,
            safePadding: 14
        };
        this.layout = this.getResponsiveLayout(width, height);
        CubePathAds.gameplayStop?.();
        this.cameras.main.setBackgroundColor('#9fd4ff');

        this.createBackground();
        this.createHeader();
        this.createTabs();
        this.createPreviewPanel();
        this.createScrollArea();
        this.bindSceneCleanup();
        this.bindScrollInput();
        CubePathAudio.init(this);

        this.refreshHeader();
        this.switchTab(this.currentTab);
    }

    handleResize() {
        if (!this.sys?.settings?.active) return;
        this.scene.restart({ tab: this.currentTab });
    }
    getResponsiveLayout(width, height) {
        const profile = this.profile || {
            isMobile: false,
            isPortrait: false,
            touchTarget: 48,
            safePadding: 14
        };

        if (!profile.isMobile) {
            return {
                headerTitleY: 62,
                headerTitleSize: 48,
                currencyY: 116,
                currencySize: 24,
                menuButtonX: width - 115,
                menuButtonY: 74,
                menuButtonW: 168,
                menuButtonH: 58,
                adButtonX: width - 360,
                adButtonY: 74,
                adButtonW: 240,
                adButtonH: 58,
                adButtonLabelExplicit: 'Смотреть рекламу\nза 10 кубикоинов',
                adButtonLabel: 'Смотреть рекламу\nза 10 кубикоинов',
                tabsY: 196,
                tabW: 286,
                tabH: 60,
                scrollViewport: {
                    x: 46,
                    y: 270,
                    width: 915,
                    height: 360
                },
                previewMode: 'side',
                previewX: width - 150,
                previewY: 365,
                previewW: 236,
                previewH: 220,
                previewTitleY: 282,
                previewCubeX: width - 150,
                previewCubeY: 370,
                previewCubeSize: { w: 44, h: 30, depth: 22 },
                previewSkinX: width - 150,
                previewSkinY: 438,
                previewHatX: width - 150,
                previewHatY: 468,
                previewLabelAlign: 'center',
                previewLabelOrigin: 0.5,
                catalogColumns: 3,
                catalogCardW: 270,
                catalogCardH: 185,
                catalogGapX: 35,
                catalogGapY: 35,
                cosmeticStartY: 110,
                boostColumns: 2,
                boostCardW: 420,
                boostCardH: 255,
                boostGapX: 25,
                boostStartY: 168,
                boostButtonW: 240,
                boostButtonH: 54,
                hintY: 28,
                hintSize: 14,
                scrollBarOffset: 14,
                showScrollHint: false
            };
        }

        const safe = profile.safePadding + 6;
        const isCompactPortrait = !!(profile.isPortrait && height <= 740);
        const isCompactLandscape = !!(!profile.isPortrait && height <= 430);
        const buttonGap = profile.isPortrait ? 10 : 8;
        const headerTitleY = safe + (profile.isPortrait ? (isCompactPortrait ? 16 : 18) : (isCompactLandscape ? 12 : 16));
        const currencyY = headerTitleY + (profile.isPortrait ? (isCompactPortrait ? 28 : 32) : (isCompactLandscape ? 22 : 24));
        const topButtonH = profile.isPortrait
            ? Math.max(40, Math.min(isCompactPortrait ? 46 : 50, Math.round(profile.touchTarget * 0.68)))
            : Math.max(34, Math.min(isCompactLandscape ? 38 : 46, Math.round(profile.touchTarget * 0.66)));
        const availableTopWidth = Math.max(180, width - safe * 2);
        const menuButtonW = profile.isPortrait
            ? Math.max(98, Math.min(124, Math.floor((availableTopWidth - buttonGap) * 0.34)))
            : Math.max(96, Math.min(116, Math.floor((availableTopWidth - buttonGap) * 0.4)));
        const adButtonW = Math.max(130, availableTopWidth - menuButtonW - buttonGap);
        const topButtonsY = currencyY + (profile.isPortrait ? (isCompactPortrait ? 38 : 42) : (isCompactLandscape ? 24 : 34));
        const tabH = profile.isPortrait ? (isCompactPortrait ? 48 : 52) : (isCompactLandscape ? 38 : 46);
        const tabsY = topButtonsY + topButtonH / 2 + tabH / 2 + (profile.isPortrait ? (isCompactPortrait ? 14 : 18) : (isCompactLandscape ? 10 : 18));
        const tabW = Math.floor((width - safe * 2) / 3);
        const previewMode = profile.isPortrait ? 'bottom' : 'side';
        const scrollX = safe;
        const scrollY = tabsY + tabH / 2 + (profile.isPortrait ? 16 : (isCompactLandscape ? 10 : 18));
        const previewW = previewMode === 'bottom'
            ? width - safe * 2
            : Math.min(220, Math.floor(width * 0.28));
        const scrollW = previewMode === 'bottom'
            ? width - safe * 2
            : width - safe * 2 - previewW - 18;
        const previewH = previewMode === 'bottom'
            ? (isCompactPortrait ? 82 : 92)
            : (isCompactLandscape ? 118 : 142);
        const previewY = previewMode === 'bottom'
            ? height - safe - previewH / 2
            : scrollY + previewH / 2 + 4;
        const scrollBottom = previewMode === 'bottom'
            ? previewY - previewH / 2 - 14
            : height - safe;
        const scrollH = Math.max(isCompactLandscape ? 104 : 132, scrollBottom - scrollY);
        const scrollViewport = {
            x: scrollX,
            y: scrollY,
            width: scrollW,
            height: scrollH
        };

        return {
            headerTitleY,
            headerTitleSize: profile.isPortrait ? 30 : (isCompactLandscape ? 20 : 24),
            currencyY,
            currencySize: profile.isPortrait ? 16 : (isCompactLandscape ? 12 : 15),
            menuButtonX: width - safe - menuButtonW / 2,
            menuButtonY: topButtonsY,
            menuButtonW,
            menuButtonH: topButtonH,
            adButtonX: safe + adButtonW / 2,
            adButtonY: topButtonsY,
            adButtonW,
            adButtonH: topButtonH,
            adButtonLabelExplicit: profile.isPortrait ? 'Смотреть рекламу\nза 10 кубикоинов' : 'Реклама\nза 10 кубикоинов',
            adButtonLabel: profile.isPortrait ? 'Смотреть рекламу\nза 10 кубикоинов' : 'Реклама\nза 10 кубикоинов',
            tabsY,
            tabW,
            tabH,
            scrollViewport,
            previewMode,
            previewX: previewMode === 'bottom' ? width / 2 : width - safe - previewW / 2,
            previewY,
            previewW,
            previewH,
            previewTitleY: previewMode === 'bottom' ? previewY - previewH / 2 + 16 : previewY - previewH / 2 + 20,
            previewCubeX: previewMode === 'bottom' ? width / 2 - previewW / 2 + 48 : width - safe - previewW / 2,
            previewCubeY: previewMode === 'bottom' ? previewY + 2 : previewY + 4,
            previewCubeSize: previewMode === 'bottom'
                ? (isCompactPortrait
                    ? { w: 24, h: 16, depth: 12 }
                    : { w: 28, h: 18, depth: 14 })
                : (isCompactLandscape ? { w: 30, h: 20, depth: 15 } : { w: 36, h: 24, depth: 18 }),
            previewSkinX: previewMode === 'bottom' ? width / 2 - previewW / 2 + 88 : width - safe - previewW / 2,
            previewSkinY: previewMode === 'bottom' ? previewY - 10 : previewY + 48,
            previewHatX: previewMode === 'bottom' ? width / 2 - previewW / 2 + 88 : width - safe - previewW / 2,
            previewHatY: previewMode === 'bottom' ? previewY + 12 : previewY + 72,
            previewLabelAlign: previewMode === 'bottom' ? 'left' : 'center',
            previewLabelOrigin: previewMode === 'bottom' ? 0 : 0.5,
            catalogColumns: profile.isPortrait ? 1 : 2,
            catalogCardW: profile.isPortrait ? Math.min(scrollW - 18, 292) : Math.min(Math.floor((scrollW - 18) / 2) - 8, 252),
            catalogCardH: profile.isPortrait ? (isCompactPortrait ? 164 : 174) : (isCompactLandscape ? 138 : 160),
            catalogGapX: profile.isPortrait ? 0 : 18,
            catalogGapY: profile.isPortrait ? (isCompactPortrait ? 14 : 18) : 16,
            cosmeticStartY: 28,
            boostColumns: profile.isPortrait ? 1 : 2,
            boostCardW: profile.isPortrait ? scrollW - 18 : Math.min(Math.floor((scrollW - 16) / 2), 300),
            boostCardH: profile.isPortrait ? (isCompactPortrait ? 198 : 210) : (isCompactLandscape ? 168 : 192),
            boostGapX: 16,
            boostStartY: 18,
            boostButtonW: profile.isPortrait ? Math.min(scrollW - 56, 208) : 176,
            boostButtonH: profile.isPortrait ? 44 : (isCompactLandscape ? 36 : 42),
            hintY: 18,
            hintSize: profile.isPortrait ? 13 : 11,
            scrollBarOffset: 12,
            showScrollHint: false
        };
    }
    bindSceneCleanup() {
        this.events.off('shutdown', this.cleanupSceneResources, this);
        this.events.once('shutdown', this.cleanupSceneResources, this);
    }
    cleanupSceneResources() {
        this.unbindScrollInput();

        if (this.scrollMaskShape) {
            this.scrollMaskShape.destroy();
            this.scrollMaskShape = null;
        }
    }
    makeTextStyle({
        size = 20,
        color = '#ffffff',
        stroke = '#6b8eb1',
        strokeThickness = 3,
        shadowColor = '#ffffff',
        shadowBlur = 6,
        bold = true,
        align = 'center'
    } = {}) {
        return {
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: `${size}px`,
            color,
            fontStyle: bold ? 'bold' : 'normal',
            stroke,
            strokeThickness,
            align,
            shadow: {
                offsetX: 0,
                offsetY: 2,
                color: shadowColor,
                blur: shadowBlur,
                fill: false
            }
        };
    }

    createRoundedRect(x, y, w, h, radius, fillColor, fillAlpha = 1, strokeColor = null, strokeAlpha = 1, strokeWidth = 0) {
        const g = this.add.graphics();
        g.fillStyle(fillColor, fillAlpha);
        g.fillRoundedRect(x - w / 2, y - h / 2, w, h, radius);

        if (strokeColor !== null && strokeWidth > 0) {
            g.lineStyle(strokeWidth, strokeColor, strokeAlpha);
            g.strokeRoundedRect(x - w / 2, y - h / 2, w, h, radius);
        }

        return g;
    }

    redrawRoundedRect(target, x, y, w, h, radius, fillColor, fillAlpha = 1, strokeColor = null, strokeAlpha = 1, strokeWidth = 0) {
        target.clear();
        target.fillStyle(fillColor, fillAlpha);
        target.fillRoundedRect(x - w / 2, y - h / 2, w, h, radius);

        if (strokeColor !== null && strokeWidth > 0) {
            target.lineStyle(strokeWidth, strokeColor, strokeAlpha);
            target.strokeRoundedRect(x - w / 2, y - h / 2, w, h, radius);
        }
    }

    createBackground() {
        const { width, height } = this.scale;
        const profile = this.profile || window.CubePathDevice?.getProfile?.(this) || { reducedEffects: false, isMobile: false };

        const g = this.add.graphics();

        g.fillGradientStyle(0xb9e2ff, 0xa9d7fb, 0xe8f6ff, 0xcdeaff, 1);
        g.fillRect(0, 0, width, height);

        const cubeColor = 0xffffff;
        const cubeAlpha = 0.14;

        const drawSoftCube = (cx, cy, scale = 1, animate = false) => {
            const w = 46 * scale;
            const h = 28 * scale;
            const d = 18 * scale;

            const top = [
                { x: cx, y: cy - h / 2 },
                { x: cx + w / 2, y: cy },
                { x: cx, y: cy + h / 2 },
                { x: cx - w / 2, y: cy }
            ];

            const left = [
                { x: cx - w / 2, y: cy },
                { x: cx, y: cy + h / 2 },
                { x: cx, y: cy + h / 2 + d },
                { x: cx - w / 2, y: cy + d }
            ];

            const right = [
                { x: cx + w / 2, y: cy },
                { x: cx, y: cy + h / 2 },
                { x: cx, y: cy + h / 2 + d },
                { x: cx + w / 2, y: cy + d }
            ];

            const cube = this.add.graphics();
            cube.fillStyle(cubeColor, cubeAlpha);

            cube.beginPath();
            cube.moveTo(left[0].x, left[0].y);
            for (let i = 1; i < left.length; i++) cube.lineTo(left[i].x, left[i].y);
            cube.closePath();
            cube.fillPath();

            cube.beginPath();
            cube.moveTo(right[0].x, right[0].y);
            for (let i = 1; i < right.length; i++) cube.lineTo(right[i].x, right[i].y);
            cube.closePath();
            cube.fillPath();

            cube.beginPath();
            cube.moveTo(top[0].x, top[0].y);
            for (let i = 1; i < top.length; i++) cube.lineTo(top[i].x, top[i].y);
            cube.closePath();
            cube.fillPath();

            cube.lineStyle(2, 0xffffff, cubeAlpha * 0.75);

            cube.beginPath();
            cube.moveTo(top[0].x, top[0].y);
            for (let i = 1; i < top.length; i++) cube.lineTo(top[i].x, top[i].y);
            cube.closePath();
            cube.strokePath();

            cube.beginPath();
            cube.moveTo(left[0].x, left[0].y);
            cube.lineTo(left[1].x, left[1].y);
            cube.lineTo(left[2].x, left[2].y);
            cube.lineTo(left[3].x, left[3].y);
            cube.closePath();
            cube.strokePath();

            cube.beginPath();
            cube.moveTo(right[0].x, right[0].y);
            cube.lineTo(right[1].x, right[1].y);
            cube.lineTo(right[2].x, right[2].y);
            cube.lineTo(right[3].x, right[3].y);
            cube.closePath();
            cube.strokePath();

            if (animate) {
                this.tweens.add({
                    targets: cube,
                    alpha: { from: 1, to: 0.82 },
                    duration: Phaser.Math.Between(1800, 3200),
                    yoyo: true,
                    repeat: -1
                });
            }
        };

        const stepX = 165;
        const stepY = 118;
        const animationModulo = profile.reducedEffects ? 6 : 3;

        for (let row = 0, y = -20; y < height + 80; y += stepY, row++) {
            for (let col = 0, x = -20; x < width + 80; x += stepX, col++) {
                const offsetX = ((Math.floor(y / stepY) % 2) * 52);
                const px = x + offsetX + Phaser.Math.Between(-18, 18);
                const py = y + Phaser.Math.Between(-12, 12);
                const scale = Phaser.Math.FloatBetween(0.75, 1.2);
                drawSoftCube(px, py, scale, (row + col) % animationModulo === 0);
            }
        }

        const dots = this.add.graphics();
        const dotCount = profile.reducedEffects ? 180 : 300;

        for (let i = 0; i < dotCount; i++) {
            dots.fillStyle(0xffffff, Phaser.Math.FloatBetween(0.03, 0.09));
            dots.fillCircle(
                Phaser.Math.Between(0, width),
                Phaser.Math.Between(0, height),
                Phaser.Math.Between(1, 2)
            );
        }

        this.add.rectangle(width / 2, this.layout.headerTitleY + 62, Math.max(140, width - 180), 3, 0xffffff, 0.26);
        this.add.rectangle(width / 2, this.layout.tabsY + 58, Math.max(120, width - 420), 2, 0xffffff, 0.18);
    }

    createHeader() {
        const { width } = this.scale;
        const layout = this.layout;

        const title = this.add.text(width / 2, layout.headerTitleY, 'Магазин', {
            fontSize: `${layout.headerTitleSize}px`,
            color: '#fff7ea',
            fontStyle: 'bold',
            stroke: '#b97c38',
            strokeThickness: 4,
            shadow: {
                offsetX: 0,
                offsetY: 3,
                color: '#ffffff',
                blur: 6,
                fill: false
            }
        }).setOrigin(0.5);
        this.fitTextToBox(title, Math.max(120, width - 42), 48, 18);

        this.currencyText = this.add.text(width / 2, layout.currencyY, '', {
            fontSize: `${layout.currencySize}px`,
            color: '#5e4934',
            fontStyle: 'bold',
            shadow: {
                offsetX: 0,
                offsetY: 1,
                color: '#ffffff',
                blur: 4,
                fill: false
            }
        }).setOrigin(0.5);
        this.fitTextToBox(this.currencyText, Math.max(120, width - 44), 30, 11);

        this.createTopButton(layout.menuButtonX, layout.menuButtonY, layout.menuButtonW, layout.menuButtonH, 'В меню', () => {
            this.scene.start('MenuScene');
        });

        this.createTopButton(layout.adButtonX, layout.adButtonY, layout.adButtonW, layout.adButtonH, layout.adButtonLabelExplicit || layout.adButtonLabel, () => {
            this.watchAdForCubeCoins();
        });
    }
    createScrollArea() {
        this.scrollViewport = { ...this.layout.scrollViewport };

        const v = this.scrollViewport;

        const shadow = this.createRoundedRect(v.x + v.width / 2, v.y + v.height / 2 + 5, v.width, v.height, 20, 0x6689a8, 0.10);
        const panel = this.createRoundedRect(v.x + v.width / 2, v.y + v.height / 2, v.width, v.height, 20, 0xffffff, 0.14, 0xeaf8ff, 0.65, 2);
        const gloss = this.createRoundedRect(v.x + v.width / 2, v.y + 28, v.width - 14, 40, 14, 0xffffff, 0.06);

        this.scrollContent = this.add.container(v.x, v.y);

        this.scrollMaskShape = this.make.graphics({ x: 0, y: 0, add: false });
        this.scrollMaskShape.fillStyle(0xffffff, 1);
        this.scrollMaskShape.fillRoundedRect(v.x, v.y, v.width, v.height, 20);

        const mask = this.scrollMaskShape.createGeometryMask();
        this.scrollContent.setMask(mask);

        this.scrollBarTrack = this.createRoundedRect(v.x + v.width + this.layout.scrollBarOffset, v.y + v.height / 2, 8, v.height, 8, 0xffffff, 0.18, 0xe9f8ff, 0.55, 1);

        this.scrollBarThumb = this.createRoundedRect(v.x + v.width + this.layout.scrollBarOffset, v.y + 24, 8, 64, 8, 0x7fc1ff, 0.95, 0xffffff, 0.8, 1);

        if (this.layout.showScrollHint) this.add.text(
            v.x + v.width / 2,
            v.y + v.height + this.layout.hintY,
            this.profile?.isPortrait ? 'Свайп вверх-вниз' : 'Колесо мыши / свайп',
            this.makeTextStyle({
                size: this.layout.hintSize,
                color: '#5f7891',
                stroke: '#ffffff',
                strokeThickness: 1,
                shadowColor: '#ffffff',
                shadowBlur: 3
            })
        ).setOrigin(0.5);
    }
    bindScrollInput() {
        this.unbindScrollInput();

        this.onWheelScroll = (pointer, _go, _dx, dy) => {
            if (!this.isPointerInsideScrollArea(pointer)) return;
            this.applyScroll(dy * 0.8);
        };

        this.onPointerDownScroll = (pointer) => {
            if (!this.isPointerInsideScrollArea(pointer)) return;
            this.scrollDragPointerId = pointer.id;
            this.scrollDragLastY = pointer.y;
            this.scrollDragDistance = 0;
        };

        this.onPointerMoveScroll = (pointer) => {
            if (!pointer.isDown) return;
            if (this.scrollDragPointerId !== pointer.id) return;

            const deltaY = pointer.y - this.scrollDragLastY;
            this.scrollDragLastY = pointer.y;
            this.scrollDragDistance += Math.abs(deltaY);

            if (this.scrollDragDistance < 8) return;

            this.applyScroll(-deltaY);
        };

        this.onPointerUpScroll = (pointer) => {
            if (this.scrollDragPointerId !== pointer.id) return;
            if (this.scrollDragDistance >= 8) {
                this.scrollTapBlockUntil = this.time.now + 140;
            }

            this.scrollDragPointerId = null;
            this.scrollDragLastY = 0;
            this.scrollDragDistance = 0;
        };

        this.onKeyScrollUp = () => {
            this.applyScroll(-this.scrollSpeed);
        };

        this.onKeyScrollDown = () => {
            this.applyScroll(this.scrollSpeed);
        };

        this.input.on('wheel', this.onWheelScroll);
        this.input.on('pointerdown', this.onPointerDownScroll);
        this.input.on('pointermove', this.onPointerMoveScroll);
        this.input.on('pointerup', this.onPointerUpScroll);
        this.input.keyboard.on('keydown-UP', this.onKeyScrollUp);
        this.input.keyboard.on('keydown-DOWN', this.onKeyScrollDown);
    }
    unbindScrollInput() {
        if (this.onWheelScroll) {
            this.input.off('wheel', this.onWheelScroll);
            this.onWheelScroll = null;
        }

        if (this.onPointerDownScroll) {
            this.input.off('pointerdown', this.onPointerDownScroll);
            this.onPointerDownScroll = null;
        }

        if (this.onPointerMoveScroll) {
            this.input.off('pointermove', this.onPointerMoveScroll);
            this.onPointerMoveScroll = null;
        }

        if (this.onPointerUpScroll) {
            this.input.off('pointerup', this.onPointerUpScroll);
            this.onPointerUpScroll = null;
        }

        if (this.onKeyScrollUp) {
            this.input.keyboard.off('keydown-UP', this.onKeyScrollUp);
            this.onKeyScrollUp = null;
        }

        if (this.onKeyScrollDown) {
            this.input.keyboard.off('keydown-DOWN', this.onKeyScrollDown);
            this.onKeyScrollDown = null;
        }
    }

    isPointerInsideScrollArea(pointer) {
        if (!this.scrollViewport || !pointer) return false;

        const v = this.scrollViewport;
        return (
            pointer.x >= v.x &&
            pointer.x <= v.x + v.width &&
            pointer.y >= v.y &&
            pointer.y <= v.y + v.height
        );
    }

    applyScroll(delta) {
        if (!this.scrollContent) return;
        if (this.maxScrollY <= 0) return;

        this.scrollY = Phaser.Math.Clamp(this.scrollY + delta, 0, this.maxScrollY);
        this.scrollContent.y = this.scrollViewport.y - this.scrollY;
        this.updateScrollBar();
    }

    shouldBlockScrollTap() {
        return this.time.now < this.scrollTapBlockUntil;
    }

    updateScrollMetrics(contentHeight = 0) {
        const visibleHeight = this.scrollViewport.height;
        this.maxScrollY = Math.max(0, contentHeight - visibleHeight);
        this.scrollY = Phaser.Math.Clamp(this.scrollY, 0, this.maxScrollY);

        if (this.scrollContent) {
            this.scrollContent.y = this.scrollViewport.y - this.scrollY;
        }

        this.updateScrollBar();
    }
    updateScrollBar() {
        if (!this.scrollBarTrack || !this.scrollBarThumb || !this.scrollViewport) return;

        const trackHeight = this.scrollViewport.height;

        if (this.maxScrollY <= 0) {
            this.scrollBarThumb.setVisible(false);
            return;
        }

        this.scrollBarThumb.setVisible(true);

        const thumbHeight = Phaser.Math.Clamp(
            trackHeight * (this.scrollViewport.height / (this.scrollViewport.height + this.maxScrollY)),
            52,
            trackHeight
        );

        const progress = this.maxScrollY <= 0 ? 0 : this.scrollY / this.maxScrollY;

        const x = this.scrollViewport.x + this.scrollViewport.width + this.layout.scrollBarOffset;
        const top = this.scrollViewport.y + thumbHeight / 2;
        const bottom = this.scrollViewport.y + trackHeight - thumbHeight / 2;
        const y = Phaser.Math.Linear(top, bottom, progress);

        this.redrawRoundedRect(this.scrollBarThumb, x, y, 8, thumbHeight, 8, 0x7fc1ff, 0.95, 0xffffff, 0.8, 1);
    }
    getSkinDisplayName(skinId) {
        const map = {
            classic: 'Классический',
            ruby: 'Рубин',
            mint: 'Мята',
            sky: 'Небо',
            violet: 'Фиалка',
            obsidian: 'Обсидиан',
            emerald: 'Изумруд',
            sunset: 'Закат',
            rose: 'Роза',
            ocean: 'Океан',
            lemon: 'Лимон',
            frost: 'Иней',
            copper: 'Медь',
            void: 'Бездна'
        };

        return map[skinId] || 'Неизвестно';
    }

    getHatDisplayName(hatId) {
        const map = {
            none: 'Без шляпки',
            cap: 'Кепка',
            leaf: 'Листик',
            crown: 'Корона',
            beanie: 'Шапка',
            halo: 'Нимб',
            horns: 'Рожки',
            party: 'Колпак',
            visor: 'Козырёк',
            antenna: 'Антенна',
            bow: 'Бантик'
        };

        return map[hatId] || 'Неизвестно';
    }

    createTopButton(x, y, w, h, label, onClick) {
        const profile = this.profile || window.CubePathDevice?.getProfile?.(this) || { isMobile: false, touchTarget: 48 };
        const isMultiline = String(label).includes('\n');
        const shadow = this.createRoundedRect(x, y + 4, w, h, 16, 0x4e7ead, 0.16);

        const bg = this.createRoundedRect(x, y, w, h, 16, 0x5aa8f2, 0.95, 0xe8f8ff, 0.95, 3);
        const inner = this.createRoundedRect(x, y, w - 8, h - 8, 14, 0xffffff, 0.06, 0xffffff, 0.20, 1);
        const gloss = this.createRoundedRect(x, y - 11, w - 12, h / 2 - 8, 12, 0xffffff, 0.16, null, 0, 0);

        const hit = this.add.rectangle(x, y, Math.max(w, profile.touchTarget), Math.max(h, profile.touchTarget), 0x000000, 0.001)
            .setInteractive({ useHandCursor: !profile.isMobile });

        const text = this.add.text(
            x,
            y,
            label,
            this.makeTextStyle({
                size: isMultiline
                    ? (this.profile?.isMobile ? 10 : 13)
                    : (this.profile?.isMobile ? 15 : 18),
                color: '#f8fcff',
                stroke: '#5d85aa',
                strokeThickness: 2,
                shadowColor: '#4d79a8',
                shadowBlur: 4
            })
        ).setOrigin(0.5);
        text.setAlign('center');
        if (isMultiline) {
            text.setLineSpacing(-2);
            text.setWordWrapWidth(Math.max(40, w - 18), true);
        }
        this.fitTextToBox(text, w - 18, h - 8, this.profile?.isMobile ? 10 : 11);

        const setScaleAll = (scale) => {
            bg.setScale(scale);
            inner.setScale(scale);
            gloss.setScale(scale);
            hit.setScale(scale);
            text.setScale(scale);
        };

        if (!profile.isMobile) {
            hit.on('pointerover', () => {
                this.redrawRoundedRect(bg, x, y, w, h, 16, 0x6cb8ff, 0.98, 0xe8f8ff, 0.95, 3);
                setScaleAll(1.02);
            });

            hit.on('pointerout', () => {
                this.redrawRoundedRect(bg, x, y, w, h, 16, 0x5aa8f2, 0.95, 0xe8f8ff, 0.95, 3);
                setScaleAll(1);
            });
        }

        hit.on('pointerdown', () => {
            this.redrawRoundedRect(bg, x, y, w, h, 16, 0x3d93e5, 1, 0xe8f8ff, 0.95, 3);
            setScaleAll(0.98);
        });

        hit.on('pointerup', () => {
            this.redrawRoundedRect(bg, x, y, w, h, 16, 0x6cb8ff, 0.98, 0xe8f8ff, 0.95, 3);
            setScaleAll(profile.isMobile ? 1 : 1.02);
            CubePathAudio.playUiClick(this);
            onClick();
        });

        return { shadow, bg, inner, gloss, hit, text };
    }
    createTabs() {
        const y = this.layout.tabsY;
        const tabW = this.layout.tabW;
        const tabH = this.layout.tabH;
        const totalW = tabW * 3;
        const startX = Math.round((this.scale.width - totalW) / 2);
        this.tabDefs = [
            { key: 'boosts', label: 'Бусты', x: startX },
            { key: 'skins', label: 'Скины', x: startX + tabW },
            { key: 'hats', label: 'Шляпки', x: startX + tabW * 2 }
        ];


        const groupShadow = this.createRoundedRect(
            startX + totalW / 2,
            y + 3,
            totalW,
            tabH,
            18,
            0x5f8bb0,
            0.10
        );

        const groupBg = this.createRoundedRect(
            startX + totalW / 2,
            y,
            totalW,
            tabH,
            18,
            0xeaf5ff,
            0.44,
            0xe8f7ff,
            0.95,
            2
        );

        const separators = [
            this.add.rectangle(startX + tabW, y, 2, tabH - 10, 0xffffff, 0.22),
            this.add.rectangle(startX + tabW * 2, y, 2, tabH - 10, 0xffffff, 0.22)
        ];

        this.tabNodes.push({ key: '__groupShadow', bg: groupShadow, text: { active: false } });
        this.tabNodes.push({ key: '__groupBg', bg: groupBg, text: { active: false } });

        this.tabDefs.forEach((tab, index) => {
            const isLeft = index === 0;
            const isRight = index === 2;

            const bg = this.add.graphics();
            const gloss = this.add.graphics();

            const hit = this.add.rectangle(
                tab.x + tabW / 2,
                y,
                Math.max(tabW, this.profile?.touchTarget ?? tabW),
                Math.max(tabH, this.profile?.touchTarget ?? tabH),
                0x000000,
                0.001
            ).setInteractive({ useHandCursor: !(this.profile?.isMobile) });

            const text = this.add.text(
                tab.x + tabW / 2,
                y,
                tab.label,
                this.makeTextStyle({
                    size: this.profile?.isMobile ? 16 : 20,
                    color: '#5b7897',
                    stroke: '#ffffff',
                    strokeThickness: 1,
                    shadowColor: '#ffffff',
                    shadowBlur: 3
                })
            ).setOrigin(0.5);

            const drawSegment = (active = false) => {
                bg.clear();
                gloss.clear();

                const fill = active ? 0x2f9cff : 0xffffff;
                const alpha = active ? 0.95 : 0.01;
                const stroke = active ? 0xbef2ff : null;

                if (isLeft || isRight) {
                    const radius = { tl: isLeft ? 16 : 0, tr: isRight ? 16 : 0, bl: isLeft ? 16 : 0, br: isRight ? 16 : 0 };
                    bg.fillStyle(fill, alpha);
                    bg.fillRoundedRect(tab.x, y - tabH / 2, tabW, tabH, radius);

                    if (stroke) {
                        bg.lineStyle(2, stroke, 1);
                        bg.strokeRoundedRect(tab.x, y - tabH / 2, tabW, tabH, radius);
                    }

                    gloss.fillStyle(0xffffff, active ? 0.18 : 0.08);
                    gloss.fillRoundedRect(tab.x + 6, y - tabH / 2 + 5, tabW - 12, 20, {
                        tl: isLeft ? 12 : 0,
                        tr: isRight ? 12 : 0,
                        bl: 0,
                        br: 0
                    });
                } else {
                    bg.fillStyle(fill, alpha);
                    bg.fillRect(tab.x, y - tabH / 2, tabW, tabH);

                    if (stroke) {
                        bg.lineStyle(2, stroke, 1);
                        bg.strokeRect(tab.x, y - tabH / 2, tabW, tabH);
                    }

                    gloss.fillStyle(0xffffff, active ? 0.18 : 0.08);
                    gloss.fillRect(tab.x + 6, y - tabH / 2 + 5, tabW - 12, 20);
                }
            };

            hit.on('pointerdown', () => {
                CubePathAudio.playUiClick(this);
                this.switchTab(tab.key);
            });

            this.tabNodes.push({ key: tab.key, bg, gloss, hit, text, drawSegment });
        });

        separators.forEach((s) => s.setDepth(5));
        this.updateTabs();
    }
    updateTabs() {
        this.tabNodes = this.tabNodes.filter((tab) => tab && tab.bg);

        this.tabNodes.forEach((tab) => {
            if (!tab.drawSegment || !tab.text) return;

            const active = tab.key === this.currentTab;
            tab.drawSegment(active);

            if (active) {
                tab.text.setStyle(this.makeTextStyle({
                    size: this.profile?.isMobile ? 16 : 20,
                    color: '#ffffff',
                    stroke: '#5f92c0',
                    strokeThickness: 2,
                    shadowColor: '#6ebeff',
                    shadowBlur: 6
                }));
            } else {
                tab.text.setStyle(this.makeTextStyle({
                    size: this.profile?.isMobile ? 16 : 20,
                    color: '#5b7897',
                    stroke: '#ffffff',
                    strokeThickness: 1,
                    shadowColor: '#ffffff',
                    shadowBlur: 3
                }));
            }

            tab.text.setOrigin(0.5);
        });
    }
    createPreviewPanel() {
        const layout = this.layout;

        const shadow = this.createRoundedRect(layout.previewX, layout.previewY + (layout.previewMode === 'bottom' ? 4 : 5), layout.previewW + 6, layout.previewH + 4, 18, 0x5d86a8, 0.14);
        const bg = this.createRoundedRect(layout.previewX, layout.previewY, layout.previewW, layout.previewH, 18, 0xffffff, 0.24, 0xeaf8ff, 0.9, 2);
        const gloss = this.createRoundedRect(layout.previewX, layout.previewY - layout.previewH / 2 + 22, layout.previewW - 16, 36, 14, 0xffffff, 0.12);

        const title = this.add.text(
            layout.previewX,
            layout.previewTitleY,
            'Текущий вид',
            this.makeTextStyle({
                size: this.profile?.isMobile ? 16 : 18,
                color: '#4f6578',
                stroke: '#ffffff',
                strokeThickness: 1,
                shadowColor: '#ffffff',
                shadowBlur: 3
            })
        ).setOrigin(0.5);
        this.fitTextToBox(title, Math.max(90, layout.previewW - 24), 24, 10);

        this.previewCube = this.add.graphics();

        this.previewSkinLabel = this.add.text(
            layout.previewSkinX,
            layout.previewSkinY,
            '',
            this.makeTextStyle({
                size: this.profile?.isMobile ? 13 : 14,
                color: '#4f6578',
                stroke: '#ffffff',
                strokeThickness: 1,
                shadowColor: '#ffffff',
                shadowBlur: 3
            })
        ).setOrigin(layout.previewLabelOrigin, 0.5);
        this.fitTextToBox(this.previewSkinLabel, layout.previewMode === 'bottom' ? layout.previewW - 112 : layout.previewW - 34, 24, 10);

        this.previewHatLabel = this.add.text(
            layout.previewHatX,
            layout.previewHatY,
            '',
            this.makeTextStyle({
                size: this.profile?.isMobile ? 13 : 14,
                color: '#4f6578',
                stroke: '#ffffff',
                strokeThickness: 1,
                shadowColor: '#ffffff',
                shadowBlur: 3
            })
        ).setOrigin(layout.previewLabelOrigin, 0.5);
        this.fitTextToBox(this.previewHatLabel, layout.previewMode === 'bottom' ? layout.previewW - 112 : layout.previewW - 34, 24, 10);

        this.redrawPreviewCube();

        this.previewPanelNodes = [
            shadow,
            bg,
            gloss,
            title,
            this.previewCube,
            this.previewSkinLabel,
            this.previewHatLabel
        ];
    }
    redrawPreviewCube() {
        if (!this.previewCube) return;

        const x = this.layout.previewCubeX;
        const y = this.layout.previewCubeY;

        const skinId = CubePathStorage.getEquippedSkin?.() || 'classic';
        const hatId = CubePathStorage.getEquippedHat?.() || 'none';

        this.drawPreviewCubeGraphic(
            this.previewCube,
            x,
            y,
            this.layout.previewCubeSize.w,
            this.layout.previewCubeSize.h,
            this.layout.previewCubeSize.depth,
            skinId,
            hatId
        );
    }
    refreshHeader() {
        this.currencyText.setText(`Кубикоинов: ${CubePathStorage.getCubeCoins()}`);
        this.fitTextToBox(this.currencyText, Math.max(120, this.scale.width - 44), 30, 11);
        this.redrawPreviewCube();

        if (this.previewSkinLabel) {
            const skinId = CubePathStorage.getEquippedSkin?.() || 'classic';
            this.previewSkinLabel.setText(`Скин: ${this.getSkinDisplayName(skinId)}`);
            if (this.layout.previewLabelAlign === 'left') {
                this.previewSkinLabel.setAlign('left');
            }
            this.fitTextToBox(this.previewSkinLabel, this.layout.previewMode === 'bottom' ? this.layout.previewW - 112 : this.layout.previewW - 34, 24, 10);
        }

        if (this.previewHatLabel) {
            const hatId = CubePathStorage.getEquippedHat?.() || 'none';
            this.previewHatLabel.setText(`Шляпка: ${this.getHatDisplayName(hatId)}`);
            if (this.layout.previewLabelAlign === 'left') {
                this.previewHatLabel.setAlign('left');
            }
            this.fitTextToBox(this.previewHatLabel, this.layout.previewMode === 'bottom' ? this.layout.previewW - 112 : this.layout.previewW - 34, 24, 10);
        }
    }

    addContentNode(node) {
        if (!node) return node;
        this.contentNodes.push(node);
        this.scrollContent.add(node);
        return node;
    }

    clearContent() {
        this.contentNodes.forEach((node) => {
            if (node && node.destroy) node.destroy();
        });

        this.contentNodes = [];
        this.scrollY = 0;

        if (this.scrollContent) {
            this.scrollContent.y = this.scrollViewport.y;
        }

        this.updateScrollBar();

        if (this.hintText) {
            this.hintText.destroy();
            this.hintText = null;
        }
    }

    switchTab(tab) {
        this.currentTab = tab;
        this.updateTabs();
        this.clearContent();
        this.refreshHeader();

        let contentHeight = 0;

        if (tab === 'boosts') contentHeight = this.buildBoostsTab();
        if (tab === 'skins') contentHeight = this.buildSkinsTab();
        if (tab === 'hats') contentHeight = this.buildHatsTab();

        this.updateScrollMetrics(contentHeight);
        this.animateContentIn();
    }

    animateContentIn() {
        this.contentNodes.forEach((node, i) => {
            if (!node || typeof node.setAlpha !== 'function') return;

            node.setAlpha(0);
            node.y += 12;

            this.tweens.add({
                targets: node,
                alpha: 1,
                y: node.y - 12,
                duration: 180,
                delay: i * 16,
                ease: 'Quad.easeOut'
            });
        });
    }

    createMainCard(x, y, w, h, theme) {
        const palette = {
            blue: {
                fill: 0x63b7ff,
                stroke: 0xdaf6ff,
                gloss: 0xffffff,
                shadow: 0x5689af
            },
            orange: {
                fill: 0xf7a24f,
                stroke: 0xffe1b8,
                gloss: 0xffffff,
                shadow: 0xb87439
            },
            pearl: {
                fill: 0xf3fbff,
                stroke: 0xeaf8ff,
                gloss: 0xffffff,
                shadow: 0x86a6bd
            }
        }[theme];

        const shadow = this.createRoundedRect(x, y + 5, w, h, 18, palette.shadow, 0.12);
        const bg = this.createRoundedRect(x, y, w, h, 18, palette.fill, 0.84, palette.stroke, 0.95, 3);
        const inner = this.createRoundedRect(x, y, w - 10, h - 10, 15, 0xffffff, 0.05, 0xffffff, 0.16, 1);
        const gloss = this.createRoundedRect(x, y - h / 4, w - 12, h / 2 - 10, 12, palette.gloss, 0.11);

        this.addContentNode(shadow);
        this.addContentNode(bg);
        this.addContentNode(inner);
        this.addContentNode(gloss);

        return { shadow, bg, inner, gloss };
    }
    createText(x, y, text, style) {
        const node = this.add.text(x, y, text, style);
        const maxWidth = style?.wordWrap?.width ?? Number.POSITIVE_INFINITY;
        this.fitTextToBox(node, maxWidth, Number.POSITIVE_INFINITY, this.profile?.isMobile ? 10 : 11);
        return this.addContentNode(node);
    }

    fitTextToBox(text, maxWidth, maxHeight, minSize = 10) {
        window.CubePathLayout?.fitText?.(text, {
            maxWidth,
            maxHeight,
            minSize
        });
        return text;
    }

    createActionButton(x, y, w, h, label, enabled, onClick, theme = 'blue') {
        const profile = this.profile || window.CubePathDevice?.getProfile?.(this) || { isMobile: false, touchTarget: 48 };
        const colors = {
            blue: {
                base: enabled ? 0x5aa8f2 : 0x9db4c8,
                hover: enabled ? 0x73bbff : 0x9db4c8,
                down: enabled ? 0x3e93e3 : 0x9db4c8,
                stroke: 0xe8f8ff,
                text: enabled ? '#f8fcff' : '#edf2f7',
                textStroke: '#5b84aa'
            },
            orange: {
                base: enabled ? 0xdd8b45 : 0xc0a896,
                hover: enabled ? 0xeea25e : 0xc0a896,
                down: enabled ? 0xc87531 : 0xc0a896,
                stroke: 0xffedd5,
                text: enabled ? '#fffaf3' : '#f1ece8',
                textStroke: '#9a6a3d'
            },
            pearl: {
                base: enabled ? 0x8abbe3 : 0xb8c7d3,
                hover: enabled ? 0x9fcbed : 0xb8c7d3,
                down: enabled ? 0x73abd5 : 0xb8c7d3,
                stroke: 0xffffff,
                text: enabled ? '#ffffff' : '#f0f0f0',
                textStroke: '#6f90ad'
            }
        }[theme];

        const shadow = this.createRoundedRect(x, y + 4, w, h, 14, 0x4d7394, 0.14);
        const bg = this.createRoundedRect(x, y, w, h, 14, colors.base, 0.96, colors.stroke, 0.9, 2);
        const inner = this.createRoundedRect(x, y, w - 8, h - 8, 12, 0xffffff, 0.05, 0xffffff, 0.14, 1);
        const gloss = this.createRoundedRect(x, y - 9, w - 10, h / 2 - 8, 10, 0xffffff, 0.14);

        const hit = this.add.rectangle(x, y, Math.max(w, profile.touchTarget), Math.max(h, profile.touchTarget), 0x000000, 0.001);
        const text = this.add.text(
            x,
            y,
            label,
            this.makeTextStyle({
                size: this.profile?.isMobile ? 15 : 17,
                color: colors.text,
                stroke: colors.textStroke,
                strokeThickness: 2,
                shadowColor: colors.textStroke,
                shadowBlur: 3
            })
        ).setOrigin(0.5);
        text.setAlign('center');
        text.setWordWrapWidth(Math.max(40, w - 20), true);
        this.fitTextToBox(text, w - 18, h - 8, this.profile?.isMobile ? 10 : 11);

        if (enabled) {
            hit.setInteractive({ useHandCursor: !profile.isMobile });

            const setScaleAll = (scale) => {
                bg.setScale(scale);
                inner.setScale(scale);
                gloss.setScale(scale);
                hit.setScale(scale);
                text.setScale(scale);
            };

            if (!profile.isMobile) {
                hit.on('pointerover', () => {
                    this.redrawRoundedRect(bg, x, y, w, h, 14, colors.hover, 0.98, colors.stroke, 0.9, 2);
                    setScaleAll(1.02);
                });

                hit.on('pointerout', () => {
                    this.redrawRoundedRect(bg, x, y, w, h, 14, colors.base, 0.96, colors.stroke, 0.9, 2);
                    setScaleAll(1);
                });
            }

            hit.on('pointerdown', () => {
                this.redrawRoundedRect(bg, x, y, w, h, 14, colors.down, 1, colors.stroke, 0.9, 2);
                setScaleAll(0.98);
            });

            hit.on('pointerup', () => {
                if (this.shouldBlockScrollTap()) {
                    this.redrawRoundedRect(bg, x, y, w, h, 14, colors.base, 0.96, colors.stroke, 0.9, 2);
                    setScaleAll(1);
                    return;
                }

                this.redrawRoundedRect(bg, x, y, w, h, 14, profile.isMobile ? colors.base : colors.hover, profile.isMobile ? 0.96 : 0.98, colors.stroke, 0.9, 2);
                setScaleAll(profile.isMobile ? 1 : 1.02);
                CubePathAudio.playUiClick(this);
                onClick();
            });
        }

        this.addContentNode(shadow);
        this.addContentNode(bg);
        this.addContentNode(inner);
        this.addContentNode(gloss);
        this.addContentNode(hit);
        this.addContentNode(text);

        return { shadow, bg, inner, gloss, hit, text };
    }
    createStatusBadge(x, y, label, kind = 'owned') {
        const palette = {
            owned: {
                fill: 0x89c3ea,
                stroke: 0xeef9ff,
                text: '#ffffff',
                textStroke: '#6c97b7'
            },
            equipped: {
                fill: 0x74c96d,
                stroke: 0xeeffec,
                text: '#ffffff',
                textStroke: '#5c9656'
            },
            locked: {
                fill: 0xb4c0cb,
                stroke: 0xf5f8fb,
                text: '#ffffff',
                textStroke: '#8c98a3'
            }
        }[kind];

        const badgeWidth = this.profile?.isMobile ? 108 : 118;
        const badgeHeight = this.profile?.isMobile ? 26 : 28;
        const bg = this.createRoundedRect(x, y, badgeWidth, badgeHeight, 12, palette.fill, 0.95, palette.stroke, 0.9, 2);

        const text = this.add.text(
            x,
            y,
            label,
            this.makeTextStyle({
                size: this.profile?.isMobile ? 12 : 13,
                color: palette.text,
                stroke: palette.textStroke,
                strokeThickness: 2,
                shadowColor: '#ffffff',
                shadowBlur: 2
            })
        ).setOrigin(0.5);
        text.setAlign('center');
        this.fitTextToBox(text, badgeWidth - 10, badgeHeight - 6, 9);

        this.addContentNode(bg);
        this.addContentNode(text);
    }
    getContentGridLayout(columns, cardWidth, gapX = 18, inset = 12) {
        const contentWidth = this.scrollViewport?.width ?? 915;
        const usableWidth = Math.max(0, contentWidth - inset * 2);
        const totalWidth = columns * cardWidth + (columns - 1) * gapX;
        const startX = inset + Math.max(0, (usableWidth - totalWidth) / 2) + cardWidth / 2;

        return { startX, totalWidth, usableWidth };
    }
    buildBoostsTab() {
        const freezeCount = CubePathStorage.getBoostCount('freeze');
        const energyCount = CubePathStorage.getBoostCount('energy');
        const coins = CubePathStorage.getCubeCoins();

        if (this.profile?.isMobile) {
            const items = [
                {
                    title: 'Заморозка',
                    count: freezeCount,
                    infoText: 'Останавливает разрушение плиток на короткое время',
                    price: 20,
                    theme: 'blue',
                    accentStroke: '#72a0c1',
                    priceColor: '#fff6dc',
                    priceStroke: '#9e7a49',
                    onClick: () => this.buyBoost('freeze', 20)
                },
                {
                    title: 'Энергетик',
                    count: energyCount,
                    infoText: 'Ломает опасные клетки и преграды',
                    price: 25,
                    theme: 'orange',
                    accentStroke: '#b26d34',
                    priceColor: '#fff4de',
                    priceStroke: '#9f7548',
                    onClick: () => this.buyBoost('energy', 25)
                }
            ];

            const columns = this.layout.boostColumns;
            const gapX = this.layout.boostGapX;
            const gapY = 22;
            const cardW = this.layout.boostCardW;
            const cardH = this.layout.boostCardH;
            const { startX } = this.getContentGridLayout(columns, cardW, gapX, 10);

            items.forEach((item, index) => {
                const col = index % columns;
                const row = Math.floor(index / columns);
                const x = startX + col * (cardW + gapX);
                const y = this.layout.boostStartY + row * (cardH + gapY);

                this.createMainCard(x, y, cardW, cardH, item.theme);

                this.createText(x, y - cardH / 2 + 42, item.title, this.makeTextStyle({
                    size: this.profile.isPortrait ? 26 : 22,
                    color: '#ffffff',
                    stroke: item.accentStroke,
                    strokeThickness: 2,
                    shadowColor: '#ffffff',
                    shadowBlur: 4
                })).setOrigin(0.5);

                this.createText(x, y - 8, `В наличии: ${item.count}\n${item.infoText}`, {
                    ...this.makeTextStyle({
                        size: this.profile.isPortrait ? 15 : 13,
                        color: '#f7fdff',
                        stroke: item.theme === 'orange' ? '#9c6d43' : '#6f91b0',
                        strokeThickness: 1,
                        shadowColor: '#ffffff',
                        shadowBlur: 2,
                        bold: true
                    }),
                    wordWrap: { width: cardW - 44 }
                }).setOrigin(0.5);

                this.createText(x, y + cardH / 2 - 62, `Цена: ${item.price} кубикоинов`, this.makeTextStyle({
                    size: this.profile.isPortrait ? 18 : 16,
                    color: item.priceColor,
                    stroke: item.priceStroke,
                    strokeThickness: 2,
                    shadowColor: '#ffffff',
                    shadowBlur: 3
                })).setOrigin(0.5);

                this.createActionButton(
                    x,
                    y + cardH / 2 - 24,
                    this.layout.boostButtonW,
                    this.layout.boostButtonH,
                    coins >= item.price ? 'Купить' : 'Не хватает',
                    coins >= item.price,
                    item.onClick,
                    item.theme
                );
            });

            const rows = Math.ceil(items.length / columns);
            return this.layout.boostStartY + rows * (cardH + gapY);
        }

        this.createMainCard(245, 168, 420, 255, 'blue');

        this.createText(245, 105, 'Заморозка', this.makeTextStyle({
            size: 31,
            color: '#ffffff',
            stroke: '#72a0c1',
            strokeThickness: 2,
            shadowColor: '#ffffff',
            shadowBlur: 4
        })).setOrigin(0.5);

        this.createText(245, 163, `В наличии: ${freezeCount}\nОстанавливает разрушение\nплиток на короткое время`, this.makeTextStyle({
            size: 16,
            color: '#f7fdff',
            stroke: '#6f91b0',
            strokeThickness: 1,
            shadowColor: '#ffffff',
            shadowBlur: 2,
            bold: true
        })).setOrigin(0.5);

        this.createText(245, 235, 'Цена: 20 кубикоинов', this.makeTextStyle({
            size: 22,
            color: '#fff6dc',
            stroke: '#9e7a49',
            strokeThickness: 2,
            shadowColor: '#ffffff',
            shadowBlur: 3
        })).setOrigin(0.5);

        this.createActionButton(
            245, 287, 240, 54,
            coins >= 20 ? 'Купить' : 'Не хватает',
            coins >= 20,
            () => this.buyBoost('freeze', 20),
            'blue'
        );

        this.createMainCard(690, 168, 420, 255, 'orange');

        this.createText(690, 105, 'Энергетик', this.makeTextStyle({
            size: 31,
            color: '#ffffff',
            stroke: '#b26d34',
            strokeThickness: 2,
            shadowColor: '#ffffff',
            shadowBlur: 4
        })).setOrigin(0.5);

        this.createText(690, 163, `В наличии: ${energyCount}\nЛомает опасные клетки и\nпреграды`, this.makeTextStyle({
            size: 16,
            color: '#fff9f2',
            stroke: '#9c6d43',
            strokeThickness: 1,
            shadowColor: '#ffffff',
            shadowBlur: 2,
            bold: true
        })).setOrigin(0.5);

        this.createText(690, 235, 'Цена: 25 кубикоинов', this.makeTextStyle({
            size: 22,
            color: '#fff4de',
            stroke: '#9f7548',
            strokeThickness: 2,
            shadowColor: '#ffffff',
            shadowBlur: 3
        })).setOrigin(0.5);

        this.createActionButton(
            690, 287, 240, 54,
            coins >= 25 ? 'Купить' : 'Не хватает',
            coins >= 25,
            () => this.buyBoost('energy', 25),
            'orange'
        );

        return 360;
    }

    buildSkinsTab() {
        const skins = [
            { id: 'ruby', title: 'Рубин', price: 35 },
            { id: 'mint', title: 'Мята', price: 50 },
            { id: 'sky', title: 'Небо', price: 50 },
            { id: 'violet', title: 'Фиалка', price: 70 },
            { id: 'obsidian', title: 'Обсидиан', price: 70 },

            { id: 'emerald', title: 'Изумруд', price: 85 },
            { id: 'sunset', title: 'Закат', price: 95 },
            { id: 'rose', title: 'Роза', price: 110 },
            { id: 'ocean', title: 'Океан', price: 120 },
            { id: 'lemon', title: 'Лимон', price: 130 },
            { id: 'frost', title: 'Иней', price: 145 },
            { id: 'copper', title: 'Медь', price: 155 },
            { id: 'void', title: 'Бездна', price: 180 }
        ];

        if (false && this.profile?.isMobile) {
            const cols = this.layout.catalogColumns;
            const gapX = this.layout.catalogGapX;
            const stepY = this.layout.catalogCardH + this.layout.catalogGapY;
            const { startX } = this.getContentGridLayout(cols, this.layout.catalogCardW, gapX, 10);

            skins.forEach((skin, i) => {
                const col = i % cols;
                const row = Math.floor(i / cols);
                const x = startX + col * (this.layout.catalogCardW + gapX);
                const y = this.layout.cosmeticStartY + row * stepY;

                const owned = CubePathStorage.ownsSkin(skin.id);
                const equipped = CubePathStorage.getEquippedSkin() === skin.id;
                const coins = CubePathStorage.getCubeCoins();

                let buttonText = 'Купить';
                let enabled = coins >= skin.price;
                let infoText = 'Новый цвет кубика';
                let priceText = `Цена: ${skin.price}`;

                if (owned && equipped) {
                    buttonText = 'Надето';
                    enabled = false;
                    infoText = 'Сейчас используется';
                    priceText = 'Куплено';
                } else if (owned) {
                    buttonText = 'Надеть';
                    enabled = true;
                    infoText = 'Доступен для экипировки';
                    priceText = 'Куплено';
                } else if (coins < skin.price) {
                    buttonText = 'Не хватает';
                }

                this.buildCosmeticCard({
                    x,
                    y,
                    title: skin.title,
                    infoText,
                    priceText,
                    buttonText,
                    buttonEnabled: enabled,
                    previewSkin: skin.id,
                    statusKind: equipped ? 'equipped' : owned ? 'owned' : 'locked',
                    statusText: equipped ? 'Надето' : owned ? 'Куплено' : 'Не куплено',
                    onClick: () => {
                        if (!owned) {
                            this.buySkin(skin.id, skin.price);
                        } else if (!equipped) {
                            CubePathStorage.setEquippedSkin(skin.id);
                            this.showHint(`Скин ${skin.title} надет`);
                            this.switchTab('skins');
                        }
                    }
                });
            });

            const rows = Math.ceil(skins.length / cols);
            return this.layout.cosmeticStartY + (rows - 1) * stepY + this.layout.catalogCardH / 2 + 32;
        }

        if (false && this.profile?.isMobile) {
            const cols = this.layout.catalogColumns;
            const gapX = this.layout.catalogGapX;
            const stepY = this.layout.catalogCardH + this.layout.catalogGapY;
            const { startX } = this.getContentGridLayout(cols, this.layout.catalogCardW, gapX, 10);

            hats.forEach((hat, i) => {
                const col = i % cols;
                const row = Math.floor(i / cols);
                const x = startX + col * (this.layout.catalogCardW + gapX);
                const y = this.layout.cosmeticStartY + row * stepY;

                if (hat.remove) {
                    const noneEquipped = CubePathStorage.getEquippedHat() === 'none';

                    this.buildCosmeticCard({
                        x,
                        y,
                        title: 'Без шляпки',
                        infoText: noneEquipped ? 'Сейчас используется' : 'Снять текущую шляпку',
                        priceText: 'Бесплатно',
                        buttonText: noneEquipped ? 'Надето' : 'Снять',
                        buttonEnabled: !noneEquipped,
                        statusKind: noneEquipped ? 'equipped' : 'owned',
                        statusText: noneEquipped ? 'Надето' : 'Доступно',
                        onClick: () => {
                            CubePathStorage.setEquippedHat('none');
                            this.showHint('Шляпка снята');
                            this.switchTab('hats');
                        }
                    });

                    return;
                }

                const owned = CubePathStorage.ownsHat(hat.id);
                const equipped = CubePathStorage.getEquippedHat() === hat.id;
                const coins = CubePathStorage.getCubeCoins();

                let buttonText = 'Купить';
                let enabled = coins >= hat.price;
                let infoText = 'Украшение для кубика';
                let priceText = `Цена: ${hat.price}`;

                if (owned && equipped) {
                    buttonText = 'Надето';
                    enabled = false;
                    infoText = 'Сейчас используется';
                    priceText = 'Куплено';
                } else if (owned) {
                    buttonText = 'Надеть';
                    enabled = true;
                    infoText = 'Доступна для экипировки';
                    priceText = 'Куплено';
                } else if (coins < hat.price) {
                    buttonText = 'Не хватает';
                }

                this.buildCosmeticCard({
                    x,
                    y,
                    title: hat.title,
                    infoText,
                    priceText,
                    buttonText,
                    buttonEnabled: enabled,
                    previewHat: hat.id,
                    statusKind: equipped ? 'equipped' : owned ? 'owned' : 'locked',
                    statusText: equipped ? 'Надето' : owned ? 'Куплено' : 'Не куплено',
                    onClick: () => {
                        if (!owned) {
                            this.buyHat(hat.id, hat.price);
                        } else if (!equipped) {
                            CubePathStorage.setEquippedHat(hat.id);
                            this.showHint(`Шляпка ${hat.title} надета`);
                            this.switchTab('hats');
                        }
                    }
                });
            });

            const rows = Math.ceil(hats.length / cols);
            return this.layout.cosmeticStartY + (rows - 1) * stepY + this.layout.catalogCardH / 2 + 32;
        }

        const cols = this.profile?.isMobile ? this.layout.catalogColumns : 3;
        const grid = this.profile?.isMobile
            ? this.getContentGridLayout(cols, this.layout.catalogCardW, this.layout.catalogGapX, 10)
            : { startX: 150 };
        const startX = grid.startX;
        const startY = this.profile?.isMobile ? this.layout.cosmeticStartY : 110;
        const stepX = this.profile?.isMobile ? this.layout.catalogCardW + this.layout.catalogGapX : 305;
        const stepY = this.profile?.isMobile ? this.layout.catalogCardH + this.layout.catalogGapY : 220;

        skins.forEach((skin, i) => {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const x = startX + col * stepX;
            const y = startY + row * stepY;

            const owned = CubePathStorage.ownsSkin(skin.id);
            const equipped = CubePathStorage.getEquippedSkin() === skin.id;
            const coins = CubePathStorage.getCubeCoins();

            let buttonText = 'Купить';
            let enabled = coins >= skin.price;
            let infoText = 'Новый цвет кубика';
            let priceText = `Цена: ${skin.price}`;

            if (owned && equipped) {
                buttonText = 'Надето';
                enabled = false;
                infoText = 'Сейчас используется';
                priceText = 'Куплено';
            } else if (owned) {
                buttonText = 'Надеть';
                enabled = true;
                infoText = 'Доступен для экипировки';
                priceText = 'Куплено';
            } else if (coins < skin.price) {
                buttonText = 'Не хватает';
            }

            this.buildCosmeticCard({
                x,
                y,
                title: skin.title,
                infoText,
                priceText,
                buttonText,
                buttonEnabled: enabled,
                previewSkin: skin.id,
                statusKind: equipped ? 'equipped' : owned ? 'owned' : 'locked',
                statusText: equipped ? 'Надето' : owned ? 'Куплено' : 'Не куплено',
                onClick: () => {
                    if (!owned) {
                        this.buySkin(skin.id, skin.price);
                    } else if (!equipped) {
                        CubePathStorage.setEquippedSkin(skin.id);
                        this.showHint(`Скин ${skin.title} надет`);
                        this.switchTab('skins');
                    }
                }
            });
        });

        const rows = Math.ceil(skins.length / cols);
        return this.profile?.isMobile
            ? startY + (rows - 1) * stepY + this.layout.catalogCardH / 2 + 32
            : startY + (rows - 1) * stepY + 140;
    }
    buildHatsTab() {
        const hats = [
            { id: 'cap', title: 'Кепка', price: 25 },
            { id: 'leaf', title: 'Листик', price: 40 },
            { id: 'crown', title: 'Корона', price: 60 },

            { id: 'beanie', title: 'Шапка', price: 70 },
            { id: 'halo', title: 'Нимб', price: 85 },
            { id: 'horns', title: 'Рожки', price: 95 },
            { id: 'party', title: 'Колпак', price: 105 },
            { id: 'visor', title: 'Козырёк', price: 115 },
            { id: 'antenna', title: 'Антенна', price: 130 },
            { id: 'bow', title: 'Бантик', price: 145 },

            { id: 'none', title: 'Без шляпки', price: 0, remove: true }
        ];

        const cols = this.profile?.isMobile ? this.layout.catalogColumns : 3;
        const grid = this.profile?.isMobile
            ? this.getContentGridLayout(cols, this.layout.catalogCardW, this.layout.catalogGapX, 10)
            : { startX: 150 };
        const startX = grid.startX;
        const startY = this.profile?.isMobile ? this.layout.cosmeticStartY : 110;
        const stepX = this.profile?.isMobile ? this.layout.catalogCardW + this.layout.catalogGapX : 305;
        const stepY = this.profile?.isMobile ? this.layout.catalogCardH + this.layout.catalogGapY : 220;

        hats.forEach((hat, i) => {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const x = startX + col * stepX;
            const y = startY + row * stepY;

            if (hat.remove) {
                const noneEquipped = CubePathStorage.getEquippedHat() === 'none';

                this.buildCosmeticCard({
                    x,
                    y,
                    title: 'Без шляпки',
                    infoText: noneEquipped ? 'Сейчас используется' : 'Снять текущую шляпку',
                    priceText: 'Бесплатно',
                    buttonText: noneEquipped ? 'Надето' : 'Снять',
                    buttonEnabled: !noneEquipped,
                    statusKind: noneEquipped ? 'equipped' : 'owned',
                    statusText: noneEquipped ? 'Надето' : 'Доступно',
                    onClick: () => {
                        CubePathStorage.setEquippedHat('none');
                        this.showHint('Шляпка снята');
                        this.switchTab('hats');
                    }
                });

                return;
            }

            const owned = CubePathStorage.ownsHat(hat.id);
            const equipped = CubePathStorage.getEquippedHat() === hat.id;
            const coins = CubePathStorage.getCubeCoins();

            let buttonText = 'Купить';
            let enabled = coins >= hat.price;
            let infoText = 'Украшение для кубика';
            let priceText = `Цена: ${hat.price}`;

            if (owned && equipped) {
                buttonText = 'Надето';
                enabled = false;
                infoText = 'Сейчас используется';
                priceText = 'Куплено';
            } else if (owned) {
                buttonText = 'Надеть';
                enabled = true;
                infoText = 'Доступна для экипировки';
                priceText = 'Куплено';
            } else if (coins < hat.price) {
                buttonText = 'Не хватает';
            }

            this.buildCosmeticCard({
                x,
                y,
                title: hat.title,
                infoText,
                priceText,
                buttonText,
                buttonEnabled: enabled,
                previewHat: hat.id,
                statusKind: equipped ? 'equipped' : owned ? 'owned' : 'locked',
                statusText: equipped ? 'Надето' : owned ? 'Куплено' : 'Не куплено',
                onClick: () => {
                    if (!owned) {
                        this.buyHat(hat.id, hat.price);
                    } else if (!equipped) {
                        CubePathStorage.setEquippedHat(hat.id);
                        this.showHint(`Шляпка ${hat.title} надета`);
                        this.switchTab('hats');
                    }
                }
            });
        });

        const rows = Math.ceil(hats.length / cols);
        return this.profile?.isMobile
            ? startY + (rows - 1) * stepY + this.layout.catalogCardH / 2 + 32
            : startY + (rows - 1) * stepY + 140;
    }
    buildCosmeticCard({
        x,
        y,
        title,
        infoText,
        priceText,
        buttonText,
        buttonEnabled,
        onClick,
        previewSkin = null,
        previewHat = null,
        statusKind = null,
        statusText = ''
    }) {
        if (this.profile?.isMobile) {
            const cardW = this.layout.catalogCardW;
            const cardH = this.layout.catalogCardH;
            const left = x - cardW / 2 + 18;
            const previewX = x + cardW / 2 - 50;
            const textWrapWidth = Math.max(120, cardW - 118);

            this.createMainCard(x, y, cardW, cardH, 'pearl');

            this.createText(left, y - cardH / 2 + 28, title, {
                ...this.makeTextStyle({
                    size: this.profile.isPortrait ? 21 : 18,
                    color: '#5f6872',
                    stroke: '#ffffff',
                    strokeThickness: 1,
                    shadowColor: '#ffffff',
                    shadowBlur: 3,
                    align: 'left'
                }),
                wordWrap: { width: textWrapWidth }
            }).setOrigin(0, 0.5);

            this.createText(left, y - 8, infoText, {
                ...this.makeTextStyle({
                    size: this.profile.isPortrait ? 13 : 12,
                    color: '#7b8793',
                    stroke: '#ffffff',
                    strokeThickness: 1,
                    shadowColor: '#ffffff',
                    shadowBlur: 2,
                    align: 'left'
                }),
                wordWrap: { width: textWrapWidth }
            }).setOrigin(0, 0.5);

            this.createText(left, y + cardH / 2 - 54, priceText, this.makeTextStyle({
                size: this.profile.isPortrait ? 16 : 14,
                color: '#8c6d46',
                stroke: '#fff9ef',
                strokeThickness: 1,
                shadowColor: '#ffffff',
                shadowBlur: 2,
                align: 'left'
            })).setOrigin(0, 0.5);

            const preview = this.add.graphics();
            this.drawPreviewMiniCube(
                preview,
                previewX,
                y - 10,
                previewSkin || (CubePathStorage.getEquippedSkin?.() || 'classic'),
                previewHat || 'none'
            );
            this.addContentNode(preview);

            if (statusText) {
                this.createStatusBadge(left + 52, y - cardH / 2 + 16, statusText, statusKind || 'owned');
            }

            this.createActionButton(
                x,
                y + cardH / 2 - 24,
                Math.min(cardW - 36, 190),
                42,
                buttonText,
                buttonEnabled,
                onClick,
                'pearl'
            );
            return;
        }

        this.createMainCard(x, y, 270, 185, 'pearl');

        this.createText(x - 18, y - 50, title, this.makeTextStyle({
            size: 23,
            color: '#5f6872',
            stroke: '#ffffff',
            strokeThickness: 1,
            shadowColor: '#ffffff',
            shadowBlur: 3
        })).setOrigin(0.5);

        this.createText(x - 18, y - 10, infoText, {
            ...this.makeTextStyle({
                size: 14,
                color: '#7b8793',
                stroke: '#ffffff',
                strokeThickness: 1,
                shadowColor: '#ffffff',
                shadowBlur: 2
            }),
            wordWrap: { width: 180 }
        }).setOrigin(0.5);

        this.createText(x - 18, y + 34, priceText, this.makeTextStyle({
            size: 17,
            color: '#8c6d46',
            stroke: '#fff9ef',
            strokeThickness: 1,
            shadowColor: '#ffffff',
            shadowBlur: 2
        })).setOrigin(0.5);

        const preview = this.add.graphics();
        this.drawPreviewMiniCube(
            preview,
            x + 92,
            y - 14,
            previewSkin || (CubePathStorage.getEquippedSkin?.() || 'classic'),
            previewHat || 'none'
        );
        this.addContentNode(preview);

        if (statusText) {
            this.createStatusBadge(x - 58, y - 76, statusText, statusKind || 'owned');
        }

        this.createActionButton(
            x - 18, y + 70, 160, 40,
            buttonText,
            buttonEnabled,
            onClick,
            'pearl'
        );
    }

    drawPreviewMiniCube(graphics, x, y, skinId, hatId) {
        this.drawPreviewCubeGraphic(graphics, x, y, 34, 22, 16, skinId, hatId);
    }
    drawPreviewCubeGraphic(graphics, x, y, w, h, depth, skinId, hatId) {
        graphics.clear();

        const skinMap = {
            classic: { top: 0xf7dc6f, left: 0xd4ac0d, right: 0xf1c40f },
            ruby: { top: 0xff6b6b, left: 0xd64545, right: 0xff8a8a },
            mint: { top: 0x6ef0c2, left: 0x38b48b, right: 0x97f5d6 },
            sky: { top: 0x7dc8ff, left: 0x4d91cf, right: 0xa7dcff },
            violet: { top: 0xc59bff, left: 0x8a63d1, right: 0xddc6ff },
            obsidian: { top: 0x808080, left: 0x4d4d4d, right: 0xa5a5a5 },
            emerald: { top: 0x4fe38a, left: 0x23995a, right: 0x7dffb0 },
            sunset: { top: 0xffb36b, left: 0xd9742f, right: 0xffd08f },
            rose: { top: 0xff8fb1, left: 0xd45d82, right: 0xffb3ca },
            ocean: { top: 0x4db8ff, left: 0x1f7fc4, right: 0x85d4ff },
            lemon: { top: 0xfff27a, left: 0xd8c93b, right: 0xfff7a8 },
            frost: { top: 0xd7f4ff, left: 0x9cc9db, right: 0xf3fcff },
            copper: { top: 0xd9905b, left: 0xa85f33, right: 0xf0b287 },
            void: { top: 0x5a5a72, left: 0x2f2f45, right: 0x80809d }
        };

        const colors = skinMap[skinId] || skinMap.classic;

        const top = [
            { x, y: y - h / 2 },
            { x: x + w / 2, y },
            { x, y: y + h / 2 },
            { x: x - w / 2, y }
        ];

        const left = [
            { x: x - w / 2, y },
            { x, y: y + h / 2 },
            { x, y: y + h / 2 + depth },
            { x: x - w / 2, y: y + depth }
        ];

        const right = [
            { x: x + w / 2, y },
            { x, y: y + h / 2 },
            { x, y: y + h / 2 + depth },
            { x: x + w / 2, y: y + depth }
        ];

        graphics.fillStyle(colors.left, 1);
        graphics.beginPath();
        graphics.moveTo(left[0].x, left[0].y);
        for (let i = 1; i < left.length; i++) graphics.lineTo(left[i].x, left[i].y);
        graphics.closePath();
        graphics.fillPath();

        graphics.fillStyle(colors.right, 1);
        graphics.beginPath();
        graphics.moveTo(right[0].x, right[0].y);
        for (let i = 1; i < right.length; i++) graphics.lineTo(right[i].x, right[i].y);
        graphics.closePath();
        graphics.fillPath();

        graphics.fillStyle(colors.top, 1);
        graphics.beginPath();
        graphics.moveTo(top[0].x, top[0].y);
        for (let i = 1; i < top.length; i++) graphics.lineTo(top[i].x, top[i].y);
        graphics.closePath();
        graphics.fillPath();

        if (hatId === 'cap') {
            graphics.fillStyle(0x2b2b2b, 1);
            graphics.fillRect(x - 9, y - h / 2 - 10, 18, 6);
            graphics.fillRect(x - 4, y - h / 2 - 16, 8, 6);
        } else if (hatId === 'crown') {
            graphics.fillStyle(0xffd54a, 1);
            graphics.fillRect(x - 10, y - h / 2 - 8, 20, 5);
            graphics.fillTriangle(x - 10, y - h / 2 - 8, x - 4, y - h / 2 - 18, x + 1, y - h / 2 - 8);
            graphics.fillTriangle(x - 2, y - h / 2 - 8, x + 3, y - h / 2 - 20, x + 8, y - h / 2 - 8);
            graphics.fillTriangle(x + 6, y - h / 2 - 8, x + 11, y - h / 2 - 18, x + 14, y - h / 2 - 8);
        } else if (hatId === 'leaf') {
            graphics.fillStyle(0x4caf50, 1);
            graphics.fillEllipse(x, y - h / 2 - 10, 16, 8);
            graphics.lineStyle(2, 0x2f6f33, 1);
            graphics.beginPath();
            graphics.moveTo(x - 5, y - h / 2 - 10);
            graphics.lineTo(x + 5, y - h / 2 - 10);
            graphics.strokePath();
        } else if (hatId === 'beanie') {
            graphics.fillStyle(0x7a4cff, 1);
            graphics.fillRect(x - 9, y - h / 2 - 10, 18, 6);
            graphics.fillCircle(x, y - h / 2 - 12, 3);
        } else if (hatId === 'halo') {
            graphics.lineStyle(2, 0xffe680, 1);
            graphics.strokeEllipse(x, y - h / 2 - 13, 18, 7);
        } else if (hatId === 'horns') {
            graphics.fillStyle(0xe8dfcf, 1);
            graphics.fillTriangle(x - 9, y - h / 2 - 7, x - 4, y - h / 2 - 17, x, y - h / 2 - 7);
            graphics.fillTriangle(x, y - h / 2 - 7, x + 4, y - h / 2 - 17, x + 9, y - h / 2 - 7);
        } else if (hatId === 'party') {
            graphics.fillStyle(0xff5fa2, 1);
            graphics.fillTriangle(x, y - h / 2 - 18, x - 8, y - h / 2 - 6, x + 8, y - h / 2 - 6);
            graphics.fillStyle(0xffffff, 1);
            graphics.fillCircle(x, y - h / 2 - 19, 2);
        } else if (hatId === 'visor') {
            graphics.fillStyle(0x1f1f1f, 1);
            graphics.fillRect(x - 9, y - h / 2 - 9, 18, 5);
            graphics.fillRect(x - 12, y - h / 2 - 5, 8, 2);
        } else if (hatId === 'antenna') {
            graphics.lineStyle(2, 0xcfd8dc, 1);
            graphics.beginPath();
            graphics.moveTo(x, y - h / 2 - 5);
            graphics.lineTo(x, y - h / 2 - 17);
            graphics.strokePath();
            graphics.fillStyle(0xff5252, 1);
            graphics.fillCircle(x, y - h / 2 - 18, 3);
        } else if (hatId === 'bow') {
            graphics.fillStyle(0xff4f7d, 1);
            graphics.fillTriangle(x - 1, y - h / 2 - 8, x - 10, y - h / 2 - 14, x - 9, y - h / 2 - 4);
            graphics.fillTriangle(x + 1, y - h / 2 - 8, x + 10, y - h / 2 - 14, x + 9, y - h / 2 - 4);
            graphics.fillCircle(x, y - h / 2 - 8, 2);
        }
    }

    buyBoost(boostType, price) {
        if (!CubePathStorage.spendCubeCoins(price)) {
            this.showHint('Не хватает кубикоинов');
            return;
        }

        CubePathStorage.addBoost(boostType, 1);
        this.refreshHeader();
        this.showHint(boostType === 'freeze' ? 'Заморозка куплена' : 'Энергетик куплен');
        this.switchTab('boosts');
    }

    buySkin(skinId, price) {
        if (CubePathStorage.ownsSkin(skinId)) {
            this.showHint('Этот скин уже куплен');
            return;
        }

        if (!CubePathStorage.spendCubeCoins(price)) {
            this.showHint('Не хватает кубикоинов');
            return;
        }

        CubePathStorage.unlockSkin(skinId);
        CubePathStorage.setEquippedSkin(skinId);
        this.refreshHeader();
        this.showHint('Скин куплен и надет');
        this.switchTab('skins');
    }

    buyHat(hatId, price) {
        if (CubePathStorage.ownsHat(hatId)) {
            this.showHint('Эта шляпка уже куплена');
            return;
        }

        if (!CubePathStorage.spendCubeCoins(price)) {
            this.showHint('Не хватает кубикоинов');
            return;
        }

        CubePathStorage.unlockHat(hatId);
        CubePathStorage.setEquippedHat(hatId);
        this.refreshHeader();
        this.showHint('Шляпка куплена и надета');
        this.switchTab('hats');
    }
    watchAdForCubeCoins() {
        if (this.adInProgress) return;

        this.adInProgress = true;

        CubePathAds.showRewarded({
            onOpen: () => {
                CubePathAudio.pauseMusicForAd(this);
                this.showHint('Реклама загружается...');
            },
            onReward: () => {
                CubePathStorage.addCubeCoins(10);
                this.refreshHeader();
                this.showHint('Получено: +10 кубикоинов');
                this.switchTab(this.currentTab);
            },
            onClose: () => {
                this.adInProgress = false;
                CubePathAudio.resumeMusicAfterAd(this);
            },
            onError: () => {
                this.adInProgress = false;
                CubePathAudio.resumeMusicAfterAd(this);
                this.showHint('Реклама недоступна');
            }
        });
    }
    showHint(text) {
        if (this.hintText) this.hintText.destroy();

        const baseY = this.profile?.isMobile
            ? (() => {
                if (this.layout?.previewMode === 'bottom') {
                    const previewTop = this.layout.previewY - this.layout.previewH / 2;
                    const minY = (this.scrollViewport?.y || 0) + 24;
                    return Phaser.Math.Clamp(previewTop - 16, minY, this.scale.height - 28);
                }
                return this.scale.height - 28;
            })()
            : 675;

        this.hintText = this.add.text(
            this.scale.width / 2,
            baseY,
            text,
            this.makeTextStyle({
                size: this.profile?.isMobile ? 15 : 19,
                color: '#ffffff',
                stroke: '#6f8fad',
                strokeThickness: 4,
                shadowColor: '#ffffff',
                shadowBlur: 6
            })
        ).setOrigin(0.5);

        this.tweens.add({
            targets: this.hintText,
            alpha: { from: 0, to: 1 },
            y: { from: baseY + 12, to: baseY },
            duration: 140,
            ease: 'Quad.easeOut'
        });

        this.time.delayedCall(1200, () => {
            if (this.hintText) {
                this.tweens.add({
                    targets: this.hintText,
                    alpha: 0,
                    y: this.hintText.y - 10,
                    duration: 180,
                    onComplete: () => {
                        if (this.hintText) {
                            this.hintText.destroy();
                            this.hintText = null;
                        }
                    }
                });
            }
        });
    }
}

window.ShopScene = ShopScene;
