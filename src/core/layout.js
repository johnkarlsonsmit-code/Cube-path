window.CubePathLayout = (() => {
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  const getFontSize = (textObject) => {
    const size = Number.parseFloat(textObject?.style?.fontSize);
    if (Number.isFinite(size) && size > 0) return size;

    const styleSize = Number.parseFloat(textObject?.style?.metrics?.fontSize);
    if (Number.isFinite(styleSize) && styleSize > 0) return styleSize;

    return 16;
  };

  const fitText = (textObject, options = {}) => {
    if (!textObject || typeof textObject.setFontSize !== 'function') {
      return textObject;
    }

    const {
      maxWidth = Number.POSITIVE_INFINITY,
      maxHeight = Number.POSITIVE_INFINITY,
      minSize = 8,
      lineSpacing = -2,
      wrap = true
    } = options;

    const applyLayout = () => {
      if (
        wrap &&
        Number.isFinite(maxWidth) &&
        maxWidth > 0 &&
        typeof textObject.setWordWrapWidth === 'function'
      ) {
        textObject.setWordWrapWidth(Math.max(12, maxWidth), true);
      }

      if (
        typeof lineSpacing === 'number' &&
        typeof textObject.setLineSpacing === 'function' &&
        String(textObject.text || '').includes('\n')
      ) {
        textObject.setLineSpacing(lineSpacing);
      }
    };

    let fontSize = getFontSize(textObject);
    let guard = 40;

    applyLayout();

    while (guard-- > 0 && fontSize > minSize) {
      const tooWide = Number.isFinite(maxWidth) && textObject.width > maxWidth;
      const tooTall = Number.isFinite(maxHeight) && textObject.height > maxHeight;

      if (!tooWide && !tooTall) break;

      fontSize -= 1;
      textObject.setFontSize(fontSize);
      applyLayout();
    }

    return textObject;
  };

  const resolveVerticalStack = ({
    availableHeight,
    itemCount,
    preferredItemHeight,
    minItemHeight,
    preferredGap,
    minGap
  }) => {
    if (!itemCount || availableHeight <= 0) {
      return {
        itemHeight: preferredItemHeight,
        gap: preferredGap
      };
    }

    const gaps = Math.max(0, itemCount - 1);
    const preferredTotal = preferredItemHeight * itemCount + preferredGap * gaps;
    const minTotal = minItemHeight * itemCount + minGap * gaps;

    if (availableHeight >= preferredTotal) {
      return {
        itemHeight: preferredItemHeight,
        gap: preferredGap
      };
    }

    if (availableHeight <= minTotal) {
      return {
        itemHeight: minItemHeight,
        gap: minGap
      };
    }

    const ratio = clamp(
      (availableHeight - minTotal) / Math.max(1, preferredTotal - minTotal),
      0,
      1
    );

    return {
      itemHeight: minItemHeight + (preferredItemHeight - minItemHeight) * ratio,
      gap: minGap + (preferredGap - minGap) * ratio
    };
  };

  return {
    clamp,
    fitText,
    resolveVerticalStack
  };
})();
