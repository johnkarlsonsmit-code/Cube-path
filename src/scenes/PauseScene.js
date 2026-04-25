class PauseScene extends Phaser.Scene {
  constructor() {
    super('PauseScene');
    this.uiNodes = [];
    this.profile = null;
    this.pauseLayout = null;
  }

  create() {
    const w = this.scale.width;
    const h = this.scale.height;
    this.__cubePathResizeKey = `${w}x${h}`;

    this.uiNodes = [];
    this.profile = window.CubePathDevice?.getProfile?.(this) || {
      isMobile: false,
      isPortrait: false,
      touchTarget: 48
    };
    this.pauseLayout = this.getPauseLayout(w, h);
    this.scene.bringToTop();
    CubePathAds.gameplayStop?.();

    this.createBackgroundOverlay();

    const layout = this.pauseLayout;
    const panelShadow = this.createRoundedRect(layout.panelX, layout.panelY + 6, layout.panelW, layout.panelH, 24, 0x5e86ab, 0.18);
    const panelBg = this.createRoundedRect(layout.panelX, layout.panelY, layout.panelW, layout.panelH, 24, 0x9fd3ff, 0.98, 0xeaf8ff, 0.95, 2);
    const panelInner = this.createRoundedRect(layout.panelX, layout.panelY, layout.panelW - 10, layout.panelH - 10, 20, 0xb8e1ff, 0.22, 0xffffff, 0.14, 1);
    const gloss = this.createRoundedRect(layout.panelX, layout.panelTop + 52, layout.panelW - 34, 48, 16, 0xffffff, 0.10);

    const title = this.add.text(
      layout.panelX,
      layout.titleY,
      'Пауза',
      this.makeTextStyle({
        size: layout.titleSize,
        color: '#fff8ec',
        stroke: '#b17438',
        strokeThickness: 4,
        shadowColor: '#ffffff',
        shadowBlur: 8
      })
    ).setOrigin(0.5).setDepth(12004);
    this.fitTextToBox(title, layout.panelW - 48, 42, 18);

    const continueBtn = this.createStyledButton(layout.panelX, layout.buttonY[0], layout.buttonW, layout.buttonH, 'Продолжить', () => {
      this.scene.stop();
      this.scene.resume('GameScene');
    }, { theme: 'green', textSize: layout.buttonTextSize });

    const restartBtn = this.createStyledButton(layout.panelX, layout.buttonY[1], layout.buttonW, layout.buttonH, 'Рестарт', () => {
      const gameScene = this.scene.get('GameScene');
      this.scene.stop();
      this.scene.resume('GameScene');
      gameScene.resetCurrentLevel();
    }, { theme: 'blue', textSize: layout.buttonTextSize });

    const settingsBtn = this.createStyledButton(layout.panelX, layout.buttonY[2], layout.buttonW, layout.buttonH, 'Настройки', () => {
      this.scene.launch('SettingsScene', { returnScene: 'PauseScene' });
      this.scene.bringToTop('SettingsScene');
      this.scene.pause();
    }, { theme: 'gray', textSize: layout.buttonTextSize });

    const menuBtn = this.createStyledButton(layout.panelX, layout.buttonY[3], layout.buttonW, layout.buttonH, 'В меню', () => {
      const gameScene = this.scene.get('GameScene');
      CubePathAudio.stopMusic(gameScene);
      this.scene.stop();
      this.scene.stop('GameScene');
      this.scene.start('MenuScene');
    }, { theme: 'orange', textSize: layout.buttonTextSize });

    this.uiNodes.push(
      panelShadow,
      panelBg,
      panelInner,
      gloss,
      title,
      ...continueBtn,
      ...restartBtn,
      ...settingsBtn,
      ...menuBtn
    );

    this.keyEsc = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.animateUiIn();
  }

  handleResize() {
    if (!this.sys?.settings?.active) return;
    this.scene.restart();
  }

  getPauseLayout(w, h) {
    const profile = this.profile || { isMobile: false, isPortrait: false, touchTarget: 48 };

    if (!profile.isMobile) {
      return {
        panelX: w / 2,
        panelY: h / 2,
        panelTop: h / 2 - 170,
        panelW: 520,
        panelH: 340,
        titleY: h / 2 - 118,
        titleSize: 34,
        buttonW: 210,
        buttonH: 42,
        buttonTextSize: 16,
        buttonY: [h / 2 - 42, h / 2 + 14, h / 2 + 70, h / 2 + 126]
      };
    }

    const panelW = Math.min(w - 30, 440);
    const panelH = Math.min(h - 28, profile.isPortrait ? 400 : 308);
    const panelX = w / 2;
    const panelY = h / 2;
    const panelTop = panelY - panelH / 2;
    const stack = window.CubePathLayout?.resolveVerticalStack?.({
      availableHeight: panelH - (profile.isPortrait ? 154 : 128),
      itemCount: 4,
      preferredItemHeight: profile.isPortrait ? 50 : 44,
      minItemHeight: 34,
      preferredGap: profile.isPortrait ? 14 : 10,
      minGap: 8
    }) || {
      itemHeight: profile.isPortrait ? 44 : 40,
      gap: 10
    };
    const buttonH = Math.round(stack.itemHeight);
    const gapY = Math.round(stack.gap);
    const firstButtonY = panelTop + (profile.isPortrait ? 118 : 102);

    return {
      panelX,
      panelY,
      panelTop,
      panelW,
      panelH,
      titleY: panelTop + (profile.isPortrait ? 48 : 42),
      titleSize: profile.isPortrait ? 28 : 22,
      buttonW: Math.min(panelW - 42, profile.isPortrait ? panelW - 52 : 224),
      buttonH,
      buttonTextSize: profile.isPortrait ? 15 : 13,
      buttonY: [
        firstButtonY,
        firstButtonY + buttonH + gapY,
        firstButtonY + (buttonH + gapY) * 2,
        firstButtonY + (buttonH + gapY) * 3
      ]
    };
  }

  update() {
    if (Phaser.Input.Keyboard.JustDown(this.keyEsc)) {
      this.scene.stop();
      this.scene.resume('GameScene');
    }
  }

  createBackgroundOverlay() {
    const w = this.scale.width;
    const h = this.scale.height;

    this.add.rectangle(w / 2, h / 2, w, h, 0x8ecfff, 0.14).setDepth(12000);

    const shade = this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.26).setDepth(12000);
    this.uiNodes.push(shade);
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

  fitTextToBox(text, maxWidth, maxHeight, minSize = 10) {
    window.CubePathLayout?.fitText?.(text, {
      maxWidth,
      maxHeight,
      minSize
    });
    return text;
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

  createRoundedRect(x, y, w, h, radius, fillColor, fillAlpha = 1, strokeColor = null, strokeAlpha = 1, strokeWidth = 0, depth = 12001) {
    const g = this.add.graphics().setDepth(depth);
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

  createStyledButton(x, y, w, h, label, onClick, options = {}) {
    const profile = this.profile || window.CubePathDevice?.getProfile?.(this) || { isMobile: false, touchTarget: 48 };
    const theme = options.theme || 'blue';
    const textSize = options.textSize || 16;

    const themes = {
      blue: {
        base: 0x5aa8f2,
        hover: 0x6cb8ff,
        down: 0x3d93e5,
        stroke: 0xe8f8ff,
        text: '#f8fcff',
        textStroke: '#5d85aa',
        shadow: 0x4e7ead
      },
      orange: {
        base: 0xdd8b45,
        hover: 0xeea25e,
        down: 0xc87531,
        stroke: 0xffedd5,
        text: '#fffaf3',
        textStroke: '#9a6a3d',
        shadow: 0x9f6c3c
      },
      green: {
        base: 0x6bc774,
        hover: 0x7fd988,
        down: 0x54ad5d,
        stroke: 0xe9ffe9,
        text: '#ffffff',
        textStroke: '#5d9461',
        shadow: 0x5b9560
      },
      gray: {
        base: 0xb8c7d3,
        hover: 0xc7d3dd,
        down: 0xa7b7c4,
        stroke: 0xf3f7fa,
        text: '#ffffff',
        textStroke: '#8091a0',
        shadow: 0x8596a6
      }
    };

    const c = themes[theme] || themes.blue;

    const shadow = this.createRoundedRect(x, y + 4, w, h, 14, c.shadow, 0.14, null, 0, 0, 12003);
    const bg = this.createRoundedRect(x, y, w, h, 14, c.base, 0.96, c.stroke, 0.9, 2, 12004);
    const inner = this.createRoundedRect(x, y, w - 8, h - 8, 11, 0xffffff, 0.05, 0xffffff, 0.14, 1, 12005);
    const gloss = this.createRoundedRect(x, y - 8, w - 10, h / 2 - 6, 10, 0xffffff, 0.14, null, 0, 0, 12005);

    const hit = this.add.rectangle(
      x,
      y,
      Math.max(w, profile.touchTarget),
      Math.max(h, profile.touchTarget),
      0x000000,
      0.001
    )
      .setInteractive({ useHandCursor: !profile.isMobile })
      .setDepth(12006);

    const text = this.add.text(
      x,
      y,
      label,
      this.makeTextStyle({
        size: textSize,
        color: c.text,
        stroke: c.textStroke,
        strokeThickness: 2,
        shadowColor: c.textStroke,
        shadowBlur: 4
      })
    ).setOrigin(0.5).setDepth(12007);
    text.setAlign('center');
    text.setWordWrapWidth(Math.max(36, w - 18), true);
    this.fitTextToBox(text, w - 16, h - 8, 10);

    const setScaleAll = (scale) => {
      bg.setScale(scale);
      inner.setScale(scale);
      gloss.setScale(scale);
      hit.setScale(scale);
      text.setScale(scale);
    };

    if (!profile.isMobile) {
      hit.on('pointerover', () => {
        this.redrawRoundedRect(bg, x, y, w, h, 14, c.hover, 0.98, c.stroke, 0.9, 2);
        setScaleAll(1.02);
      });

      hit.on('pointerout', () => {
        this.redrawRoundedRect(bg, x, y, w, h, 14, c.base, 0.96, c.stroke, 0.9, 2);
        setScaleAll(1);
      });
    }

    hit.on('pointerdown', () => {
      this.redrawRoundedRect(bg, x, y, w, h, 14, c.down, 1, c.stroke, 0.9, 2);
      setScaleAll(0.98);
    });

    hit.on('pointerup', () => {
      this.redrawRoundedRect(bg, x, y, w, h, 14, c.hover, 0.98, c.stroke, 0.9, 2);
      setScaleAll(profile.isMobile ? 1 : 1.02);
      CubePathAudio.playUiClick(this);
      onClick();
    });

    return [shadow, bg, inner, gloss, hit, text];
  }
}

window.PauseScene = PauseScene;
