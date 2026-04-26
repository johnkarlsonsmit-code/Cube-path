class SettingsScene extends Phaser.Scene {
  constructor() {
    super('SettingsScene');
    this.returnScene = 'MenuScene';
    this.uiNodes = [];
    this.profile = null;
    this.uiLayout = null;
  }

  create(data) {
    const w = this.scale.width;
    const h = this.scale.height;
    this.__cubePathResizeKey = `${w}x${h}`;

    this.returnScene = data?.returnScene || 'MenuScene';
    this.settings = CubePathStorage.getAudioSettings();
    this.uiNodes = [];
    this.profile = window.CubePathDevice?.getProfile?.(this) || {
      isMobile: false,
      isPortrait: false,
      touchTarget: 48,
      safePadding: 14
    };
    this.uiLayout = this.getSettingsLayout(w, h);
    CubePathAds.gameplayStop?.();

    this.cameras.main.setBackgroundColor('#9fd4ff');

    this.createBackground();

    const layout = this.uiLayout;
    const panelShadow = this.createRoundedRect(layout.panelX, layout.panelY + 4, layout.panelW, layout.panelH, 22, 0x6689a8, 0.12);
    const panelBg = this.createRoundedRect(layout.panelX, layout.panelY, layout.panelW, layout.panelH, 22, 0xffffff, 0.18, 0xeaf8ff, 0.65, 2);
    const panelGloss = this.createRoundedRect(layout.panelX, layout.panelTop + 42, layout.panelW - 48, 52, 16, 0xffffff, 0.08);

    const title = this.add.text(
      layout.panelX,
      layout.titleY,
      'Настройки',
      this.makeTextStyle({
        size: layout.titleSize,
        color: '#fff8ec',
        stroke: '#b17438',
        strokeThickness: 4,
        shadowColor: '#ffffff',
        shadowBlur: 8
      })
    ).setOrigin(0.5);
    this.fitTextToBox(title, layout.panelW - 48, 42, 18);

    const subtitle = this.add.text(
      layout.panelX,
      layout.subtitleY,
      'Звук и музыка',
      this.makeTextStyle({
        size: layout.subtitleSize,
        color: '#5f7891',
        stroke: '#ffffff',
        strokeThickness: 1,
        shadowColor: '#ffffff',
        shadowBlur: 3
      })
    ).setOrigin(0.5);
    this.fitTextToBox(subtitle, layout.panelW - 56, 28, 12);

    const backBtn = this.createTopButton(
      layout.backButtonX,
      layout.backButtonY,
      layout.backButtonW,
      layout.backButtonH,
      'Назад',
      () => {
        this.goBack();
      }
    );

    this.createToggleRow(layout.panelX, layout.toggleRowY[0], 'Звук', this.settings.soundEnabled, (value) => {
      this.settings = CubePathAudio.saveSettings(this, {
        ...this.settings,
        soundEnabled: value
      });
    });

    this.createToggleRow(layout.panelX, layout.toggleRowY[1], 'Музыка', this.settings.musicEnabled, (value) => {
      this.settings = CubePathAudio.saveSettings(this, {
        ...this.settings,
        musicEnabled: value
      });
    });

    this.createSliderRow(layout.panelX, layout.sliderRowY[0], 'Общая громкость', this.settings.masterVolume, (value) => {
      this.settings = CubePathAudio.saveSettings(this, {
        ...this.settings,
        masterVolume: value
      });
    });

    this.createSliderRow(layout.panelX, layout.sliderRowY[1], 'Громкость эффектов', this.settings.sfxVolume, (value) => {
      this.settings = CubePathAudio.saveSettings(this, {
        ...this.settings,
        sfxVolume: value
      });
      CubePathAudio.playStep(this);
    });

    this.createSliderRow(layout.panelX, layout.sliderRowY[2], 'Громкость музыки', this.settings.musicVolume, (value) => {
      this.settings = CubePathAudio.saveSettings(this, {
        ...this.settings,
        musicVolume: value
      });
    });

    this.uiNodes.push(panelShadow, panelBg, panelGloss, title, subtitle, ...backBtn.nodes);
    this.animateUiIn();
  }

  handleResize() {
    if (!this.sys?.settings?.active) return;
    this.scene.restart({ returnScene: this.returnScene });
  }

  getSettingsLayout(w, h) {
    const profile = this.profile || {
      isMobile: false,
      isPortrait: false,
      touchTarget: 48,
      safePadding: 14
    };

    if (!profile.isMobile) {
      return {
        panelX: w / 2,
        panelY: h / 2,
        panelTop: h / 2 - 235,
        panelW: 620,
        panelH: 470,
        titleY: 86,
        titleSize: 38,
        subtitleY: 126,
        subtitleSize: 20,
        backButtonX: w - 110,
        backButtonY: 46,
        backButtonW: 160,
        backButtonH: 52,
        rowWidth: 420,
        toggleButtonW: 100,
        toggleButtonH: 40,
        sliderWidth: 250,
        toggleRowY: [220, 290],
        sliderRowY: [372, 454, 536],
        labelSize: 23,
        valueSize: 19,
        sliderLabelSize: 20,
        sliderValueSize: 16
      };
    }

    const safe = profile.safePadding + 6;
    const panelW = Math.min(w - safe * 2, profile.isPortrait ? 420 : 720);
    const panelH = Math.min(h - safe * 2, profile.isPortrait ? 568 : 352);
    const panelX = w / 2;
    const panelY = h / 2;
    const panelTop = panelY - panelH / 2;
    const panelBottom = panelY + panelH / 2;
    const isTightLandscape = !profile.isPortrait && panelH <= 320;
    const backButtonPlacement = profile.isPortrait ? 'footer' : 'header';
    const backButtonH = Math.max(isTightLandscape ? 32 : 38, Math.min(isTightLandscape ? 38 : 46, Math.round(profile.touchTarget * 0.74)));
    const rowWidth = panelW - (profile.isPortrait ? 42 : 68);
    const sliderReservedRight = profile.isPortrait ? 52 : 76;
    const sliderWidth = Math.max(profile.isPortrait ? 132 : 150, rowWidth - sliderReservedRight);
    const toggleGap = profile.isPortrait ? 58 : (isTightLandscape ? 70 : 86);
    const contentTop = panelTop + (profile.isPortrait ? 138 : (isTightLandscape ? 86 : 122));
    const contentBottom = panelBottom - (backButtonPlacement === 'footer' ? backButtonH + 34 : (isTightLandscape ? 16 : 28));
    const stack = window.CubePathLayout?.resolveVerticalStack?.({
      availableHeight: Math.max(150, contentBottom - contentTop),
      itemCount: 5,
      preferredItemHeight: profile.isPortrait ? 54 : (isTightLandscape ? 34 : 50),
      minItemHeight: profile.isPortrait ? 42 : (isTightLandscape ? 28 : 40),
      preferredGap: profile.isPortrait ? 14 : (isTightLandscape ? 5 : 12),
      minGap: isTightLandscape ? 3 : 8
    }) || {
      itemHeight: profile.isPortrait ? 48 : 46,
      gap: profile.isPortrait ? 12 : 10
    };
    const rowStep = stack.itemHeight + stack.gap;
    const totalContentHeight = stack.itemHeight * 5 + stack.gap * 4;
    const centeredTop = contentTop + Math.max(0, (contentBottom - contentTop - totalContentHeight) / 2);
    const toggleStart = centeredTop + stack.itemHeight * 0.5;
    const sliderStart = toggleStart + rowStep * 2;

    return {
      panelX,
      panelY,
      panelTop,
      panelBottom,
      isTightLandscape,
      panelW,
      panelH,
      titleY: panelTop + (profile.isPortrait ? 42 : (isTightLandscape ? 30 : 40)),
      titleSize: profile.isPortrait ? 30 : (isTightLandscape ? 22 : 26),
      subtitleY: panelTop + (profile.isPortrait ? 76 : (isTightLandscape ? 54 : 68)),
      subtitleSize: profile.isPortrait ? 16 : (isTightLandscape ? 12 : 15),
      backButtonPlacement,
      backButtonX: backButtonPlacement === 'footer'
        ? panelX
        : panelX - panelW / 2 + (isTightLandscape ? 56 : 66),
      backButtonY: backButtonPlacement === 'footer'
        ? panelBottom - (backButtonH / 2 + 18)
        : panelTop + (isTightLandscape ? 54 : 98),
      backButtonW: backButtonPlacement === 'footer'
        ? Math.min(panelW - 52, 210)
        : (isTightLandscape ? 104 : 124),
      backButtonH,
      rowWidth,
      toggleButtonW: profile.isPortrait ? 98 : (isTightLandscape ? 82 : 94),
      toggleButtonH: Math.max(isTightLandscape ? 28 : 34, Math.min(isTightLandscape ? 34 : 42, Math.round(profile.touchTarget * 0.66))),
      sliderWidth,
      toggleRowY: [toggleStart, toggleStart + rowStep],
      sliderRowY: [sliderStart, sliderStart + rowStep, sliderStart + rowStep * 2],
      labelSize: profile.isPortrait ? 18 : (isTightLandscape ? 13 : 17),
      valueSize: profile.isPortrait ? 15 : (isTightLandscape ? 11 : 14),
      sliderLabelSize: profile.isPortrait ? 16 : (isTightLandscape ? 12 : 15),
      sliderValueSize: profile.isPortrait ? 14 : (isTightLandscape ? 11 : 13),
      sliderValueInset: profile.isPortrait ? 16 : 22,
      toggleGap
    };
  }

  goBack() {
    if (this.returnScene === 'PauseScene') {
      this.scene.stop();
      this.scene.resume('PauseScene');
    } else if (this.returnScene === 'GameScene') {
      this.scene.stop();
      CubePathAds.gameplayStart?.();
      this.scene.resume('GameScene');
    } else {
      this.scene.start('MenuScene');
    }
  }

  createBackground() {
    const { width, height } = this.scale;
    const profile = this.profile || window.CubePathDevice?.getProfile?.(this) || { reducedEffects: false };

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
  }

  createToggleRow(x, y, label, initialValue, onChange) {
    const layout = this.uiLayout;
    const rowWidth = layout.rowWidth;
    const left = x - rowWidth / 2;
    const buttonX = x + rowWidth / 2 - layout.toggleButtonW / 2;
    const valueX = buttonX - layout.toggleGap;
    const labelWidth = Math.max(110, rowWidth - layout.toggleButtonW - 24);
    const compactRow = !!layout.isTightLandscape;

    const labelText = this.add.text(
      left,
      y,
      label,
      this.makeTextStyle({
        size: layout.labelSize,
        color: '#5f7891',
        stroke: '#ffffff',
        strokeThickness: 1,
        shadowColor: '#ffffff',
        shadowBlur: 3,
        align: 'left'
      })
    ).setOrigin(0, 0.5);
    this.fitTextToBox(labelText, labelWidth, compactRow ? 18 : 24, compactRow ? 9 : 11);

    const valueText = this.add.text(
      valueX,
      y,
      initialValue ? 'ВКЛ' : 'ВЫКЛ',
      this.makeTextStyle({
        size: layout.valueSize,
        color: initialValue ? '#6ddc91' : '#ff7777',
        stroke: '#ffffff',
        strokeThickness: 1,
        shadowColor: '#ffffff',
        shadowBlur: 2
      })
    ).setOrigin(0.5);

    valueText.setVisible(false);

    let buttonRef = null;

    const refreshButton = () => {
      if (buttonRef?.bg) {
        this.redrawRoundedRect(
          buttonRef.bg,
          buttonX,
          y,
          layout.toggleButtonW,
          layout.toggleButtonH,
          14,
          initialValue ? 0x5aa8f2 : 0xc1ccd6,
          0.95,
          0xe8f8ff,
          0.95,
          2
        );
      }

      if (buttonRef?.inner) {
        this.redrawRoundedRect(
          buttonRef.inner,
          buttonX,
          y,
          layout.toggleButtonW - 8,
          layout.toggleButtonH - 8,
          11,
          0xffffff,
          0.06,
          0xffffff,
          0.18,
          1
        );
      }

      if (buttonRef?.text) {
        buttonRef.text.setText(initialValue ? 'ВКЛ' : 'ВЫКЛ');
      }

      valueText.setText(initialValue ? 'ВКЛ' : 'ВЫКЛ');
      valueText.setColor(initialValue ? '#6ddc91' : '#ff7777');
    };

    buttonRef = this.createToggleButton(
      buttonX,
      y,
      layout.toggleButtonW,
      layout.toggleButtonH,
      initialValue ? 'ВКЛ' : 'ВЫКЛ',
      () => {
        initialValue = !initialValue;
        refreshButton();
        onChange(initialValue);
      }
    );

    refreshButton();
    this.uiNodes.push(labelText, valueText, ...buttonRef.nodes);
  }

  createSliderRow(x, y, label, initialValue, onChange) {
    const layout = this.uiLayout;
    const rowWidth = layout.rowWidth;
    const left = x - rowWidth / 2;
    const valueX = x + rowWidth / 2 - (layout.sliderValueInset || 22);
    const compactRow = !!layout.isTightLandscape;
    const sliderX = valueX - (this.profile?.isPortrait ? 24 : (compactRow ? 22 : 30)) - layout.sliderWidth / 2;
    const labelY = y - (this.profile?.isPortrait ? 16 : (compactRow ? 10 : 18));
    const sliderY = y + (this.profile?.isPortrait ? 8 : (compactRow ? 7 : 10));
    const labelWidth = Math.max(110, rowWidth - (this.profile?.isPortrait ? 26 : 42));

    const labelText = this.add.text(
      left,
      labelY,
      label,
      this.makeTextStyle({
        size: layout.sliderLabelSize,
        color: '#5f7891',
        stroke: '#ffffff',
        strokeThickness: 1,
        shadowColor: '#ffffff',
        shadowBlur: 3,
        align: 'left'
      })
    ).setOrigin(0, 0.5);
    this.fitTextToBox(labelText, labelWidth, compactRow ? 18 : 26, compactRow ? 9 : 11);

    const valueText = this.add.text(
      valueX,
      sliderY,
      `${Math.round(initialValue * 100)}%`,
      this.makeTextStyle({
        size: layout.sliderValueSize,
        color: '#6f87a0',
        stroke: '#ffffff',
        strokeThickness: 1,
        shadowColor: '#ffffff',
        shadowBlur: 2
      })
    ).setOrigin(0.5);

    const sliderBg = this.createRoundedRect(
      sliderX,
      sliderY,
      layout.sliderWidth + 20,
      16,
      8,
      0xffffff,
      0.18,
      0xe8f8ff,
      0.45,
      1
    );

    this.uiNodes.push(labelText, valueText, sliderBg);

    const slider = CubePathUI.createSlider(
      this,
      sliderX,
      sliderY,
      layout.sliderWidth,
      initialValue,
      (value) => {
        valueText.setText(`${Math.round(value * 100)}%`);
        onChange(value);
      },
      { depth: 5000 }
    );

    this.uiNodes.push(slider.track, slider.fill, slider.knob);
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
        size: 18,
        color: '#f8fcff',
        stroke: '#5d85aa',
        strokeThickness: 2,
        shadowColor: '#4d79a8',
        shadowBlur: 4
      })
    ).setOrigin(0.5);
    text.setAlign('center');
    text.setWordWrapWidth(Math.max(36, w - 18), true);
    this.fitTextToBox(text, w - 16, h - 8, 11);

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

    return { nodes: [shadow, bg, inner, gloss, hit, text] };
  }

  createToggleButton(x, y, w, h, label, onClick) {
    const profile = this.profile || window.CubePathDevice?.getProfile?.(this) || { isMobile: false, touchTarget: 48 };
    const shadow = this.createRoundedRect(x, y + 3, w, h, 14, 0x4e7ead, 0.12);
    const bg = this.createRoundedRect(x, y, w, h, 14, 0x5aa8f2, 0.95, 0xe8f8ff, 0.95, 2);
    const inner = this.createRoundedRect(x, y, w - 8, h - 8, 11, 0xffffff, 0.06, 0xffffff, 0.18, 1);
    const gloss = this.createRoundedRect(x, y - 7, w - 10, h / 2 - 6, 9, 0xffffff, 0.14);

    const hit = this.add.rectangle(x, y, Math.max(w, profile.touchTarget), Math.max(h, profile.touchTarget), 0x000000, 0.001)
      .setInteractive({ useHandCursor: !profile.isMobile });

    const text = this.add.text(
      x,
      y,
      label,
      this.makeTextStyle({
        size: 16,
        color: '#f8fcff',
        stroke: '#5d85aa',
        strokeThickness: 2,
        shadowColor: '#4d79a8',
        shadowBlur: 3
      })
    ).setOrigin(0.5);
    text.setAlign('center');
    this.fitTextToBox(text, w - 12, h - 8, 10);

    const setScaleAll = (scale) => {
      bg.setScale(scale);
      inner.setScale(scale);
      gloss.setScale(scale);
      hit.setScale(scale);
      text.setScale(scale);
    };

    if (!profile.isMobile) {
      hit.on('pointerover', () => {
        setScaleAll(1.02);
      });

      hit.on('pointerout', () => {
        setScaleAll(1);
      });
    }

    hit.on('pointerdown', () => {
      setScaleAll(0.98);
    });

    hit.on('pointerup', () => {
      setScaleAll(profile.isMobile ? 1 : 1.02);
      CubePathAudio.playUiClick(this);
      onClick();
    });

    return { nodes: [shadow, bg, inner, gloss, hit, text], bg, inner, text };
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
        delay: i * 18,
        ease: 'Quad.easeOut'
      });
    });
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

window.SettingsScene = SettingsScene;
