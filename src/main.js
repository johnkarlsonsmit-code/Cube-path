const syncViewportCssVars = () => {
  const viewport = window.CubePathDevice?.getViewport?.() || {
    width: Math.max(window.innerWidth || 0, 360),
    height: Math.max(window.innerHeight || 0, 640)
  };

  const root = document.documentElement;
  if (root?.style) {
    root.style.setProperty('--cube-path-vw', `${viewport.width}px`);
    root.style.setProperty('--cube-path-vh', `${viewport.height}px`);
  }

  return viewport;
};

const isEditableTarget = (target) => {
  const element = target instanceof Element ? target : null;
  if (!element) return false;

  const tagName = element.tagName?.toLowerCase?.() || '';
  return tagName === 'input' || tagName === 'textarea' || !!element.closest?.('[contenteditable="true"]');
};

const bindBrowserInteractionGuards = () => {
  if (window.CubePathBrowserGuardsBound) return;
  window.CubePathBrowserGuardsBound = true;

  const preventBrowserUi = (event) => {
    if (isEditableTarget(event.target)) return;
    event.preventDefault();
  };

  window.addEventListener('contextmenu', preventBrowserUi, { capture: true });
  window.addEventListener('selectstart', preventBrowserUi, { capture: true });
  window.addEventListener('dragstart', preventBrowserUi, { capture: true });
};

const getSceneResizeKey = (scene) => `${scene?.scale?.width ?? 0}x${scene?.scale?.height ?? 0}`;

const notifyScenesAboutResize = (game) => {
  const scenes = game?.scene?.scenes || [];

  scenes.forEach((scene) => {
    if (!scene?.sys?.settings) return;

    const nextKey = getSceneResizeKey(scene);
    if (scene.__cubePathResizeKey === nextKey) return;

    scene.__cubePathResizeKey = nextKey;
    scene.handleResize?.({
      width: scene.scale?.width ?? 0,
      height: scene.scale?.height ?? 0
    });
  });
};

const bindViewportListeners = (game, isMobileGame) => {
  if (window.CubePathViewportListenersBound) return;
  window.CubePathViewportListenersBound = true;

  let pendingFrame = 0;

  const queueViewportSync = () => {
    if (pendingFrame) {
      window.cancelAnimationFrame(pendingFrame);
    }

    pendingFrame = window.requestAnimationFrame(() => {
      pendingFrame = 0;

      const viewport = syncViewportCssVars();

      if (isMobileGame && game?.scale) {
        const widthChanged = Math.round(game.scale.width) !== Math.round(viewport.width);
        const heightChanged = Math.round(game.scale.height) !== Math.round(viewport.height);

        if (widthChanged || heightChanged) {
          game.scale.resize(viewport.width, viewport.height);
          return;
        }
      }

      notifyScenesAboutResize(game);
      game?.scale?.refresh?.();
    });
  };

  const viewportTarget = window.visualViewport || null;

  window.addEventListener('resize', queueViewportSync, { passive: true });
  window.addEventListener('orientationchange', queueViewportSync, { passive: true });
  window.addEventListener('pageshow', queueViewportSync, { passive: true });
  document.addEventListener('fullscreenchange', queueViewportSync);
  viewportTarget?.addEventListener?.('resize', queueViewportSync, { passive: true });

  game?.scale?.on?.('resize', () => {
    syncViewportCssVars();
    notifyScenesAboutResize(game);
  });

  window.setTimeout(queueViewportSync, 0);
  window.setTimeout(queueViewportSync, 120);
  window.setTimeout(queueViewportSync, 320);
};

const bindFullscreenHotkey = (game, isMobileGame) => {
  if (isMobileGame || window.CubePathFullscreenHotkeyBound) return;
  window.CubePathFullscreenHotkeyBound = true;

  window.addEventListener('keydown', (event) => {
    if (event.repeat || event.code !== 'KeyF') return;
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (isEditableTarget(document.activeElement)) return;
    if (!game?.scale) return;

    if (game.scale.isFullscreen) {
      game.scale.stopFullscreen();
    } else {
      game.scale.startFullscreen();
    }
  });
};

const createGameConfig = (startupProfile) => {
  const baseWidth = startupProfile.isMobile ? startupProfile.viewportWidth : 1280;
  const baseHeight = startupProfile.isMobile ? startupProfile.viewportHeight : 720;

  return {
    type: Phaser.AUTO,
    width: baseWidth,
    height: baseHeight,
    backgroundColor: '#1d1d1d',
    render: {
      powerPreference: 'high-performance'
    },
    input: {
      activePointers: startupProfile.isMobile ? 2 : 1
    },
    scale: {
      mode: startupProfile.isMobile ? Phaser.Scale.RESIZE : Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: baseWidth,
      height: baseHeight
    },
    scene: [MenuScene, ShopScene, LevelSelectScene, GameScene, PauseScene, SettingsScene]
  };
};

(async () => {
  syncViewportCssVars();
  bindBrowserInteractionGuards();

  window.CubePathI18n?.patchPhaser?.(Phaser);
  await window.CubePathI18n?.init?.();

  const startupProfile = window.CubePathDevice?.getStartupProfile?.() || { isMobile: false };
  const config = createGameConfig(startupProfile);
  const game = new Phaser.Game(config);

  window.CubePathGame = game;

  if (window.CubePathAds) {
    window.CubePathAds.setGameInstance?.(game);
    window.CubePathAds.init?.();
  }

  bindFullscreenHotkey(game, startupProfile.isMobile);
  bindViewportListeners(game, startupProfile.isMobile);
})();
