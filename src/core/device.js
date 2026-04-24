window.CubePathDevice = (() => {
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const getViewport = () => {
    const docEl = document.documentElement || {};
    const visualViewport = window.visualViewport;

    return {
      width: Math.max(
        Math.round(visualViewport?.width || 0) || 0,
        Math.round(window.innerWidth || 0) || 0,
        Math.round(docEl.clientWidth || 0) || 0,
        360
      ),
      height: Math.max(
        Math.round(visualViewport?.height || 0) || 0,
        Math.round(window.innerHeight || 0) || 0,
        Math.round(docEl.clientHeight || 0) || 0,
        640
      )
    };
  };

  const hasCoarsePointer = () => {
    try {
      return window.matchMedia('(pointer: coarse)').matches;
    } catch (_error) {
      return false;
    }
  };

  const hasTouchSupport = () => {
    const nav = window.navigator || {};
    return hasCoarsePointer() || (nav.maxTouchPoints || 0) > 0 || 'ontouchstart' in window;
  };

  const getUserAgent = () => (window.navigator?.userAgent || '').toLowerCase();

  const createProfile = (viewportWidth, viewportHeight, sceneWidth = 1280, sceneHeight = 720) => {
    const shortSide = Math.min(viewportWidth, viewportHeight);
    const longSide = Math.max(viewportWidth, viewportHeight);
    const aspectRatio = longSide / Math.max(shortSide, 1);
    const userAgent = getUserAgent();
    const isTouch = hasTouchSupport();
    const isPhoneUa = /android|iphone|ipod|iemobile|blackberry|mobile/.test(userAgent);
    const isTabletUa = /ipad|tablet/.test(userAgent);
    const isMobile = isTouch && (isPhoneUa || isTabletUa || shortSide <= 1024);
    const isTablet = isMobile && (isTabletUa || shortSide >= 700);
    const isPortrait = viewportHeight > viewportWidth;
    const canvasScale = Math.max(
      0.01,
      Math.min(
        viewportWidth / Math.max(sceneWidth, 1),
        viewportHeight / Math.max(sceneHeight, 1)
      )
    );

    return {
      viewportWidth,
      viewportHeight,
      sceneWidth,
      sceneHeight,
      shortSide,
      longSide,
      aspectRatio,
      canvasScale,
      isTouch,
      isMobile,
      isTablet,
      isPortrait,
      isLandscape: !isPortrait,
      isCompactLandscape: isMobile && !isPortrait && viewportHeight <= 500,
      isCompactWidth: sceneWidth <= 900 || shortSide <= 430,
      isVeryNarrow: aspectRatio >= 2.1,
      reducedEffects: isMobile && !isTablet,
      safePadding: isMobile ? (isPortrait ? 18 : 14) : 14,
      touchTarget: clamp(Math.round(48 / canvasScale), 48, isPortrait ? 120 : 96),
      sliderTrackHeight: isMobile ? (isPortrait ? 12 : 10) : 8,
      sliderKnobRadius: isMobile ? (isPortrait ? 15 : 13) : 10,
      profileName: !isMobile
        ? 'desktop'
        : isTablet
          ? (isPortrait ? 'tablet-portrait' : 'tablet-landscape')
          : (isPortrait ? 'phone-portrait' : 'phone-landscape')
    };
  };

  const getStartupProfile = () => {
    const viewport = getViewport();
    return createProfile(viewport.width, viewport.height, 1280, 720);
  };

  const getProfile = (scene) => {
    const viewport = getViewport();
    const sceneWidth = scene?.scale?.width ?? 1280;
    const sceneHeight = scene?.scale?.height ?? 720;
    return createProfile(viewport.width, viewport.height, sceneWidth, sceneHeight);
  };

  return {
    clamp,
    getViewport,
    getStartupProfile,
    getProfile
  };
})();
