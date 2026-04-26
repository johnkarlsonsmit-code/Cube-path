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

const syncDocumentTitle = () => {
  const language = window.CubePathI18n?.getLanguage?.() || 'ru';
  document.title = language === 'en' ? 'Cube Path' : 'Путь Кубика';
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

  const preventNonPrimaryPointer = (event) => {
    if (isEditableTarget(event.target)) return;
    if (typeof event.button === 'number' && event.button <= 0) return;
    event.preventDefault();
  };

  const guardedTargets = [window, document, document.documentElement, document.body].filter(Boolean);
  const passiveFalse = { capture: true, passive: false };

  guardedTargets.forEach((target) => {
    target.addEventListener('contextmenu', preventBrowserUi, passiveFalse);
    target.addEventListener('selectstart', preventBrowserUi, passiveFalse);
    target.addEventListener('dragstart', preventBrowserUi, passiveFalse);
    target.addEventListener('auxclick', preventBrowserUi, passiveFalse);
    target.addEventListener('gesturestart', preventBrowserUi, passiveFalse);
    target.addEventListener('gesturechange', preventBrowserUi, passiveFalse);
    target.addEventListener('gestureend', preventBrowserUi, passiveFalse);
    target.addEventListener('pointerdown', preventNonPrimaryPointer, passiveFalse);
    target.addEventListener('mousedown', preventNonPrimaryPointer, passiveFalse);
  });

  document.addEventListener('selectionchange', () => {
    const selection = window.getSelection?.();
    if (!selection || selection.isCollapsed) return;
    if (isEditableTarget(document.activeElement)) return;
    selection.removeAllRanges();
  });
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
  window.addEventListener('load', queueViewportSync, { passive: true });
  window.addEventListener('focus', queueViewportSync, { passive: true });
  document.addEventListener('visibilitychange', queueViewportSync, { passive: true });
  document.addEventListener('fullscreenchange', queueViewportSync);
  viewportTarget?.addEventListener?.('resize', queueViewportSync, { passive: true });

  game?.scale?.on?.('resize', () => {
    syncViewportCssVars();
    notifyScenesAboutResize(game);
  });

  window.setTimeout(queueViewportSync, 0);
  window.setTimeout(queueViewportSync, 120);
  window.setTimeout(queueViewportSync, 320);
  window.setTimeout(queueViewportSync, 700);
  window.setTimeout(queueViewportSync, 1200);
  window.setTimeout(queueViewportSync, 2000);
};

const bindCanvasGuards = (game) => {
  const canvas = game?.canvas;
  if (!canvas || canvas.__cubePathCanvasGuardsBound) return;

  canvas.__cubePathCanvasGuardsBound = true;
  canvas.setAttribute('oncontextmenu', 'return false;');
  canvas.addEventListener('contextmenu', (event) => event.preventDefault(), { capture: true });
  canvas.addEventListener('dragstart', (event) => event.preventDefault(), { capture: true });
};

const waitWithTimeout = (promise, timeoutMs, fallbackValue) => {
  let timer = null;

  return Promise.race([
    Promise.resolve(promise).catch(() => fallbackValue),
    new Promise((resolve) => {
      timer = window.setTimeout(() => resolve(fallbackValue), timeoutMs);
    })
  ]).finally(() => {
    if (timer) window.clearTimeout(timer);
  });
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
  await waitWithTimeout(window.CubePathI18n?.init?.(), 1200, 'ru');
  syncDocumentTitle();

  const startupProfile = window.CubePathDevice?.getStartupProfile?.() || { isMobile: false };
  const config = createGameConfig(startupProfile);
  const game = new Phaser.Game(config);

  window.CubePathGame = game;
  bindCanvasGuards(game);

  if (window.CubePathAds) {
    window.CubePathAds.setGameInstance?.(game);
    window.CubePathAds.init?.();
  }

  bindFullscreenHotkey(game, startupProfile.isMobile);
  bindViewportListeners(game, startupProfile.isMobile);
})();
