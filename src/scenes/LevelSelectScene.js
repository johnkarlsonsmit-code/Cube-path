class LevelSelectScene extends Phaser.Scene {
  constructor() {
    super('LevelSelectScene');
    this.scrollY = 0;
    this.maxScrollY = 0;
    this.scrollSpeed = 48;
    this.uiNodes = [];
    this.profile = null;
    this.layout = null;
    this.scrollDragPointerId = null;
    this.scrollDragLastY = 0;
    this.scrollDragDistance = 0;
    this.scrollTapBlockUntil = 0;
  }

  create() {
    const { width, height } = this.scale;
    this.__cubePathResizeKey = `${width}x${height}`;
    this.scrollY = 0;
    this.maxScrollY = 0;
    this.uiNodes = [];
    this.scrollDragPointerId = null;
    this.scrollDragLastY = 0;
    this.scrollDragDistance = 0;
    this.scrollTapBlockUntil = 0;
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

    const panelShadow = this.createRoundedRect(
      width / 2,
      this.layout.panelY + 5,
      this.layout.panelW,
      this.layout.panelH,
      22,
      0x6689a8,
      0.10
    );
    const panelBg = this.createRoundedRect(
      width / 2,
      this.layout.panelY,
      this.layout.panelW,
      this.layout.panelH,
      22,
      0xffffff,
      0.14,
      0xeaf8ff,
      0.65,
      2
    );
    const panelGloss = this.createRoundedRect(
      width / 2,
      this.layout.panelTop + 34,
      this.layout.panelW - 30,
      42,
      16,
      0xffffff,
      0.07
    );

    panelShadow.setDepth(1);
    panelBg.setDepth(2);
    panelGloss.setDepth(3);

    this.content = this.add.container(0, 0);
    this.content.setDepth(20);

    const title = this.add.text(
      width / 2,
      this.layout.titleY,
      'Выбор уровня',
      this.makeTextStyle({
        size: this.layout.titleSize,
        color: '#fff8ec',
        stroke: '#b17438',
        strokeThickness: 4,
        shadowColor: '#ffffff',
        shadowBlur: 8
      })
    ).setOrigin(0.5).setDepth(30);
    this.fitTextToBox(title, Math.min(width - 48, this.layout.panelW - 80), 56, 18);

    const menuBtn = this.createTopButton(
      this.layout.menuButtonX,
      this.layout.menuButtonY,
      this.layout.menuButtonW,
      this.layout.menuButtonH,
      'В меню',
      () => {
        this.scene.start('MenuScene');
      }
    );

    menuBtn.nodes.forEach((node) => node.setDepth(30));

    this.uiNodes.push(title, ...menuBtn.nodes);

    this.buildContent();
    this.bindSceneCleanup();
    this.bindScrollInput();

    this.animateUiIn();
  }

  handleResize() {
    if (!this.sys?.settings?.active) return;
    this.scene.restart();
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
        panelW: width - 90,
        panelH: 610,
        panelY: 395,
        panelTop: 90,
        titleY: 34,
        titleSize: 36,
        menuButtonX: width - 105,
        menuButtonY: 40,
        menuButtonW: 155,
        menuButtonH: 52,
        contentStartY: 78,
        contentWidth: width - 150,
        footerY: height - 18,
        footerText: '',
        footerSize: 14,
        contentBottomPadding: 130,
        sectionTitleSize: 28,
        sectionSubtitleSize: 15,
        sectionCardHWithSubtitle: 86,
        sectionCardHPlain: 62,
        levelsPerRow: 5,
        levelGapX: 20,
        levelGapY: 18,
        levelButtonH: 66,
        levelTitleSize: 22,
        starSize: 13,
        levelVerticalPadding: 10
      };
    }

    const safe = profile.safePadding + 6;
    const panelW = width - safe * 2;
    const panelH = height - 98;

    return {
      panelW,
      panelH,
      panelY: height / 2 + 8,
      panelTop: 78,
      titleY: profile.isPortrait ? 40 : 30,
      titleSize: profile.isPortrait ? 30 : 24,
      menuButtonX: safe + (profile.isPortrait ? 64 : 58),
      menuButtonY: profile.isPortrait ? 86 : 66,
      menuButtonW: profile.isPortrait ? 128 : 116,
      menuButtonH: Math.max(42, Math.min(48, Math.round(profile.touchTarget * 0.78))),
      contentStartY: profile.isPortrait ? 132 : 112,
      contentWidth: panelW - 36,
      footerY: height - 22,
      footerText: '',
      footerSize: profile.isPortrait ? 13 : 12,
      contentBottomPadding: profile.isPortrait ? 126 : 104,
      sectionTitleSize: profile.isPortrait ? 22 : 18,
      sectionSubtitleSize: profile.isPortrait ? 13 : 11,
      sectionCardHWithSubtitle: profile.isPortrait ? 82 : 72,
      sectionCardHPlain: profile.isPortrait ? 58 : 54,
      levelsPerRow: profile.isPortrait ? 3 : 4,
      levelGapX: profile.isPortrait ? 12 : 14,
      levelGapY: profile.isPortrait ? 12 : 10,
      levelButtonH: profile.isPortrait ? 62 : 54,
      levelTitleSize: profile.isPortrait ? 20 : 16,
      starSize: profile.isPortrait ? 12 : 10,
      levelVerticalPadding: 8
    };
  }

  bindSceneCleanup() {
    this.events.off('shutdown', this.cleanupSceneListeners, this);
    this.events.once('shutdown', this.cleanupSceneListeners, this);
  }

  isPointerInsideScrollArea(pointer) {
    if (!pointer) return false;

    const left = Math.max(0, (this.scale.width - this.layout.contentWidth) / 2 - 20);
    const right = Math.min(this.scale.width, left + this.layout.contentWidth + 40);
    const top = this.layout.contentStartY - 20;
    const bottom = this.scale.height - this.layout.contentBottomPadding + 28;

    return pointer.x >= left && pointer.x <= right && pointer.y >= top && pointer.y <= bottom;
  }

  applyScrollDelta(delta) {
    this.scrollY = Phaser.Math.Clamp(this.scrollY + delta, 0, this.maxScrollY);
    this.content.y = -this.scrollY;
  }

  shouldBlockScrollTap() {
    return this.time.now < this.scrollTapBlockUntil;
  }

  bindScrollInput() {
    this.cleanupSceneListeners();

    this.onWheelScroll = (_pointer, _go, _dx, dy) => {
      this.applyScrollDelta(dy * 0.7);
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

      this.applyScrollDelta(-deltaY);
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
      this.applyScrollDelta(-this.scrollSpeed);
    };

    this.onKeyScrollDown = () => {
      this.applyScrollDelta(this.scrollSpeed);
    };

    this.input.on('wheel', this.onWheelScroll);
    this.input.on('pointerdown', this.onPointerDownScroll);
    this.input.on('pointermove', this.onPointerMoveScroll);
    this.input.on('pointerup', this.onPointerUpScroll);
    this.input.keyboard.on('keydown-UP', this.onKeyScrollUp);
    this.input.keyboard.on('keydown-DOWN', this.onKeyScrollDown);
  }

  cleanupSceneListeners() {
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

  createBackground() {
    const { width, height } = this.scale;
    const profile = this.profile || window.CubePathDevice?.getProfile?.(this) || { reducedEffects: false };

    const g = this.add.graphics();
    g.fillGradientStyle(0xb9e2ff, 0xa9d7fb, 0xe8f6ff, 0xcdeaff, 1);
    g.fillRect(0, 0, width, height);

    const cubeColor = 0xffffff;
    const cubeAlpha = profile.isMobile ? 0.10 : 0.14;

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

    const stepX = profile.isMobile ? 208 : 165;
    const stepY = profile.isMobile ? 144 : 118;
    const animationModulo = profile.reducedEffects ? 6 : 3;

    for (let row = 0, y = -20; y < height + 80; y += stepY, row++) {
      for (let col = 0, x = -20; x < width + 80; x += stepX, col++) {
        const offsetX = ((Math.floor(y / stepY) % 2) * 52);
        const px = x + offsetX + Phaser.Math.Between(-18, 18);
        const py = y + Phaser.Math.Between(-12, 12);
        const scale = Phaser.Math.FloatBetween(0.75, 1.2);
        drawSoftCube(px, py, scale, !profile.isMobile && (row + col) % animationModulo === 0);
      }
    }

    const dots = this.add.graphics();
    const dotCount = profile.isMobile ? 90 : (profile.reducedEffects ? 180 : 300);

    for (let i = 0; i < dotCount; i++) {
      dots.fillStyle(0xffffff, Phaser.Math.FloatBetween(0.03, 0.09));
      dots.fillCircle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height),
        Phaser.Math.Between(1, 2)
      );
    }
  }

  animateUiIn() {
    this.uiNodes.forEach((node, i) => {
      if (!node || typeof node.setAlpha !== 'function') return;

      node.setAlpha(0);
      node.y += 10;

      this.tweens.add({
        targets: node,
        alpha: 1,
        y: node.y - 10,
        duration: 220,
        delay: i * 22,
        ease: 'Quad.easeOut'
      });
    });
  }

  buildContent() {
    const width = this.scale.width;
    let y = this.layout.contentStartY;

    y = this.addTutorialSection(width, y);
    y += 22;

    const biomeNames = ['Луг', 'Лёд', 'Пустыня', 'Вулкан', 'Руины'];

    for (let biome = 0; biome < 5; biome++) {
      y = this.addCampaignBiomeSection(width, y, biome, biomeNames[biome]);
      y += 22;
    }

    const visibleHeight = this.scale.height - this.layout.contentBottomPadding;
    this.maxScrollY = Math.max(0, y - visibleHeight);
  }

  addSectionHeader(width, y, title, subtitle = '', color = '#ffffff', locked = false) {
    const cardX = width / 2;
    const cardW = this.layout.contentWidth;
    const cardH = subtitle ? this.layout.sectionCardHWithSubtitle : this.layout.sectionCardHPlain;

    const shadow = this.createRoundedRect(cardX, y + cardH / 2 + 4, cardW, cardH, 18, 0x6689a8, 0.10);
    const bg = this.createRoundedRect(cardX, y + cardH / 2, cardW, cardH, 18, 0xffffff, locked ? 0.11 : 0.18, 0xeaf8ff, 0.55, 2);
    const gloss = this.createRoundedRect(cardX, y + 18, cardW - 14, 26, 12, 0xffffff, 0.06);

    const titleText = this.add.text(
      cardX,
      y + 14,
      title,
      this.makeTextStyle({
        size: this.layout.sectionTitleSize,
        color,
        stroke: locked ? '#a4b3c0' : '#ffffff',
        strokeThickness: 1,
        shadowColor: '#ffffff',
        shadowBlur: 3
      })
    ).setOrigin(0.5, 0);
    this.fitTextToBox(titleText, cardW - 28, 30, 12);

    this.content.add([shadow, bg, gloss, titleText]);

    if (subtitle) {
      const sub = this.add.text(
        cardX,
        y + 44,
        subtitle,
        {
          ...this.makeTextStyle({
            size: this.layout.sectionSubtitleSize,
            color: locked ? '#8f9ead' : '#7088a0',
            stroke: '#ffffff',
            strokeThickness: 1,
            shadowColor: '#ffffff',
            shadowBlur: 2,
            bold: true,
            align: 'center'
          }),
          wordWrap: { width: cardW - 30 }
        }
      ).setOrigin(0.5, 0);
      this.fitTextToBox(sub, cardW - 30, cardH - 42, 10);

      this.content.add(sub);
    }

    return y + cardH + 10;
  }

  addTutorialSection(width, y) {
    y = this.addSectionHeader(
      width,
      y,
      'Обучение',
      '3 коротких уровня с базовыми механиками',
      '#5b7897'
    );

    const total = window.CubePathData.tutorialLevels.length;
    const unlocked = CubePathStorage.getUnlockedLevel('tutorial');
    const current = CubePathStorage.getCurrentLevel('tutorial');

    y = this.addLevelButtonsRow({
      y,
      totalLevels: total,
      unlockedLevelIndex: unlocked,
      currentLevelIndex: current,
      mode: 'tutorial',
      startLevel: 0,
      biomeLocked: false
    });

    return y;
  }

  addCampaignBiomeSection(width, y, biomeIndex, biomeName) {
    const required = CubePathStorage.getBiomeUnlockRequirement(biomeIndex);
    const isRuinsPreview = biomeIndex === 4;

    const unlocked = isRuinsPreview
      ? false
      : CubePathStorage.isBiomeUnlocked(biomeIndex, 'campaign');

    const subtitle = isRuinsPreview
      ? 'Закрыт • в следующем обновлении'
      : biomeIndex === 0
        ? 'Стартовый биом'
        : unlocked
          ? `Открыт • требуется ${required}★`
          : `Закрыт • требуется ${required}★`;

    y = this.addSectionHeader(
      width,
      y,
      biomeName,
      subtitle,
      unlocked ? '#5b7897' : '#8a9cad',
      !unlocked
    );

    const start = biomeIndex * 20;
    const total = 20;
    const unlockedLevelIndex = CubePathStorage.getUnlockedLevel('campaign');
    const currentLevelIndex = CubePathStorage.getCurrentLevel('campaign');

    y = this.addLevelButtonsRow({
      y,
      totalLevels: total,
      unlockedLevelIndex,
      currentLevelIndex,
      mode: 'campaign',
      startLevel: start,
      biomeLocked: !unlocked,
      showComingSoonOverlay: isRuinsPreview
    });

    return y;
  }

  addLevelButtonsRow({
    y,
    totalLevels,
    unlockedLevelIndex,
    currentLevelIndex,
    mode,
    startLevel = 0,
    biomeLocked = false,
    showComingSoonOverlay = false
  }) {
    const perRow = this.layout.levelsPerRow;
    const gapX = this.layout.levelGapX;
    const gapY = this.layout.levelGapY;
    const buttonH = this.layout.levelButtonH;
    const availableWidth = this.layout.contentWidth - 28;
    const buttonW = Math.max(
      80,
      Math.floor((availableWidth - gapX * (perRow - 1)) / perRow)
    );
    const rows = Math.ceil(totalLevels / perRow);
    const contentWidth = perRow * buttonW + (perRow - 1) * gapX;
    const contentHeight = rows * buttonH + (rows - 1) * gapY;
    const startX = Math.round((this.scale.width - contentWidth) / 2);
    const contentCenterX = startX + contentWidth / 2;
    const contentCenterY = y + contentHeight / 2;

    for (let i = 0; i < totalLevels; i++) {
      const globalLevel = startLevel + i;
      const row = Math.floor(i / perRow);
      const col = i % perRow;

      const x = startX + col * (buttonW + gapX);
      const yy = y + row * (buttonH + gapY);

      const isUnlocked = !biomeLocked && globalLevel <= unlockedLevelIndex;
      const isCurrent = globalLevel === currentLevelIndex;

      const btn = this.createLevelButton(
        x + buttonW / 2,
        yy + buttonH / 2,
        buttonW,
        buttonH,
        `${i + 1}`,
        {
          unlocked: isUnlocked,
          current: isCurrent,
          onClick: () => {
            if (!isUnlocked) return;
            CubePathStorage.setMode(mode);
            CubePathStorage.setCurrentLevel(globalLevel, mode);
            this.scene.start('GameScene');
          }
        }
      );

      this.content.add(btn.nodes);

      const stars = CubePathStorage.getBestStars(mode, globalLevel);
      const starGap = Math.max(14, Math.floor(buttonW * 0.18));
      const firstStarX = x + buttonW / 2 - starGap;

      for (let s = 0; s < 3; s++) {
        const star = this.add.text(
          firstStarX + s * starGap,
          yy + buttonH - 12,
          '★',
          this.makeTextStyle({
            size: this.layout.starSize,
            color: s < stars ? '#ffd54a' : '#aab6c2',
            stroke: s < stars ? '#d8a62c' : '#dfe7ef',
            strokeThickness: 1,
            shadowColor: '#ffffff',
            shadowBlur: 2
          })
        ).setOrigin(0.5);

        this.content.add(star);
      }
    }

    if (showComingSoonOverlay) {
      const overlayShadow = this.createRoundedRect(
        contentCenterX,
        contentCenterY + 5,
        contentWidth + 28,
        contentHeight + 24,
        22,
        0x6689a8,
        0.10
      );

      const overlayBg = this.createRoundedRect(
        contentCenterX,
        contentCenterY,
        contentWidth + 28,
        contentHeight + 24,
        22,
        0xffffff,
        0.28,
        0xeaf8ff,
        0.75,
        2
      );

      const lock = this.add.text(
        contentCenterX,
        contentCenterY - 16,
        '🔒',
        this.makeTextStyle({
          size: this.profile?.isMobile ? 34 : 42,
          color: '#ffffff',
          stroke: '#8ea0b0',
          strokeThickness: 2,
          shadowColor: '#ffffff',
          shadowBlur: 4
        })
      ).setOrigin(0.5);

      const label = this.add.text(
        contentCenterX,
        contentCenterY + 22,
        'В следующем обновлении',
        this.makeTextStyle({
          size: this.profile?.isMobile ? 15 : 18,
          color: '#7b8d9e',
          stroke: '#ffffff',
          strokeThickness: 1,
          shadowColor: '#ffffff',
          shadowBlur: 2
        })
      ).setOrigin(0.5);

      this.content.add([overlayShadow, overlayBg, lock, label]);
    }

    return y + rows * (buttonH + gapY) + this.layout.levelVerticalPadding;
  }

  createLevelButton(x, y, w, h, label, options = {}) {
    const profile = this.profile || window.CubePathDevice?.getProfile?.(this) || { isMobile: false, touchTarget: 48 };
    const unlocked = options.unlocked ?? false;
    const current = options.current ?? false;
    const onClick = options.onClick ?? (() => {});

    const colors = !unlocked
      ? {
        base: 0xc1ccd6,
        hover: 0xc1ccd6,
        down: 0xc1ccd6,
        stroke: 0xe8eff5,
        text: '#eef3f7',
        textStroke: '#99a7b3',
        shadow: 0x7891a7,
        alpha: 0.65
      }
      : current
        ? {
          base: 0x4fa8ff,
          hover: 0x69b7ff,
          down: 0x348fdc,
          stroke: 0xdff6ff,
          text: '#ffffff',
          textStroke: '#5d85aa',
          shadow: 0x5d89ae,
          alpha: 0.98
        }
        : {
          base: 0x8ec8f0,
          hover: 0xa4d5f5,
          down: 0x74b6e0,
          stroke: 0xeaf8ff,
          text: '#ffffff',
          textStroke: '#6e93b1',
          shadow: 0x6c8da8,
          alpha: 0.95
        };

    const shadow = this.createRoundedRect(x, y + 4, w, h, 16, colors.shadow, 0.14);
    const bg = this.createRoundedRect(x, y, w, h, 16, colors.base, colors.alpha, colors.stroke, 1, 2);
    const inner = profile.isMobile ? null : this.createRoundedRect(x, y, w - 8, h - 8, 12, 0xffffff, 0.05, 0xffffff, 0.14, 1);
    const gloss = profile.isMobile ? null : this.createRoundedRect(x, y - 12, w - 12, h / 2 - 4, 10, 0xffffff, 0.14);

    const hit = this.add.rectangle(
      x,
      y,
      Math.max(w, profile.touchTarget),
      Math.max(h, profile.touchTarget),
      0x000000,
      0.001
    );
    if (unlocked) {
      hit.setInteractive({ useHandCursor: !profile.isMobile });
    }

    const text = this.add.text(
      x,
      y - 8,
      label,
      this.makeTextStyle({
        size: this.layout.levelTitleSize,
        color: colors.text,
        stroke: colors.textStroke,
        strokeThickness: 2,
        shadowColor: colors.textStroke,
        shadowBlur: 4
      })
    ).setOrigin(0.5);
    this.fitTextToBox(text, w - 16, 26, 10);

    if (unlocked) {
      if (!profile.isMobile) {
        hit.on('pointerover', () => {
          this.redrawRoundedRect(bg, x, y, w, h, 16, colors.hover, colors.alpha, colors.stroke, 1, 2);
        });

        hit.on('pointerout', () => {
          this.redrawRoundedRect(bg, x, y, w, h, 16, colors.base, colors.alpha, colors.stroke, 1, 2);
        });
      }

      hit.on('pointerdown', () => {
        this.redrawRoundedRect(bg, x, y, w, h, 16, colors.down, 1, colors.stroke, 1, 2);
      });

      hit.on('pointerup', () => {
        if (this.shouldBlockScrollTap()) {
          this.redrawRoundedRect(bg, x, y, w, h, 16, colors.base, colors.alpha, colors.stroke, 1, 2);
          return;
        }

        this.redrawRoundedRect(bg, x, y, w, h, 16, profile.isMobile ? colors.base : colors.hover, colors.alpha, colors.stroke, 1, 2);
        onClick();
      });
    }

    return { nodes: [shadow, bg, inner, gloss, hit, text].filter(Boolean) };
  }

  createTopButton(x, y, w, h, label, onClick) {
    const profile = this.profile || window.CubePathDevice?.getProfile?.(this) || { isMobile: false, touchTarget: 48 };
    const shadow = this.createRoundedRect(x, y + 4, w, h, 16, 0x4e7ead, 0.16);
    const bg = this.createRoundedRect(x, y, w, h, 16, 0x5aa8f2, 0.95, 0xe8f8ff, 0.95, 3);
    const inner = this.createRoundedRect(x, y, w - 8, h - 8, 14, 0xffffff, 0.06, 0xffffff, 0.20, 1);
    const gloss = this.createRoundedRect(x, y - 11, w - 12, h / 2 - 8, 12, 0xffffff, 0.16);

    const hit = this.add.rectangle(x, y, Math.max(w, profile.touchTarget), Math.max(h, profile.touchTarget), 0x000000, 0.001)
      .setInteractive({ useHandCursor: !profile.isMobile });

    const text = this.add.text(
      x,
      y,
      label,
      this.makeTextStyle({
        size: this.profile?.isMobile ? 16 : 18,
        color: '#f8fcff',
        stroke: '#5d85aa',
        strokeThickness: 2,
        shadowColor: '#4d79a8',
        shadowBlur: 4
      })
    ).setOrigin(0.5);
    text.setAlign('center');
    text.setWordWrapWidth(Math.max(36, w - 18), true);
    this.fitTextToBox(text, w - 16, h - 10, 11);

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
      this.redrawRoundedRect(bg, x, y, w, h, 16, profile.isMobile ? 0x5aa8f2 : 0x6cb8ff, profile.isMobile ? 0.95 : 0.98, 0xe8f8ff, 0.95, 3);
      setScaleAll(profile.isMobile ? 1 : 1.02);
      onClick();
    });

    return { nodes: [shadow, bg, inner, gloss, hit, text] };
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

  fitTextToBox(text, maxWidth, maxHeight, minSize = 10) {
    window.CubePathLayout?.fitText?.(text, {
      maxWidth,
      maxHeight,
      minSize
    });
    return text;
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
}

window.LevelSelectScene = LevelSelectScene;
