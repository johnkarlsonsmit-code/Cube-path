class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
    this.menuNodes = [];
    this.controlsOverlayNodes = [];
    this.profile = null;
  }

  create() {
    const { width, height } = this.scale;
    this.__cubePathResizeKey = `${width}x${height}`;
    this.profile = window.CubePathDevice?.getProfile?.(this) || {
      isMobile: false,
      isPortrait: false,
      touchTarget: 48,
      safePadding: 14
    };

    CubePathAds.init();
    CubePathAds.gameplayStop?.();
    CubePathAds.signalReady?.();

    this.menuNodes = [];
    this.controlsOverlayNodes = [];
    this.cameras.main.setBackgroundColor('#9fd4ff');

    this.createBackground();

    const layout = this.getMenuLayout(width, height);

    const title = this.add.text(
      width / 2,
      layout.titleY,
      'Cube Path',
      this.makeTextStyle({
        size: layout.titleSize,
        color: '#fff8ec',
        stroke: '#b17438',
        strokeThickness: 4,
        shadowColor: '#ffffff',
        shadowBlur: 8
      })
    ).setOrigin(0.5);

    const subtitle = this.add.text(
      width / 2,
      layout.subtitleY,
      'Аркадная puzzle-lite игра',
      this.makeTextStyle({
        size: layout.subtitleSize,
        color: '#5f7891',
        stroke: '#ffffff',
        strokeThickness: 1,
        shadowColor: '#ffffff',
        shadowBlur: 3
      })
    ).setOrigin(0.5);

    const controlsHint = this.add.text(
      width / 2,
      layout.hintY,
      layout.controlsHint,
      this.makeTextStyle({
        size: layout.hintSize,
        color: '#6f87a0',
        stroke: '#ffffff',
        strokeThickness: 1,
        shadowColor: '#ffffff',
        shadowBlur: 2
      })
    ).setOrigin(0.5);

    this.menuNodes.push(title, subtitle, controlsHint);

    const canContinue = CubePathStorage.canContinueCampaign();
    const isDesktopMenu = !this.profile?.isMobile;
    const buttonDefs = [
      {
        label: canContinue ? 'Продолжить' : 'Продолжить недоступно',
        width: layout.primaryButtonWidth,
        height: layout.primaryButtonHeight,
        disabled: !canContinue,
        onClick: () => {
          if (!canContinue) return;
          CubePathStorage.setMode('campaign');
          CubePathStorage.setCurrentLevel(
            CubePathStorage.getContinueCampaignLevel(),
            'campaign'
          );
          this.scene.start('GameScene');
        }
      },
      {
        label: 'Кампания',
        width: layout.secondaryButtonWidth,
        height: layout.primaryButtonHeight,
        onClick: () => {
          CubePathStorage.setMode('campaign');
          this.scene.start('LevelSelectScene');
        }
      },
      {
        label: 'Бесконечный режим',
        width: layout.primaryButtonWidth,
        height: layout.primaryButtonHeight,
        onClick: () => {
          CubePathStorage.setMode('survival');
          CubePathStorage.setCurrentLevel(0, 'survival');
          this.scene.start('GameScene');
        }
      },
      {
        label: 'Выбор уровня',
        width: layout.secondaryButtonWidth,
        height: layout.primaryButtonHeight,
        onClick: () => {
          CubePathStorage.setMode('campaign');
          this.scene.start('LevelSelectScene');
        }
      },
      {
        label: 'Магазин',
        width: layout.secondaryButtonWidth,
        height: layout.secondaryButtonHeight,
        onClick: () => {
          this.scene.start('ShopScene');
        }
      }
    ];

    if (!isDesktopMenu) {
      buttonDefs.push({
        label: 'Настройки',
        width: layout.secondaryButtonWidth,
        height: layout.secondaryButtonHeight,
        onClick: () => {
          this.scene.start('SettingsScene');
        }
      });
    }

    const mainButtons = buttonDefs.map((def, index) => {
      const row = Math.floor(index / layout.columns);
      const col = index % layout.columns;
      const x = layout.startX + col * (layout.columnWidth + layout.gapX) + layout.columnWidth / 2;
      const y = layout.startY + row * (layout.primaryButtonHeight + layout.gapY);

      return this.createMenuButton(
        x,
        y,
        def.width,
        def.height,
        def.label,
        def.onClick,
        { disabled: def.disabled }
      );
    });

    const controlsBtn = this.createMenuButton(
      width / 2,
      layout.resetY,
      layout.resetButtonWidth,
      layout.resetButtonHeight,
      'Управление',
      () => {
        this.showControlsOverlay();
      },
      { small: true }
    );

    const settingsSideBtn = isDesktopMenu
      ? this.createMenuButton(
        layout.settingsX,
        layout.settingsY,
        layout.settingsWidth,
        layout.settingsHeight,
        'Настройки',
        () => {
          this.scene.start('SettingsScene');
        },
        { small: true }
      )
      : null;

    this.menuNodes.push(
      ...mainButtons.flatMap((button) => button.nodes),
      ...controlsBtn.nodes,
      ...(settingsSideBtn?.nodes || [])
    );

    const footer = this.add.text(
      width / 2,
      layout.footerY,
      layout.footerText,
      this.makeTextStyle({
        size: layout.footerSize,
        color: '#6f87a0',
        stroke: '#ffffff',
        strokeThickness: 1,
        shadowColor: '#ffffff',
        shadowBlur: 2
      })
    ).setOrigin(0.5);

    this.menuNodes.push(footer);
    this.animateMenuIn();
  }

  handleResize() {
    if (!this.sys?.settings?.active) return;

    this.clearControlsOverlay();
    this.scene.restart();
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

    this.add.rectangle(
      width / 2,
      profile.isMobile ? Math.min(height * 0.33, 210) : 226,
      width - 300,
      3,
      0xffffff,
      0.24
    );
  }

  getMenuLayout(width, height) {
    const profile = this.profile || {
      isMobile: false,
      isPortrait: false,
      touchTarget: 48,
      safePadding: 14
    };

    if (!profile.isMobile) {
      return {
        titleY: 88,
        titleSize: 56,
        subtitleY: 145,
        subtitleSize: 22,
        hintY: 188,
        hintSize: 18,
        controlsHint: 'Свайпы на телефоне, клавиши на ПК',
        columns: 1,
        columnWidth: 360,
        primaryButtonWidth: 360,
        secondaryButtonWidth: 320,
        primaryButtonHeight: 62,
        secondaryButtonHeight: 58,
        startX: width / 2 - 180,
        startY: 265,
        gapX: 0,
        gapY: 13,
        resetY: 635,
        resetButtonWidth: 300,
        resetButtonHeight: 50,
        settingsX: width - 118,
        settingsY: 96,
        settingsWidth: 180,
        settingsHeight: 46,
        footerY: 690,
        footerText: 'Все клавиши и жесты — в разделе "Управление"',
        footerSize: 15
      };
    }

    const safe = profile.safePadding + 8;
    const buttonHeight = Math.min(72, Math.max(50, Math.round(profile.touchTarget * 0.75)));
    const secondaryHeight = Math.max(buttonHeight - 4, 48);

    if (profile.isPortrait) {
      const buttonWidth = Math.min(width - safe * 2, 360);
      const gapY = 12;
      const startY = Math.max(240, Math.round(height * 0.34));

      return {
        titleY: 74,
        titleSize: 46,
        subtitleY: 120,
        subtitleSize: 20,
        hintY: 156,
        hintSize: 17,
        controlsHint: 'Свайп для телефона, клавиши для ПК',
        columns: 1,
        columnWidth: buttonWidth,
        primaryButtonWidth: buttonWidth,
        secondaryButtonWidth: buttonWidth,
        primaryButtonHeight: buttonHeight,
        secondaryButtonHeight: secondaryHeight,
        startX: (width - buttonWidth) / 2,
        startY,
        gapX: 0,
        gapY,
        resetY: Math.min(height - 78, startY + 6 * (buttonHeight + gapY)),
        resetButtonWidth: Math.min(buttonWidth, 320),
        resetButtonHeight: 48,
        footerY: height - 26,
        footerText: 'Все клавиши и жесты — в "Управлении"',
        footerSize: 14
      };
    }

    const gapX = 16;
    const columns = 2;
    const buttonWidth = Math.min(320, Math.floor((width - safe * 2 - gapX) / 2));
    const startX = (width - (columns * buttonWidth + gapX)) / 2;

    return {
      titleY: 42,
      titleSize: 40,
      subtitleY: 76,
      subtitleSize: 17,
      hintY: 104,
      hintSize: 14,
      controlsHint: 'Свайп для телефона, клавиши для ПК',
      columns,
      columnWidth: buttonWidth,
      primaryButtonWidth: buttonWidth,
      secondaryButtonWidth: buttonWidth,
      primaryButtonHeight: buttonHeight,
      secondaryButtonHeight: secondaryHeight,
      startX,
      startY: Math.max(156, Math.round(height * 0.4)),
      gapX,
      gapY: 12,
      resetY: height - 44,
      resetButtonWidth: Math.min(320, width - safe * 2),
      resetButtonHeight: 42,
      footerY: height - 18,
      footerText: 'Все клавиши и жесты — в "Управлении"',
      footerSize: 12
    };
  }

  clearControlsOverlay() {
    if (!this.controlsOverlayNodes?.length) return;

    this.controlsOverlayNodes.forEach((node) => {
      if (node && typeof node.destroy === 'function') {
        node.destroy();
      }
    });

    this.controlsOverlayNodes = [];
  }

  getLegacyControlsOverlayContent() {
    return {
      mobile: [
        'ПК',
        'W / A / S / D или стрелки — движение',
        'R — рестарт уровня',
        'Q / E — предыдущий / следующий уровень',
        'T — пересобрать текущий уровень кампании',
        '1 / Z — буст ICE',
        '2 / X — буст PWR',
        'Esc — пауза',
        '',
        'Телефон',
        'Диагональный свайп — движение',
        'Кнопка сверху справа — пауза',
        'Кнопки ICE / PWR снизу — бусты'
      ].join('\n'),
      desktopLeftTitle: 'ПК',
      desktopLeftText: [
        'W / A / S / D или стрелки — движение',
        'R — рестарт уровня',
        'Q / E — предыдущий / следующий уровень',
        'T — пересобрать текущий уровень кампании',
        '1 / Z — буст ICE',
        '2 / X — буст PWR',
        'Esc — пауза'
      ].join('\n'),
      desktopRightTitle: 'Телефон',
      desktopRightText: [
        'Диагональный свайп — движение',
        'Кнопка сверху справа — пауза',
        'Кнопки ICE / PWR снизу — бусты'
      ].join('\n')
    };
  }

  getControlsOverlayContent() {
    return {
      mobile: [
        'ПК',
        'W / A / S / D или стрелки — движение',
        'R — рестарт уровня',
        '1 / Z — буст ICE',
        '2 / X — буст PWR',
        'Esc — пауза',
        '',
        'Телефон',
        'Диагональный свайп — движение',
        'Кнопка сверху справа — пауза',
        'Кнопки ICE / PWR снизу — бусты'
      ].join('\n'),
      desktopLeftTitle: 'ПК',
      desktopLeftText: [
        'W / A / S / D или стрелки — движение',
        'R — рестарт уровня',
        '1 / Z — буст ICE',
        '2 / X — буст PWR',
        'Esc — пауза'
      ].join('\n'),
      desktopRightTitle: 'Телефон',
      desktopRightText: [
        'Диагональный свайп — движение',
        'Кнопка сверху справа — пауза',
        'Кнопки ICE / PWR снизу — бусты'
      ].join('\n')
    };
  }

  showControlsOverlay() {
    this.clearControlsOverlay();

    const { width, height } = this.scale;
    const profile = this.profile || window.CubePathDevice?.getProfile?.(this) || {
      isMobile: false,
      isPortrait: false,
      safePadding: 14
    };
    const safe = (profile.safePadding || 14) + 8;
    const panelWidth = Math.min(
      width - safe * 2,
      profile.isMobile
        ? (profile.isPortrait ? 346 : 430)
        : 700
    );
    const panelHeight = Math.min(
      height - safe * 2,
      profile.isMobile
        ? (profile.isPortrait ? 470 : 360)
        : 430
    );
    const cx = width / 2;
    const cy = height / 2;
    const content = this.getControlsOverlayContent();

    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x6c9dcb, 0.28).setInteractive().setDepth(200);
    const shadow = this.createRoundedRect(cx, cy + 6, panelWidth, panelHeight, 24, 0x4e7ead, 0.18);
    const panel = this.createRoundedRect(cx, cy, panelWidth, panelHeight, 24, 0xe8f5ff, 0.98, 0xffffff, 0.95, 2);
    const inner = this.createRoundedRect(cx, cy, panelWidth - 12, panelHeight - 12, 18, 0xffffff, 0.3, 0xffffff, 0.4, 1);
    const gloss = this.createRoundedRect(cx, cy - panelHeight / 2 + 28, panelWidth - 24, 42, 14, 0xffffff, 0.2);
    shadow.setDepth(201);
    panel.setDepth(202);
    inner.setDepth(203);
    gloss.setDepth(204);

    const title = this.add.text(
      cx,
      cy - panelHeight / 2 + 42,
      'Управление',
      this.makeTextStyle({
        size: profile.isMobile ? (profile.isPortrait ? 24 : 26) : 30,
        color: '#fff8ec',
        stroke: '#6b8eb1',
        strokeThickness: 3,
        shadowColor: '#ffffff',
        shadowBlur: 6
      })
    ).setOrigin(0.5).setDepth(205);

    const contentNodes = [];

    const useSingleColumn = profile.isMobile && profile.isPortrait;

    if (useSingleColumn) {
      const body = this.add.text(
        cx - panelWidth / 2 + 28,
        cy - panelHeight / 2 + 88,
        content.mobile,
        this.makeTextStyle({
          size: profile.isPortrait ? 12 : 13,
          color: '#5f7891',
          stroke: '#ffffff',
          strokeThickness: 1,
          shadowColor: '#ffffff',
          shadowBlur: 2,
          bold: false,
          align: 'left'
        })
      ).setOrigin(0, 0).setDepth(205);
      body.setWordWrapWidth(panelWidth - 56, true);
      body.setLineSpacing(profile.isPortrait ? 5 : 6);
      contentNodes.push(body);
    } else {
      const sectionTop = cy - panelHeight / 2 + 94;
      const columnGap = 34;
      const columnWidth = (panelWidth - 88 - columnGap) / 2;
      const leftX = cx - panelWidth / 2 + 34;
      const rightX = leftX + columnWidth + columnGap;
      const sectionTitleSize = profile.isMobile ? 16 : 20;
      const sectionBodySize = profile.isMobile ? 11 : 15;
      const sectionBodySpacing = profile.isMobile ? 4 : 6;

      const leftTitle = this.add.text(
        leftX,
        sectionTop,
        content.desktopLeftTitle,
        this.makeTextStyle({
          size: sectionTitleSize,
          color: '#fff8ec',
          stroke: '#6b8eb1',
          strokeThickness: 2,
          shadowColor: '#ffffff',
          shadowBlur: 4,
          align: 'left'
        })
      ).setOrigin(0, 0).setDepth(205);

      const leftBody = this.add.text(
        leftX,
        sectionTop + 34,
        content.desktopLeftText,
        this.makeTextStyle({
          size: sectionBodySize,
          color: '#5f7891',
          stroke: '#ffffff',
          strokeThickness: 1,
          shadowColor: '#ffffff',
          shadowBlur: 2,
          bold: false,
          align: 'left'
        })
      ).setOrigin(0, 0).setDepth(205);
      leftBody.setWordWrapWidth(columnWidth, true);
      leftBody.setLineSpacing(sectionBodySpacing);

      const rightTitle = this.add.text(
        rightX,
        sectionTop,
        content.desktopRightTitle,
        this.makeTextStyle({
          size: sectionTitleSize,
          color: '#fff8ec',
          stroke: '#6b8eb1',
          strokeThickness: 2,
          shadowColor: '#ffffff',
          shadowBlur: 4,
          align: 'left'
        })
      ).setOrigin(0, 0).setDepth(205);

      const rightBody = this.add.text(
        rightX,
        sectionTop + 34,
        content.desktopRightText,
        this.makeTextStyle({
          size: sectionBodySize,
          color: '#5f7891',
          stroke: '#ffffff',
          strokeThickness: 1,
          shadowColor: '#ffffff',
          shadowBlur: 2,
          bold: false,
          align: 'left'
        })
      ).setOrigin(0, 0).setDepth(205);
      rightBody.setWordWrapWidth(columnWidth, true);
      rightBody.setLineSpacing(sectionBodySpacing);

      contentNodes.push(leftTitle, leftBody, rightTitle, rightBody);
    }

    const closeBtn = this.createMenuButton(
      cx,
      cy + panelHeight / 2 - 34,
      Math.min(220, panelWidth - 40),
      44,
      'Закрыть',
      () => {
        this.clearControlsOverlay();
      },
      { small: true }
    );
    closeBtn.nodes.forEach((node) => node?.setDepth?.(206));

    overlay.on('pointerdown', (pointer) => {
      const insidePanel =
        pointer.x >= cx - panelWidth / 2 &&
        pointer.x <= cx + panelWidth / 2 &&
        pointer.y >= cy - panelHeight / 2 &&
        pointer.y <= cy + panelHeight / 2;

      if (insidePanel) return;
      this.clearControlsOverlay();
    });

    this.controlsOverlayNodes = [
      overlay,
      shadow,
      panel,
      inner,
      gloss,
      title,
      ...contentNodes,
      ...closeBtn.nodes
    ];
  }

  animateMenuIn() {
    this.menuNodes.forEach((node, i) => {
      if (!node || typeof node.setAlpha !== 'function') return;

      node.setAlpha(0);
      node.y += 12;

      this.tweens.add({
        targets: node,
        alpha: 1,
        y: node.y - 12,
        duration: 220,
        delay: i * 28,
        ease: 'Quad.easeOut'
      });
    });
  }

  createMenuButton(x, y, w, h, label, onClick, options = {}) {
    const profile = this.profile || window.CubePathDevice?.getProfile?.(this) || {
      isMobile: false,
      touchTarget: 48
    };
    const disabled = options.disabled ?? false;
    const small = options.small ?? false;

    const colors = disabled
      ? {
        base: 0xb7c6d4,
        hover: 0xb7c6d4,
        down: 0xb7c6d4,
        stroke: 0xe9f4fb,
        text: '#eef3f8',
        textStroke: '#94a3b2'
      }
      : {
        base: 0x5aa8f2,
        hover: 0x6cb8ff,
        down: 0x3d93e5,
        stroke: 0xe8f8ff,
        text: '#f8fcff',
        textStroke: '#5d85aa'
      };

    const radius = 18;
    const innerRadius = 14;
    const glossRadius = 12;

    const shadow = this.createRoundedRect(x, y + 4, w, h, radius, 0x4e7ead, 0.15);
    const bg = this.createRoundedRect(x, y, w, h, radius, colors.base, 0.95, colors.stroke, 1, 3);
    const inner = this.createRoundedRect(x, y, w - 10, h - 10, innerRadius, 0xffffff, 0.05, 0xffffff, 0.18, 1);
    const gloss = this.createRoundedRect(x, y - 12, w - 16, h / 2, glossRadius, 0xffffff, 0.15);

    const hit = this.add.rectangle(
      x,
      y,
      Math.max(w, profile.touchTarget),
      Math.max(h, profile.touchTarget),
      0x000000,
      0.001
    );

    if (!disabled) {
      hit.setInteractive({ useHandCursor: !profile.isMobile });
    }

    const text = this.add.text(
      x,
      y,
      label,
      this.makeTextStyle({
        size: small ? 19 : 24,
        color: colors.text,
        stroke: colors.textStroke,
        strokeThickness: 3,
        shadowColor: colors.textStroke,
        shadowBlur: 5
      })
    ).setOrigin(0.5);

    const setScaleAll = (scale) => {
      bg.setScale(scale);
      inner.setScale(scale);
      gloss.setScale(scale);
      hit.setScale(scale);
      text.setScale(scale);
    };

    if (!disabled) {
      if (!profile.isMobile) {
        hit.on('pointerover', () => {
          this.redrawRoundedRect(bg, x, y, w, h, radius, colors.hover, 1, colors.stroke, 1, 3);
          setScaleAll(1.03);
        });

        hit.on('pointerout', () => {
          this.redrawRoundedRect(bg, x, y, w, h, radius, colors.base, 0.95, colors.stroke, 1, 3);
          setScaleAll(1);
        });
      }

      hit.on('pointerdown', () => {
        this.redrawRoundedRect(bg, x, y, w, h, radius, colors.down, 1, colors.stroke, 1, 3);
        setScaleAll(0.98);
      });

      hit.on('pointerup', () => {
        this.redrawRoundedRect(bg, x, y, w, h, radius, colors.hover, 1, colors.stroke, 1, 3);
        setScaleAll(profile.isMobile ? 1 : 1.03);
        onClick();
      });
    }

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

window.MenuScene = MenuScene;
