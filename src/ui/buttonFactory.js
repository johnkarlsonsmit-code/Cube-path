window.CubePathUI = {
  createButton(scene, x, y, w, h, label, onClick, options = {}) {
    const profile = window.CubePathDevice?.getProfile?.(scene) || { isMobile: false, touchTarget: 48 };
    const bgColor = options.bgColor ?? 0x2d2d2d;
    const hoverColor = options.hoverColor ?? 0x3d3d3d;
    const downColor = options.downColor ?? 0x555555;
    const borderColor = options.borderColor ?? 0x777777;
    const textSize = options.textSize ?? '20px';
    const textColor = options.textColor ?? '#ffffff';
    const depth = options.depth ?? 5000;
    const radius = options.radius ?? 10;
    const icon = options.icon ?? false;
    const hitWidth = Math.max(w, options.hitWidth ?? profile.touchTarget);
    const hitHeight = Math.max(h, options.hitHeight ?? profile.touchTarget);

    const bg = scene.add.rectangle(x, y, w, h, bgColor)
      .setStrokeStyle(2, borderColor)
      .setDepth(depth);

    const hit = scene.add.rectangle(x, y, hitWidth, hitHeight, 0x000000, 0.001)
      .setInteractive({ useHandCursor: !profile.isMobile })
      .setDepth(depth + 1);

    const text = scene.add.text(x, y, label, {
      fontSize: textSize,
      color: textColor,
      align: 'center'
    }).setOrigin(0.5).setDepth(depth + 1);

    bg.setScrollFactor(0);
    hit.setScrollFactor(0);
    text.setScrollFactor(0);

    if (icon) {
      text.setFontFamily('Arial');
    }

    if (!profile.isMobile) {
      hit.on('pointerover', () => {
        bg.setFillStyle(hoverColor);
        bg.setScale(1.03);
        text.setScale(1.03);
      });

      hit.on('pointerout', () => {
        bg.setFillStyle(bgColor);
        bg.setScale(1);
        text.setScale(1);
      });
    }

    hit.on('pointerdown', () => {
      if (typeof scene.ignoreUiSwipeOnce === 'function') {
        scene.ignoreUiSwipeOnce();
      }
      bg.setFillStyle(downColor);
      bg.setScale(0.96);
      text.setScale(0.96);
    });

    hit.on('pointerup', () => {
      if (typeof scene.ignoreUiSwipeOnce === 'function') {
        scene.ignoreUiSwipeOnce();
      }
      bg.setFillStyle(profile.isMobile ? bgColor : hoverColor);
      bg.setScale(profile.isMobile ? 1 : 1.03);
      text.setScale(profile.isMobile ? 1 : 1.03);

      if (window.CubePathAudio && typeof CubePathAudio.playUiClick === 'function') {
        CubePathAudio.playUiClick(scene);
      }

      onClick();
    });

    return { bg, hit, text };
  },

  createSlider(scene, x, y, width, value, onChange, options = {}) {
    const profile = window.CubePathDevice?.getProfile?.(scene) || {
      isMobile: false,
      touchTarget: 48,
      sliderTrackHeight: 8,
      sliderKnobRadius: 10
    };
    const depth = options.depth ?? 5000;
    const trackHeight = options.trackHeight ?? profile.sliderTrackHeight;
    const knobRadius = options.knobRadius ?? profile.sliderKnobRadius;
    const trackHitHeight = Math.max(trackHeight + 10, profile.touchTarget);

    const track = scene.add.rectangle(x, y, width, trackHeight, 0x3a3a3a)
      .setDepth(depth)
      .setScrollFactor(0);

    const fill = scene.add.rectangle(x - width / 2, y, width * value, trackHeight, 0x8fd3ff)
      .setOrigin(0, 0.5)
      .setDepth(depth + 1)
      .setScrollFactor(0);

    const knob = scene.add.circle(x - width / 2 + width * value, y, knobRadius, 0xffffff)
      .setDepth(depth + 2)
      .setScrollFactor(0);

    knob.setInteractive(
      new Phaser.Geom.Circle(0, 0, Math.max(knobRadius, Math.round(profile.touchTarget / 2))),
      Phaser.Geom.Circle.Contains
    );
    scene.input.setDraggable(knob);
    if (!profile.isMobile && knob.input) {
      knob.input.cursor = 'pointer';
    }

    const updateSlider = (pointerX) => {
      const left = x - width / 2;
      const right = x + width / 2;
      const clamped = Phaser.Math.Clamp(pointerX, left, right);
      const t = (clamped - left) / width;
      knob.x = clamped;
      fill.width = width * t;
      onChange(t);
    };

    let sliderClickLock = false;

    knob.on('dragstart', () => {
      sliderClickLock = false;
    });

    knob.on('drag', (pointer, dragX) => {
      if (!sliderClickLock && window.CubePathAudio && typeof CubePathAudio.playUiClick === 'function') {
        CubePathAudio.playUiClick(scene);
        sliderClickLock = true;
      }
      updateSlider(dragX);
    });

    track.setInteractive(
      new Phaser.Geom.Rectangle(-width / 2, -trackHitHeight / 2, width, trackHitHeight),
      Phaser.Geom.Rectangle.Contains
    );
    if (!profile.isMobile && track.input) {
      track.input.cursor = 'pointer';
    }
    track.on('pointerdown', (pointer) => {
      if (window.CubePathAudio && typeof CubePathAudio.playUiClick === 'function') {
        CubePathAudio.playUiClick(scene);
      }
      updateSlider(pointer.x);
    });

    return { track, fill, knob };
  }
};
