class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.tileW = 64;
    this.tileH = 32;
    this.tileDepth = 16;
    this.offsetX = 420;
    this.offsetY = 170;
    this.currentCampaignLayout = null;
    this.currentCampaignSeed = null;
    this.coinsCollected = 0;
    this.coinsTotal = 0;
    this.survivalCoinRewardGranted = false;
    this.coinIcons = [];
    this.survivalStage = 0;
    this.survivalBest = 0;
    this.cameraTarget = null;
    this.lastMoveDx = 0;
    this.lastMoveDy = 0;
    this.lookAheadDistanceX = 52;
    this.lookAheadDistanceY = 28;
    this.isSliding = false;
    this.freezeActive = false;
    this.freezeUsesLeft = 1;
    this.freezeEndTimer = null;
    this.pendingFrozenBreaks = [];
    this.freezeButtonBg = null;
    this.freezeButtonIcon = null;
    this.freezeCountText = null;
    this.freezeStatusText = null;

    this.energyButtonBg = null;
    this.energyButtonIcon = null;
    this.energyCountText = null;
    this.energyStatusText = null;
    this.energyActive = false;
    this.energyUsesLeft = 1;
    this.energyEndTimer = null;
    this.pendingEnergyTileRebuild = null;
    this.isSinking = false;
    this.hotTileTimer = null;
    this.secondChanceUi = [];
    this.canUseSecondChance = true;
    this.secondChanceUsed = false;
    this.collectedCoinPositions = new Set();
    this.lastSafeGridX = null;
    this.lastSafeGridY = null;
    this.isPaused = false;
    this.pauseUi = [];
    this.resultUi = [];
    this.adInProgress = false;
    this.pendingRewardAction = null;
    this.pendingInterstitialAfterWin = false;
    this.deviceProfile = null;
    this.uiHitBoxes = [];
    this.gameUiLayout = null;
    this.swipePointerId = null;
    this.swipeConsumed = false;
    this.sdkPauseActive = false;
    this.sdkPauseStartedAt = 0;
    this.activeOverlayKind = null;
    this.lastLevelCompleteResult = null;
    this.lastLevelCompleteCubeCoins = 0;
    this.biomeBackdropNodes = [];
  }
  preload() {
    // Meadow
    this.load.image('meadow-bg', 'src/assets/meadow/bg_meadow.png');
    this.load.image('meadow-tile-normal', 'src/assets/meadow/tile_normal.png');
    this.load.image('meadow-tile-block', 'src/assets/meadow/tile_block.png');
    this.load.image('meadow-tile-fragile-fast', 'src/assets/meadow/tile_fragile_fast.png');
    this.load.image('meadow-tile-coin', 'src/assets/meadow/tile_coin.png');
    this.load.image('meadow-tile-finish', 'src/assets/meadow/tile_finish.png');
    this.load.image('meadow-tile-breaking', 'src/assets/meadow/tile_breaking.png');
    this.load.image('meadow-tile-start', 'src/assets/meadow/tile_start.png');
    this.load.image('meadow-tile-solid', 'src/assets/meadow/tile_solid.png');
    this.load.image('meadow-tile-spikes', 'src/assets/meadow/tile_spikes.png');

    // Arctic
    this.load.image('arctic-bg', 'src/assets/arctic/bg_arctic.png');
    this.load.image('arctic-tile-normal', 'src/assets/arctic/tile_normal.png');
    this.load.image('arctic-tile-block', 'src/assets/arctic/tile_block.png');
    this.load.image('arctic-tile-fragile-fast', 'src/assets/arctic/tile_fragile_fast.png');
    this.load.image('arctic-tile-coin', 'src/assets/arctic/tile_coin.png');
    this.load.image('arctic-tile-finish', 'src/assets/arctic/tile_finish.png');
    this.load.image('arctic-tile-breaking', 'src/assets/arctic/tile_breaking.png');
    this.load.image('arctic-tile-start', 'src/assets/arctic/tile_start.png');
    this.load.image('arctic-tile-solid', 'src/assets/arctic/tile_solid.png');
    this.load.image('arctic-tile-spikes', 'src/assets/arctic/tile_spikes.png');
    this.load.image('arctic-tile-ice', 'src/assets/arctic/tile_ice.png');

    // Desert
    this.load.image('desert-bg', 'src/assets/desert/bg_desert.png');
    this.load.image('desert-tile-normal', 'src/assets/desert/tile_normal.png');
    this.load.image('desert-tile-block', 'src/assets/desert/tile_block.png');
    this.load.image('desert-tile-fragile-fast', 'src/assets/desert/tile_fragile_fast.png');
    this.load.image('desert-tile-coin', 'src/assets/desert/tile_coin.png');
    this.load.image('desert-tile-finish', 'src/assets/desert/tile_finish.png');
    this.load.image('desert-tile-breaking', 'src/assets/desert/tile_breaking.png');
    this.load.image('desert-tile-start', 'src/assets/desert/tile_start.png');
    this.load.image('desert-tile-solid', 'src/assets/desert/tile_solid.png');
    this.load.image('desert-tile-spikes', 'src/assets/desert/tile_spikes.png');
    this.load.image('desert-tile-quicksand', 'src/assets/desert/tile_quicksand.png');

    // Volcano
    this.load.image('volcano-bg', 'src/assets/volcano/bg_volcano.png');
    this.load.image('volcano-tile-normal', 'src/assets/volcano/tile_normal.png');
    this.load.image('volcano-tile-block', 'src/assets/volcano/tile_block.png');
    this.load.image('volcano-tile-fragile-fast', 'src/assets/volcano/tile_fragile_fast.png');
    this.load.image('volcano-tile-coin', 'src/assets/volcano/tile_coin.png');
    this.load.image('volcano-tile-finish', 'src/assets/volcano/tile_finish.png');
    this.load.image('volcano-tile-breaking', 'src/assets/volcano/tile_breaking.png');
    this.load.image('volcano-tile-start', 'src/assets/volcano/tile_start.png');
    this.load.image('volcano-tile-solid', 'src/assets/volcano/tile_solid.png');
    this.load.image('volcano-tile-spikes', 'src/assets/volcano/tile_spikes.png');
    this.load.image('volcano-tile-hot', 'src/assets/volcano/tile_hot.png');

    this.load.audio('music-main', 'src/assets/audio/music_main.mp3');
  }
  tryContinueIceSlide(dx, dy) {
    const nextX = this.playerGridX + dx;
    const nextY = this.playerGridY + dy;

    if (!this.isInsideLevel(nextX, nextY)) {
      this.isSliding = false;
      this.loseGame();
      return;
    }

    const targetCell = this.level[nextY][nextX];

    if (targetCell === 0) {
      this.isSliding = false;
      this.loseGame();
      return;
    }

    if (targetCell === 14) {
      this.isSliding = false;
      return;
    }

    if (this.energyActive && [4, 7, 9, 10, 11].includes(targetCell)) {
      this.isSliding = false;
      this.breakHazardTile(nextX, nextY);
      this.movePlayerTo(nextX, nextY, false, dx, dy);
      return;
    }

    if (targetCell === 4) {
      this.isSliding = false;
      return;
    }
    if (targetCell === 7) {
      this.isSliding = false;
      this.movePlayerTo(nextX, nextY, true, dx, dy);
      return;
    }
    if (targetCell === 10) {
      this.isSliding = false;
      this.movePlayerTo(nextX, nextY, false, dx, dy);
      return;
    }
    this.movePlayerTo(nextX, nextY, false, dx, dy);
  }
  create() {
    this.isSinking = false;
    this.hotTileTimer = null;
    this.canUseSecondChance = true;
    this.secondChanceUsed = false;
    this.collectedCoinPositions = new Set();
    this.lastSafeGridX = null;
    this.lastSafeGridY = null
    this.secondChanceUi = [];
    this.isPaused = false;
    this.pauseUi = [];
    this.resultUi = [];
    this.activeOverlayKind = null;
    this.lastLevelCompleteResult = null;
    this.lastLevelCompleteCubeCoins = 0;
    this.gameMode = CubePathStorage.getMode();
    this.currentLevelIndex = CubePathStorage.getCurrentLevel(this.gameMode);
    this.unlockedLevelIndex = CubePathStorage.getUnlockedLevel(this.gameMode);
    this.survivalCoinRewardGranted = false;
    this.freezeActive = false;
    this.freezeUsesLeft = CubePathStorage.getBoostCount('freeze');
    this.freezeEndTimer = null;
    this.pendingFrozenBreaks = [];


    this.energyActive = false;
    this.energyUsesLeft = CubePathStorage.getBoostCount('energy');
    this.energyEndTimer = null;
    this.freezeButtonBg = null;
    this.freezeButtonIcon = null;
    this.freezeCountText = null;
    this.freezeStatusText = null;

    this.energyButtonBg = null;
    this.energyButtonIcon = null;
    this.energyCountText = null;
    this.energyStatusText = null;
    this.pendingEnergyTileRebuild = null;
    this.tileTextureScaleCache = this.tileTextureScaleCache || Object.create(null);
    this.useSpriteBiomeTiles = false;
    this.lastDisplayedTimeTenths = -1;
    this.deviceProfile = window.CubePathDevice?.getProfile?.(this) || { isMobile: false, isPortrait: false, touchTarget: 48 };
    this.__cubePathResizeKey = `${this.scale.width}x${this.scale.height}`;
    this.uiHitBoxes = [];
    CubePathAudio.init(this);
    this.bindLifecycleCleanup();
    this.events.off('resume', this.handleSceneResume, this);
    this.events.on('resume', this.handleSceneResume, this);
    this.setupInput();
    this.loadLevel(this.currentLevelIndex);
    CubePathAudio.startMusic(this, 'music-main');
    CubePathAudio.applySettings(this);
    this.survivalBest = CubePathStorage.getSurvivalBest();
  }
  bindLifecycleCleanup() {
    this.events.off('shutdown', this.cleanupRuntimeState, this);
    this.events.once('shutdown', this.cleanupRuntimeState, this);
  }
  handleSceneResume() {
    if (this.sdkPauseActive || this.isGameOver) return;
    if (this.scene.isActive('PauseScene') || this.scene.isActive('SettingsScene')) return;
    CubePathAds.gameplayStart?.();
  }
  cleanupRuntimeState() {
    if (this.handlePointerDown) {
      this.input.off('pointerdown', this.handlePointerDown);
      this.handlePointerDown = null;
    }

    if (this.handlePointerUp) {
      this.input.off('pointerup', this.handlePointerUp);
      this.handlePointerUp = null;
    }

    if (this.handlePointerMove) {
      this.input.off('pointermove', this.handlePointerMove);
      this.handlePointerMove = null;
    }

    this.ignoreUiSwipeOnce = null;
    this.events.off('resume', this.handleSceneResume, this);
    this.clearResultMenu();
    this.clearPauseMenu();
    this.clearSecondChanceMenu();
    this.clearBreakTimers();
    this.clearHotTileTimer();

    if (this.freezeEndTimer && !this.freezeEndTimer.hasDispatched) {
      this.freezeEndTimer.remove(false);
    }

    if (this.energyEndTimer && !this.energyEndTimer.hasDispatched) {
      this.energyEndTimer.remove(false);
    }

    this.freezeEndTimer = null;
    this.energyEndTimer = null;
    this.sdkPauseActive = false;
    this.sdkPauseStartedAt = 0;
    CubePathAds.gameplayStop?.();
  }
  handleResize() {
    this.__cubePathResizeKey = `${this.scale.width}x${this.scale.height}`;
    this.deviceProfile = window.CubePathDevice?.getProfile?.(this) || this.deviceProfile || { isMobile: false, isPortrait: false, touchTarget: 48 };

    if (this.activeOverlayKind === 'mainCampaignComplete') {
      this.showMainCampaignCompleteScreen();
      return;
    }

    if (this.activeOverlayKind === 'gameComplete') {
      this.showGameCompleteScreen();
      return;
    }

    if (this.activeOverlayKind === 'survivalGameOver') {
      this.showSurvivalGameOver();
      return;
    }

    if (!this.level || !this.player) {
      return;
    }

    this.clearResponsiveHud();
    this.drawBiomeBackdrop();
    this.createFlashOverlay();
    this.drawUI();
    this.setupCamera();
    this.fixHudToCamera();

    if (this.activeOverlayKind === 'levelComplete' && this.lastLevelCompleteResult) {
      this.showLevelCompleteScreen(this.lastLevelCompleteResult, {
        skipRewards: true,
        gainedCubeCoinsOverride: this.lastLevelCompleteCubeCoins
      });
      return;
    }

    if (this.activeOverlayKind === 'secondChance') {
      this.showSecondChanceMenu();
    }
  }
  clearResponsiveHud() {
    const hudNodes = this.children.list.filter((child) => child && child.depth >= 5000 && child.depth < 12000);

    hudNodes.forEach((child) => {
      if (child.input && child.disableInteractive) {
        try {
          child.disableInteractive();
        } catch (_error) {
        }
      } else if (child.input && child.removeInteractive) {
        try {
          child.removeInteractive();
        } catch (_error) {
        }
      }

      child.destroy?.();
    });

    if (this.hintTextAd) {
      this.hintTextAd.destroy();
      this.hintTextAd = null;
    }

    this.flashOverlay = null;
    this.freezeButtonBg = null;
    this.freezeButtonIcon = null;
    this.freezeCountText = null;
    this.freezeStatusText = null;
    this.energyButtonBg = null;
    this.energyButtonIcon = null;
    this.energyCountText = null;
    this.energyStatusText = null;
    this.levelLabel = null;
    this.timeLabel = null;
    this.movesLabel = null;
    this.coinLabel = null;
    this.bestLabel = null;
    this.biomeLabel = null;
    this.campaignStarsLabel = null;
    this.nextBiomeLabel = null;
    this.legendLabel = null;
    this.hotkeysLabel = null;
    this.soundButtonText = null;
    this.resetUiHitBoxes();
  }
  destroyUiNodes(nodes) {
    if (!Array.isArray(nodes)) return [];

    for (const item of nodes) {
      if (!item) continue;

      const canTouchInteractiveState = !!item.scene?.sys;

      if (canTouchInteractiveState && item.input && item.disableInteractive) {
        try {
          item.disableInteractive();
        } catch (_error) {
        }
      } else if (canTouchInteractiveState && item.input && item.removeInteractive) {
        try {
          item.removeInteractive();
        } catch (_error) {
        }
      }

      if (item.bg && item.bg.destroy) item.bg.destroy();
      if (item.text && item.text.destroy) item.text.destroy();
      if (item.shadow && item.shadow.destroy) item.shadow.destroy();
      if (item.icon && item.icon.destroy) item.icon.destroy();

      if (item.container && item.container.destroy) {
        item.container.destroy();
        continue;
      }

      if (item.destroy) {
        item.destroy();
      }
    }

    return [];
  }
  clearSecondChanceMenu() {
    this.secondChanceUi = this.destroyUiNodes(this.secondChanceUi);
    if (this.activeOverlayKind === 'secondChance') {
      this.activeOverlayKind = null;
    }
    this.input.setDefaultCursor('default');
  }
  clearResultMenu() {
    this.resultUi = this.destroyUiNodes(this.resultUi);
    if (this.activeOverlayKind === 'levelComplete') {
      this.activeOverlayKind = null;
    }
  }
  generateAndStoreCampaignLevel(levelIndex) {
    const seed = this.getCampaignSeed(levelIndex);
    this.currentCampaignSeed = seed;

    const generated = CubePathLevelGenerator.generateCampaignLevel(levelIndex, seed);
    this.currentCampaignLayout = generated.map(row => [...row]);
  }
  getLevelLayout(index) {
    if (this.gameMode === 'tutorial') {
      return window.CubePathData.tutorialLevels[index].map(row => [...row]);
    }

    if (this.gameMode === 'campaign') {
      const expectedSeed = this.getCampaignSeed(index);

      if (!this.currentCampaignLayout || this.currentCampaignSeed !== expectedSeed) {
        this.generateAndStoreCampaignLevel(index);
      }

      return this.currentCampaignLayout.map(row => [...row]);
    }

    if (this.gameMode === 'survival') {
      this.generateAndStoreSurvivalLevel(index);
      return this.currentCampaignLayout.map(row => [...row]);
    }

    return window.CubePathData.tutorialLevels[0].map(row => [...row]);
  }
  generateAndStoreSurvivalLevel(levelIndex) {
    const seed = Date.now() + Math.floor(Math.random() * 100000);
    this.currentCampaignSeed = seed;

    const generated = CubePathLevelGenerator.generateCampaignLevel(levelIndex, seed);
    this.currentCampaignLayout = generated.map(row => [...row]);
  }
  setupInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    this.keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    this.keyOne = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
    this.keyTwo = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
    this.keyZ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
    this.keyX = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
    this.keyEsc = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    if (this.handlePointerDown) {
      this.input.off('pointerdown', this.handlePointerDown);
    }

    if (this.handlePointerUp) {
      this.input.off('pointerup', this.handlePointerUp);
    }

    if (this.handlePointerMove) {
      this.input.off('pointermove', this.handlePointerMove);
    }

    this.handlePointerDown = (pointer) => {
      this.swipePointerId = pointer.id;
      this.swipeConsumed = false;
      this.swipeStartX = pointer.x;
      this.swipeStartY = pointer.y;
      this.swipeBlocked = this.isPointerOverUI(pointer.x, pointer.y);
      CubePathAudio.ensureAudioContext(this);
    };

    this.handlePointerMove = (pointer) => {
      if (!pointer.isDown) return;
      if (this.time.now < this.ignorePointerUntil) return;
      if (this.swipeBlocked || this.swipeConsumed) return;
      if (this.isGameOver || this.isMoving || this.moveCooldown > 0) return;

      const dx = pointer.x - this.swipeStartX;
      const dy = pointer.y - this.swipeStartY;

      if (Math.max(Math.abs(dx), Math.abs(dy)) < this.swipeMinDistance) return;

      const swipeMove = this.resolveSwipeMove(dx, dy);
      if (!swipeMove) return;

      this.swipeConsumed = true;
      this.tryMove(swipeMove.dx, swipeMove.dy);
    };

    this.handlePointerUp = (pointer) => {
      if (this.time.now < this.ignorePointerUntil) {
        this.swipePointerId = null;
        this.swipeConsumed = false;
        return;
      }
      if (this.swipeBlocked) {
        this.swipeBlocked = false;
        this.swipePointerId = null;
        this.swipeConsumed = false;
        return;
      }
      if (this.swipeConsumed) {
        this.swipePointerId = null;
        this.swipeConsumed = false;
        return;
      }
      if (this.isGameOver || this.isMoving || this.moveCooldown > 0) {
        this.swipePointerId = null;
        this.swipeConsumed = false;
        return;
      }

      const dx = pointer.x - this.swipeStartX;
      const dy = pointer.y - this.swipeStartY;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      if (Math.max(absDx, absDy) < this.swipeMinDistance) {
        this.swipePointerId = null;
        this.swipeConsumed = false;
        return;
      }
      const swipeMove = this.resolveSwipeMove(dx, dy);
      if (!swipeMove) {
        this.swipePointerId = null;
        this.swipeConsumed = false;
        return;
      }

      this.swipePointerId = null;
      this.swipeConsumed = false;
      this.tryMove(swipeMove.dx, swipeMove.dy);
    };

    this.input.on('pointerdown', this.handlePointerDown);
    this.input.on('pointermove', this.handlePointerMove);
    this.input.on('pointerup', this.handlePointerUp);

    this.ignoreUiSwipeOnce = () => {
      this.swipeBlocked = true;
      this.swipeConsumed = true;
      this.ignorePointerUntil = this.time.now + 120;
    };
  }
  clearPauseMenu() {
    this.pauseUi = this.destroyUiNodes(this.pauseUi);
  }

  openPauseScene() {
    if (this.isGameOver || this.scene.isActive('PauseScene') || this.scene.isActive('SettingsScene')) {
      return;
    }

    CubePathAds.gameplayStop?.();
    this.scene.launch('PauseScene');
    this.scene.bringToTop('PauseScene');
    this.scene.pause();
  }

  resolveSwipeMove(dx, dy) {
    if (Math.abs(dx) < 2 && Math.abs(dy) < 2) return null;

    if (dx >= 0 && dy >= 0) return { dx: 1, dy: 0 };
    if (dx < 0 && dy >= 0) return { dx: 0, dy: 1 };
    if (dx < 0 && dy < 0) return { dx: -1, dy: 0 };
    return { dx: 0, dy: -1 };
  }

  processActiveSwipe() {
    const pointer = this.input?.activePointer;
    if (!pointer || !pointer.isDown) {
      if (this.swipePointerId !== null) {
        this.swipePointerId = null;
        this.swipeConsumed = false;
        this.swipeBlocked = false;
      }
      return;
    }
    if (this.time.now < this.ignorePointerUntil) return;
    if (this.isGameOver || this.isMoving || this.moveCooldown > 0) return;

    if (this.swipePointerId === null) {
      this.swipePointerId = pointer.id;
      this.swipeStartX = pointer.x;
      this.swipeStartY = pointer.y;
      this.swipeBlocked = this.isPointerOverUI(pointer.x, pointer.y);
      if (this.swipeBlocked) return;
    }

    if (this.swipeBlocked || this.swipeConsumed) return;

    const dx = pointer.x - this.swipeStartX;
    const dy = pointer.y - this.swipeStartY;

    if (Math.max(Math.abs(dx), Math.abs(dy)) < this.swipeMinDistance) return;

    const swipeMove = this.resolveSwipeMove(dx, dy);
    if (!swipeMove) return;

    this.swipeConsumed = true;
    this.tryMove(swipeMove.dx, swipeMove.dy);
  }

  pauseGame() {
    this.openPauseScene();
  }
  getNextBiomeProgressData() {
    const currentStars = CubePathStorage.getTotalEarnedStars('campaign');

    for (let biome = 1; biome < 5; biome++) {
      const requirement = CubePathStorage.getBiomeUnlockRequirement(biome);
      if (currentStars < requirement) {
        const prevRequirement = CubePathStorage.getBiomeUnlockRequirement(biome - 1);
        const range = Math.max(1, requirement - prevRequirement);
        const progress = Phaser.Math.Clamp((currentStars - prevRequirement) / range, 0, 1);

        return {
          currentStars,
          targetStars: requirement,
          progress,
          unlockedAll: false
        };
      }
    }

    return {
      currentStars,
      targetStars: CubePathStorage.getBiomeUnlockRequirement(4),
      progress: 1,
      unlockedAll: true
    };
  }

  createTopStarProgressBar(cx, y, width = 390) {
    const data = this.getNextBiomeProgressData();
    const nodes = [];

    const leftX = cx - width / 2 - 64;
    const rightX = cx + width / 2 + 64;

    const barBg = this.createUiRoundedRect(cx, y, width, 42, 16, 0x2f8fd8, 0.96, 0xdff6ff, 0.95, 2, 12005);
    const barInner = this.createUiRoundedRect(cx, y, width - 10, 32, 13, 0x0d5fa7, 0.78, 0xffffff, 0.12, 1, 12006);

    const fillWidth = Math.max(28, (width - 20) * data.progress);
    const fillX = cx - (width - 20) / 2 + fillWidth / 2;

    const fill = this.createUiRoundedRect(
      fillX,
      y,
      fillWidth,
      24,
      10,
      data.unlockedAll ? 0x66d67d : 0x95dd2f,
      0.98,
      0xeaffc8,
      0.55,
      1,
      12007
    );

    const leftStar = this.add.text(
      leftX,
      y + 1,
      '★',
      this.makeUiTextStyle({
        size: 56,
        color: '#ffd54a',
        stroke: '#d79a18',
        strokeThickness: 3,
        shadowColor: '#fff4c5',
        shadowBlur: 4
      })
    ).setOrigin(0.5).setScrollFactor(0).setDepth(12008);

    const leftValue = this.add.text(
      leftX,
      y + 2,
      `${data.currentStars}`,
      this.makeUiTextStyle({
        size: 22,
        color: '#6a4b09',
        stroke: '#fff1af',
        strokeThickness: 1,
        shadowColor: '#ffffff',
        shadowBlur: 2
      })
    ).setOrigin(0.5).setScrollFactor(0).setDepth(12009);

    const rightStar = this.add.text(
      rightX,
      y + 1,
      '★',
      this.makeUiTextStyle({
        size: 56,
        color: '#d6dde5',
        stroke: '#9daebb',
        strokeThickness: 3,
        shadowColor: '#ffffff',
        shadowBlur: 3
      })
    ).setOrigin(0.5).setScrollFactor(0).setDepth(12008);

    const rightValue = this.add.text(
      rightX,
      y + 2,
      `${data.targetStars}`,
      this.makeUiTextStyle({
        size: 22,
        color: '#4f6578',
        stroke: '#eef6fd',
        strokeThickness: 1,
        shadowColor: '#ffffff',
        shadowBlur: 2
      })
    ).setOrigin(0.5).setScrollFactor(0).setDepth(12009);

    nodes.push(barBg, barInner, fill, leftStar, leftValue, rightStar, rightValue);
    return nodes;
  }
  createRewardCubeIcon(x, y, scale = 1) {
    const g = this.add.graphics().setScrollFactor(0).setDepth(12006);

    const w = 58 * scale;
    const h = 34 * scale;
    const d = 30 * scale;

    const top = [
      { x, y: y - h / 2 },
      { x: x + w / 2, y },
      { x, y: y + h / 2 },
      { x: x - w / 2, y }
    ];

    const left = [
      { x: x - w / 2, y },
      { x, y: y + h / 2 },
      { x, y: y + h / 2 + d },
      { x: x - w / 2, y: y + d }
    ];

    const right = [
      { x: x + w / 2, y },
      { x, y: y + h / 2 },
      { x, y: y + h / 2 + d },
      { x: x + w / 2, y: y + d }
    ];

    g.fillStyle(0xffc300, 1);
    g.beginPath();
    g.moveTo(left[0].x, left[0].y);
    for (let i = 1; i < left.length; i++) g.lineTo(left[i].x, left[i].y);
    g.closePath();
    g.fillPath();

    g.fillStyle(0xe18300, 1);
    g.beginPath();
    g.moveTo(right[0].x, right[0].y);
    for (let i = 1; i < right.length; i++) g.lineTo(right[i].x, right[i].y);
    g.closePath();
    g.fillPath();

    g.fillStyle(0xf6e34d, 1);
    g.beginPath();
    g.moveTo(top[0].x, top[0].y);
    for (let i = 1; i < top.length; i++) g.lineTo(top[i].x, top[i].y);
    g.closePath();
    g.fillPath();

    g.lineStyle(4 * scale, 0xc36a00, 1);
    g.beginPath();
    g.moveTo(top[0].x, top[0].y);
    g.lineTo(top[1].x, top[1].y);
    g.lineTo(top[2].x, top[2].y);
    g.lineTo(top[3].x, top[3].y);
    g.closePath();
    g.strokePath();

    g.beginPath();
    g.moveTo(left[0].x, left[0].y);
    g.lineTo(left[1].x, left[1].y);
    g.lineTo(left[2].x, left[2].y);
    g.lineTo(left[3].x, left[3].y);
    g.closePath();
    g.strokePath();

    g.beginPath();
    g.moveTo(right[0].x, right[0].y);
    g.lineTo(right[1].x, right[1].y);
    g.lineTo(right[2].x, right[2].y);
    g.lineTo(right[3].x, right[3].y);
    g.closePath();
    g.strokePath();

    return g;
  }
  resumeGame() {
    if (!this.isPaused) return;
    this.clearPauseMenu();
    this.isPaused = false;
    CubePathAds.gameplayStart?.();
  }
  onYandexPause() {
    if (this.sdkPauseActive) return;

    this.sdkPauseActive = true;
    this.sdkPauseStartedAt = this.time.now;
    CubePathAudio.pauseMusicForAd(this);
  }
  onYandexResume() {
    if (!this.sdkPauseActive) return;

    if (!this.isGameOver && Number.isFinite(this.levelStartTime)) {
      const pauseDuration = Math.max(0, this.time.now - this.sdkPauseStartedAt);
      this.levelStartTime += pauseDuration;
    }

    this.sdkPauseActive = false;
    this.sdkPauseStartedAt = 0;
    CubePathAudio.resumeMusicAfterAd(this);
    this.handleSceneResume();
  }
  setAdPauseState(active) {
    this.adInProgress = active;
  }

  showRewardedSecondChance() {
    if (this.adInProgress) return;

    this.setAdPauseState(true);
    CubePathAudio.pauseMusicForAd(this);

    CubePathAds.showRewarded({
      onOpen: () => {
        this.showAdHint?.('Реклама загружается...');
      },
      onReward: () => {
        this.pendingRewardAction = 'secondChance';
      },
      onClose: () => {
        this.setAdPauseState(false);
        CubePathAudio.resumeMusicAfterAd(this);

        if (this.pendingRewardAction === 'secondChance') {
          this.pendingRewardAction = null;
          this.clearSecondChanceMenu();
          this.secondChanceUsed = true;
          this.canUseSecondChance = false;
          this.restoreLevelStateForSecondChance();
        } else {
          this.showAdHint?.('Награда не получена');
        }
      },
      onError: () => {
        this.setAdPauseState(false);
        CubePathAudio.resumeMusicAfterAd(this);
        this.showAdHint?.('Реклама недоступна');
      }
    });
  }

  showRewardedRandomBoost() {
    if (this.adInProgress) return;

    this.setAdPauseState(true);
    CubePathAudio.pauseMusicForAd(this);

    CubePathAds.showRewarded({
      onOpen: () => {
        this.showAdHint?.('Реклама загружается...');
      },
      onReward: () => {
        const boostType = Math.random() < 0.5 ? 'freeze' : 'energy';
        CubePathStorage.addBoost(boostType, 1);
        this.freezeUsesLeft = CubePathStorage.getBoostCount('freeze');
        this.energyUsesLeft = CubePathStorage.getBoostCount('energy');
        this.refreshFreezeUi?.();
        this.refreshEnergyUi?.();
        this.showAdHint?.(
          boostType === 'freeze'
            ? 'Получен буст: Заморозка'
            : 'Получен буст: Энергетик'
        );
      },
      onClose: () => {
        this.setAdPauseState(false);
        CubePathAudio.resumeMusicAfterAd(this);
      },
      onError: () => {
        this.setAdPauseState(false);
        CubePathAudio.resumeMusicAfterAd(this);
        this.showAdHint?.('Реклама недоступна');
      }
    });
  }

  showInterstitialBetweenLevels(onDone) {
    if (this.adInProgress) {
      if (onDone) onDone();
      return;
    }

    this.setAdPauseState(true);
    CubePathAudio.pauseMusicForAd(this);

    CubePathAds.showInterstitial({
      onOpen: () => {
        this.showAdHint?.('Показ рекламы...');
      },
      onClose: () => {
        this.setAdPauseState(false);
        CubePathAudio.resumeMusicAfterAd(this);
        if (onDone) onDone();
      },
      onError: () => {
        this.setAdPauseState(false);
        CubePathAudio.resumeMusicAfterAd(this);
        if (onDone) onDone();
      }
    });
  }

  showAdHint(text) {
    if (this.hintTextAd) {
      this.hintTextAd.destroy();
      this.hintTextAd = null;
    }

    const profile = this.deviceProfile || window.CubePathDevice?.getProfile?.(this) || { isMobile: false, safePadding: 14 };
    const hintY = (profile.safePadding || 14) + (profile.isMobile ? 14 : 10);
    const hintWidth = Math.max(180, this.scale.width - (profile.isMobile ? 34 : 120));

    this.hintTextAd = this.add.text(this.scale.width / 2, hintY, text, {
      fontSize: profile.isMobile ? '15px' : '18px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5, 0).setDepth(13000).setScrollFactor(0);
    this.hintTextAd.setAlign('center');
    this.hintTextAd.setWordWrapWidth(hintWidth, true);
    this.fitTextToBox(this.hintTextAd, hintWidth, profile.isMobile ? 44 : 40, 10);

    this.time.delayedCall(1200, () => {
      if (!this.hintTextAd) return;

      this.tweens.add({
        targets: this.hintTextAd,
        alpha: 0,
        duration: 180,
        onComplete: () => {
          if (this.hintTextAd) {
            this.hintTextAd.destroy();
            this.hintTextAd = null;
          }
        }
      });
    });
  }
  shouldRefreshTimerLabel(time) {
    const elapsedTenths = Math.max(0, Math.floor((time - this.levelStartTime) / 100));

    if (elapsedTenths === this.lastDisplayedTimeTenths) {
      return false;
    }

    this.lastDisplayedTimeTenths = elapsedTenths;
    return true;
  }
  update(time, delta) {
    if (Phaser.Input.Keyboard.JustDown(this.keyEsc)) {
      this.openPauseScene();
      return;
    }
    if (this.adInProgress) return;
    if (this.sdkPauseActive) return;
    if (this.timeLabel && !this.isGameOver && this.shouldRefreshTimerLabel(time)) {
      const elapsed = (time - this.levelStartTime) / 1000;
      this.timeLabel.setText(this.getHudTimeText(elapsed));
    }

    if (this.deviceProfile?.isMobile) {
      this.processActiveSwipe();
    }

    if (this.isGameOver || this.isMoving) return;

    if (this.moveCooldown > 0) {
      this.moveCooldown -= delta;
      if (this.isSliding) return;
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.cursors.up) || Phaser.Input.Keyboard.JustDown(this.keys.up)) {
      this.tryMove(0, -1);
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down) || Phaser.Input.Keyboard.JustDown(this.keys.down)) {
      this.tryMove(0, 1);
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.left) || Phaser.Input.Keyboard.JustDown(this.keys.left)) {
      this.tryMove(-1, 0);
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right) || Phaser.Input.Keyboard.JustDown(this.keys.right)) {
      this.tryMove(1, 0);
    } else if (Phaser.Input.Keyboard.JustDown(this.keyR)) {
      this.resetCurrentLevel();
    } else if (Phaser.Input.Keyboard.JustDown(this.keyOne) || Phaser.Input.Keyboard.JustDown(this.keyZ)) {
      this.activateFreezeBoost?.();
    } else if (Phaser.Input.Keyboard.JustDown(this.keyTwo) || Phaser.Input.Keyboard.JustDown(this.keyX)) {
      this.activateEnergyBoost?.();
    }
  }
  getBiomeIndex() {
    if (this.gameMode === 'tutorial') return 0;
    return CubePathStorage.getBiomeIndexForLevel(this.currentLevelIndex);
  }
  isCurrentBiomeUnlocked() {
    return CubePathStorage.isBiomeUnlocked(this.getBiomeIndex(), this.gameMode);
  }

  getCurrentBiomeRequirement() {
    return CubePathStorage.getBiomeUnlockRequirement(this.getBiomeIndex());
  }

  getCurrentTotalStars() {
    return CubePathStorage.getTotalEarnedStars('campaign');
  }

  getNextBiomeRequirementText() {
    if (this.gameMode !== 'campaign') return '';

    const biome = this.getBiomeIndex();
    const nextBiome = biome + 1;

    if (nextBiome >= 5) return 'Все биомы открыты';

    const required = CubePathStorage.getBiomeUnlockRequirement(nextBiome);
    const current = CubePathStorage.getTotalEarnedStars('campaign');
    const left = Math.max(0, required - current);

    return left > 0
      ? `До следующего биома: ${left}★`
      : 'Следующий биом открыт';
  }

  buildStarComponents(result) {
    return {
      clear: true,
      time: result.timeSeconds <= result.parTime,
      coins: this.coinsTotal > 0 && this.coinsCollected >= this.coinsTotal
    };
  }
  getCampaignConfig(levelIndex) {
    return CubePathLevelGenerator.getCampaignConfig(levelIndex);
  }
  loadLevel(index) {
    this.clearBreakTimers();
    this.clearResultMenu();
    this.activeOverlayKind = null;
    this.lastLevelCompleteResult = null;
    this.lastLevelCompleteCubeCoins = 0;

    if (this.clearSecondChanceMenu) {
      this.clearSecondChanceMenu();
    }
    this.clearPauseMenu();
    this.isPaused = false;
    this.resetCameraFilters();
    this.children.removeAll(true);

    const totalLevels = CubePathStorage.getTotalLevels(this.gameMode);
    this.currentLevelIndex = Phaser.Math.Clamp(index, 0, totalLevels - 1);
    if (this.gameMode === 'campaign') {
      const expectedSeed = this.getCampaignSeed(this.currentLevelIndex);
      if (this.currentCampaignSeed !== expectedSeed) {
        this.currentCampaignLayout = null;
      }
    }
    this.baseLevel = this.getLevelLayout(this.currentLevelIndex);
    this.configureLevelSpace();

    this.level = this.baseLevel.map((row) => [...row]);

    if (this.gameMode === 'survival') {
      this.limitSurvivalCoinsToOne();
    }

    this.biomeTheme = this.getBiomeTheme();
    this.useSpriteBiomeTiles = this.getBiomeIndex() <= 3;
    this.cameras.main.setBackgroundColor(this.biomeTheme.background);
    this.tiles = [];
    this.breakTimers = [];

    this.player = null;
    this.playerGridX = 0;
    this.playerGridY = 0;
    this.startGridX = 0;
    this.startGridY = 0;
    this.isMoving = false;
    this.isGameOver = false;
    this.isSliding = false;
    this.isSinking = false;
    this.clearHotTileTimer();
    this.moveCooldown = 0;
    this.swipeStartX = 0;
    this.swipeStartY = 0;
    this.deviceProfile = window.CubePathDevice?.getProfile?.(this) || this.deviceProfile || { isMobile: false, isPortrait: false, touchTarget: 48 };
    this.__cubePathResizeKey = `${this.scale.width}x${this.scale.height}`;
    this.uiHitBoxes = [];
    this.swipeMinDistance = this.deviceProfile.isMobile
      ? Math.max(22, Math.round(this.deviceProfile.touchTarget * 0.45))
      : 30;
    this.swipeBlocked = true;
    this.ignorePointerUntil = this.time.now + 180;
    this.movesCount = 0;
    this.levelStartTime = this.time.now;
    this.lastDisplayedTimeTenths = -1;

    this.bestTime = CubePathStorage.getBestTime(this.gameMode, this.currentLevelIndex);
    this.bestMoves = CubePathStorage.getBestMoves(this.gameMode, this.currentLevelIndex);
    this.coinsCollected = 0;
    this.coinsTotal = this.countCoinsInLevel(this.level);
    this.survivalCoinRewardGranted = false;

    this.freezeActive = false;
    this.freezeUsesLeft = CubePathStorage.getBoostCount('freeze');
    this.pendingFrozenBreaks = [];
    if (this.freezeEndTimer && !this.freezeEndTimer.hasDispatched) {
      this.freezeEndTimer.remove(false);
    }
    this.freezeEndTimer = null;

    this.energyActive = false;
    this.energyUsesLeft = CubePathStorage.getBoostCount('energy');
    if (this.energyEndTimer && !this.energyEndTimer.hasDispatched) {
      this.energyEndTimer.remove(false);
    }
    this.energyEndTimer = null;
    this.pendingEnergyTileRebuild = null;
    this.canUseSecondChance = true;
    this.secondChanceUsed = false;
    this.collectedCoinPositions = new Set();

    this.createFlashOverlay();
    this.drawBiomeBackdrop();
    this.drawUI();
    this.drawLevel();
    this.findStartPosition();
    this.createPlayer();
    this.setupCamera();
    this.fixHudToCamera();
    this.saveProgress();
    CubePathAds.gameplayStart?.();

    this.lastSafeGridX = this.startGridX;
    this.lastSafeGridY = this.startGridY;
  }
  showMainCampaignCompleteScreen() {
    this.clearBreakTimers();
    this.clearResultMenu();
    this.activeOverlayKind = 'mainCampaignComplete';
    const profile = this.deviceProfile || window.CubePathDevice?.getProfile?.(this) || { isMobile: false, isPortrait: false };
    const isMobileOverlay = !!profile.isMobile;

    this.resetCameraFilters();
    this.children.removeAll(true);

    const panel = this.createStyledOverlayPanel({
      width: isMobileOverlay
        ? (profile.isPortrait ? Math.min(this.scale.width - 28, 360) : Math.min(this.scale.width - 48, 500))
        : 660,
      height: isMobileOverlay
        ? (profile.isPortrait ? 388 : 320)
        : 360,
      title: 'Основная кампания завершена',
      titleColor: '#ffffff',
      titleStroke: '#6dbb80'
    });

    const { cx, cy } = panel;
    const campaignTop = cy - panel.panelHeight / 2;
    const campaignBottom = cy + panel.panelHeight / 2;
    const campaignSummary = this.add.text(
      cx,
      campaignTop + (isMobileOverlay ? 104 : 128),
      'Попробуйте бесконечный режим\nНовые обновления уже в пути',
      this.makeUiTextStyle({
        size: isMobileOverlay ? (profile.isPortrait ? 16 : 18) : 22,
        color: '#5f7891',
        stroke: '#ffffff',
        strokeThickness: 1
      })
    ).setOrigin(0.5).setScrollFactor(0).setDepth(12005);
    campaignSummary.setAlign('center');
    campaignSummary.setWordWrapWidth(Math.min(panel.panelWidth - 44, this.scale.width - 56), true);
    this.fitTextToBox(campaignSummary, Math.min(panel.panelWidth - 44, this.scale.width - 56), panel.panelHeight - 180, 12);

    const endlessBtnCampaign = this.createStyledUiButton(cx, campaignBottom - (isMobileOverlay ? 86 : 90), isMobileOverlay ? 232 : 260, isMobileOverlay ? 40 : 42, 'Бесконечный режим', () => {
      CubePathStorage.setMode('survival');
      CubePathStorage.setCurrentLevel(0, 'survival');
      this.scene.start('GameScene');
    }, { textSize: isMobileOverlay ? 12 : 15, theme: 'green' });

    const menuBtnCampaign = this.createStyledUiButton(cx, campaignBottom - (isMobileOverlay ? 38 : 40), isMobileOverlay ? 166 : 180, isMobileOverlay ? 36 : 40, 'В меню', () => {
      CubePathAudio.stopMusic(this);
      this.scene.start('MenuScene');
    }, { textSize: isMobileOverlay ? 12 : 15, theme: 'blue' });

    this.resultUi = [
      panel.overlay,
      panel.shadow,
      panel.panel,
      panel.inner,
      panel.gloss,
      panel.titleText,
      campaignSummary,
      ...endlessBtnCampaign,
      ...menuBtnCampaign
    ];

    this.fixHudToCamera();
    return;
    const unusedTopTwo = cy - panel.panelHeight / 2;
    const unusedBottomTwo = cy + panel.panelHeight / 2;
    const unusedStatsAdaptive = this.add.text(
      cx,
      panelTop + (isMobileOverlay ? 112 : 126),
      completedCount > 0
        ? `Сумма лучших результатов:\n${totalBestTime.toFixed(1)}с / ${totalBestMoves} ходов`
        : 'Лучшие результаты пока не найдены',
      this.makeUiTextStyle({
        size: isMobileOverlay ? (profile.isPortrait ? 15 : 17) : 19,
        color: '#5f7891',
        stroke: '#ffffff',
        strokeThickness: 1
      })
    ).setOrigin(0.5).setScrollFactor(0).setDepth(12005);
    unusedStatsAdaptive.setAlign('center');
    unusedStatsAdaptive.setWordWrapWidth(Math.min(panel.panelWidth - 44, this.scale.width - 56), true);
    this.fitTextToBox(unusedStatsAdaptive, Math.min(panel.panelWidth - 44, this.scale.width - 56), panel.panelHeight - 176, 12);

    const unusedReplayBtnNode = this.createStyledUiButton(cx, panelBottom - (isMobileOverlay ? 84 : 88), isMobileOverlay ? 214 : 226, isMobileOverlay ? 40 : 42, 'Играть заново', () => {
      this.currentLevelIndex = 0;
      if (this.gameMode === 'tutorial') {
        this.unlockedLevelIndex = 0;
      }
      this.saveProgress();
      this.loadLevel(0);
    }, { textSize: isMobileOverlay ? 12 : 15, theme: 'green' });

    const unusedMenuBtnNode = this.createStyledUiButton(cx, panelBottom - (isMobileOverlay ? 38 : 40), isMobileOverlay ? 170 : 186, isMobileOverlay ? 36 : 40, 'В меню', () => {
      CubePathAudio.stopMusic(this);
      this.scene.start('MenuScene');
    }, { textSize: isMobileOverlay ? 12 : 15, theme: 'blue' });

    this.resultUi = [
      panel.overlay,
      panel.shadow,
      panel.panel,
      panel.inner,
      panel.gloss,
      panel.titleText,
      unusedStatsAdaptive,
      ...unusedReplayBtnNode,
      ...unusedMenuBtnNode
    ];

    this.fixHudToCamera();
    return;
    const panelTop = cy - panel.panelHeight / 2;
    const panelBottom = cy + panel.panelHeight / 2;
    const unusedSummaryTextNode = this.add.text(
      cx,
      panelTop + (isMobileOverlay ? 104 : 128),
      'Попробуйте бесконечный режим\nНовые обновления уже в пути',
      this.makeUiTextStyle({
        size: isMobileOverlay ? (profile.isPortrait ? 16 : 18) : 22,
        color: '#5f7891',
        stroke: '#ffffff',
        strokeThickness: 1
      })
    ).setOrigin(0.5).setScrollFactor(0).setDepth(12005);
    unusedSummaryTextNode.setAlign('center');
    unusedSummaryTextNode.setWordWrapWidth(Math.min(panel.panelWidth - 44, this.scale.width - 56), true);
    this.fitTextToBox(unusedSummaryTextNode, Math.min(panel.panelWidth - 44, this.scale.width - 56), panel.panelHeight - 180, 12);

    const unusedEndlessBtnNode = this.createStyledUiButton(cx, panelBottom - (isMobileOverlay ? 86 : 90), isMobileOverlay ? 232 : 260, isMobileOverlay ? 40 : 42, 'Бесконечный режим', () => {
      CubePathStorage.setMode('survival');
      CubePathStorage.setCurrentLevel(0, 'survival');
      this.scene.start('GameScene');
    }, { textSize: isMobileOverlay ? 12 : 15, theme: 'green' });

    const unusedSecondMenuBtnNode = this.createStyledUiButton(cx, panelBottom - (isMobileOverlay ? 38 : 40), isMobileOverlay ? 166 : 180, isMobileOverlay ? 36 : 40, 'В меню', () => {
      CubePathAudio.stopMusic(this);
      this.scene.start('MenuScene');
    }, { textSize: isMobileOverlay ? 12 : 15, theme: 'blue' });

    this.resultUi = [
      panel.overlay,
      panel.shadow,
      panel.panel,
      panel.inner,
      panel.gloss,
      panel.titleText,
      unusedSummaryTextNode,
      ...unusedEndlessBtnNode,
      ...unusedSecondMenuBtnNode
    ];

    this.fixHudToCamera();
    return;
    const unusedTop = cy - panel.panelHeight / 2;
    const unusedBottom = cy + panel.panelHeight / 2;
    const statsTextAdaptive = completedCount > 0
      ? `Сумма лучших результатов:\n${totalBestTime.toFixed(1)}с / ${totalBestMoves} ходов`
      : 'Лучшие результаты пока не найдены';

    const deadStatsAdaptive = this.add.text(
      cx,
      top + (isMobileOverlay ? 112 : 126),
      statsTextAdaptive,
      this.makeUiTextStyle({
        size: isMobileOverlay ? (profile.isPortrait ? 15 : 17) : 19,
        color: '#5f7891',
        stroke: '#ffffff',
        strokeThickness: 1
      })
    ).setOrigin(0.5).setScrollFactor(0).setDepth(12005);
    deadStatsAdaptive.setAlign('center');
    deadStatsAdaptive.setWordWrapWidth(Math.min(panel.panelWidth - 44, this.scale.width - 56), true);
    this.fitTextToBox(deadStatsAdaptive, Math.min(panel.panelWidth - 44, this.scale.width - 56), panel.panelHeight - 176, 12);

    const deadReplayBtnAdaptive = this.createStyledUiButton(cx, bottom - (isMobileOverlay ? 84 : 88), isMobileOverlay ? 214 : 226, isMobileOverlay ? 40 : 42, 'Играть заново', () => {
      this.currentLevelIndex = 0;
      if (this.gameMode === 'tutorial') {
        this.unlockedLevelIndex = 0;
      }
      this.saveProgress();
      this.loadLevel(0);
    }, { textSize: isMobileOverlay ? 12 : 15, theme: 'green' });

    const deadMenuBtnAdaptive = this.createStyledUiButton(cx, bottom - (isMobileOverlay ? 38 : 40), isMobileOverlay ? 170 : 186, isMobileOverlay ? 36 : 40, 'В меню', () => {
      CubePathAudio.stopMusic(this);
      this.scene.start('MenuScene');
    }, { textSize: isMobileOverlay ? 12 : 15, theme: 'blue' });

    this.resultUi = [
      panel.overlay,
      panel.shadow,
      panel.panel,
      panel.inner,
      panel.gloss,
      panel.titleText,
      deadStatsAdaptive,
      ...deadReplayBtnAdaptive,
      ...deadMenuBtnAdaptive
    ];

    this.fixHudToCamera();
    return;
    const top = cy - panel.panelHeight / 2;
    const bottom = cy + panel.panelHeight / 2;
    const summaryText = this.add.text(
      cx,
      top + (isMobileOverlay ? 104 : 128),
      'Попробуйте бесконечный режим\nНовые обновления уже в пути',
      this.makeUiTextStyle({
        size: isMobileOverlay ? (profile.isPortrait ? 16 : 18) : 22,
        color: '#5f7891',
        stroke: '#ffffff',
        strokeThickness: 1
      })
    ).setOrigin(0.5).setScrollFactor(0).setDepth(12005);
    summaryText.setAlign('center');
    summaryText.setWordWrapWidth(Math.min(panel.panelWidth - 44, this.scale.width - 56), true);
    this.fitTextToBox(summaryText, Math.min(panel.panelWidth - 44, this.scale.width - 56), panel.panelHeight - 180, 12);

    const deadEndlessBtnAdaptive = this.createStyledUiButton(cx, bottom - (isMobileOverlay ? 86 : 90), isMobileOverlay ? 232 : 260, isMobileOverlay ? 40 : 42, 'Бесконечный режим', () => {
      CubePathStorage.setMode('survival');
      CubePathStorage.setCurrentLevel(0, 'survival');
      this.scene.start('GameScene');
    }, { textSize: isMobileOverlay ? 12 : 15, theme: 'green' });

    const deadSecondMenuBtnAdaptive = this.createStyledUiButton(cx, bottom - (isMobileOverlay ? 38 : 40), isMobileOverlay ? 166 : 180, isMobileOverlay ? 36 : 40, 'В меню', () => {
      CubePathAudio.stopMusic(this);
      this.scene.start('MenuScene');
    }, { textSize: isMobileOverlay ? 12 : 15, theme: 'blue' });

    this.resultUi = [
      panel.overlay,
      panel.shadow,
      panel.panel,
      panel.inner,
      panel.gloss,
      panel.titleText,
      summaryText,
      ...deadEndlessBtnAdaptive,
      ...deadSecondMenuBtnAdaptive
    ];

    this.fixHudToCamera();
    return;

    const text = this.add.text(
      cx,
      cy - (isMobileOverlay ? 12 : 6),
      'Попробуйте бесконечный режим\n\nОжидайте обновлений',
      this.makeUiTextStyle({
        size: isMobileOverlay ? (profile.isPortrait ? 18 : 19) : 24,
        color: '#5f7891',
        stroke: '#ffffff',
        strokeThickness: 1
      })
    ).setOrigin(0.5).setScrollFactor(0).setDepth(12005);
    if (isMobileOverlay) {
      passedText.setWordWrapWidth(Math.min(panel.panelWidth - 46, this.scale.width - 58), true);
    }
    text.setWordWrapWidth(Math.min(panel.panelWidth - 48, this.scale.width - 56), true);

    const endlessBtn = this.createStyledUiButton(cx, cy + (isMobileOverlay ? 84 : 88), isMobileOverlay ? 236 : 260, isMobileOverlay ? 40 : 42, 'Бесконечный режим', () => {
      CubePathStorage.setMode('survival');
      CubePathStorage.setCurrentLevel(0, 'survival');
      this.scene.start('GameScene');
    }, { textSize: isMobileOverlay ? 13 : 16, theme: 'green' });

    const menuBtn = this.createStyledUiButton(cx, cy + (isMobileOverlay ? 136 : 144), isMobileOverlay ? 170 : 180, isMobileOverlay ? 38 : 42, 'В меню', () => {
      CubePathAudio.stopMusic(this);
      this.scene.start('MenuScene');
    }, { textSize: isMobileOverlay ? 13 : 16, theme: 'blue' });

    this.fixHudToCamera();
  }
  countCoinsInLevel(level) {
    let count = 0;
    for (let y = 0; y < level.length; y++) {
      for (let x = 0; x < level[y].length; x++) {
        if (level[y][x] === 8) count++;
      }
    }
    return count;
  }
  limitSurvivalCoinsToOne() {
    if (this.gameMode !== 'survival') return;

    const coinPositions = [];

    for (let y = 0; y < this.level.length; y++) {
      for (let x = 0; x < this.level[y].length; x++) {
        if (this.level[y][x] === 8) {
          coinPositions.push({ x, y });
        }
      }
    }

    if (coinPositions.length <= 1) return;

    const keep = coinPositions[0];

    for (const pos of coinPositions) {
      if (pos.x === keep.x && pos.y === keep.y) continue;
      this.level[pos.y][pos.x] = 1;
    }
  }
  collectCoinAt(x, y) {
    if (this.level[y][x] !== 8) return;

    this.level[y][x] = 1;
    this.coinsCollected++;
    this.collectedCoinPositions.add(`${x},${y}`);

    const tile = this.tiles?.[y]?.[x];
    if (tile && tile.setType) {
      tile.setType(1);
      tile.type = 1;
      tile.isBreaking = false;
    }

    if (this.gameMode === 'survival') {
      if (!this.survivalCoinRewardGranted) {
        CubePathStorage.addCubeCoins(1);
        this.survivalCoinRewardGranted = true;
      }

      if (this.coinLabel) {
        this.coinLabel.setText(`Кубикоины: ${this.coinsCollected}/${this.coinsTotal}`);
      }
    } else {
      if (this.coinLabel) {
        this.coinLabel.setText(`Монеты: ${this.coinsCollected}/${this.coinsTotal}`);
      }
    }

    const pos = this.toIso(x, y);
    this.spawnCoinCollectEffect(pos.x, pos.y - 10);
  }
  isSafeCheckpointCell(cell) {
    return [1, 2, 3, 5, 6, 8, 12, 13].includes(cell);
  }
  getBiomeTheme() {
    const biome = this.getBiomeIndex();

    const themes = [
      {
        name: 'Луг',
        background: '#1d1d1d',
        tiles: {
          normal: { top: 0xc6c9cf, left: 0x8f959e, right: 0xe0e3e8 },
          start: { top: 0x47c76d, left: 0x2f9a52, right: 0x67d78a },
          finish: { top: 0x4aa8ff, left: 0x2d7fc9, right: 0x7dc3ff },
          block: { top: 0x8d8d8d, left: 0x6c6c6c, right: 0xb1b1b1 },
          fragile: { top: 0xcaa7ff, left: 0x9a72da, right: 0xddc8ff },
          solid: { top: 0x6ddc91, left: 0x38a85f, right: 0x96efb0 },
          deadly: { top: 0xff6c6c, left: 0xc74343, right: 0xff9494 },
          coin: { top: 0xffd54a, left: 0xd4a017, right: 0xffe082 }
        }
      },
      {
        name: 'Лёд',
        background: '#16202b',
        tiles: {
          normal: { top: 0xcfefff, left: 0x8dbbdb, right: 0xe8f8ff },
          start: { top: 0x72ffcc, left: 0x3fbf9c, right: 0x9effdf },
          finish: { top: 0x7ab8ff, left: 0x4d88d6, right: 0xa8d4ff },
          block: { top: 0xb9d4e6, left: 0x86a6ba, right: 0xd9edf8 },
          fragile: { top: 0xdac8ff, left: 0xa694db, right: 0xeee4ff },
          solid: { top: 0x9ef4ff, left: 0x60bac9, right: 0xcafaff },
          deadly: { top: 0xff8f8f, left: 0xd95f5f, right: 0xffb0b0 },
          coin: { top: 0xffe27a, left: 0xe0b63a, right: 0xffefb3 }
        }
      },
      {
        name: 'Пустыня',
        background: '#2a1f12',
        tiles: {
          normal: { top: 0xe2c48f, left: 0xb68d5b, right: 0xf1ddb6 },
          start: { top: 0x76d96d, left: 0x4f9f48, right: 0x97e08f },
          finish: { top: 0x67b3ff, left: 0x3d82cc, right: 0x95ceff },
          block: { top: 0xa57d52, left: 0x7c5d3b, right: 0xc2996d },
          fragile: { top: 0xe0b6ff, left: 0xaa7fd3, right: 0xf0d7ff },
          solid: { top: 0xb7ef8f, left: 0x7ab45c, right: 0xd6ffbc },
          deadly: { top: 0xff7c5a, left: 0xcc5437, right: 0xffa085 },
          coin: { top: 0xffde6c, left: 0xd4a51f, right: 0xffedac },
          quicksand: { top: 0xd6ad63, left: 0xa0773d, right: 0xedcf99 }
        }
      },
      {
        name: 'Вулкан',
        background: '#241616',
        tiles: {
          normal: { top: 0xb9a2a2, left: 0x7d6666, right: 0xd8c1c1 },
          start: { top: 0x67d77a, left: 0x3e9f52, right: 0x8fea9a },
          finish: { top: 0x79b8ff, left: 0x4a88d1, right: 0xa3d2ff },
          block: { top: 0x6f5b5b, left: 0x4b3d3d, right: 0x8c7474 },
          fragile: { top: 0xd6aeff, left: 0x9d73d3, right: 0xebd8ff },
          solid: { top: 0xa2ff8f, left: 0x66b454, right: 0xc3ffb8 },
          deadly: { top: 0xff5a36, left: 0xc53a1c, right: 0xff8d71 },
          coin: { top: 0xffdd66, left: 0xd6a411, right: 0xffefab },
          hot: { top: 0xffa34d, left: 0xc96a1a, right: 0xffc27d }
        }
      },
      {
        name: 'Руины',
        background: '#171d26',
        tiles: {
          normal: { top: 0xaab5c4, left: 0x778191, right: 0xd1d8e2 },
          start: { top: 0x56d1b5, left: 0x2f9882, right: 0x82e6cf },
          finish: { top: 0x7f9dff, left: 0x546ed2, right: 0xaec1ff },
          block: { top: 0x707b88, left: 0x505966, right: 0x97a2af },
          fragile: { top: 0xc3b7ff, left: 0x8e7fd6, right: 0xe0d9ff },
          solid: { top: 0x7ce0c7, left: 0x49a68f, right: 0xa8f0df },
          deadly: { top: 0xff6f9f, left: 0xc64873, right: 0xffa6c3 },
          coin: { top: 0xffdc78, left: 0xd4a423, right: 0xffefb0 },
          switch: { top: 0x7cf0ff, left: 0x3f9db0, right: 0xb7fbff },
          gateOn: { top: 0x7ef7c4, left: 0x49b187, right: 0xb4ffe0 },
          gateOff: { top: 0x55606e, left: 0x39414d, right: 0x7a8797 }
        }
      }
    ];

    return themes[biome] ?? themes[0];
  }
  registerWorldTile(tile) {
    if (!tile) return tile;

    if (this.hudCamera) {
      if (tile.graphics) this.hudCamera.ignore(tile.graphics);
      if (tile.deco) this.hudCamera.ignore(tile.deco);
      if (tile.sprite) this.hudCamera.ignore(tile.sprite);
      if (tile.shadow) this.hudCamera.ignore(tile.shadow);
    }

    return tile;
  }
  spawnCoinCollectEffect(x, y) {
    for (let i = 0; i < 6; i++) {
      const piece = this.registerWorldObject(
        this.add.circle(x, y, 4, 0xffd54a).setDepth(3000)
      );

      this.tweens.add({
        targets: piece,
        x: x + Phaser.Math.Between(-24, 24),
        y: y + Phaser.Math.Between(-24, 8),
        alpha: 0,
        duration: 260,
        onComplete: () => piece.destroy()
      });
    }
  }
  regenerateCurrentCampaignLevel() {
    if (this.gameMode !== 'campaign') return;

    this.currentCampaignLayout = null;
    this.currentCampaignSeed = null;
    this.loadLevel(this.currentLevelIndex);
  }
  saveProgress() {
    CubePathStorage.setCurrentLevel(this.currentLevelIndex, this.gameMode);
    CubePathStorage.setUnlockedLevel(this.unlockedLevelIndex, this.gameMode);
  }

  createFlashOverlay() {
    const { width, height } = this.scale;
    this.flashOverlay = this.add.rectangle(width / 2, height / 2, width, height, 0xffffff, 0)
      .setScrollFactor(0)
      .setDepth(10000);
  }

  flash(color = 0xffffff, alpha = 0.2, duration = 120) {
    this.flashOverlay.setFillStyle(color, alpha);
    this.tweens.add({ targets: this.flashOverlay, alpha: 0, duration });
  }
  makeUiTextStyle({
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

  createUiRoundedRect(x, y, w, h, radius, fillColor, fillAlpha = 1, strokeColor = null, strokeAlpha = 1, strokeWidth = 0, depth = 12001) {
    const g = this.add.graphics().setDepth(depth).setScrollFactor(0);
    g.fillStyle(fillColor, fillAlpha);
    g.fillRoundedRect(x - w / 2, y - h / 2, w, h, radius);

    if (strokeColor !== null && strokeWidth > 0) {
      g.lineStyle(strokeWidth, strokeColor, strokeAlpha);
      g.strokeRoundedRect(x - w / 2, y - h / 2, w, h, radius);
    }

    return g;
  }

  createStyledOverlayPanel({
    width = 460,
    height = 280,
    title = '',
    titleColor = '#ffffff',
    titleStroke = '#6b8eb1'
  }) {
    const profile = this.deviceProfile || window.CubePathDevice?.getProfile?.(this) || { isMobile: false, isPortrait: false, safePadding: 14 };
    const safeMargin = (profile.safePadding || 14) + (profile.isMobile ? 8 : 18);
    width = Math.min(width, this.scale.width - safeMargin * 2);
    height = Math.min(height, this.scale.height - safeMargin * 2);

    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2;

    const overlay = this.add.rectangle(
      cx,
      cy,
      this.scale.width,
      this.scale.height,
      0x8ecfff,
      0.12
    ).setScrollFactor(0).setDepth(12000);

    const shadow = this.createUiRoundedRect(cx, cy + 6, width, height, 24, 0x5e86ab, 0.18, null, 0, 0, 12001);
    const panel = this.createUiRoundedRect(cx, cy, width, height, 24, 0x9fd3ff, 0.98, 0xeaf8ff, 0.95, 2, 12002);
    const inner = this.createUiRoundedRect(cx, cy, width - 10, height - 10, 20, 0xb8e1ff, 0.22, 0xffffff, 0.14, 1, 12003);
    const gloss = this.createUiRoundedRect(cx, cy - height / 2 + 34, width - 20, 48, 16, 0xffffff, 0.10, null, 0, 0, 12003);

    const titleText = this.add.text(
      cx,
      cy - height / 2 + (profile.isMobile ? 64 : 88),
      title,
      this.makeUiTextStyle({
        size: profile.isMobile ? (profile.isPortrait ? 24 : 26) : 31,
        color: titleColor,
        stroke: titleStroke,
        strokeThickness: 3,
        shadowColor: '#ffffff',
        shadowBlur: 6
      })
    ).setOrigin(0.5).setScrollFactor(0).setDepth(12004);
    titleText.setAlign('center');
    titleText.setWordWrapWidth(Math.max(120, width - 48), true);
    this.fitTextToBox(titleText, Math.max(120, width - 48), profile.isMobile ? 54 : 64, 18);

    return { cx, cy, panelWidth: width, panelHeight: height, overlay, shadow, panel, inner, gloss, titleText };
  }

  createStyledUiButton(x, y, w, h, label, onClick, options = {}) {
    const theme = options.theme || 'blue';
    const textSize = options.textSize || 16;
    const baseDepth = Number.isFinite(options.depth) ? options.depth : 12003;
    const profile = this.deviceProfile || window.CubePathDevice?.getProfile?.(this) || { isMobile: false, touchTarget: 48 };
    const isMultiline = String(label).includes('\n');

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

    const shadow = this.createUiRoundedRect(x, y + 4, w, h, 14, c.shadow, 0.14, null, 0, 0, baseDepth);
    const bg = this.createUiRoundedRect(x, y, w, h, 14, c.base, 0.96, c.stroke, 0.9, 2, baseDepth + 1);
    const inner = this.createUiRoundedRect(x, y, w - 8, h - 8, 11, 0xffffff, 0.05, 0xffffff, 0.14, 1, baseDepth + 2);
    const gloss = this.createUiRoundedRect(x, y - 8, w - 10, h / 2 - 6, 10, 0xffffff, 0.14, null, 0, 0, baseDepth + 2);

    const hit = this.add.rectangle(
      x,
      y,
      Math.max(w, profile.isMobile ? profile.touchTarget : w),
      Math.max(h, profile.isMobile ? Math.round(profile.touchTarget * 0.86) : h),
      0x000000,
      0.001
    )
      .setInteractive({ useHandCursor: !profile.isMobile })
      .setScrollFactor(0)
      .setDepth(baseDepth + 3);

    const text = this.add.text(
      x,
      y,
      label,
      this.makeUiTextStyle({
        size: textSize,
        color: c.text,
        stroke: c.textStroke,
        strokeThickness: 2,
        shadowColor: c.textStroke,
        shadowBlur: 3
      })
    ).setOrigin(0.5).setScrollFactor(0).setDepth(baseDepth + 4);
    text.setAlign('center');
    if (isMultiline) {
      text.setLineSpacing(-2);
      text.setWordWrapWidth(Math.max(60, w - 18), true);
    }
    this.fitTextToBox(text, Math.max(44, w - 18), h - 8, profile.isMobile ? 10 : 11);

    const setScaleAll = (scale) => {
      bg.setScale(scale);
      inner.setScale(scale);
      gloss.setScale(scale);
      hit.setScale(scale);
      text.setScale(scale);
    };

    if (!profile.isMobile) {
      hit.on('pointerover', () => {
        bg.clear();
        bg.fillStyle(c.hover, 0.98);
        bg.fillRoundedRect(x - w / 2, y - h / 2, w, h, 14);
        bg.lineStyle(2, c.stroke, 0.9);
        bg.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 14);
        setScaleAll(1.02);
      });

      hit.on('pointerout', () => {
        bg.clear();
        bg.fillStyle(c.base, 0.96);
        bg.fillRoundedRect(x - w / 2, y - h / 2, w, h, 14);
        bg.lineStyle(2, c.stroke, 0.9);
        bg.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 14);
        setScaleAll(1);
      });
    }

    hit.on('pointerdown', () => {
      bg.clear();
      bg.fillStyle(c.down, 1);
      bg.fillRoundedRect(x - w / 2, y - h / 2, w, h, 14);
      bg.lineStyle(2, c.stroke, 0.9);
      bg.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 14);
      setScaleAll(0.98);
    });

    hit.on('pointerup', () => {
      bg.clear();
      bg.fillStyle(profile.isMobile ? c.base : c.hover, profile.isMobile ? 0.96 : 0.98);
      bg.fillRoundedRect(x - w / 2, y - h / 2, w, h, 14);
      bg.lineStyle(2, c.stroke, 0.9);
      bg.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 14);
      setScaleAll(profile.isMobile ? 1 : 1.02);
      onClick();
    });

    return [shadow, bg, inner, gloss, hit, text];
  }

  createStarRow(cx, y, filledStars, options = {}) {
    const nodes = [];
    const scale = Number.isFinite(options.scale) ? options.scale : 1;
    const spacing = Number.isFinite(options.spacing) ? options.spacing : 88 * scale;

    const drawSoftStar = (x, y, scale, filled) => {
      const g = this.add.graphics().setScrollFactor(0).setDepth(12006);

      const outer = 36 * scale;
      const inner = 17 * scale;
      const points = 5;

      const buildStar = (outerR, innerR) => {
        const pts = [];
        for (let i = 0; i < points * 2; i++) {
          const angle = -Math.PI / 2 + i * Math.PI / points;
          const r = i % 2 === 0 ? outerR : innerR;
          pts.push({
            x: x + Math.cos(angle) * r,
            y: y + Math.sin(angle) * r
          });
        }
        return pts;
      };

      const starPoints = buildStar(outer, inner);

      const fill = filled ? 0xffd63b : 0xd6dde5;
      const stroke = filled ? 0xe19908 : 0x9dadba;
      const innerFill = filled ? 0xffeb7a : 0xecf0f4;

      g.fillStyle(fill, 1);
      g.lineStyle(5, stroke, 1);
      g.beginPath();
      g.moveTo(starPoints[0].x, starPoints[0].y);
      for (let i = 1; i < starPoints.length; i++) g.lineTo(starPoints[i].x, starPoints[i].y);
      g.closePath();
      g.fillPath();
      g.strokePath();

      const innerStar = buildStar(outer * 0.78, inner * 0.78);
      g.fillStyle(innerFill, filled ? 0.62 : 0.38);
      g.beginPath();
      g.moveTo(innerStar[0].x, innerStar[0].y);
      for (let i = 1; i < innerStar.length; i++) g.lineTo(innerStar[i].x, innerStar[i].y);
      g.closePath();
      g.fillPath();

      return g;
    };

    for (let i = 0; i < 3; i++) {
      const x = cx - spacing + i * spacing;
      const filled = i < filledStars;
      nodes.push(drawSoftStar(x, y, scale, filled));
    }

    return nodes;
  }
  createMetricRow(cx, y, icon, text, theme = 'blue', options = {}) {
    const palettes = {
      blue: {
        fill: 0xeaf6ff,
        stroke: 0xffffff,
        text: '#5f7891',
        icon: '#5aa8f2',
        textStroke: '#ffffff'
      },
      gold: {
        fill: 0xfff4d8,
        stroke: 0xffefc0,
        text: '#9b742c',
        icon: '#f0b93b',
        textStroke: '#fffaf0'
      }
    };

    const p = palettes[theme] || palettes.blue;
    const nodes = [];
    const textSize = Number.isFinite(options.textSize) ? options.textSize : 17;
    const iconSize = Number.isFinite(options.iconSize) ? options.iconSize : 21;
    const maxWidth = Number.isFinite(options.maxWidth) ? options.maxWidth : 180;
    const maxHeight = Number.isFinite(options.maxHeight) ? options.maxHeight : 26;
    const minSize = Number.isFinite(options.minSize) ? options.minSize : 10;
    const labelOffsetX = Number.isFinite(options.labelOffsetX) ? options.labelOffsetX : 8;
    const iconOffsetX = Number.isFinite(options.iconOffsetX) ? options.iconOffsetX : -12;
    const shardScale = Number.isFinite(options.shardScale) ? options.shardScale : 0.62;

    const label = this.add.text(
      cx + labelOffsetX,
      y,
      text,
      this.makeUiTextStyle({
        size: textSize,
        color: p.text,
        stroke: p.textStroke,
        strokeThickness: 1,
        shadowColor: '#ffffff',
        shadowBlur: 2,
        align: 'left'
      })
    ).setOrigin(0, 0.5).setScrollFactor(0).setDepth(12005);
    this.fitTextToBox(label, maxWidth, maxHeight, minSize);

    nodes.push(label);

    if (icon === '⌛') {
      const iconText = this.add.text(
        cx + iconOffsetX,
        y,
        '⌛',
        this.makeUiTextStyle({
          size: iconSize,
          color: p.icon,
          stroke: '#ffffff',
          strokeThickness: 1,
          shadowColor: '#ffffff',
          shadowBlur: 2
        })
      ).setOrigin(0.5).setScrollFactor(0).setDepth(12005);

      nodes.push(iconText);
    } else if (icon === 'STAR_HALF') {
      const g = this.add.graphics().setScrollFactor(0).setDepth(12005);

      const x = cx + iconOffsetX + 4;
      const yy = y;
      const s = shardScale;

      // внешний контур "осколка звезды"
      const outer = [
        { x: x - 20 * s, y: yy - 6 * s },
        { x: x - 4 * s, y: yy - 18 * s },
        { x: x + 10 * s, y: yy - 10 * s },
        { x: x + 6 * s, y: yy - 1 * s },
        { x: x + 16 * s, y: yy + 7 * s },
        { x: x + 2 * s, y: yy + 15 * s },
        { x: x - 8 * s, y: yy + 9 * s },
        { x: x - 6 * s, y: yy + 1 * s }
      ];

      g.fillStyle(0xd97d00, 1);
      g.beginPath();
      g.moveTo(outer[0].x, outer[0].y);
      for (let i = 1; i < outer.length; i++) g.lineTo(outer[i].x, outer[i].y);
      g.closePath();
      g.fillPath();

      // внутренняя основа
      const inner = [
        { x: x - 15 * s, y: yy - 5 * s },
        { x: x - 3 * s, y: yy - 14 * s },
        { x: x + 6 * s, y: yy - 9 * s },
        { x: x + 3 * s, y: yy - 1 * s },
        { x: x + 11 * s, y: yy + 6 * s },
        { x: x + 1 * s, y: yy + 12 * s },
        { x: x - 6 * s, y: yy + 8 * s },
        { x: x - 4 * s, y: yy + 1 * s }
      ];

      g.fillStyle(0xffc800, 1);
      g.beginPath();
      g.moveTo(inner[0].x, inner[0].y);
      for (let i = 1; i < inner.length; i++) g.lineTo(inner[i].x, inner[i].y);
      g.closePath();
      g.fillPath();

      // светлая верхняя грань
      const topFace = [
        { x: x - 13 * s, y: yy - 5 * s },
        { x: x - 2 * s, y: yy - 12 * s },
        { x: x + 5 * s, y: yy - 8 * s },
        { x: x + 2 * s, y: yy - 1 * s },
        { x: x - 1 * s, y: yy + 1 * s },
        { x: x - 11 * s, y: yy - 3 * s }
      ];

      g.fillStyle(0xf4e64f, 1);
      g.beginPath();
      g.moveTo(topFace[0].x, topFace[0].y);
      for (let i = 1; i < topFace.length; i++) g.lineTo(topFace[i].x, topFace[i].y);
      g.closePath();
      g.fillPath();

      // нижняя тёплая грань
      const lowerFace = [
        { x: x - 1 * s, y: yy + 1 * s },
        { x: x + 8 * s, y: yy + 6 * s },
        { x: x + 1 * s, y: yy + 11 * s },
        { x: x - 6 * s, y: yy + 7 * s }
      ];

      g.fillStyle(0xffd632, 1);
      g.beginPath();
      g.moveTo(lowerFace[0].x, lowerFace[0].y);
      for (let i = 1; i < lowerFace.length; i++) g.lineTo(lowerFace[i].x, lowerFace[i].y);
      g.closePath();
      g.fillPath();

      // белая "ломаная" кромка скола
      g.lineStyle(3, 0xfff7c8, 0.95);
      g.beginPath();
      g.moveTo(x - 12 * s, yy - 3 * s);
      g.lineTo(x - 1 * s, yy + 1 * s);
      g.lineTo(x + 6 * s, yy + 9 * s);
      g.strokePath();

      // внешний контур поверх всего
      g.lineStyle(3, 0xb56300, 1);
      g.beginPath();
      g.moveTo(outer[0].x, outer[0].y);
      for (let i = 1; i < outer.length; i++) g.lineTo(outer[i].x, outer[i].y);
      g.closePath();
      g.strokePath();

      nodes.push(g);
    }
    return nodes;
  }

  createCampaignProgressBar(cx, y, width = 360) {
    if (this.gameMode !== 'campaign') return [];

    const currentStars = CubePathStorage.getTotalEarnedStars('campaign');
    const currentBiome = CubePathStorage.getBiomeIndexForLevel(this.currentLevelIndex);
    const nextBiome = Math.min(currentBiome + 1, 4);
    const nextRequirement = CubePathStorage.getBiomeUnlockRequirement(nextBiome);

    let prevRequirement = 0;
    if (nextBiome > 0) {
      prevRequirement = CubePathStorage.getBiomeUnlockRequirement(nextBiome - 1);
    }

    const allUnlocked = currentStars >= CubePathStorage.getBiomeUnlockRequirement(4);
    const range = Math.max(1, nextRequirement - prevRequirement);
    const progress = allUnlocked ? 1 : Phaser.Math.Clamp((currentStars - prevRequirement) / range, 0, 1);

    const nodes = [];

    const bg = this.createUiRoundedRect(cx, y, width, 44, 16, 0xe9f6ff, 0.88, 0xffffff, 0.95, 2, 12004);
    const track = this.createUiRoundedRect(cx, y + 8, width - 30, 14, 7, 0xc9dded, 0.75, 0xffffff, 0.35, 1, 12005);

    const fillWidth = Math.max(18, (width - 30) * progress);
    const fillX = cx - (width - 30) / 2 + fillWidth / 2;

    const fill = this.createUiRoundedRect(fillX, y + 8, fillWidth, 14, 7, allUnlocked ? 0x6fd08b : 0xffd35b, 0.96, 0xffffff, 0.45, 1, 12006);

    const title = this.add.text(
      cx,
      y - 8,
      allUnlocked ? 'Все биомы открыты' : `Прогресс до следующего биома`,
      this.makeUiTextStyle({
        size: 15,
        color: '#5f7891',
        stroke: '#ffffff',
        strokeThickness: 1,
        shadowColor: '#ffffff',
        shadowBlur: 2
      })
    ).setOrigin(0.5).setScrollFactor(0).setDepth(12007);

    const subtitle = this.add.text(
      cx,
      y + 30,
      allUnlocked
        ? `${currentStars}★ собрано`
        : `${currentStars}★ / ${nextRequirement}★ • осталось ${Math.max(0, nextRequirement - currentStars)}★`,
      this.makeUiTextStyle({
        size: 14,
        color: allUnlocked ? '#5a9e67' : '#8a6e2f',
        stroke: '#ffffff',
        strokeThickness: 1,
        shadowColor: '#ffffff',
        shadowBlur: 2
      })
    ).setOrigin(0.5).setScrollFactor(0).setDepth(12007);

    nodes.push(bg, track, fill, title, subtitle);
    return nodes;
  }
  getCampaignSeed(levelIndex) {
    return 1000 + levelIndex;
  }
  configureLevelSpace() {
    const width = this.baseLevel[0].length;
    const height = this.baseLevel.length;

    this.offsetX = Math.max(420, height * this.tileW * 0.6);
    this.offsetY = 180;

    const minX = this.offsetX - (height - 1) * (this.tileW / 2) - 260;
    const maxX = this.offsetX + (width - 1) * (this.tileW / 2) + 260;
    const minY = this.offsetY - this.tileH - 120;
    const maxY = this.offsetY + (width + height) * (this.tileH / 2) + this.tileDepth + 260;

    this.worldBounds = {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  }

  setupCamera() {
    const cam = this.cameras.main;
    cam.setViewport(0, 0, this.scale.width, this.scale.height);
    cam.setBounds(
      this.worldBounds.x,
      this.worldBounds.y,
      this.worldBounds.width,
      this.worldBounds.height
    );
    cam.setZoom(this.getResponsiveCameraZoom());
    cam.roundPixels = true;

    if (this.cameraTarget) {
      cam.startFollow(this.cameraTarget, false, 0.08, 0.08);
      this.updateCameraTarget(true);
    }
  }

  resetCameraFilters() {
    this.children.list.forEach((child) => {
      if (!child || typeof child.cameraFilter !== 'number') return;
      child.cameraFilter = 0;
    });
  }

  fixHudToCamera() {
    const mainCam = this.cameras.main;

    this.resetCameraFilters();

    let hudCam = this.hudCamera;
    const hasHudCamera = hudCam && this.cameras.cameras.includes(hudCam);

    if (!hasHudCamera) {
      hudCam = this.cameras.add(0, 0, this.scale.width, this.scale.height, false, 'hudCamera');
      this.hudCamera = hudCam;
    } else {
      hudCam.setViewport(0, 0, this.scale.width, this.scale.height);
    }

    hudCam.setScroll(0, 0);
    hudCam.setZoom(1);
    hudCam.roundPixels = true;

    const hudObjects = [];
    const worldObjects = [];

    this.children.list.forEach((child) => {
      if (!child) return;

      if (child === this.cameraTarget) {
        worldObjects.push(child);
        return;
      }

      if (child.depth >= 5000) {
        if (child.setScrollFactor) child.setScrollFactor(0);
        hudObjects.push(child);
      } else {
        worldObjects.push(child);
      }
    });

    mainCam.ignore(hudObjects);
    hudCam.ignore(worldObjects);
  }
  registerWorldObject(obj) {
    if (!obj) return obj;

    if (this.hudCamera) {
      this.hudCamera.ignore(obj);
    }

    return obj;
  }
  getCameraLookAhead() {
    return {
      x: this.lastMoveDx * this.lookAheadDistanceX,
      y: this.lastMoveDy * this.lookAheadDistanceY
    };
  }

  updateCameraTarget(instant = false) {
    if (!this.cameraTarget) return;

    const look = this.getCameraLookAhead();
    const tx = this.playerVisualX + look.x;
    const ty = this.playerVisualY + 30 + look.y;

    if (instant) {
      this.cameraTarget.setPosition(tx, ty);
      return;
    }

    this.cameraTarget.setPosition(tx, ty);
  }
  getResponsiveCameraZoom() {
    const profile = this.deviceProfile || window.CubePathDevice?.getProfile?.(this) || { isMobile: false, isPortrait: false };
    const levelWidth = this.baseLevel?.[0]?.length ?? 0;
    const levelHeight = this.baseLevel?.length ?? 0;
    const largestDimension = Math.max(levelWidth, levelHeight);

    let zoom = 2.7;

    if (profile.isMobile) {
      zoom = profile.isPortrait ? 1.82 : 2.12;
    } else if (this.scale.height < 760) {
      zoom = 2.6;
    }

    if (largestDimension >= 12) {
      zoom -= profile.isMobile ? 0.12 : 0.08;
    }

    if (largestDimension >= 14) {
      zoom -= profile.isMobile ? 0.08 : 0.04;
    }

    return Phaser.Math.Clamp(zoom, profile.isPortrait ? 1.58 : 1.94, 2.7);
  }
  resetUiHitBoxes() {
    this.uiHitBoxes = [];
  }
  registerUiHitBox(cx, cy, width, height, padding = 0) {
    if (!width || !height) return;

    this.uiHitBoxes.push({
      left: cx - width / 2 - padding,
      right: cx + width / 2 + padding,
      top: cy - height / 2 - padding,
      bottom: cy + height / 2 + padding
    });
  }
  getGameUiLayout() {
    const profile = this.deviceProfile || window.CubePathDevice?.getProfile?.(this) || { isMobile: false, isPortrait: false, touchTarget: 48, safePadding: 14 };
    const w = this.scale.width;
    const h = this.scale.height;
    const side = profile.isMobile ? 12 : 14;
    const top = profile.isMobile ? 12 : 12;

    if (!profile.isMobile) {
      return {
        profile,
        left: side,
        top,
        right: w - 14,
        infoCardX: side + 122,
        infoCardY: top + 38,
        infoCardW: 244,
        infoCardH: 76,
        pauseX: w - 64,
        pauseY: top + 18,
        pauseW: 92,
        pauseH: 34,
        boostSize: 46,
        freezeX: w - 92,
        energyX: w - 92,
        freezeY: top + 98,
        energyY: top + 184
      };
    }

    const iconSize = profile.isPortrait ? 52 : 44;
    const iconGap = 8;
    const rightColX = w - side - iconSize / 2;
    const leftColX = rightColX - iconSize - iconGap;
    const topRowY = top + iconSize / 2;
    const secondRowY = topRowY + iconSize + 8;
    const soundButtonY = secondRowY + iconSize / 2 + 18;
    const navY = soundButtonY + 30;
    const boostSize = profile.isPortrait ? 56 : 48;
    const boostY = h - (profile.isPortrait ? 82 : 62);
    const pauseX = w - side - (profile.isPortrait ? 26 : 24);
    const pauseY = top + (profile.isPortrait ? 20 : 18);
    const pauseW = profile.isPortrait ? 56 : 52;
    const pauseH = profile.isPortrait ? 42 : 38;
    const infoCardMaxW = Math.max(168, w - side * 3 - pauseW - 28);
    const infoCardW = Math.min(profile.isPortrait ? 214 : 240, infoCardMaxW);
    const infoCardH = profile.isPortrait ? 68 : 64;
    const freezeX = profile.isPortrait
      ? w / 2 - boostSize / 2 - 26
      : w - side - boostSize / 2 - boostSize - 18;
    const energyX = profile.isPortrait
      ? w / 2 + boostSize / 2 + 26
      : w - side - boostSize / 2;

    return {
      profile,
      side,
      top,
      leftTextX: side,
      topTextY: top,
      titleFont: profile.isPortrait ? 15 : 16,
      bodyFont: profile.isPortrait ? 12 : 13,
      metaFont: profile.isPortrait ? 10 : 11,
      leftBlockWidth: profile.isPortrait ? Math.max(152, w - 110) : Math.max(220, w * 0.42),
      infoCardX: side + infoCardW / 2,
      infoCardY: top + infoCardH / 2,
      infoCardW,
      infoCardH,
      pauseX,
      pauseY,
      pauseW,
      pauseH,
      controlButtons: [
        { x: leftColX, y: topRowY, label: '⌂', textSize: '20px', action: () => { CubePathAudio.stopMusic(this); this.scene.start('MenuScene'); } },
        { x: rightColX, y: topRowY, label: '↺', textSize: '20px', action: () => { this.resetCurrentLevel(); } },
        { x: leftColX, y: secondRowY, label: '⛶', textSize: '18px', action: () => { this.toggleFullscreen(); } },
        { x: rightColX, y: secondRowY, label: '♪', textSize: '18px', action: () => { this.toggleSound(); } }
      ],
      iconSize,
      soundButtonX: (leftColX + rightColX) / 2,
      soundButtonY,
      soundButtonW: profile.isPortrait ? Math.min(154, w - side * 2) : 132,
      soundButtonH: 28,
      navLeftX: leftColX,
      navRightX: rightColX,
      navY,
      navW: profile.isPortrait ? 48 : 42,
      navH: 30,
      legendX: w / 2,
      legendY: h - (profile.isPortrait ? 26 : 18),
      legendWidth: w - side * 2,
      boostSize,
      freezeX,
      energyX,
      boostY
    };
  }
  getHudTitleText() {
    return this.gameMode === 'survival'
      ? `\u042d\u0442\u0430\u043f ${this.currentLevelIndex + 1}`
      : `\u0423\u0440\u043e\u0432\u0435\u043d\u044c ${this.currentLevelIndex + 1}`;
  }
  getHudTimeText(elapsedSeconds = 0) {
    return `\u0412\u0440\u0435\u043c\u044f ${elapsedSeconds.toFixed(1)}\u0441`;
  }
  drawCompactHudCard(layout) {
    const profile = layout.profile || this.deviceProfile || window.CubePathDevice?.getProfile?.(this) || { isMobile: false, isPortrait: false };
    const cardW = layout.infoCardW || (profile.isMobile ? 206 : 244);
    const cardH = layout.infoCardH || (profile.isMobile ? 68 : 76);
    const cardX = layout.infoCardX || ((layout.left || 14) + cardW / 2);
    const cardY = layout.infoCardY || ((layout.top || 12) + cardH / 2);
    const titleSize = profile.isMobile ? (profile.isPortrait ? 14 : 15) : 18;
    const timeSize = profile.isMobile ? (profile.isPortrait ? 13 : 14) : 15;
    const titleY = cardY - (profile.isMobile ? 18 : 20);
    const timeY = cardY + (profile.isMobile ? 12 : 13);
    const textX = cardX - cardW / 2 + (profile.isMobile ? 18 : 20);
    const textWidth = Math.max(110, cardW - (profile.isMobile ? 34 : 40));

    this.createUiRoundedRect(cardX, cardY + 4, cardW, cardH, 18, 0x4e7ead, 0.16, null, 0, 0, 5000);
    this.createUiRoundedRect(cardX, cardY, cardW, cardH, 18, 0x2f78bd, 0.92, 0xe8f8ff, 0.9, 2, 5001);
    this.createUiRoundedRect(cardX, cardY, cardW - 10, cardH - 10, 14, 0xffffff, 0.06, 0xffffff, 0.16, 1, 5002);
    this.createUiRoundedRect(cardX, cardY - cardH / 2 + 16, cardW - 18, 22, 9, 0xffffff, 0.12, null, 0, 0, 5002);
    this.createUiRoundedRect(cardX - cardW / 2 + 10, cardY, 6, cardH - 18, 3, 0xffd36b, 0.94, null, 0, 0, 5003);

    this.levelLabel = this.add.text(
      textX,
      titleY,
      this.getHudTitleText(),
      this.makeUiTextStyle({
        size: titleSize,
        color: '#ffffff',
        stroke: '#376b9f',
        strokeThickness: 2,
        shadowColor: '#29527e',
        shadowBlur: 3,
        align: 'left'
      })
    ).setOrigin(0, 0.5).setDepth(5004).setScrollFactor(0);
    this.fitTextToBox(this.levelLabel, textWidth, 22, 10);

    this.timeLabel = this.add.text(
      textX,
      timeY,
      this.getHudTimeText(0),
      this.makeUiTextStyle({
        size: timeSize,
        color: '#ffe29c',
        stroke: '#8d6d24',
        strokeThickness: 2,
        shadowColor: '#8d6d24',
        shadowBlur: 2,
        align: 'left'
      })
    ).setOrigin(0, 0.5).setDepth(5004).setScrollFactor(0);
    this.fitTextToBox(this.timeLabel, textWidth, 22, 10);

    this.registerUiHitBox(cardX, cardY, cardW, cardH, 6);
  }
  drawUI() {
    this.resetUiHitBoxes();

    if (this.deviceProfile?.isMobile) {
      return this.drawMobileUI();
    }

    const layout = this.getGameUiLayout();
    this.gameUiLayout = layout;
    this.drawCompactHudCard(layout);
    this.movesLabel = null;
    this.coinLabel = null;
    this.bestLabel = null;
    this.biomeLabel = null;
    this.campaignStarsLabel = null;
    this.nextBiomeLabel = null;
    this.legendLabel = null;
    this.hotkeysLabel = null;
    this.createStyledUiButton(
      layout.pauseX,
      layout.pauseY,
      layout.pauseW,
      layout.pauseH,
      'II',
      () => {
        this.openPauseScene();
      },
      { textSize: 15, theme: 'blue', depth: 5000 }
    );
    this.registerUiHitBox(layout.pauseX, layout.pauseY, layout.pauseW, layout.pauseH, 6);
    this.soundButtonText = null;
    CubePathAudio.applySettings(this, this.audioSettings);

    if (typeof this.freezeUsesLeft === 'number' && typeof this.activateFreezeBoost === 'function') {
      const freezeBg = this.add.rectangle(layout.freezeX, layout.freezeY, layout.boostSize, layout.boostSize, 0x20445a)
        .setStrokeStyle(2, 0x8fe9ff)
        .setInteractive({ useHandCursor: true })
        .setDepth(5000)
        .setScrollFactor(0);

      const freezeIcon = this.add.text(layout.freezeX, layout.freezeY - 1, '❄', {
        fontFamily: 'Trebuchet MS, Arial, sans-serif',
        fontSize: '22px',
        fontStyle: 'bold',
        color: '#dff8ff',
        stroke: '#173449',
        strokeThickness: 2
      }).setOrigin(0.5).setDepth(5001).setScrollFactor(0);

      const freezeCount = this.add.text(layout.freezeX, layout.freezeY + 30, '', {
        fontSize: '11px',
        color: '#8fe9ff',
        align: 'center'
      }).setOrigin(0.5, 0).setDepth(5001).setScrollFactor(0);

      freezeBg.on('pointerdown', () => {
        this.ignoreUiSwipeOnce?.();
        CubePathAudio.playUiClick(this);
        this.activateFreezeBoost();
      });

      this.freezeButtonBg = freezeBg;
      this.freezeButtonIcon = freezeIcon;
      this.freezeCountText = freezeCount;
      this.freezeStatusText = null;

      this.registerUiHitBox(layout.freezeX, layout.freezeY, layout.boostSize, layout.boostSize + 26, 6);
      this.refreshFreezeUi();
    }

    if (typeof this.energyUsesLeft === 'number' && typeof this.activateEnergyBoost === 'function') {
      const energyBg = this.add.rectangle(layout.energyX, layout.energyY, layout.boostSize, layout.boostSize, 0x5a3d16)
        .setStrokeStyle(2, 0xffd36b)
        .setInteractive({ useHandCursor: true })
        .setDepth(5000)
        .setScrollFactor(0);

      const energyIcon = this.add.text(layout.energyX, layout.energyY - 1, '⚡', {
        fontFamily: 'Trebuchet MS, Arial, sans-serif',
        fontSize: '20px',
        fontStyle: 'bold',
        color: '#fff1bf',
        stroke: '#4f3211',
        strokeThickness: 2
      }).setOrigin(0.5).setDepth(5001).setScrollFactor(0);

      const energyCount = this.add.text(layout.energyX, layout.energyY + 30, '', {
        fontSize: '11px',
        color: '#ffd36b',
        align: 'center'
      }).setOrigin(0.5, 0).setDepth(5001).setScrollFactor(0);

      energyBg.on('pointerdown', () => {
        this.ignoreUiSwipeOnce?.();
        CubePathAudio.playUiClick(this);
        this.activateEnergyBoost();
      });

      this.energyButtonBg = energyBg;
      this.energyButtonIcon = energyIcon;
      this.energyCountText = energyCount;
      this.energyStatusText = null;

      this.registerUiHitBox(layout.energyX, layout.energyY, layout.boostSize, layout.boostSize + 26, 6);
      this.refreshEnergyUi();
    }

    return;
    CubePathUI.createButton(this, right - 186, top + 16, 40, 30, '⌂', () => {
      CubePathAudio.stopMusic(this);
      this.scene.start('MenuScene');
    }, { textSize: '18px', depth: 5000 });

    CubePathUI.createButton(this, right - 138, top + 16, 40, 30, '⛶', () => {
      this.toggleFullscreen();
    }, { textSize: '16px', depth: 5000 });

    CubePathUI.createButton(this, right - 90, top + 16, 40, 30, '↺', () => {
      this.resetCurrentLevel();
    }, { textSize: '18px', depth: 5000 });

    CubePathUI.createButton(this, right - 42, top + 16, 40, 30, '♪', () => {
      this.toggleSound();
    }, { textSize: '16px', depth: 5000 });

    const soundButton = CubePathUI.createButton(
      this,
      right - 92,
      top + 54,
      88,
      26,
      this.soundEnabled ? 'Звук' : 'Без зв.',
      () => {
        this.toggleSound();
      },
      { textSize: '11px', depth: 5000 }
    );
    this.soundButtonText = soundButton.text;
    CubePathAudio.applySettings(this, this.audioSettings);

    CubePathUI.createButton(this, right - 146, top + 88, 34, 24, '<', () => {
      this.goToPreviousLevel();
    }, { textSize: '14px', depth: 5000 });

    CubePathUI.createButton(this, right - 98, top + 88, 34, 24, '>', () => {
      this.goToNextLevel();
    }, { textSize: '14px', depth: 5000 });
    if (typeof this.freezeUsesLeft === 'number' && typeof this.activateFreezeBoost === 'function') {
      const freezeBg = this.add.rectangle(right - 92, top + 128, 46, 46, 0x20445a)
        .setStrokeStyle(2, 0x8fe9ff)
        .setInteractive({ useHandCursor: true })
        .setDepth(5000)
        .setScrollFactor(0);

      const freezeIcon = this.add.text(right - 92, top + 126, '❄', {
        fontSize: '26px',
        color: '#dff8ff'
      }).setOrigin(0.5).setDepth(5001).setScrollFactor(0);

      const freezeCount = this.add.text(right - 92, top + 158, '', {
        fontSize: '11px',
        color: '#8fe9ff',
        align: 'center'
      }).setOrigin(0.5, 0).setDepth(5001).setScrollFactor(0);

      freezeBg.on('pointerdown', () => {
        this.ignoreUiSwipeOnce?.();
        CubePathAudio.playUiClick(this);
        this.activateFreezeBoost();
      });

      this.freezeButtonBg = freezeBg;
      this.freezeButtonIcon = freezeIcon;
      this.freezeCountText = freezeCount;

      this.freezeStatusText = this.add.text(
        right - 92,
        top + 176,
        '',
        {
          fontSize: '10px',
          color: '#8fe9ff',
          align: 'center'
        }
      ).setOrigin(0.5, 0).setDepth(5000).setScrollFactor(0);

      this.refreshFreezeUi();
    }

    if (typeof this.energyUsesLeft === 'number' && typeof this.activateEnergyBoost === 'function') {
      const energyBg = this.add.rectangle(right - 92, top + 214, 46, 46, 0x5a3d16)
        .setStrokeStyle(2, 0xffd36b)
        .setInteractive({ useHandCursor: true })
        .setDepth(5000)
        .setScrollFactor(0);

      const energyIcon = this.add.text(right - 92, top + 212, '⚡', {
        fontSize: '24px',
        color: '#fff1bf'
      }).setOrigin(0.5).setDepth(5001).setScrollFactor(0);

      const energyCount = this.add.text(right - 92, top + 244, '', {
        fontSize: '11px',
        color: '#ffd36b',
        align: 'center'
      }).setOrigin(0.5, 0).setDepth(5001).setScrollFactor(0);

      energyBg.on('pointerdown', () => {
        this.ignoreUiSwipeOnce?.();
        CubePathAudio.playUiClick(this);
        this.activateEnergyBoost();
      });

      this.energyButtonBg = energyBg;
      this.energyButtonIcon = energyIcon;
      this.energyCountText = energyCount;

      this.energyStatusText = this.add.text(
        right - 92,
        top + 262,
        '',
        {
          fontSize: '10px',
          color: '#ffd36b',
          align: 'center'
        }
      ).setOrigin(0.5, 0).setDepth(5000).setScrollFactor(0);

      this.refreshEnergyUi();
    }
  }
  drawMobileUI() {
    const layout = this.getGameUiLayout();
    this.gameUiLayout = layout;
    const { profile } = layout;
    this.drawCompactHudCard(layout);
    this.movesLabel = null;
    this.coinLabel = null;
    this.bestLabel = null;
    this.biomeLabel = null;
    this.campaignStarsLabel = null;
    this.nextBiomeLabel = null;
    this.legendLabel = null;
    this.hotkeysLabel = null;

    this.createStyledUiButton(
      layout.pauseX,
      layout.pauseY,
      layout.pauseW,
      layout.pauseH,
      'II',
      () => {
        this.openPauseScene();
      },
      { textSize: profile.isPortrait ? 15 : 14, theme: 'blue', depth: 5000 }
    );
    this.registerUiHitBox(layout.pauseX, layout.pauseY, layout.pauseW, layout.pauseH, 6);
    this.soundButtonText = null;
    CubePathAudio.applySettings(this, this.audioSettings);

    if (typeof this.freezeUsesLeft === 'number' && typeof this.activateFreezeBoost === 'function') {
      const freezeBg = this.add.rectangle(layout.freezeX, layout.boostY, layout.boostSize, layout.boostSize, 0x20445a)
        .setStrokeStyle(2, 0x8fe9ff)
        .setInteractive({ useHandCursor: false })
        .setDepth(5000)
        .setScrollFactor(0);

      const freezeIcon = this.add.text(layout.freezeX, layout.boostY - 1, '❄', {
        fontFamily: 'Trebuchet MS, Arial, sans-serif',
        fontSize: `${profile.isPortrait ? 24 : 20}px`,
        fontStyle: 'bold',
        color: '#dff8ff',
        stroke: '#173449',
        strokeThickness: 2
      }).setOrigin(0.5).setDepth(5001).setScrollFactor(0);

      const freezeCount = this.add.text(layout.freezeX, layout.boostY + layout.boostSize / 2 + 10, '', {
        fontSize: `${layout.metaFont}px`,
        color: '#8fe9ff',
        align: 'center'
      }).setOrigin(0.5, 0).setDepth(5001).setScrollFactor(0);

      freezeBg.on('pointerdown', () => {
        this.ignoreUiSwipeOnce?.();
        CubePathAudio.playUiClick(this);
        this.activateFreezeBoost();
      });

      this.freezeButtonBg = freezeBg;
      this.freezeButtonIcon = freezeIcon;
      this.freezeCountText = freezeCount;
      this.freezeStatusText = null;

      this.registerUiHitBox(layout.freezeX, layout.boostY, layout.boostSize, layout.boostSize + 26, 6);
      this.refreshFreezeUi();
    }

    if (typeof this.energyUsesLeft === 'number' && typeof this.activateEnergyBoost === 'function') {
      const energyBg = this.add.rectangle(layout.energyX, layout.boostY, layout.boostSize, layout.boostSize, 0x5a3d16)
        .setStrokeStyle(2, 0xffd36b)
        .setInteractive({ useHandCursor: false })
        .setDepth(5000)
        .setScrollFactor(0);

      const energyIcon = this.add.text(layout.energyX, layout.boostY - 1, '⚡', {
        fontFamily: 'Trebuchet MS, Arial, sans-serif',
        fontSize: `${profile.isPortrait ? 22 : 18}px`,
        fontStyle: 'bold',
        color: '#fff1bf',
        stroke: '#4f3211',
        strokeThickness: 2
      }).setOrigin(0.5).setDepth(5001).setScrollFactor(0);

      const energyCount = this.add.text(layout.energyX, layout.boostY + layout.boostSize / 2 + 10, '', {
        fontSize: `${layout.metaFont}px`,
        color: '#ffd36b',
        align: 'center'
      }).setOrigin(0.5, 0).setDepth(5001).setScrollFactor(0);

      energyBg.on('pointerdown', () => {
        this.ignoreUiSwipeOnce?.();
        CubePathAudio.playUiClick(this);
        this.activateEnergyBoost();
      });

      this.energyButtonBg = energyBg;
      this.energyButtonIcon = energyIcon;
      this.energyCountText = energyCount;
      this.energyStatusText = null;

      this.registerUiHitBox(layout.energyX, layout.boostY, layout.boostSize, layout.boostSize + 26, 6);
      this.refreshEnergyUi();
    }

    return;

    this.bestLabel = this.add.text(
      layout.leftTextX,
      labelY,
      `Лучшее: ${this.bestTime ? this.bestTime.toFixed(1) + 'с' : '-'} / ${this.bestMoves ?? '-'}`,
      {
        fontSize: `${layout.metaFont}px`,
        color: '#aaaaaa',
        wordWrap: { width: layout.leftBlockWidth }
      }
    ).setDepth(5000).setScrollFactor(0);
    labelY += 16;

    if (this.gameMode === 'campaign') {
      this.biomeLabel = this.add.text(layout.leftTextX, labelY, `Биом: ${this.biomeTheme.name}`, {
        fontSize: `${layout.metaFont}px`,
        color: '#bbbbbb'
      }).setDepth(5000).setScrollFactor(0);
      labelY += 14;

      this.campaignStarsLabel = this.add.text(
        layout.leftTextX,
        labelY,
        `Звезды кампании: ${CubePathStorage.getTotalEarnedStars('campaign')}`,
        {
          fontSize: `${layout.metaFont}px`,
          color: '#ffd54a'
        }
      ).setDepth(5000).setScrollFactor(0);
      labelY += 14;

      this.nextBiomeLabel = this.add.text(
        layout.leftTextX,
        labelY,
        this.getNextBiomeRequirementText(),
        {
          fontSize: `${layout.metaFont}px`,
          color: '#bbbbbb',
          wordWrap: { width: layout.leftBlockWidth }
        }
      ).setDepth(5000).setScrollFactor(0);
      labelY += 18;
    }

    this.registerUiHitBox(
      layout.leftTextX + layout.leftBlockWidth / 2,
      layout.topTextY + (labelY - layout.topTextY) / 2,
      layout.leftBlockWidth,
      labelY - layout.topTextY + 10,
      4
    );

    layout.controlButtons.forEach((button) => {
      CubePathUI.createButton(this, button.x, button.y, layout.iconSize, layout.iconSize, button.label, button.action, {
        textSize: button.textSize,
        depth: 5000,
        radius: 14
      });
      this.registerUiHitBox(button.x, button.y, layout.iconSize, layout.iconSize, 6);
    });

    const soundButton = CubePathUI.createButton(
      this,
      layout.soundButtonX,
      layout.soundButtonY,
      layout.soundButtonW,
      layout.soundButtonH,
      this.soundEnabled ? 'Звук: ВКЛ' : 'Звук: ВЫКЛ',
      () => {
        this.toggleSound();
      },
      { textSize: `${profile.isPortrait ? 12 : 11}px`, depth: 5000 }
    );
    this.soundButtonText = soundButton.text;
    this.registerUiHitBox(layout.soundButtonX, layout.soundButtonY, layout.soundButtonW, layout.soundButtonH, 6);
    CubePathAudio.applySettings(this, this.audioSettings);

    CubePathUI.createButton(this, layout.navLeftX, layout.navY, layout.navW, layout.navH, '<', () => {
      this.goToPreviousLevel();
    }, { textSize: '16px', depth: 5000 });

    CubePathUI.createButton(this, layout.navRightX, layout.navY, layout.navW, layout.navH, '>', () => {
      this.goToNextLevel();
    }, { textSize: '16px', depth: 5000 });

    this.registerUiHitBox(layout.navLeftX, layout.navY, layout.navW, layout.navH, 6);
    this.registerUiHitBox(layout.navRightX, layout.navY, layout.navW, layout.navH, 6);

    const legendText = 'Серый: ломается | Фиолетовый: быстро | Зеленый: прочный | Красный: смерть';
    this.legendLabel = this.add.text(
      layout.legendX,
      layout.legendY,
      legendText,
      {
        fontSize: `${layout.metaFont}px`,
        color: '#bbbbbb',
        align: 'center',
        wordWrap: { width: layout.legendWidth }
      }
    ).setOrigin(0.5, 1).setDepth(5000).setScrollFactor(0);
    this.registerUiHitBox(layout.legendX, layout.legendY - 10, layout.legendWidth, profile.isPortrait ? 42 : 30, 4);

    if (typeof this.freezeUsesLeft === 'number' && typeof this.activateFreezeBoost === 'function') {
      const freezeBg = this.add.rectangle(layout.freezeX, layout.boostY, layout.boostSize, layout.boostSize, 0x20445a)
        .setStrokeStyle(2, 0x8fe9ff)
        .setInteractive({ useHandCursor: false })
        .setDepth(5000)
        .setScrollFactor(0);

      const freezeIcon = this.add.text(layout.freezeX, layout.boostY - 2, '❄', {
        fontSize: `${profile.isPortrait ? 28 : 24}px`,
        color: '#dff8ff'
      }).setOrigin(0.5).setDepth(5001).setScrollFactor(0);

      const freezeCount = this.add.text(layout.freezeX, layout.boostY + layout.boostSize / 2 + 10, '', {
        fontSize: `${layout.metaFont}px`,
        color: '#8fe9ff',
        align: 'center'
      }).setOrigin(0.5, 0).setDepth(5001).setScrollFactor(0);

      freezeBg.on('pointerdown', () => {
        this.ignoreUiSwipeOnce?.();
        CubePathAudio.playUiClick(this);
        this.activateFreezeBoost();
      });

      this.freezeButtonBg = freezeBg;
      this.freezeButtonIcon = freezeIcon;
      this.freezeCountText = freezeCount;
      this.freezeStatusText = this.add.text(
        layout.freezeX,
        layout.boostY - layout.boostSize / 2 - 14,
        '',
        {
          fontSize: `${layout.metaFont}px`,
          color: '#8fe9ff',
          align: 'center'
        }
      ).setOrigin(0.5, 1).setDepth(5000).setScrollFactor(0);

      this.registerUiHitBox(layout.freezeX, layout.boostY, layout.boostSize, layout.boostSize + 26, 6);
      this.refreshFreezeUi();
    }

    if (typeof this.energyUsesLeft === 'number' && typeof this.activateEnergyBoost === 'function') {
      const energyBg = this.add.rectangle(layout.energyX, layout.boostY, layout.boostSize, layout.boostSize, 0x5a3d16)
        .setStrokeStyle(2, 0xffd36b)
        .setInteractive({ useHandCursor: false })
        .setDepth(5000)
        .setScrollFactor(0);

      const energyIcon = this.add.text(layout.energyX, layout.boostY - 2, '⚡', {
        fontSize: `${profile.isPortrait ? 26 : 22}px`,
        color: '#fff1bf'
      }).setOrigin(0.5).setDepth(5001).setScrollFactor(0);

      const energyCount = this.add.text(layout.energyX, layout.boostY + layout.boostSize / 2 + 10, '', {
        fontSize: `${layout.metaFont}px`,
        color: '#ffd36b',
        align: 'center'
      }).setOrigin(0.5, 0).setDepth(5001).setScrollFactor(0);

      energyBg.on('pointerdown', () => {
        this.ignoreUiSwipeOnce?.();
        CubePathAudio.playUiClick(this);
        this.activateEnergyBoost();
      });

      this.energyButtonBg = energyBg;
      this.energyButtonIcon = energyIcon;
      this.energyCountText = energyCount;
      this.energyStatusText = this.add.text(
        layout.energyX,
        layout.boostY - layout.boostSize / 2 - 14,
        '',
        {
          fontSize: `${layout.metaFont}px`,
          color: '#ffd36b',
          align: 'center'
        }
      ).setOrigin(0.5, 1).setDepth(5000).setScrollFactor(0);

      this.registerUiHitBox(layout.energyX, layout.boostY, layout.boostSize, layout.boostSize + 26, 6);
      this.refreshEnergyUi();
    }
  }
  refreshFreezeUi() {
    if (this.freezeButtonBg) {
      if (this.freezeActive) {
        this.freezeButtonBg.setFillStyle(0x2d6f8f, 1);
      } else if (this.freezeUsesLeft > 0) {
        this.freezeButtonBg.setFillStyle(0x20445a, 1);
      } else {
        this.freezeButtonBg.setFillStyle(0x2a2a2a, 1);
      }
    }

    if (this.freezeButtonIcon) {
      this.freezeButtonIcon.setAlpha(this.freezeUsesLeft > 0 || this.freezeActive ? 1 : 0.45);
    }

    if (this.freezeCountText) {
      this.freezeCountText.setText(`x${this.freezeUsesLeft}`);
    }

    if (this.freezeStatusText) {
      this.freezeStatusText.setText('');
    }
  }
  activateFreezeBoost() {
    if (this.isGameOver) return;
    if (this.freezeActive) return;
    if (this.freezeUsesLeft <= 0) return;
    if (!CubePathStorage.consumeBoost('freeze', 1)) return;

    this.freezeUsesLeft = CubePathStorage.getBoostCount('freeze');
    this.freezeActive = true;

    if (this.freezeEndTimer && !this.freezeEndTimer.hasDispatched) {
      this.freezeEndTimer.remove(false);
    }

    CubePathAudio.playTone(this, 520, 0.06, 'sine', 0.035, 900);
    this.refreshFreezeUi();

    this.freezeEndTimer = this.time.delayedCall(2500, () => {
      this.freezeActive = false;
      this.freezeEndTimer = null;
      this.resolvePendingFrozenBreaks();
      this.refreshFreezeUi();
    });
  }
  resolvePendingFrozenBreaks() {
    const pending = [...this.pendingFrozenBreaks];
    this.pendingFrozenBreaks = [];

    for (const item of pending) {
      if (!item) continue;
      const { x, y, cell } = item;

      if (!this.level[y] || this.level[y][x] !== cell) continue;

      const pos = this.toIso(x, y);
      this.spawnTileBreakEffect(pos.x, pos.y);
      CubePathAudio.playBreak(this);

      this.level[y][x] = 0;

      if (this.tiles[y][x]) {
        this.tiles[y][x].destroy();
        this.tiles[y][x] = null;
      }

      if (!this.isGameOver && this.playerGridX === x && this.playerGridY === y) {
        this.loseGame();
        return;
      }
    }
  }
  queueFrozenBreak(x, y, cell) {
    const alreadyQueued = this.pendingFrozenBreaks.some(
      (item) => item && item.x === x && item.y === y
    );

    if (alreadyQueued) return;

    this.pendingFrozenBreaks.push({ x, y, cell });
  }
  toggleFullscreen() {
    if (this.scale.isFullscreen) {
      this.scale.stopFullscreen();
    } else {
      this.scale.startFullscreen();
    }
  }
  toggleSound() {
    const settings = CubePathStorage.getAudioSettings();
    settings.soundEnabled = !settings.soundEnabled;
    this.audioSettings = CubePathAudio.saveSettings(this, settings);

    if (this.soundButtonText) {
      this.soundButtonText.setText(this.soundEnabled ? 'Звук: ВКЛ' : 'Звук: ВЫКЛ');
    }

    if (this.audioSettings.soundEnabled) {
      CubePathAudio.playTone(this, 600, 0.05, 'square', 0.025, 750);
    }
  }

  isPointerOverUI(x, y) {
    if (this.uiHitBoxes?.length) {
      return this.uiHitBoxes.some((box) =>
        x >= box.left && x <= box.right &&
        y >= box.top && y <= box.bottom
      );
    }

    const w = this.scale.width;
    const h = this.scale.height;
    const top = 12;
    const right = w - 14;

    const overRightButtons =
      x >= right - 230 && x <= right &&
      y >= top && y <= top + 235;

    const overLeftHud =
      x >= 0 && x <= 340 &&
      y >= 0 && y <= 160;

    const overBottomLegend =
      x >= 0 && x <= w &&
      y >= h - 40 && y <= h;

    return overRightButtons || overLeftHud || overBottomLegend;
  }
  refreshEnergyUi() {
    if (this.energyButtonBg) {
      if (this.energyActive) {
        this.energyButtonBg.setFillStyle(0x8a5b18, 1);
      } else if (this.energyUsesLeft > 0) {
        this.energyButtonBg.setFillStyle(0x5a3d16, 1);
      } else {
        this.energyButtonBg.setFillStyle(0x2a2a2a, 1);
      }
    }

    if (this.energyButtonIcon) {
      this.energyButtonIcon.setAlpha(this.energyUsesLeft > 0 || this.energyActive ? 1 : 0.45);
    }

    if (this.energyCountText) {
      this.energyCountText.setText(`x${this.energyUsesLeft}`);
    }

    if (this.energyStatusText) {
      this.energyStatusText.setText('');
    }
  }
  activateEnergyBoost() {
    if (this.isGameOver) return;
    if (this.energyActive) return;
    if (this.energyUsesLeft <= 0) return;
    if (!CubePathStorage.consumeBoost('energy', 1)) return;

    this.energyUsesLeft = CubePathStorage.getBoostCount('energy');
    this.energyActive = true;

    if (this.energyEndTimer && !this.energyEndTimer.hasDispatched) {
      this.energyEndTimer.remove(false);
    }

    CubePathAudio.playTone(this, 880, 0.06, 'square', 0.04, 1100);
    this.refreshEnergyUi();

    this.energyEndTimer = this.time.delayedCall(2000, () => {
      this.energyActive = false;
      this.energyEndTimer = null;
      this.refreshEnergyUi();
    });
  }
  breakHazardTile(x, y) {
    const cell = this.level?.[y]?.[x];
    if (![4, 7, 9, 10, 11].includes(cell)) return false;

    CubePathAudio.playBreak(this);

    this.level[y][x] = 1;

    const tile = this.tiles?.[y]?.[x];
    if (tile && tile.setType) {
      tile.setType(1);
      tile.type = 1;
      tile.isBreaking = false;
    }

    this.pendingEnergyTileRebuild = null;

    return true;
  }
  rebuildPendingEnergyTileIfNeeded(x, y) {
    this.pendingEnergyTileRebuild = null;
  }
  drawLevel() {
    for (let y = 0; y < this.level.length; y++) {
      this.tiles[y] = [];
      for (let x = 0; x < this.level[y].length; x++) {
        const cell = this.level[y][x];
        this.tiles[y][x] = null;
        if (cell === 0) continue;
        let tile = null;

        if (this.useSpriteBiomeTiles) {
          tile = this.registerWorldTile(this.createIsoTile(x, y, cell));
        } else {
          const colors = this.getTileColors(cell);
          tile = this.registerWorldTile(
            this.createIsoTile(x, y, cell, colors.top, colors.left, colors.right)
          );
        }

        tile.type = cell;
        tile.isBreaking = false;
        this.tiles[y][x] = tile;
      }
    }
  }

  getTileColors(cell) {
    const theme = this.biomeTheme?.tiles || this.getBiomeTheme().tiles;

    if (cell === 2) return theme.start;
    if (cell === 3) return theme.finish;
    if (cell === 4) return theme.block;
    if (cell === 5) return theme.fragile;
    if (cell === 6) return theme.solid;
    if (cell === 7) return theme.deadly;
    if (cell === 8) return theme.coin;
    if (cell === 9) return { top: 0xbdefff, left: 0x84c7dd, right: 0xe3f9ff };
    if (cell === 10) return theme.quicksand ?? { top: 0xd6ad63, left: 0xa0773d, right: 0xedcf99 };
    if (cell === 11) return theme.hot ?? { top: 0xffa34d, left: 0xc96a1a, right: 0xffc27d };
    if (cell === 12) return theme.switch ?? { top: 0x7cf0ff, left: 0x3f9db0, right: 0xb7fbff };
    if (cell === 13) return theme.gateOn ?? { top: 0x7ef7c4, left: 0x49b187, right: 0xb4ffe0 };
    if (cell === 14) return theme.gateOff ?? { top: 0x55606e, left: 0x39414d, right: 0x7a8797 };
    return theme.normal;
  }
  triggerQuicksandSink(x, y) {
    if (this.isSinking) return;

    this.isSinking = true;
    this.isSliding = false;

    const tile = this.tiles?.[y]?.[x];
    if (tile && !tile.isBreaking) {
      tile.isBreaking = true;
      tile.setBreaking(10);
    }

    this.time.delayedCall(140, () => {
      this.loseGame();
    });
  }
  toggleSwitchTiles() {
    for (let y = 0; y < this.level.length; y++) {
      for (let x = 0; x < this.level[y].length; x++) {
        const cell = this.level[y][x];

        if (cell !== 13 && cell !== 14) continue;

        const nextCell = cell === 13 ? 14 : 13;
        this.level[y][x] = nextCell;
        if (!this.baseLevel) continue;
        this.baseLevel[y][x] = nextCell;
        if (this.tiles[y][x]) {
          this.tiles[y][x].destroy();
          this.tiles[y][x] = null;
        }

        let tile = null;

        if (this.useSpriteBiomeTiles) {
          tile = this.registerWorldTile(this.createIsoTile(x, y, nextCell));
        } else {
          const colors = this.getTileColors(nextCell);
          tile = this.registerWorldTile(
            this.createIsoTile(x, y, nextCell, colors.top, colors.left, colors.right)
          );
        }

        tile.type = nextCell;
        tile.isBreaking = false;
        this.tiles[y][x] = tile;
      }
    }
  }
  clearHotTileTimer() {
    if (this.hotTileTimer && !this.hotTileTimer.hasDispatched) {
      this.hotTileTimer.remove(false);
    }
    this.hotTileTimer = null;
  }

  startHotTileTimer(x, y) {
    this.clearHotTileTimer();

    const tile = this.tiles?.[y]?.[x];
    if (tile && !tile.isBreaking) {
      tile.isBreaking = true;
      tile.setBreaking(11);
    }

    this.hotTileTimer = this.time.delayedCall(700, () => {
      this.hotTileTimer = null;

      if (this.isGameOver) return;
      if (this.playerGridX !== x || this.playerGridY !== y) return;

      this.loseGame();
    });
  }
  getSpriteBiomeConfig(biome) {
    const configs = {
      0: {
        prefix: 'meadow',
        bg: 'meadow-bg'
      },
      1: {
        prefix: 'arctic',
        bg: 'arctic-bg'
      },
      2: {
        prefix: 'desert',
        bg: 'desert-bg'
      },
      3: {
        prefix: 'volcano',
        bg: 'volcano-bg'
      }
    };

    return configs[biome] || null;
  }
  getTileTextureScale(key, fitToWidth = 98) {
    const cacheKey = `${key}:${fitToWidth}`;

    if (this.tileTextureScaleCache[cacheKey] !== undefined) {
      return this.tileTextureScaleCache[cacheKey];
    }

    if (!this.textures.exists(key)) {
      this.tileTextureScaleCache[cacheKey] = 1;
      return 1;
    }

    const texture = this.textures.get(key).getSourceImage();
    const scale = fitToWidth / texture.width;
    this.tileTextureScaleCache[cacheKey] = scale;
    return scale;
  }
  createSpriteBiomeTile(gridX, gridY, cell, biome) {
    const config = this.getSpriteBiomeConfig(biome);
    if (!config) {
      const colors = this.getTileColors(cell);
      return this.createClassicIsoTile(gridX, gridY, cell, colors.top, colors.left, colors.right);
    }

    const pos = this.toIso(gridX, gridY);
    const prefix = config.prefix;

    const getTextureKey = (type, breaking = false) => {
      if (breaking) {
        if (type === 5) return `${prefix}-tile-fragile-fast`;
        return `${prefix}-tile-breaking`;
      }

      switch (type) {
        case 1: return `${prefix}-tile-normal`;
        case 2: return `${prefix}-tile-start`;
        case 3: return `${prefix}-tile-finish`;
        case 4: return `${prefix}-tile-block`;
        case 5: return `${prefix}-tile-fragile-fast`;
        case 6: return `${prefix}-tile-solid`;
        case 7: return `${prefix}-tile-spikes`;
        case 8: return `${prefix}-tile-coin`;
        case 9: return biome === 1 ? `${prefix}-tile-ice` : `${prefix}-tile-normal`;
        case 10: return biome === 2 ? `${prefix}-tile-quicksand` : `${prefix}-tile-normal`;
        case 11: return biome === 3 ? `${prefix}-tile-hot` : `${prefix}-tile-normal`;
        default: return `${prefix}-tile-normal`;
      }
    };

    const isThinTile = (type) => type === 5;
    const isTallTile = (type) => type === 4 || type === 6;
    const isSpecialWideTile = (type) => type === 9 || type === 10;

    const getYOffset = (type) => {
      if (isThinTile(type)) return 7;
      if (isTallTile(type)) return 8;
      if (isSpecialWideTile(type)) return 6;
      return 6;
    };

    const getShadowSize = (type) => {
      if (isThinTile(type)) return { w: 42, h: 12, y: 16 };
      if (isTallTile(type)) return { w: 56, h: 18, y: 20 };
      if (isSpecialWideTile(type)) return { w: 52, h: 16, y: 18 };
      return { w: 50, h: 16, y: 18 };
    };

    const shadowCfg = getShadowSize(cell);

    const shadow = this.add.ellipse(
      pos.x,
      pos.y + shadowCfg.y,
      shadowCfg.w,
      shadowCfg.h,
      0x000000,
      0.16
    ).setDepth(gridX + gridY - 0.25);

    const sprite = this.add.image(
      pos.x,
      pos.y + getYOffset(cell) - 2,
      getTextureKey(cell, false)
    ).setDepth(gridX + gridY);

    const fitToWidth = 98;

    const applyVisual = (type, breaking = false) => {
      const key = getTextureKey(type, breaking);

      if (!this.textures.exists(key)) {
        return;
      }

      sprite.setTexture(key);
      sprite.setScale(this.getTileTextureScale(key, fitToWidth));
      sprite.setPosition(pos.x, pos.y + getYOffset(type) - 2);

      const newShadow = getShadowSize(type);
      shadow.setPosition(pos.x, pos.y + newShadow.y);
      shadow.setSize(newShadow.w, newShadow.h);
    };

    const tile = {
      sprite,
      shadow,
      type: cell,
      isBreaking: false,

      setType: (newCell) => {
        applyVisual(newCell, false);
        tile.type = newCell;
        tile.isBreaking = false;
      },

      setBreaking: (cellType) => {
        applyVisual(cellType, true);
        tile.type = cellType;
        tile.isBreaking = true;

        this.tweens.add({
          targets: sprite,
          scaleX: sprite.scaleX * 0.96,
          scaleY: sprite.scaleY * 0.96,
          duration: 70,
          yoyo: true,
          repeat: 1
        });
      },

      destroy: () => {
        if (shadow) shadow.destroy();
        if (sprite) sprite.destroy();
      }
    };

    applyVisual(cell, false);
    return tile;
  }
  createIsoTile(gridX, gridY, cell, topColor, leftColor, rightColor) {
    const biome = this.getBiomeIndex();

    if (biome === 0 || biome === 1 || biome === 2 || biome === 3) {
      return this.createSpriteBiomeTile(gridX, gridY, cell, biome);
    }

    return this.createClassicIsoTile(gridX, gridY, cell, topColor, leftColor, rightColor);
  }
  drawBiomeBackdrop() {
    const biome = this.getBiomeIndex();
    const config = this.getSpriteBiomeConfig(biome);

    if (this.biomeBackdropNodes) {
      for (const node of this.biomeBackdropNodes) {
        if (node && node.destroy) node.destroy();
      }
    }
    this.biomeBackdropNodes = [];

    if (!config || !this.textures.exists(config.bg)) return;

    const { width, height } = this.scale;

    const bg = this.add.image(width / 2, height / 2, config.bg)
      .setScrollFactor(0)
      .setDepth(-6000);

    const scaleX = width / bg.width;
    const scaleY = height / bg.height;
    bg.setScale(Math.max(scaleX, scaleY));

    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0xffffff, 0.04)
      .setScrollFactor(0)
      .setDepth(-5999);

    this.biomeBackdropNodes.push(bg, overlay);
  }
  createMeadowIsoTile(gridX, gridY, cell) {
    return this.createSpriteBiomeTile(gridX, gridY, cell, 0);
  }
  createClassicIsoTile(gridX, gridY, cell, topColor, leftColor, rightColor) {
    const pos = this.toIso(gridX, gridY);
    const g = this.add.graphics();

    const top = [
      { x: pos.x, y: pos.y - this.tileH / 2 },
      { x: pos.x + this.tileW / 2, y: pos.y },
      { x: pos.x, y: pos.y + this.tileH / 2 },
      { x: pos.x - this.tileW / 2, y: pos.y }
    ];

    const left = [
      { x: pos.x - this.tileW / 2, y: pos.y },
      { x: pos.x, y: pos.y + this.tileH / 2 },
      { x: pos.x, y: pos.y + this.tileH / 2 + this.tileDepth },
      { x: pos.x - this.tileW / 2, y: pos.y + this.tileDepth }
    ];

    const right = [
      { x: pos.x + this.tileW / 2, y: pos.y },
      { x: pos.x, y: pos.y + this.tileH / 2 },
      { x: pos.x, y: pos.y + this.tileH / 2 + this.tileDepth },
      { x: pos.x + this.tileW / 2, y: pos.y + this.tileDepth }
    ];

    const deco = this.add.graphics().setDepth(gridX + gridY + 0.8);

    const drawBase = (topFill, leftFill, rightFill) => {
      g.clear();

      g.fillStyle(leftFill, 1);
      g.beginPath();
      g.moveTo(left[0].x, left[0].y);
      for (let i = 1; i < left.length; i++) g.lineTo(left[i].x, left[i].y);
      g.closePath();
      g.fillPath();

      g.fillStyle(rightFill, 1);
      g.beginPath();
      g.moveTo(right[0].x, right[0].y);
      for (let i = 1; i < right.length; i++) g.lineTo(right[i].x, right[i].y);
      g.closePath();
      g.fillPath();

      g.fillStyle(topFill, 1);
      g.beginPath();
      g.moveTo(top[0].x, top[0].y);
      for (let i = 1; i < top.length; i++) g.lineTo(top[i].x, top[i].y);
      g.closePath();
      g.fillPath();
    };

    const drawDeco = (type) => {
      deco.clear();

      // старт — кружок
      if (type === 2) {
        deco.lineStyle(2, 0xffffff, 0.95);
        deco.strokeCircle(pos.x, pos.y - 4, 8);
        deco.fillStyle(0xffffff, 0.22);
        deco.fillCircle(pos.x, pos.y - 4, 5);
      }
      if (type === 9) {
        deco.lineStyle(2, 0xffffff, 0.85);
        deco.beginPath();
        deco.moveTo(pos.x - 10, pos.y - 3);
        deco.lineTo(pos.x - 2, pos.y - 9);
        deco.lineTo(pos.x + 4, pos.y - 2);
        deco.lineTo(pos.x + 12, pos.y - 8);
        deco.strokePath();

        deco.beginPath();
        deco.moveTo(pos.x - 8, pos.y + 6);
        deco.lineTo(pos.x - 1, pos.y + 1);
        deco.lineTo(pos.x + 8, pos.y + 6);
        deco.strokePath();
      }
      // финиш — маленький флажок
      if (type === 3) {
        deco.lineStyle(2, 0xffffff, 1);
        deco.beginPath();
        deco.moveTo(pos.x - 4, pos.y - 12);
        deco.lineTo(pos.x - 4, pos.y + 4);
        deco.strokePath();

        deco.fillStyle(0xffffff, 0.95);
        deco.beginPath();
        deco.moveTo(pos.x - 4, pos.y - 12);
        deco.lineTo(pos.x + 9, pos.y - 8);
        deco.lineTo(pos.x - 4, pos.y - 4);
        deco.closePath();
        deco.fillPath();
      }
      if (type === 11) {
        deco.fillStyle(0xff6a00, 0.95);
        deco.fillCircle(pos.x - 6, pos.y - 3, 3);
        deco.fillCircle(pos.x + 2, pos.y - 6, 4);
        deco.fillCircle(pos.x + 8, pos.y - 1, 3);

        deco.lineStyle(2, 0xffd27a, 0.9);
        deco.beginPath();
        deco.moveTo(pos.x - 10, pos.y + 3);
        deco.lineTo(pos.x - 4, pos.y - 6);
        deco.lineTo(pos.x + 1, pos.y + 2);
        deco.lineTo(pos.x + 7, pos.y - 7);
        deco.lineTo(pos.x + 12, pos.y + 1);
        deco.strokePath();
      }
      if (type === 12) {
        deco.lineStyle(2, 0xffffff, 0.95);
        deco.strokeCircle(pos.x, pos.y - 4, 9);
        deco.beginPath();
        deco.moveTo(pos.x - 6, pos.y - 4);
        deco.lineTo(pos.x + 6, pos.y - 4);
        deco.moveTo(pos.x, pos.y - 10);
        deco.lineTo(pos.x, pos.y + 2);
        deco.strokePath();
      }

      if (type === 13) {
        deco.lineStyle(2, 0xffffff, 0.9);
        deco.strokeRect(pos.x - 8, pos.y - 10, 16, 12);
        deco.beginPath();
        deco.moveTo(pos.x - 4, pos.y - 4);
        deco.lineTo(pos.x - 1, pos.y - 1);
        deco.lineTo(pos.x + 5, pos.y - 7);
        deco.strokePath();
      }

      if (type === 14) {
        deco.lineStyle(2, 0xff8080, 0.9);
        deco.strokeRect(pos.x - 8, pos.y - 10, 16, 12);
        deco.beginPath();
        deco.moveTo(pos.x - 5, pos.y - 7);
        deco.lineTo(pos.x + 5, pos.y + 1);
        deco.moveTo(pos.x + 5, pos.y - 7);
        deco.lineTo(pos.x - 5, pos.y + 1);
        deco.strokePath();
      }
      if (type === 10) {
        deco.lineStyle(2, 0x7a5626, 0.9);

        deco.strokeEllipse(pos.x, pos.y - 3, 22, 10);
        deco.strokeEllipse(pos.x, pos.y - 3, 14, 6);

        deco.beginPath();
        deco.moveTo(pos.x - 8, pos.y + 1);
        deco.lineTo(pos.x - 2, pos.y - 1);
        deco.lineTo(pos.x + 3, pos.y + 2);
        deco.lineTo(pos.x + 9, pos.y - 2);
        deco.strokePath();

        deco.fillStyle(0x8a612d, 0.35);
        deco.fillEllipse(pos.x, pos.y - 3, 12, 5);
      }
      // блок — камни/трава
      if (type === 4) {
        deco.fillStyle(0x5b5b5b, 1);
        deco.fillEllipse(pos.x - 8, pos.y - 4, 10, 7);
        deco.fillEllipse(pos.x + 2, pos.y - 7, 12, 8);
        deco.fillEllipse(pos.x + 10, pos.y - 1, 9, 6);

        deco.fillStyle(0x3f7d3a, 1);
        deco.fillTriangle(pos.x - 14, pos.y + 2, pos.x - 10, pos.y - 6, pos.x - 6, pos.y + 2);
        deco.fillTriangle(pos.x + 6, pos.y + 5, pos.x + 10, pos.y - 4, pos.x + 14, pos.y + 5);
      }

      // хрупкая — трещины
      if (type === 5) {
        deco.lineStyle(2, 0x6e4aa8, 0.95);
        deco.beginPath();
        deco.moveTo(pos.x - 10, pos.y - 6);
        deco.lineTo(pos.x - 2, pos.y - 1);
        deco.lineTo(pos.x - 6, pos.y + 6);
        deco.moveTo(pos.x - 1, pos.y - 8);
        deco.lineTo(pos.x + 4, pos.y - 1);
        deco.lineTo(pos.x + 10, pos.y + 4);
        deco.strokePath();
      }

      // прочная — щит
      if (type === 6) {
        deco.lineStyle(2, 0xffffff, 0.95);
        deco.beginPath();
        deco.moveTo(pos.x, pos.y - 12);
        deco.lineTo(pos.x + 9, pos.y - 6);
        deco.lineTo(pos.x + 6, pos.y + 6);
        deco.lineTo(pos.x, pos.y + 10);
        deco.lineTo(pos.x - 6, pos.y + 6);
        deco.lineTo(pos.x - 9, pos.y - 6);
        deco.closePath();
        deco.strokePath();
      }

      // смертельная — шипы
      if (type === 7) {
        deco.fillStyle(0x7a1010, 1);
        const baseY = pos.y + 4;
        for (let i = -12; i <= 8; i += 8) {
          deco.fillTriangle(
            pos.x + i, baseY,
            pos.x + i + 4, baseY - 12,
            pos.x + i + 8, baseY
          );
        }
      }

      // монета
      if (type === 8) {
        deco.fillStyle(0xfff176, 1);
        deco.fillCircle(pos.x, pos.y - 6, 8);
        deco.fillStyle(0xffca28, 1);
        deco.fillCircle(pos.x, pos.y - 6, 4);
        deco.lineStyle(1, 0xffffff, 0.8);
        deco.strokeCircle(pos.x, pos.y - 6, 8);
      }
    };

    drawBase(topColor, leftColor, rightColor);
    drawDeco(cell);

    g.setDepth(gridX + gridY);

    return {
      graphics: g,
      deco,
      isBreaking: false,
      type: cell,

      setType: (newCell) => {
        const colors = this.getTileColors(newCell);
        drawBase(colors.top, colors.left, colors.right);
        drawDeco(newCell);
        g.setDepth(gridX + gridY);
        deco.setDepth(gridX + gridY + 0.8);
        this.type = newCell;
        this.isBreaking = false;
      },

      setBreaking: (cellType) => {
        if (cellType === 5) {
          drawBase(0xffb7ff, 0xb05cc4, 0xe0a5ef);
        } else if (cellType === 10) {
          drawBase(0xb98a45, 0x845f2c, 0xd8b16f);
        } else if (cellType === 11) {
          drawBase(0xff8a2a, 0xb95710, 0xffb15e);
        } else {
          drawBase(0xd4ac0d, 0xb7950b, 0xf4d03f);
        }

        drawDeco(cellType);
        this.isBreaking = true;
      },

      destroy: () => {
        deco.destroy();
        g.destroy();
      }
    };
  }
  findStartPosition() {
    for (let y = 0; y < this.level.length; y++) {
      for (let x = 0; x < this.level[y].length; x++) {
        if (this.level[y][x] === 2) {
          this.playerGridX = x;
          this.playerGridY = y;
          this.startGridX = x;
          this.startGridY = y;
          return;
        }
      }
    }
  }

  createPlayer() {
    const pos = this.toIso(this.playerGridX, this.playerGridY);

    this.player = this.add.graphics();
    this.playerVisualX = pos.x;
    this.playerVisualY = pos.y - 14;
    this.drawCube(this.player, this.playerVisualX, this.playerVisualY, 20, 20, 14);
    this.player.setDepth(1000);

    this.cameraTarget = this.add.zone(this.playerVisualX, this.playerVisualY + 30, 1, 1);
    this.cameraTarget.setDepth(9999);
  }

  drawCube(graphics, x, y, w, h, depth) {
    graphics.clear();

    const skinId = CubePathStorage.getEquippedSkin?.() || 'classic';
    const hatId = CubePathStorage.getEquippedHat?.() || 'none';

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
  tryMove(dx, dy) {
    if (this.isSinking) return;
    const newX = this.playerGridX + dx;
    const newY = this.playerGridY + dy;

    if (!this.isInsideLevel(newX, newY)) return this.loseGame();

    const targetCell = this.level[newY][newX];

    if (targetCell === 0) return this.loseGame();
    if (targetCell === 14) return;

    if (this.energyActive && [4, 7, 9, 10, 11].includes(targetCell)) {
      this.breakHazardTile(newX, newY);
      return this.movePlayerTo(newX, newY, false, dx, dy);
    }

    if (targetCell === 4) return;
    if (targetCell === 7) return this.movePlayerTo(newX, newY, true, dx, dy);
    this.movePlayerTo(newX, newY, false, dx, dy);
  }

  movePlayerTo(newX, newY, deadly = false, forcedDx = null, forcedDy = null) {
    const fromX = this.playerGridX;
    const fromY = this.playerGridY;

    if (this.level?.[fromY]?.[fromX] === 11 && !this.energyActive) {
      this.clearHotTileTimer();
    }

    this.isMoving = true;
    this.movesCount++;
    if (this.movesLabel) this.movesLabel.setText(`Ходы: ${this.movesCount}`);
    this.moveCooldown = 70;

    this.lastMoveDx = forcedDx ?? (newX - fromX);
    this.lastMoveDy = forcedDy ?? (newY - fromY);
    this.playerGridX = newX;
    this.playerGridY = newY;

    const from = this.toIso(fromX, fromY);
    const target = this.toIso(newX, newY);

    this.tweens.addCounter({
      from: 0,
      to: 1,
      duration: 95,
      onUpdate: (tween) => {
        const v = tween.getValue();
        const x = Phaser.Math.Linear(from.x, target.x, v);
        const baseY = Phaser.Math.Linear(from.y - 14, target.y - 14, v);
        const arcY = Math.sin(v * Math.PI) * 8;
        this.playerVisualX = x;
        this.playerVisualY = baseY - arcY;
        this.drawCube(this.player, this.playerVisualX, this.playerVisualY, 20, 20, 14);
        this.updateCameraTarget();
      },
      onComplete: () => {
        this.isMoving = false;
        this.playerVisualX = target.x;
        this.playerVisualY = target.y - 14;
        this.drawCube(this.player, this.playerVisualX, this.playerVisualY, 20, 20, 14);
        this.updateCameraTarget(true);
        CubePathAudio.playStep(this);
        if (deadly) return this.loseGame();

        this.rebuildPendingEnergyTileIfNeeded(newX, newY);
        this.collectCoinAt(newX, newY);

        const currentCellAfterCoin = this.level[newY][newX];
        if (this.isSafeCheckpointCell(currentCellAfterCoin)) {
          this.lastSafeGridX = newX;
          this.lastSafeGridY = newY;
        }

        if (!deadly && this.level[newY][newX] === 12) {
          this.toggleSwitchTiles();
          CubePathAudio.playTone(this, 720, 0.05, 'square', 0.03, 900);
        } else {
          this.activateTile(newX, newY);
        }

        if (!deadly && this.level[newY][newX] === 10 && !this.energyActive) {
          this.triggerQuicksandSink(newX, newY);
          return;
        }

        this.checkWin();

        if (!deadly && this.level[newY][newX] === 11 && !this.energyActive) {
          this.startHotTileTimer(newX, newY);
        }

        if (!deadly && this.level[newY][newX] === 9) {
          this.isSliding = true;
          this.time.delayedCall(60, () => {
            this.tryContinueIceSlide(this.lastMoveDx, this.lastMoveDy);
          });
        } else {
          this.isSliding = false;
        }
      }
    });
  }
  restoreLevelStateForSecondChance() {
    this.freezeActive = false;
    this.pendingFrozenBreaks = [];
    if (this.freezeEndTimer && !this.freezeEndTimer.hasDispatched) {
      this.freezeEndTimer.remove(false);
    }
    this.energyActive = false;
    if (this.energyEndTimer && !this.energyEndTimer.hasDispatched) {
      this.energyEndTimer.remove(false);
    }
    this.energyEndTimer = null;
    this.pendingEnergyTileRebuild = null;
    this.freezeEndTimer = null;
    this.clearBreakTimers();
    this.clearHotTileTimer();
    this.clearSecondChanceMenu();
    this.level = this.baseLevel.map((row) => [...row]);

    for (const key of this.collectedCoinPositions) {
      const [x, y] = key.split(',').map(Number);
      if (this.level[y] && this.level[y][x] === 8) {
        this.level[y][x] = 1;
      }
    }

    for (let y = 0; y < this.tiles.length; y++) {
      for (let x = 0; x < this.tiles[y].length; x++) {
        if (this.tiles[y][x]) {
          this.tiles[y][x].destroy();
          this.tiles[y][x] = null;
        }
      }
    }

    this.drawLevel();

    this.playerGridX = this.lastSafeGridX ?? this.startGridX;
    this.playerGridY = this.lastSafeGridY ?? this.startGridY;

    const pos = this.toIso(this.playerGridX, this.playerGridY);
    this.playerVisualX = pos.x;
    this.playerVisualY = pos.y - 14;

    if (this.player) {
      this.player.alpha = 1;
      this.player.scaleX = 1;
      this.player.scaleY = 1;
      this.drawCube(this.player, this.playerVisualX, this.playerVisualY, 20, 20, 14);
    }

    this.isGameOver = false;
    this.isMoving = false;
    this.isSliding = false;
    this.isSinking = false;
    this.moveCooldown = 0;

    this.updateCameraTarget(true);

    if (this.coinLabel) {
      this.coinLabel.setText(`Монеты: ${this.coinsCollected}/${this.coinsTotal}`);
    }
    if (this.movesLabel) {
      this.movesLabel.setText(`Ходы: ${this.movesCount}`);
    }
    this.refreshFreezeUi();
    this.refreshEnergyUi();
    this.fixHudToCamera();
  }
  computeStarResult() {
    const shortestMoves = this.computeShortestPathMoves();
    const parMoves = shortestMoves + Math.max(1, Math.floor(shortestMoves * 0.10));
    const parTime = parMoves * 0.62;

    const timeSeconds = (this.time.now - this.levelStartTime) / 1000;

    const clearStar = 1;
    const timeStar = timeSeconds <= parTime ? 1 : 0;
    const coinStar = this.coinsCollected >= this.coinsTotal && this.coinsTotal > 0 ? 1 : 0;

    return {
      stars: clearStar + timeStar + coinStar,
      timeSeconds,
      parMoves,
      parTime,
      shortestMoves
    };
  }
  computeShortestPathMoves() {
    const start = { x: this.startGridX, y: this.startGridY };
    let finish = null;

    for (let y = 0; y < this.level.length; y++) {
      for (let x = 0; x < this.level[y].length; x++) {
        if (this.baseLevel[y][x] === 3) {
          finish = { x, y };
        }
      }
    }

    if (!finish) return 999;

    const queue = [{ ...start, d: 0 }];
    let queueIndex = 0;
    const visited = new Set([`${start.x},${start.y}`]);
    const dirs = [
      { x: 1, y: 0 }, { x: -1, y: 0 },
      { x: 0, y: 1 }, { x: 0, y: -1 }
    ];

    while (queueIndex < queue.length) {
      const cur = queue[queueIndex++];
      if (cur.x === finish.x && cur.y === finish.y) return cur.d;

      for (const dir of dirs) {
        const nx = cur.x + dir.x;
        const ny = cur.y + dir.y;

        if (!this.isInsideLevel(nx, ny)) continue;
        const cell = this.baseLevel[ny][nx];
        if ([0, 4, 7, 14].includes(cell)) continue;

        const key = `${nx},${ny}`;
        if (visited.has(key)) continue;

        visited.add(key);
        queue.push({ x: nx, y: ny, d: cur.d + 1 });
      }
    }

    return 999;
  }
  activateTile(x, y) {
    const cell = this.level[y][x];
    if ([0, 2, 3, 4, 6, 7, 9, 10, 11, 12, 13, 14].includes(cell)) return;

    const tile = this.tiles[y][x];
    if (!tile || tile.isBreaking) return;

    tile.isBreaking = true;
    tile.setBreaking(cell);

    const breakDelay = cell === 5 ? 600 : 1200;

    const timer = this.time.delayedCall(breakDelay, () => {
      if (this.level[y][x] !== cell) return;

      if (this.freezeActive) {
        this.queueFrozenBreak(x, y, cell);
        return;
      }

      const pos = this.toIso(x, y);
      this.spawnTileBreakEffect(pos.x, pos.y);
      CubePathAudio.playBreak(this);

      this.level[y][x] = 0;

      if (this.tiles[y][x]) {
        this.tiles[y][x].destroy();
        this.tiles[y][x] = null;
      }

      if (!this.isGameOver && this.playerGridX === x && this.playerGridY === y) {
        this.loseGame();
      }
    });

    this.breakTimers.push(timer);
  }

  spawnTileBreakEffect(x, y) {
    const colors = [0xd4ac0d, 0xf4d03f, 0xb7950b, 0xffffff];
    const pieceCount = this.deviceProfile?.isMobile ? 4 : 6;

    for (let i = 0; i < pieceCount; i++) {
      const piece = this.registerWorldObject(
        this.add.circle(
          x + Phaser.Math.Between(-4, 4),
          y + Phaser.Math.Between(-3, 3),
          Phaser.Math.Between(2, 3),
          Phaser.Utils.Array.GetRandom(colors)
        ).setDepth(3000)
      );

      const dx = Phaser.Math.Between(-18, 18);
      const dy = Phaser.Math.Between(-14, 8);

      this.tweens.add({
        targets: piece,
        x: piece.x + dx,
        y: piece.y + dy,
        alpha: 0,
        scale: 0.6,
        duration: 180,
        onComplete: () => piece.destroy()
      });
    }
  }
  showGameCompleteScreen() {
    this.clearBreakTimers();
    this.clearResultMenu();
    this.activeOverlayKind = 'gameComplete';
    const profile = this.deviceProfile || window.CubePathDevice?.getProfile?.(this) || { isMobile: false, isPortrait: false };
    const isMobileOverlay = !!profile.isMobile;

    this.resetCameraFilters();
    this.children.removeAll(true);

    const totalLevels = CubePathStorage.getTotalLevels(this.gameMode);
    let totalBestTime = 0;
    let totalBestMoves = 0;
    let completedCount = 0;

    for (let i = 0; i < totalLevels; i++) {
      const bestTime = CubePathStorage.getBestTime(this.gameMode, i);
      const bestMoves = CubePathStorage.getBestMoves(this.gameMode, i);
      if (bestTime !== null && bestMoves !== null) {
        totalBestTime += bestTime;
        totalBestMoves += bestMoves;
        completedCount++;
      }
    }

    const panel = this.createStyledOverlayPanel({
      width: isMobileOverlay
        ? (profile.isPortrait ? Math.min(this.scale.width - 28, 360) : Math.min(this.scale.width - 48, 500))
        : 580,
      height: isMobileOverlay
        ? (profile.isPortrait ? 388 : 332)
        : 340,
      title: this.gameMode === 'tutorial' ? 'Обучение пройдено!' : 'Кампания пройдена!',
      titleColor: '#ffffff',
      titleStroke: '#6dbb80'
    });

    const { cx, cy } = panel;

    const statsText = completedCount > 0
      ? `Сумма лучших результатов:\n${totalBestTime.toFixed(1)}с / ${totalBestMoves} ходов`
      : 'Лучшие результаты пока не найдены';

    const stats = this.add.text(
      cx,
      cy - (isMobileOverlay ? 10 : 4),
      statsText,
      this.makeUiTextStyle({
        size: isMobileOverlay ? (profile.isPortrait ? 17 : 18) : 20,
        color: '#5f7891',
        stroke: '#ffffff',
        strokeThickness: 1
      })
    ).setOrigin(0.5).setScrollFactor(0).setDepth(12005);
    if (isMobileOverlay) {
      bestText.setWordWrapWidth(Math.min(panel.panelWidth - 46, this.scale.width - 58), true);
    }
    stats.setWordWrapWidth(Math.min(panel.panelWidth - 46, this.scale.width - 58), true);

    const replayBtn = this.createStyledUiButton(cx, cy + (isMobileOverlay ? 88 : 92), isMobileOverlay ? 220 : 230, isMobileOverlay ? 40 : 42, 'Играть заново', () => {
      this.currentLevelIndex = 0;
      if (this.gameMode === 'tutorial') {
        this.unlockedLevelIndex = 0;
      }
      this.saveProgress();
      this.loadLevel(0);
    }, { textSize: isMobileOverlay ? 13 : 16, theme: 'green' });

    const menuBtn = this.createStyledUiButton(cx, cy + (isMobileOverlay ? 140 : 148), isMobileOverlay ? 176 : 190, isMobileOverlay ? 38 : 42, 'В меню', () => {
      CubePathAudio.stopMusic(this);
      this.scene.start('MenuScene');
    }, { textSize: isMobileOverlay ? 13 : 16, theme: 'blue' });

    this.fixHudToCamera();
  }
  checkWin() {
    if (this.level[this.playerGridY][this.playerGridX] !== 3) return;

    this.isGameOver = true;
    CubePathAds.gameplayStop?.();

    const result = this.computeStarResult();

    CubePathStorage.saveBestResult(this.gameMode, this.currentLevelIndex, result.timeSeconds, this.movesCount);

    this.flash(0x66ffcc, 0.22, 180);
    CubePathAudio.playWin(this);

    if (this.gameMode === 'survival') {
      const nextStage = this.currentLevelIndex + 1;
      if (nextStage > this.survivalBest) {
        this.survivalBest = nextStage;
        CubePathStorage.setSurvivalBest(this.survivalBest);
      }

      this.time.delayedCall(900, () => {
        this.currentLevelIndex++;
        this.currentCampaignLayout = null;
        this.currentCampaignSeed = null;
        this.loadLevel(this.currentLevelIndex);
      });
      return;
    }

    this.showLevelCompleteScreen(result);
  }
  showLevelCompleteScreen(result, options = {}) {
    this.clearResultMenu();
    this.activeOverlayKind = 'levelComplete';
    this.lastLevelCompleteResult = { ...result };
    const components = this.buildStarComponents(result);
    const profile = this.deviceProfile || window.CubePathDevice?.getProfile?.(this) || { isMobile: false, isPortrait: false };
    const isMobileResult = !!profile.isMobile;
    const skipRewards = options.skipRewards === true;
    let gainedCubeCoins = Number.isFinite(options.gainedCubeCoinsOverride) ? options.gainedCubeCoinsOverride : 0;

    if (!skipRewards) {
      const rewardResult = CubePathStorage.awardCubeCoinsForNewStars(
        this.gameMode,
        this.currentLevelIndex,
        components
      );

      gainedCubeCoins = rewardResult.gainedCubeCoins;
    }

    this.lastLevelCompleteCubeCoins = gainedCubeCoins;

    const panel = this.createStyledOverlayPanel({
      width: isMobileResult
        ? (profile.isPortrait ? Math.min(this.scale.width - 24, 360) : Math.min(this.scale.width - 48, 520))
        : 610,
      height: isMobileResult
        ? (profile.isPortrait ? 486 : 388)
        : (this.gameMode === 'campaign' ? 540 : 485),
      title: 'Уровень пройден!',
      titleColor: '#ffffff',
      titleStroke: '#6fa6d1'
    });

    const { cx, cy } = panel;

    if (isMobileResult) {
      const top = cy - panel.panelHeight / 2;
      const bottom = cy + panel.panelHeight / 2;
      const firstRowYAdaptive = bottom - (profile.isPortrait ? 112 : 98);
      const menuRowYAdaptive = bottom - (profile.isPortrait ? 70 : 58);
      const adRowYAdaptive = bottom - (profile.isPortrait ? 28 : 18);
      const metricXAdaptive = cx - (profile.isPortrait ? 80 : 86);

      panel.titleText.setY(top + (profile.isPortrait ? 42 : 38));

      const starNodesAdaptive = this.createStarRow(cx, top + (profile.isPortrait ? 96 : 86), result.stars);
      const dividerAdaptive = this.add.rectangle(
        cx,
        top + (profile.isPortrait ? 144 : 128),
        Math.min(280, this.scale.width - 56),
        2,
        0xffffff,
        0.18
      ).setScrollFactor(0).setDepth(12004);

      const timeNodesAdaptive = this.createMetricRow(
        metricXAdaptive,
        top + (profile.isPortrait ? 174 : 158),
        '\u231B',
        `${result.timeSeconds.toFixed(1)}с / ${result.parTime.toFixed(1)}с`,
        'blue'
      );

      const coinNodesAdaptive = this.createMetricRow(
        metricXAdaptive,
        top + (profile.isPortrait ? 206 : 192),
        'STAR_HALF',
        `${this.coinsCollected}/${this.coinsTotal}`,
        'gold'
      );

      const rewardY = top + (profile.isPortrait ? 238 : 220);
      const rewardCubeAdaptive = this.createRewardCubeIcon(
        cx - (profile.isPortrait ? 78 : 54),
        rewardY,
        profile.isPortrait ? 0.72 : 0.78
      );
      const rewardTextAdaptive = this.add.text(
        cx - (profile.isPortrait ? 26 : 2),
        rewardY + 6,
        `+${gainedCubeCoins}`,
        this.makeUiTextStyle({
          size: profile.isPortrait ? 20 : 23,
          color: '#ffd54a',
          stroke: '#c98b11',
          strokeThickness: 2,
          shadowColor: '#fff0c8',
          shadowBlur: 4
        })
      ).setOrigin(0, 0.5).setScrollFactor(0).setDepth(12007);
      this.fitTextToBox(rewardTextAdaptive, panel.panelWidth - 120, 28, 12);

      const restartBtnAdaptive = this.createStyledUiButton(cx - (profile.isPortrait ? 66 : 70), firstRowYAdaptive, profile.isPortrait ? 116 : 128, profile.isPortrait ? 38 : 40, 'Рестарт', () => {
        this.clearResultMenu();
        this.resetCurrentLevel();
      }, { textSize: profile.isPortrait ? 11 : 12, theme: 'blue' });

      const nextBtnAdaptive = this.createStyledUiButton(cx + (profile.isPortrait ? 66 : 70), firstRowYAdaptive, profile.isPortrait ? 116 : 128, profile.isPortrait ? 38 : 40, 'Далее', () => {
        this.clearResultMenu();
        this.advanceAfterWin();
      }, { textSize: profile.isPortrait ? 11 : 12, theme: 'green' });

      const menuBtnAdaptive = this.createStyledUiButton(cx, menuRowYAdaptive, profile.isPortrait ? 184 : 202, profile.isPortrait ? 34 : 36, 'Меню', () => {
        this.clearResultMenu();
        CubePathAudio.stopMusic(this);
        this.scene.start('MenuScene');
      }, { textSize: profile.isPortrait ? 11 : 12, theme: 'gray' });

      const adBtnAdaptive = this.createStyledUiButton(
        cx,
        adRowYAdaptive,
        Math.min(panel.panelWidth - 36, profile.isPortrait ? 276 : 290),
        profile.isPortrait ? 40 : 38,
        'Смотреть рекламу за\nслучайный буст',
        () => {
          this.showRewardedRandomBoost();
        },
        { textSize: profile.isPortrait ? 10 : 11, theme: 'orange' }
      );

      this.resultUi = [
        panel.overlay,
        panel.shadow,
        panel.panel,
        panel.inner,
        panel.gloss,
        panel.titleText,
        ...starNodesAdaptive,
        dividerAdaptive,
        ...timeNodesAdaptive,
        ...coinNodesAdaptive,
        rewardCubeAdaptive,
        rewardTextAdaptive,
        ...restartBtnAdaptive,
        ...nextBtnAdaptive,
        ...menuBtnAdaptive,
        ...adBtnAdaptive
      ];

      this.fixHudToCamera();
      return;

      const firstRowY = cy + (profile.isPortrait ? 118 : 132);
      const menuRowY = cy + (profile.isPortrait ? 158 : 176);
      const adRowY = cy + (profile.isPortrait ? 196 : 218);
      const metricX = cx - (profile.isPortrait ? 82 : 86);

      panel.titleText.setY(cy - (profile.isPortrait ? 128 : 104));

      const starNodes = this.createStarRow(cx, cy - (profile.isPortrait ? 68 : 52), result.stars);
      const divider = this.add.rectangle(
        cx,
        cy - (profile.isPortrait ? 16 : 8),
        Math.min(280, this.scale.width - 56),
        2,
        0xffffff,
        0.18
      ).setScrollFactor(0).setDepth(12004);

      const timeNodes = this.createMetricRow(
        metricX,
        cy + (profile.isPortrait ? 8 : 10),
        '\u231B',
        `${result.timeSeconds.toFixed(1)}\u0441 / ${result.parTime.toFixed(1)}\u0441`,
        'blue'
      );

      const coinNodes = this.createMetricRow(
        metricX,
        cy + (profile.isPortrait ? 40 : 46),
        'STAR_HALF',
        `${this.coinsCollected}/${this.coinsTotal}`,
        'gold'
      );

      const rewardCube = this.createRewardCubeIcon(
        cx - (profile.isPortrait ? 84 : 54),
        cy + (profile.isPortrait ? 58 : 80),
        profile.isPortrait ? 0.76 : 0.8
      );
      const rewardText = this.add.text(
        cx - (profile.isPortrait ? 28 : 2),
        cy + (profile.isPortrait ? 64 : 86),
        `+${gainedCubeCoins}`,
        this.makeUiTextStyle({
          size: profile.isPortrait ? 22 : 25,
          color: '#ffd54a',
          stroke: '#c98b11',
          strokeThickness: 2,
          shadowColor: '#fff0c8',
          shadowBlur: 4
        })
      ).setOrigin(0, 0.5).setScrollFactor(0).setDepth(12007);

      const restartBtn = this.createStyledUiButton(cx - (profile.isPortrait ? 68 : 72), firstRowY, profile.isPortrait ? 120 : 132, profile.isPortrait ? 38 : 40, '\u0420\u0435\u0441\u0442\u0430\u0440\u0442', () => {
        this.clearResultMenu();
        this.resetCurrentLevel();
      }, { textSize: profile.isPortrait ? 12 : 13, theme: 'blue' });

      const nextBtn = this.createStyledUiButton(cx + (profile.isPortrait ? 68 : 72), firstRowY, profile.isPortrait ? 120 : 132, profile.isPortrait ? 38 : 40, '\u0414\u0430\u043b\u0435\u0435', () => {
        this.clearResultMenu();
        this.advanceAfterWin();
      }, { textSize: profile.isPortrait ? 12 : 13, theme: 'green' });

      const menuBtn = this.createStyledUiButton(cx, menuRowY, profile.isPortrait ? 196 : 214, profile.isPortrait ? 36 : 38, '\u041c\u0435\u043d\u044e', () => {
        this.clearResultMenu();
        CubePathAudio.stopMusic(this);
        this.scene.start('MenuScene');
      }, { textSize: profile.isPortrait ? 12 : 13, theme: 'gray' });

      const adBtn = this.createStyledUiButton(
        cx,
        adRowY,
        Math.min(this.scale.width - (profile.isPortrait ? 60 : 54), profile.isPortrait ? 286 : 296),
        profile.isPortrait ? 42 : 40,
        'Смотреть рекламу за\nслучайный буст',
        () => {
          this.showRewardedRandomBoost();
        },
        { textSize: profile.isPortrait ? 10 : 11, theme: 'orange' }
      );

      this.resultUi = [
        panel.overlay,
        panel.shadow,
        panel.panel,
        panel.inner,
        panel.gloss,
        panel.titleText,
        ...starNodes,
        divider,
        ...timeNodes,
        ...coinNodes,
        rewardCube,
        rewardText,
        ...restartBtn,
        ...nextBtn,
        ...menuBtn,
        ...adBtn
      ];

      this.fixHudToCamera();
      return;
    }

    const progressNodes = this.gameMode === 'campaign'
      ? this.createTopStarProgressBar(cx, cy - 212, 410)
      : [];

    panel.titleText.setY(cy - 154);

    const starNodes = this.createStarRow(cx, cy - 74, result.stars);

    const divider1 = this.add.rectangle(cx, cy - 6, 380, 2, 0xffffff, 0.18)
      .setScrollFactor(0).setDepth(12004);

    const divider2 = this.add.rectangle(cx, cy + 58, 380, 2, 0xffffff, 0.18)
      .setScrollFactor(0).setDepth(12004);

    const timeNodes = this.createMetricRow(
      cx - 124,
      cy + 24,
      '⌛',
      `${result.timeSeconds.toFixed(1)}с / ${result.parTime.toFixed(1)}с`,
      'blue'
    );

    const coinNodes = this.createMetricRow(
      cx + 106,
      cy + 24,
      'STAR_HALF',
      `${this.coinsCollected}/${this.coinsTotal}`,
      'gold'
    );

    const rewardCube = this.createRewardCubeIcon(cx - 30, cy + 98, 0.92);
    const rewardText = this.add.text(
      cx + 46,
      cy + 106,
      `+${gainedCubeCoins}`,
      this.makeUiTextStyle({
        size: 33,
        color: '#ffd54a',
        stroke: '#c98b11',
        strokeThickness: 2,
        shadowColor: '#fff0c8',
        shadowBlur: 4
      })
    ).setOrigin(0, 0.5).setScrollFactor(0).setDepth(12007);

    const menuBtn = this.createStyledUiButton(cx - 160, cy + 178, 140, 42, 'Меню', () => {
      CubePathAudio.stopMusic(this);
      this.scene.start('MenuScene');
    }, { textSize: 14, theme: 'gray' });

    const restartBtn = this.createStyledUiButton(cx, cy + 178, 170, 42, 'Рестарт', () => {
      this.resetCurrentLevel();
    }, { textSize: 14, theme: 'blue' });

    const nextBtn = this.createStyledUiButton(cx + 160, cy + 178, 140, 42, 'Далее', () => {
      this.advanceAfterWin();
    }, { textSize: 14, theme: 'green' });

    const adBtn = this.createStyledUiButton(cx, cy + 228, 340, 42, 'Смотреть рекламу за случайный буст', () => {
      this.showRewardedRandomBoost();
    }, { textSize: 13, theme: 'orange' });

    this.resultUi = [
      panel.overlay,
      panel.shadow,
      panel.panel,
      panel.inner,
      panel.gloss,
      panel.titleText,
      ...progressNodes,
      ...starNodes,
      divider1,
      divider2,
      ...timeNodes,
      ...coinNodes,
      rewardCube,
      rewardText,
      ...menuBtn,
      ...restartBtn,
      ...nextBtn,
      ...adBtn
    ];

    this.fixHudToCamera();
  }
  advanceAfterWin() {
    this.showInterstitialBetweenLevels(() => {
      const totalLevels = CubePathStorage.getTotalLevels(this.gameMode);
      const nextLevel = this.currentLevelIndex + 1;

      if (this.gameMode === 'campaign') {
        const currentBiome = CubePathStorage.getBiomeIndexForLevel(this.currentLevelIndex);
        const nextBiome = CubePathStorage.getBiomeIndexForLevel(nextLevel);

        const volcanoBiomeIndex = 3;
        const ruinsBiomeIndex = 4;

        if (currentBiome === volcanoBiomeIndex && nextBiome === ruinsBiomeIndex) {
          this.showMainCampaignCompleteScreen();
          return;
        }

        if (nextLevel < totalLevels) {
          if (!CubePathStorage.isBiomeUnlocked(nextBiome, 'campaign')) {
            this.scene.start('LevelSelectScene');
            return;
          }
        }
      }

      const nextUnlocked = Math.min(nextLevel, totalLevels - 1);

      if (nextUnlocked > this.unlockedLevelIndex) {
        this.unlockedLevelIndex = nextUnlocked;
        CubePathStorage.setUnlockedLevel(this.unlockedLevelIndex, this.gameMode);
      }

      this.currentCampaignLayout = null;
      this.currentCampaignSeed = null;

      if (this.currentLevelIndex >= totalLevels - 1) {
        this.showGameCompleteScreen();
        return;
      }

      this.currentLevelIndex = nextLevel;
      CubePathStorage.setCurrentLevel(this.currentLevelIndex, this.gameMode);
      this.loadLevel(this.currentLevelIndex);
    });
  }
  loseGame() {
    if (this.isGameOver) return;
    this.isGameOver = true;
    CubePathAds.gameplayStop?.();

    this.freezeActive = false;
    this.pendingFrozenBreaks = [];
    if (this.freezeEndTimer && !this.freezeEndTimer.hasDispatched) {
      this.freezeEndTimer.remove(false);
    }
    this.freezeEndTimer = null;
    if (this.refreshFreezeUi) {
      this.refreshFreezeUi();
    }
    this.energyActive = false;
    if (this.energyEndTimer && !this.energyEndTimer.hasDispatched) {
      this.energyEndTimer.remove(false);
    }
    this.energyEndTimer = null;
    if (this.refreshEnergyUi) {
      this.refreshEnergyUi();
    }
    this.clearHotTileTimer();

    if (this.gameMode === 'survival') {
      this.cameras.main.shake(140, 0.006);
      this.flash(0xff6666, 0.24, 180);
      CubePathAudio.playDeath(this);

      this.time.delayedCall(500, () => {
        this.showSurvivalGameOver();
      });

      return;
    }

    this.cameras.main.shake(140, 0.006);
    this.flash(0xff6666, 0.24, 180);
    CubePathAudio.playDeath(this);

    this.tweens.add({
      targets: this.player,
      alpha: 0,
      scaleX: 0.7,
      scaleY: 0.7,
      duration: 120,
      onComplete: () => {
        this.time.delayedCall(250, () => {
          if (this.gameMode === 'campaign' && this.canUseSecondChance && !this.secondChanceUsed) {
            if (this.showSecondChanceMenu) {
              this.showSecondChanceMenu();
            } else {
              this.resetCurrentLevel();
            }
          } else {
            this.resetCurrentLevel();
          }
        });
      }
    });
  }
  showSecondChanceMenu() {
    this.clearSecondChanceMenu();
    this.activeOverlayKind = 'secondChance';

    this.resetCameraFilters();

    const profile = this.deviceProfile || window.CubePathDevice?.getProfile?.(this) || { isMobile: false, isPortrait: false };
    const isMobileOverlay = !!profile.isMobile;

    const panel = this.createStyledOverlayPanel({
      width: isMobileOverlay
        ? (profile.isPortrait ? Math.min(this.scale.width - 28, 360) : Math.min(this.scale.width - 48, 480))
        : 520,
      height: isMobileOverlay
        ? (profile.isPortrait ? 384 : 308)
        : 300,
      title: 'Ты проиграл',
      titleColor: '#ffffff',
      titleStroke: '#d57d7d'
    });

    const { cx, cy } = panel;
    if (isMobileOverlay) {
      const top = cy - panel.panelHeight / 2;
      const bottom = cy + panel.panelHeight / 2;

      panel.titleText.setY(top + 42);

      const subtitleAdaptive = this.add.text(
        cx,
        top + 94,
        'Использовать второй шанс?',
        this.makeUiTextStyle({
          size: profile.isPortrait ? 17 : 19,
          color: '#5f7891',
          stroke: '#ffffff',
          strokeThickness: 1
        })
      ).setOrigin(0.5).setScrollFactor(0).setDepth(12005);
      subtitleAdaptive.setAlign('center');
      subtitleAdaptive.setWordWrapWidth(Math.min(panel.panelWidth - 42, this.scale.width - 56), true);
      this.fitTextToBox(subtitleAdaptive, Math.min(panel.panelWidth - 42, this.scale.width - 56), 30, 12);

      const hintAdaptive = this.add.text(
        cx,
        top + 138,
        'Возврат на последнюю\nбезопасную клетку',
        this.makeUiTextStyle({
          size: profile.isPortrait ? 13 : 14,
          color: '#6f87a0',
          stroke: '#ffffff',
          strokeThickness: 1,
          align: 'center'
        })
      ).setOrigin(0.5).setScrollFactor(0).setDepth(12005);
      hintAdaptive.setAlign('center');
      hintAdaptive.setWordWrapWidth(Math.min(panel.panelWidth - 44, this.scale.width - 56), true);
      this.fitTextToBox(hintAdaptive, Math.min(panel.panelWidth - 44, this.scale.width - 56), 42, 10);

      const firstRowYAdaptive = bottom - 94;
      const menuRowYAdaptive = bottom - 42;

      const restartBtnAdaptive = this.createStyledUiButton(cx - 66, firstRowYAdaptive, 114, 38, 'Рестарт', () => {
        this.clearSecondChanceMenu();
        this.resetCurrentLevel();
      }, { textSize: 11, theme: 'gray' });

      const secondChanceBtnAdaptive = this.createStyledUiButton(cx + 70, firstRowYAdaptive, Math.min(panel.panelWidth - 170, 148), 44, 'Смотреть рекламу за\nвторой шанс', () => {
        this.showRewardedSecondChance();
      }, { textSize: 10, theme: 'green' });

      const menuBtnAdaptive = this.createStyledUiButton(cx, menuRowYAdaptive, 166, 34, 'Меню', () => {
        this.clearSecondChanceMenu();
        CubePathAudio.stopMusic(this);
        this.scene.start('MenuScene');
      }, { textSize: 11, theme: 'blue' });

      this.secondChanceUi = [
        panel.overlay,
        panel.shadow,
        panel.panel,
        panel.inner,
        panel.gloss,
        panel.titleText,
        subtitleAdaptive,
        hintAdaptive,
        ...restartBtnAdaptive,
        ...secondChanceBtnAdaptive,
        ...menuBtnAdaptive
      ];

      this.fixHudToCamera();
      return;
    }
    const firstRowY = isMobileOverlay ? (profile.isPortrait ? cy + 78 : cy + 74) : cy + 74;
    const menuRowY = isMobileOverlay ? (profile.isPortrait ? cy + 130 : cy + 126) : cy + 126;

    panel.titleText.setY(cy - (isMobileOverlay ? (profile.isPortrait ? 108 : 62) : 62));

    const subtitle = this.add.text(
      cx,
      cy - (isMobileOverlay ? (profile.isPortrait ? 34 : 18) : 18),
      'Использовать второй шанс?',
      this.makeUiTextStyle({
        size: isMobileOverlay ? (profile.isPortrait ? 19 : 22) : 22,
        color: '#5f7891',
        stroke: '#ffffff',
        strokeThickness: 1
      })
    ).setOrigin(0.5).setScrollFactor(0).setDepth(12005);

    const hint = this.add.text(
      cx,
      cy + (isMobileOverlay ? (profile.isPortrait ? 4 : 14) : 14),
      'Возврат на последнюю безопасную клетку',
      this.makeUiTextStyle({
        size: isMobileOverlay ? (profile.isPortrait ? 13 : 15) : 15,
        color: '#6f87a0',
        stroke: '#ffffff',
        strokeThickness: 1,
        align: 'center'
      })
    ).setOrigin(0.5).setScrollFactor(0).setDepth(12005);
    if (profile.isPortrait) {
      hint.setWordWrapWidth(Math.min(260, this.scale.width - 70), true);
    }

    const restartBtn = this.createStyledUiButton(cx - (isMobileOverlay && profile.isPortrait ? 68 : 120), firstRowY, isMobileOverlay && profile.isPortrait ? 120 : 140, isMobileOverlay && profile.isPortrait ? 38 : 42, 'Рестарт', () => {
      this.clearSecondChanceMenu();
      this.resetCurrentLevel();
    }, { textSize: isMobileOverlay && profile.isPortrait ? 12 : 14, theme: 'gray' });

    const secondChanceBtn = this.createStyledUiButton(cx + (isMobileOverlay && profile.isPortrait ? 74 : 120), firstRowY, isMobileOverlay && profile.isPortrait ? 150 : 210, isMobileOverlay && profile.isPortrait ? 44 : 46, 'Смотреть рекламу за\nвторой шанс', () => {
      this.showRewardedSecondChance();
    }, { textSize: isMobileOverlay && profile.isPortrait ? 10 : 13, theme: 'green' });

    const menuBtn = this.createStyledUiButton(cx, menuRowY, isMobileOverlay && profile.isPortrait ? 170 : 150, isMobileOverlay && profile.isPortrait ? 34 : 36, 'Меню', () => {
      this.clearSecondChanceMenu();
      CubePathAudio.stopMusic(this);
      this.scene.start('MenuScene');
    }, { textSize: isMobileOverlay && profile.isPortrait ? 12 : 13, theme: 'blue' });

    this.secondChanceUi = [
      panel.overlay,
      panel.shadow,
      panel.panel,
      panel.inner,
      panel.gloss,
      panel.titleText,
      subtitle,
      hint,
      ...restartBtn,
      ...secondChanceBtn,
      ...menuBtn
    ];

    this.fixHudToCamera();
  }
  showSurvivalGameOver() {
    this.clearBreakTimers();
    this.clearResultMenu();
    this.activeOverlayKind = 'survivalGameOver';
    this.children.removeAll(true);
    const profile = this.deviceProfile || window.CubePathDevice?.getProfile?.(this) || { isMobile: false, isPortrait: false };
    const isMobileOverlay = !!profile.isMobile;

    const best = CubePathStorage.getSurvivalBest();

    const panel = this.createStyledOverlayPanel({
      width: isMobileOverlay
        ? (profile.isPortrait ? Math.min(this.scale.width - 28, 356) : Math.min(this.scale.width - 48, 460))
        : 500,
      height: isMobileOverlay
        ? (profile.isPortrait ? 312 : 280)
        : 280,
      title: 'Забег окончен',
      titleColor: '#ffffff',
      titleStroke: '#d57d7d'
    });

    const { cx, cy } = panel;
    const top = cy - panel.panelHeight / 2;
    const bottom = cy + panel.panelHeight / 2;
    const passedTextAdaptive = this.add.text(
      cx,
      top + (isMobileOverlay ? 98 : 106),
      `Пройдено уровней: ${this.currentLevelIndex}`,
      this.makeUiTextStyle({
        size: isMobileOverlay ? (profile.isPortrait ? 16 : 18) : 22,
        color: '#5f7891',
        stroke: '#ffffff',
        strokeThickness: 1
      })
    ).setOrigin(0.5).setScrollFactor(0).setDepth(12005);
    passedTextAdaptive.setAlign('center');
    this.fitTextToBox(passedTextAdaptive, panel.panelWidth - 44, 28, 12);

    const bestTextAdaptive = this.add.text(
      cx,
      top + (isMobileOverlay ? 136 : 148),
      `Лучший результат: ${best}`,
      this.makeUiTextStyle({
        size: isMobileOverlay ? (profile.isPortrait ? 14 : 15) : 17,
        color: '#6f87a0',
        stroke: '#ffffff',
        strokeThickness: 1
      })
    ).setOrigin(0.5).setScrollFactor(0).setDepth(12005);
    bestTextAdaptive.setAlign('center');
    this.fitTextToBox(bestTextAdaptive, panel.panelWidth - 44, 24, 11);

    const restartBtnAdaptive = this.createStyledUiButton(cx, bottom - (isMobileOverlay ? 84 : 82), isMobileOverlay ? 188 : 210, isMobileOverlay ? 40 : 40, 'Новый забег', () => {
      this.currentLevelIndex = 0;
      this.currentCampaignLayout = null;
      this.currentCampaignSeed = null;
      this.loadLevel(0);
    }, { textSize: isMobileOverlay ? 12 : 14, theme: 'green' });

    const menuBtnAdaptive = this.createStyledUiButton(cx, bottom - (isMobileOverlay ? 38 : 38), isMobileOverlay ? 164 : 180, isMobileOverlay ? 36 : 40, 'В меню', () => {
      CubePathAudio.stopMusic(this);
      this.scene.start('MenuScene');
    }, { textSize: isMobileOverlay ? 12 : 14, theme: 'blue' });

    this.resultUi = [
      panel.overlay,
      panel.shadow,
      panel.panel,
      panel.inner,
      panel.gloss,
      panel.titleText,
      passedTextAdaptive,
      bestTextAdaptive,
      ...restartBtnAdaptive,
      ...menuBtnAdaptive
    ];

    this.fixHudToCamera();
    return;

    const passedText = this.add.text(
      cx,
      cy - (isMobileOverlay ? 30 : 22),
      `Пройдено уровней: ${this.currentLevelIndex}`,
      this.makeUiTextStyle({
        size: isMobileOverlay ? (profile.isPortrait ? 18 : 20) : 22,
        color: '#5f7891',
        stroke: '#ffffff',
        strokeThickness: 1
      })
    ).setOrigin(0.5).setScrollFactor(0).setDepth(12005);

    const bestText = this.add.text(
      cx,
      cy + (isMobileOverlay ? 6 : 16),
      `Лучший результат: ${best}`,
      this.makeUiTextStyle({
        size: isMobileOverlay ? (profile.isPortrait ? 15 : 16) : 17,
        color: '#6f87a0',
        stroke: '#ffffff',
        strokeThickness: 1
      })
    ).setOrigin(0.5).setScrollFactor(0).setDepth(12005);

    const restartBtn = this.createStyledUiButton(cx, cy + (isMobileOverlay ? 80 : 80), isMobileOverlay ? 196 : 210, isMobileOverlay ? 40 : 40, 'Новый забег', () => {
      this.currentLevelIndex = 0;
      this.currentCampaignLayout = null;
      this.currentCampaignSeed = null;
      this.loadLevel(0);
    }, { textSize: isMobileOverlay ? 13 : 14, theme: 'green' });

    const menuBtn = this.createStyledUiButton(cx, cy + (isMobileOverlay ? 132 : 130), isMobileOverlay ? 168 : 180, isMobileOverlay ? 38 : 40, 'В меню', () => {
      CubePathAudio.stopMusic(this);
      this.scene.start('MenuScene');
    }, { textSize: isMobileOverlay ? 13 : 14, theme: 'blue' });

    this.fixHudToCamera();
  }
  showMainCampaignCompleteScreen() {
    this.clearBreakTimers();
    this.clearResultMenu();
    this.activeOverlayKind = 'mainCampaignComplete';
    const profile = this.deviceProfile || window.CubePathDevice?.getProfile?.(this) || { isMobile: false, isPortrait: false };
    const isMobileOverlay = !!profile.isMobile;

    this.resetCameraFilters();
    this.children.removeAll(true);

    const panel = this.createStyledOverlayPanel({
      width: isMobileOverlay
        ? (profile.isPortrait ? Math.min(this.scale.width - 28, 360) : Math.min(this.scale.width - 48, 500))
        : 660,
      height: isMobileOverlay
        ? (profile.isPortrait ? 360 : 312)
        : 360,
      title: '\u041e\u0441\u043d\u043e\u0432\u043d\u0430\u044f \u043a\u0430\u043c\u043f\u0430\u043d\u0438\u044f \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043d\u0430',
      titleColor: '#ffffff',
      titleStroke: '#6dbb80'
    });

    const { cx, cy } = panel;
    const top = cy - panel.panelHeight / 2;
    const bottom = cy + panel.panelHeight / 2;
    const textWidth = Math.min(panel.panelWidth - 44, this.scale.width - 56);

    panel.titleText.setY(top + (isMobileOverlay ? 42 : 54));

    const summary = this.add.text(
      cx,
      top + (isMobileOverlay ? 122 : 146),
      '\u041f\u043e\u043f\u0440\u043e\u0431\u0443\u0439\u0442\u0435 \u0431\u0435\u0441\u043a\u043e\u043d\u0435\u0447\u043d\u044b\u0439 \u0440\u0435\u0436\u0438\u043c\n\u041d\u043e\u0432\u044b\u0435 \u043e\u0431\u043d\u043e\u0432\u043b\u0435\u043d\u0438\u044f \u0443\u0436\u0435 \u0432 \u043f\u0443\u0442\u0438',
      this.makeUiTextStyle({
        size: isMobileOverlay ? (profile.isPortrait ? 16 : 18) : 22,
        color: '#5f7891',
        stroke: '#ffffff',
        strokeThickness: 1
      })
    ).setOrigin(0.5).setScrollFactor(0).setDepth(12005);
    summary.setAlign('center');
    summary.setWordWrapWidth(textWidth, true);
    this.fitTextToBox(summary, textWidth, panel.panelHeight - (isMobileOverlay ? 188 : 194), 12);

    const endlessBtn = this.createStyledUiButton(
      cx,
      bottom - (isMobileOverlay ? 86 : 90),
      isMobileOverlay ? Math.min(panel.panelWidth - 36, 238) : 260,
      isMobileOverlay ? 40 : 42,
      '\u0411\u0435\u0441\u043a\u043e\u043d\u0435\u0447\u043d\u044b\u0439 \u0440\u0435\u0436\u0438\u043c',
      () => {
        CubePathStorage.setMode('survival');
        CubePathStorage.setCurrentLevel(0, 'survival');
        this.scene.start('GameScene');
      },
      { textSize: isMobileOverlay ? 12 : 15, theme: 'green' }
    );

    const menuBtn = this.createStyledUiButton(
      cx,
      bottom - (isMobileOverlay ? 38 : 40),
      isMobileOverlay ? Math.min(panel.panelWidth - 72, 182) : 180,
      isMobileOverlay ? 36 : 40,
      '\u0412 \u043c\u0435\u043d\u044e',
      () => {
        CubePathAudio.stopMusic(this);
        this.scene.start('MenuScene');
      },
      { textSize: isMobileOverlay ? 12 : 15, theme: 'blue' }
    );

    this.resultUi = [
      panel.overlay,
      panel.shadow,
      panel.panel,
      panel.inner,
      panel.gloss,
      panel.titleText,
      summary,
      ...endlessBtn,
      ...menuBtn
    ];

    this.fixHudToCamera();
  }

  showGameCompleteScreen() {
    this.clearBreakTimers();
    this.clearResultMenu();
    this.activeOverlayKind = 'gameComplete';
    const profile = this.deviceProfile || window.CubePathDevice?.getProfile?.(this) || { isMobile: false, isPortrait: false };
    const isMobileOverlay = !!profile.isMobile;

    this.resetCameraFilters();
    this.children.removeAll(true);

    const totalLevels = CubePathStorage.getTotalLevels(this.gameMode);
    let totalBestTime = 0;
    let totalBestMoves = 0;
    let completedCount = 0;

    for (let i = 0; i < totalLevels; i++) {
      const bestTime = CubePathStorage.getBestTime(this.gameMode, i);
      const bestMoves = CubePathStorage.getBestMoves(this.gameMode, i);
      if (bestTime !== null && bestMoves !== null) {
        totalBestTime += bestTime;
        totalBestMoves += bestMoves;
        completedCount++;
      }
    }

    const panel = this.createStyledOverlayPanel({
      width: isMobileOverlay
        ? (profile.isPortrait ? Math.min(this.scale.width - 28, 360) : Math.min(this.scale.width - 48, 500))
        : 580,
      height: isMobileOverlay
        ? (profile.isPortrait ? 360 : 324)
        : 340,
      title: this.gameMode === 'tutorial'
        ? '\u041e\u0431\u0443\u0447\u0435\u043d\u0438\u0435 \u043f\u0440\u043e\u0439\u0434\u0435\u043d\u043e!'
        : '\u041a\u0430\u043c\u043f\u0430\u043d\u0438\u044f \u043f\u0440\u043e\u0439\u0434\u0435\u043d\u0430!',
      titleColor: '#ffffff',
      titleStroke: '#6dbb80'
    });

    const { cx, cy } = panel;
    const top = cy - panel.panelHeight / 2;
    const bottom = cy + panel.panelHeight / 2;
    const textWidth = Math.min(panel.panelWidth - 46, this.scale.width - 58);
    const statsText = completedCount > 0
      ? `\u0421\u0443\u043c\u043c\u0430 \u043b\u0443\u0447\u0448\u0438\u0445 \u0440\u0435\u0437\u0443\u043b\u044c\u0442\u0430\u0442\u043e\u0432:\n${totalBestTime.toFixed(1)}\u0441 / ${totalBestMoves} \u0445\u043e\u0434\u043e\u0432`
      : '\u041b\u0443\u0447\u0448\u0438\u0435 \u0440\u0435\u0437\u0443\u043b\u044c\u0442\u0430\u0442\u044b \u043f\u043e\u043a\u0430 \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u044b';

    panel.titleText.setY(top + (isMobileOverlay ? 42 : 52));

    const stats = this.add.text(
      cx,
      top + (isMobileOverlay ? 130 : 144),
      statsText,
      this.makeUiTextStyle({
        size: isMobileOverlay ? (profile.isPortrait ? 17 : 18) : 20,
        color: '#5f7891',
        stroke: '#ffffff',
        strokeThickness: 1
      })
    ).setOrigin(0.5).setScrollFactor(0).setDepth(12005);
    stats.setAlign('center');
    stats.setWordWrapWidth(textWidth, true);
    this.fitTextToBox(stats, textWidth, panel.panelHeight - (isMobileOverlay ? 188 : 186), 12);

    const replayBtn = this.createStyledUiButton(
      cx,
      bottom - (isMobileOverlay ? 84 : 88),
      isMobileOverlay ? Math.min(panel.panelWidth - 48, 220) : 230,
      isMobileOverlay ? 40 : 42,
      '\u0418\u0433\u0440\u0430\u0442\u044c \u0437\u0430\u043d\u043e\u0432\u043e',
      () => {
        this.currentLevelIndex = 0;
        if (this.gameMode === 'tutorial') {
          this.unlockedLevelIndex = 0;
        }
        this.saveProgress();
        this.loadLevel(0);
      },
      { textSize: isMobileOverlay ? 12 : 16, theme: 'green' }
    );

    const menuBtn = this.createStyledUiButton(
      cx,
      bottom - (isMobileOverlay ? 38 : 40),
      isMobileOverlay ? Math.min(panel.panelWidth - 72, 184) : 190,
      isMobileOverlay ? 36 : 42,
      '\u0412 \u043c\u0435\u043d\u044e',
      () => {
        CubePathAudio.stopMusic(this);
        this.scene.start('MenuScene');
      },
      { textSize: isMobileOverlay ? 12 : 16, theme: 'blue' }
    );

    this.resultUi = [
      panel.overlay,
      panel.shadow,
      panel.panel,
      panel.inner,
      panel.gloss,
      panel.titleText,
      stats,
      ...replayBtn,
      ...menuBtn
    ];

    this.fixHudToCamera();
  }

  showLevelCompleteScreen(result, options = {}) {
    this.clearResultMenu();
    this.activeOverlayKind = 'levelComplete';
    this.lastLevelCompleteResult = { ...result };
    const components = this.buildStarComponents(result);
    const profile = this.deviceProfile || window.CubePathDevice?.getProfile?.(this) || { isMobile: false, isPortrait: false };
    const isMobileResult = !!profile.isMobile;
    const skipRewards = options.skipRewards === true;
    let gainedCubeCoins = Number.isFinite(options.gainedCubeCoinsOverride) ? options.gainedCubeCoinsOverride : 0;

    if (!skipRewards) {
      const rewardResult = CubePathStorage.awardCubeCoinsForNewStars(
        this.gameMode,
        this.currentLevelIndex,
        components
      );

      gainedCubeCoins = rewardResult.gainedCubeCoins;
    }

    this.lastLevelCompleteCubeCoins = gainedCubeCoins;

    this.resetCameraFilters();

    const panel = this.createStyledOverlayPanel({
      width: isMobileResult
        ? (profile.isPortrait ? Math.min(this.scale.width - 24, 360) : Math.min(this.scale.width - 48, 520))
        : 610,
      height: isMobileResult
        ? (profile.isPortrait ? 470 : 372)
        : (this.gameMode === 'campaign' ? 540 : 485),
      title: '\u0423\u0440\u043e\u0432\u0435\u043d\u044c \u043f\u0440\u043e\u0439\u0434\u0435\u043d!',
      titleColor: '#ffffff',
      titleStroke: '#6fa6d1'
    });

    const { cx, cy } = panel;
    const watchBoostLabel = '\u0421\u043c\u043e\u0442\u0440\u0435\u0442\u044c \u0440\u0435\u043a\u043b\u0430\u043c\u0443 \u0437\u0430\n\u0441\u043b\u0443\u0447\u0430\u0439\u043d\u044b\u0439 \u0431\u0443\u0441\u0442';

    if (isMobileResult) {
      const top = cy - panel.panelHeight / 2;
      const bottom = cy + panel.panelHeight / 2;
      const metricX = cx - Math.min(profile.isPortrait ? 82 : 88, panel.panelWidth * 0.24);
      const metricWidth = Math.max(100, panel.panelWidth - (profile.isPortrait ? 146 : 168));
      const starScale = profile.isPortrait
        ? Phaser.Math.Clamp((panel.panelWidth - 56) / 300, 0.72, 0.92)
        : Phaser.Math.Clamp((panel.panelWidth - 72) / 320, 0.76, 0.96);
      const starSpacing = profile.isPortrait
        ? Phaser.Math.Clamp((panel.panelWidth - 58) / 3, 60, 76)
        : Phaser.Math.Clamp((panel.panelWidth - 86) / 3, 68, 82);
      const pairGap = profile.isPortrait ? 14 : 16;
      const pairWidth = Math.max(106, Math.floor((panel.panelWidth - 44 - pairGap) / 2));
      const pairOffset = pairWidth / 2 + pairGap / 2;
      const isTightLandscape = !profile.isPortrait && panel.panelHeight <= 340;
      const compactReward = isTightLandscape || (!profile.isPortrait && panel.panelHeight <= 390);
      const firstRowY = bottom - (profile.isPortrait ? 112 : (isTightLandscape ? 78 : 98));
      const menuRowY = bottom - (profile.isPortrait ? 70 : (isTightLandscape ? 32 : 58));
      const adRowY = bottom - (profile.isPortrait ? 28 : (isTightLandscape ? 32 : 18));
      const rewardIconX = compactReward
        ? cx + panel.panelWidth * 0.18
        : cx - Math.min(profile.isPortrait ? 76 : 54, panel.panelWidth * 0.22);
      const rewardTextOffset = compactReward ? 34 : 52;
      const rewardScale = compactReward ? 0.48 : (profile.isPortrait ? 0.72 : 0.78);

      panel.titleText.setY(top + (profile.isPortrait ? 42 : (isTightLandscape ? 30 : 38)));

      const starNodes = this.createStarRow(cx, top + (profile.isPortrait ? 98 : (isTightLandscape ? 70 : 88)), result.stars, {
        scale: isTightLandscape ? Math.min(starScale, 0.78) : starScale,
        spacing: starSpacing
      });
      const divider = this.add.rectangle(
        cx,
        top + (profile.isPortrait ? 144 : (isTightLandscape ? 108 : 128)),
        Math.min(280, this.scale.width - 56),
        2,
        0xffffff,
        0.18
      ).setScrollFactor(0).setDepth(12004);

      const timeNodes = this.createMetricRow(
        metricX,
        top + (profile.isPortrait ? 174 : (isTightLandscape ? 132 : 158)),
        '\u231B',
        `${result.timeSeconds.toFixed(1)}\u0441 / ${result.parTime.toFixed(1)}\u0441`,
        'blue',
        {
          textSize: profile.isPortrait ? 15 : 16,
          maxWidth: compactReward ? Math.min(metricWidth, panel.panelWidth * 0.34) : metricWidth,
          maxHeight: 22,
          iconSize: profile.isPortrait ? 19 : 21
        }
      );

      const coinNodes = this.createMetricRow(
        metricX,
        top + (profile.isPortrait ? 206 : (isTightLandscape ? 156 : 192)),
        'STAR_HALF',
        `${this.coinsCollected}/${this.coinsTotal}`,
        'gold',
        {
          textSize: profile.isPortrait ? 15 : 16,
          maxWidth: compactReward ? Math.min(metricWidth, panel.panelWidth * 0.34) : metricWidth,
          maxHeight: 22,
          shardScale: profile.isPortrait ? 0.56 : 0.62
        }
      );

      const rewardY = compactReward
        ? top + (isTightLandscape ? 145 : 170)
        : top + (profile.isPortrait ? 238 : 220);
      const rewardCube = this.createRewardCubeIcon(
        rewardIconX,
        rewardY,
        rewardScale
      );
      const rewardText = this.add.text(
        rewardIconX + rewardTextOffset,
        rewardY + (compactReward ? 2 : 6),
        `+${gainedCubeCoins}`,
        this.makeUiTextStyle({
          size: compactReward ? 17 : (profile.isPortrait ? 20 : 23),
          color: '#ffd54a',
          stroke: '#c98b11',
          strokeThickness: 2,
          shadowColor: '#fff0c8',
          shadowBlur: 4
        })
      ).setOrigin(0, 0.5).setScrollFactor(0).setDepth(12007);
      this.fitTextToBox(rewardText, panel.panelWidth - 120, 28, 12);

      const restartBtn = this.createStyledUiButton(
        cx - pairOffset,
        firstRowY,
        pairWidth,
        profile.isPortrait ? 38 : (isTightLandscape ? 34 : 40),
        '\u0420\u0435\u0441\u0442\u0430\u0440\u0442',
        () => {
          this.clearResultMenu();
          this.resetCurrentLevel();
        },
        { textSize: profile.isPortrait ? 11 : 12, theme: 'blue' }
      );

      const nextBtn = this.createStyledUiButton(
        cx + pairOffset,
        firstRowY,
        pairWidth,
        profile.isPortrait ? 38 : (isTightLandscape ? 34 : 40),
        '\u0414\u0430\u043b\u0435\u0435',
        () => {
          this.clearResultMenu();
          this.advanceAfterWin();
        },
        { textSize: profile.isPortrait ? 11 : 12, theme: 'green' }
      );

      const menuBtn = this.createStyledUiButton(
        isTightLandscape ? cx - pairOffset : cx,
        menuRowY,
        isTightLandscape ? pairWidth : Math.min(panel.panelWidth - 36, profile.isPortrait ? 188 : 206),
        profile.isPortrait ? 34 : (isTightLandscape ? 34 : 36),
        '\u0412 \u043c\u0435\u043d\u044e',
        () => {
          this.clearResultMenu();
          CubePathAudio.stopMusic(this);
          this.scene.start('MenuScene');
        },
        { textSize: profile.isPortrait ? 11 : 12, theme: 'gray' }
      );

      const adBtn = this.createStyledUiButton(
        isTightLandscape ? cx + pairOffset : cx,
        adRowY,
        isTightLandscape ? pairWidth : Math.min(panel.panelWidth - 32, profile.isPortrait ? 286 : 296),
        profile.isPortrait ? 40 : (isTightLandscape ? 34 : 38),
        watchBoostLabel,
        () => {
          this.showRewardedRandomBoost();
        },
        { textSize: profile.isPortrait ? 10 : (isTightLandscape ? 9 : 11), theme: 'orange' }
      );

      this.resultUi = [
        panel.overlay,
        panel.shadow,
        panel.panel,
        panel.inner,
        panel.gloss,
        panel.titleText,
        ...starNodes,
        divider,
        ...timeNodes,
        ...coinNodes,
        rewardCube,
        rewardText,
        ...restartBtn,
        ...nextBtn,
        ...menuBtn,
        ...adBtn
      ];

      this.fixHudToCamera();
      return;
    }

    const progressNodes = this.gameMode === 'campaign'
      ? this.createTopStarProgressBar(cx, cy - 212, 410)
      : [];

    panel.titleText.setY(cy - 154);

    const starNodes = this.createStarRow(cx, cy - 74, result.stars, {
      scale: 1,
      spacing: 88
    });
    const divider1 = this.add.rectangle(cx, cy - 6, 380, 2, 0xffffff, 0.18)
      .setScrollFactor(0).setDepth(12004);
    const divider2 = this.add.rectangle(cx, cy + 58, 380, 2, 0xffffff, 0.18)
      .setScrollFactor(0).setDepth(12004);

    const timeNodes = this.createMetricRow(
      cx - 124,
      cy + 24,
      '\u231B',
      `${result.timeSeconds.toFixed(1)}\u0441 / ${result.parTime.toFixed(1)}\u0441`,
      'blue',
      { maxWidth: 150, maxHeight: 24 }
    );

    const coinNodes = this.createMetricRow(
      cx + 106,
      cy + 24,
      'STAR_HALF',
      `${this.coinsCollected}/${this.coinsTotal}`,
      'gold',
      { maxWidth: 106, maxHeight: 24 }
    );

    const rewardCube = this.createRewardCubeIcon(cx - 30, cy + 98, 0.92);
    const rewardText = this.add.text(
      cx + 46,
      cy + 106,
      `+${gainedCubeCoins}`,
      this.makeUiTextStyle({
        size: 33,
        color: '#ffd54a',
        stroke: '#c98b11',
        strokeThickness: 2,
        shadowColor: '#fff0c8',
        shadowBlur: 4
      })
    ).setOrigin(0, 0.5).setScrollFactor(0).setDepth(12007);
    this.fitTextToBox(rewardText, 190, 36, 14);

    const menuBtn = this.createStyledUiButton(
      cx - 160,
      cy + 178,
      140,
      42,
      '\u0412 \u043c\u0435\u043d\u044e',
      () => {
        CubePathAudio.stopMusic(this);
        this.scene.start('MenuScene');
      },
      { textSize: 14, theme: 'gray' }
    );

    const restartBtn = this.createStyledUiButton(
      cx,
      cy + 178,
      170,
      42,
      '\u0420\u0435\u0441\u0442\u0430\u0440\u0442',
      () => {
        this.resetCurrentLevel();
      },
      { textSize: 14, theme: 'blue' }
    );

    const nextBtn = this.createStyledUiButton(
      cx + 160,
      cy + 178,
      140,
      42,
      '\u0414\u0430\u043b\u0435\u0435',
      () => {
        this.advanceAfterWin();
      },
      { textSize: 14, theme: 'green' }
    );

    const adBtn = this.createStyledUiButton(
      cx,
      cy + 228,
      340,
      42,
      '\u0421\u043c\u043e\u0442\u0440\u0435\u0442\u044c \u0440\u0435\u043a\u043b\u0430\u043c\u0443 \u0437\u0430 \u0441\u043b\u0443\u0447\u0430\u0439\u043d\u044b\u0439 \u0431\u0443\u0441\u0442',
      () => {
        this.showRewardedRandomBoost();
      },
      { textSize: 13, theme: 'orange' }
    );

    this.resultUi = [
      panel.overlay,
      panel.shadow,
      panel.panel,
      panel.inner,
      panel.gloss,
      panel.titleText,
      ...progressNodes,
      ...starNodes,
      divider1,
      divider2,
      ...timeNodes,
      ...coinNodes,
      rewardCube,
      rewardText,
      ...menuBtn,
      ...restartBtn,
      ...nextBtn,
      ...adBtn
    ];

    this.fixHudToCamera();
  }

  showSecondChanceMenu() {
    this.clearSecondChanceMenu();
    this.activeOverlayKind = 'secondChance';

    this.resetCameraFilters();

    const profile = this.deviceProfile || window.CubePathDevice?.getProfile?.(this) || { isMobile: false, isPortrait: false };
    const isMobileOverlay = !!profile.isMobile;

    const panel = this.createStyledOverlayPanel({
      width: isMobileOverlay
        ? (profile.isPortrait ? Math.min(this.scale.width - 28, 360) : Math.min(this.scale.width - 48, 480))
        : 520,
      height: isMobileOverlay
        ? (profile.isPortrait ? 412 : 316)
        : 300,
      title: '\u0422\u044b \u043f\u0440\u043e\u0438\u0433\u0440\u0430\u043b',
      titleColor: '#ffffff',
      titleStroke: '#d57d7d'
    });

    const { cx, cy } = panel;
    const top = cy - panel.panelHeight / 2;
    const bottom = cy + panel.panelHeight / 2;
    const textWidth = Math.min(panel.panelWidth - 42, this.scale.width - 56);

    panel.titleText.setY(top + (isMobileOverlay ? 42 : 48));

    const subtitle = this.add.text(
      cx,
      top + (isMobileOverlay ? 94 : 102),
      '\u0418\u0441\u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u044c \u0432\u0442\u043e\u0440\u043e\u0439 \u0448\u0430\u043d\u0441?',
      this.makeUiTextStyle({
        size: isMobileOverlay ? (profile.isPortrait ? 17 : 19) : 22,
        color: '#5f7891',
        stroke: '#ffffff',
        strokeThickness: 1
      })
    ).setOrigin(0.5).setScrollFactor(0).setDepth(12005);
    subtitle.setAlign('center');
    subtitle.setWordWrapWidth(textWidth, true);
    this.fitTextToBox(subtitle, textWidth, isMobileOverlay ? 30 : 36, 12);

    const hint = this.add.text(
      cx,
      top + (isMobileOverlay ? 138 : 150),
      '\u0412\u043e\u0437\u0432\u0440\u0430\u0442 \u043d\u0430 \u043f\u043e\u0441\u043b\u0435\u0434\u043d\u044e\u044e\n\u0431\u0435\u0437\u043e\u043f\u0430\u0441\u043d\u0443\u044e \u043a\u043b\u0435\u0442\u043a\u0443',
      this.makeUiTextStyle({
        size: isMobileOverlay ? (profile.isPortrait ? 13 : 14) : 15,
        color: '#6f87a0',
        stroke: '#ffffff',
        strokeThickness: 1,
        align: 'center'
      })
    ).setOrigin(0.5).setScrollFactor(0).setDepth(12005);
    hint.setAlign('center');
    hint.setWordWrapWidth(textWidth, true);
    this.fitTextToBox(hint, textWidth, isMobileOverlay ? 42 : 46, 10);

    let restartBtn;
    let secondChanceBtn;
    let menuBtn;

    if (isMobileOverlay && profile.isPortrait) {
      const buttonW = panel.panelWidth - 38;
      restartBtn = this.createStyledUiButton(
        cx,
        bottom - 136,
        buttonW,
        38,
        '\u0420\u0435\u0441\u0442\u0430\u0440\u0442',
        () => {
          this.clearSecondChanceMenu();
          this.resetCurrentLevel();
        },
        { textSize: 11, theme: 'gray' }
      );

      secondChanceBtn = this.createStyledUiButton(
        cx,
        bottom - 88,
        buttonW,
        42,
        '\u0421\u043c\u043e\u0442\u0440\u0435\u0442\u044c \u0440\u0435\u043a\u043b\u0430\u043c\u0443 \u0437\u0430\n\u0432\u0442\u043e\u0440\u043e\u0439 \u0448\u0430\u043d\u0441',
        () => {
          this.showRewardedSecondChance();
        },
        { textSize: 10, theme: 'green' }
      );

      menuBtn = this.createStyledUiButton(
        cx,
        bottom - 38,
        buttonW,
        34,
        '\u0412 \u043c\u0435\u043d\u044e',
        () => {
          this.clearSecondChanceMenu();
          CubePathAudio.stopMusic(this);
          this.scene.start('MenuScene');
        },
        { textSize: 11, theme: 'blue' }
      );
    } else {
      const firstRowY = bottom - (isMobileOverlay ? 84 : 88);
      const menuRowY = bottom - (isMobileOverlay ? 38 : 40);
      const landscapePairGap = 14;
      const landscapePairWidth = isMobileOverlay
        ? Math.max(132, Math.floor((panel.panelWidth - 44 - landscapePairGap) / 2))
        : 140;
      const landscapePairOffset = landscapePairWidth / 2 + landscapePairGap / 2;
      restartBtn = this.createStyledUiButton(
        cx - (isMobileOverlay ? landscapePairOffset : 120),
        firstRowY,
        isMobileOverlay ? landscapePairWidth : 140,
        isMobileOverlay ? 38 : 42,
        '\u0420\u0435\u0441\u0442\u0430\u0440\u0442',
        () => {
          this.clearSecondChanceMenu();
          this.resetCurrentLevel();
        },
        { textSize: isMobileOverlay ? 12 : 14, theme: 'gray' }
      );

      secondChanceBtn = this.createStyledUiButton(
        cx + (isMobileOverlay ? landscapePairOffset : 120),
        firstRowY,
        isMobileOverlay ? landscapePairWidth : 210,
        isMobileOverlay ? 44 : 46,
        '\u0421\u043c\u043e\u0442\u0440\u0435\u0442\u044c \u0440\u0435\u043a\u043b\u0430\u043c\u0443 \u0437\u0430\n\u0432\u0442\u043e\u0440\u043e\u0439 \u0448\u0430\u043d\u0441',
        () => {
          this.showRewardedSecondChance();
        },
        { textSize: isMobileOverlay ? 10 : 13, theme: 'green' }
      );

      menuBtn = this.createStyledUiButton(
        cx,
        menuRowY,
        isMobileOverlay ? 170 : 150,
        isMobileOverlay ? 34 : 36,
        '\u0412 \u043c\u0435\u043d\u044e',
        () => {
          this.clearSecondChanceMenu();
          CubePathAudio.stopMusic(this);
          this.scene.start('MenuScene');
        },
        { textSize: isMobileOverlay ? 12 : 13, theme: 'blue' }
      );
    }

    this.secondChanceUi = [
      panel.overlay,
      panel.shadow,
      panel.panel,
      panel.inner,
      panel.gloss,
      panel.titleText,
      subtitle,
      hint,
      ...restartBtn,
      ...secondChanceBtn,
      ...menuBtn
    ];

    this.fixHudToCamera();
  }

  showSurvivalGameOver() {
    this.clearBreakTimers();
    this.clearResultMenu();
    this.activeOverlayKind = 'survivalGameOver';
    this.children.removeAll(true);
    const profile = this.deviceProfile || window.CubePathDevice?.getProfile?.(this) || { isMobile: false, isPortrait: false };
    const isMobileOverlay = !!profile.isMobile;

    const best = CubePathStorage.getSurvivalBest();

    const panel = this.createStyledOverlayPanel({
      width: isMobileOverlay
        ? (profile.isPortrait ? Math.min(this.scale.width - 28, 356) : Math.min(this.scale.width - 48, 460))
        : 500,
      height: isMobileOverlay
        ? (profile.isPortrait ? 336 : 288)
        : 280,
      title: '\u0417\u0430\u0431\u0435\u0433 \u043e\u043a\u043e\u043d\u0447\u0435\u043d',
      titleColor: '#ffffff',
      titleStroke: '#d57d7d'
    });

    const { cx, cy } = panel;
    const top = cy - panel.panelHeight / 2;
    const bottom = cy + panel.panelHeight / 2;

    panel.titleText.setY(top + (isMobileOverlay ? 42 : 48));

    const passedText = this.add.text(
      cx,
      top + (isMobileOverlay ? 98 : 106),
      `\u041f\u0440\u043e\u0439\u0434\u0435\u043d\u043e \u0443\u0440\u043e\u0432\u043d\u0435\u0439: ${this.currentLevelIndex}`,
      this.makeUiTextStyle({
        size: isMobileOverlay ? (profile.isPortrait ? 16 : 18) : 22,
        color: '#5f7891',
        stroke: '#ffffff',
        strokeThickness: 1
      })
    ).setOrigin(0.5).setScrollFactor(0).setDepth(12005);
    passedText.setAlign('center');
    this.fitTextToBox(passedText, panel.panelWidth - 44, 28, 12);

    const bestText = this.add.text(
      cx,
      top + (isMobileOverlay ? 136 : 148),
      `\u041b\u0443\u0447\u0448\u0438\u0439 \u0440\u0435\u0437\u0443\u043b\u044c\u0442\u0430\u0442: ${best}`,
      this.makeUiTextStyle({
        size: isMobileOverlay ? (profile.isPortrait ? 14 : 15) : 17,
        color: '#6f87a0',
        stroke: '#ffffff',
        strokeThickness: 1
      })
    ).setOrigin(0.5).setScrollFactor(0).setDepth(12005);
    bestText.setAlign('center');
    this.fitTextToBox(bestText, panel.panelWidth - 44, 24, 11);

    const restartBtn = this.createStyledUiButton(
      cx,
      bottom - (isMobileOverlay ? 84 : 82),
      isMobileOverlay ? (profile.isPortrait ? panel.panelWidth - 38 : 188) : 210,
      40,
      '\u041d\u043e\u0432\u044b\u0439 \u0437\u0430\u0431\u0435\u0433',
      () => {
        this.currentLevelIndex = 0;
        this.currentCampaignLayout = null;
        this.currentCampaignSeed = null;
        this.loadLevel(0);
      },
      { textSize: isMobileOverlay ? 12 : 14, theme: 'green' }
    );

    const menuBtn = this.createStyledUiButton(
      cx,
      bottom - 38,
      isMobileOverlay ? (profile.isPortrait ? panel.panelWidth - 38 : 164) : 180,
      isMobileOverlay ? 36 : 40,
      '\u0412 \u043c\u0435\u043d\u044e',
      () => {
        CubePathAudio.stopMusic(this);
        this.scene.start('MenuScene');
      },
      { textSize: isMobileOverlay ? 12 : 14, theme: 'blue' }
    );

    this.resultUi = [
      panel.overlay,
      panel.shadow,
      panel.panel,
      panel.inner,
      panel.gloss,
      panel.titleText,
      passedText,
      bestText,
      ...restartBtn,
      ...menuBtn
    ];

    this.fixHudToCamera();
  }

  resetCurrentLevel() {
    this.clearResultMenu();
    this.clearPauseMenu();
    this.isPaused = false;

    if (this.clearSecondChanceMenu) {
      this.clearSecondChanceMenu();
    }

    this.resetCameraFilters();

    this.freezeActive = false;
    this.pendingFrozenBreaks = [];

    if (this.freezeEndTimer && !this.freezeEndTimer.hasDispatched) {
      this.freezeEndTimer.remove(false);
    }
    this.freezeEndTimer = null;

    this.energyActive = false;
    if (this.energyEndTimer && !this.energyEndTimer.hasDispatched) {
      this.energyEndTimer.remove(false);
    }
    this.energyEndTimer = null;

    this.isMoving = false;
    this.isSliding = false;
    this.swipeBlocked = true;
    this.swipeStartX = 0;
    this.swipeStartY = 0;
    this.ignorePointerUntil = this.time.now + 220;

    this.loadLevel(this.currentLevelIndex);
  }
  goToPreviousLevel() {
    if (this.currentLevelIndex <= 0) return;
    this.currentLevelIndex--;
    this.saveProgress();
    this.loadLevel(this.currentLevelIndex);
    this.currentCampaignLayout = null;
    this.currentCampaignSeed = null;
  }

  goToNextLevel() {
    if (this.currentLevelIndex >= this.unlockedLevelIndex) return;
    this.currentLevelIndex++;
    this.saveProgress();
    this.loadLevel(this.currentLevelIndex);
    this.currentCampaignLayout = null;
    this.currentCampaignSeed = null;
  }

  clearBreakTimers() {
    if (!this.breakTimers) return;
    for (const timer of this.breakTimers) {
      if (timer && !timer.hasDispatched) {
        timer.remove(false);
      }
    }
    this.breakTimers = [];
  }

  isInsideLevel(x, y) {
    return y >= 0 && y < this.level.length && x >= 0 && x < this.level[y].length;
  }

  toIso(gridX, gridY) {
    return {
      x: this.offsetX + (gridX - gridY) * (this.tileW / 2),
      y: this.offsetY + (gridX + gridY) * (this.tileH / 2)
    };
  }
}

window.GameScene = GameScene;
