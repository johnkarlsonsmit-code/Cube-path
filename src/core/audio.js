window.CubePathAudio = {
  init(scene) {
    const settings = CubePathStorage.getAudioSettings();
    scene.soundEnabled = settings.soundEnabled;
    scene.audioSettings = settings;
    scene.audioCtx = null;

    if (scene.musicTrack === undefined) {
      scene.musicTrack = null;
    }

    if (scene.musicWasPlayingBeforeAd === undefined) {
      scene.musicWasPlayingBeforeAd = false;
    }
  },

  clampVolume(value, fallback = 1) {
    const numericValue = Number(value);

    if (!Number.isFinite(numericValue)) {
      return fallback;
    }

    return Math.max(0, Math.min(1, numericValue));
  },

  normalizeSettings(settings = null) {
    const defaults = CubePathStorage.getAudioSettings();
    const source = settings || defaults;

    return {
      soundEnabled: source.soundEnabled ?? defaults.soundEnabled,
      musicEnabled: source.musicEnabled ?? defaults.musicEnabled,
      masterVolume: this.clampVolume(source.masterVolume, defaults.masterVolume),
      sfxVolume: this.clampVolume(source.sfxVolume, defaults.sfxVolume),
      musicVolume: this.clampVolume(source.musicVolume, defaults.musicVolume)
    };
  },

  saveSettings(scene, settings) {
    const normalizedSettings = this.normalizeSettings(settings);
    CubePathStorage.saveAudioSettings(normalizedSettings);
    this.applySettingsGlobally(scene, normalizedSettings);
    return normalizedSettings;
  },

  applySettingsGlobally(scene, settings = null) {
    const normalizedSettings = this.normalizeSettings(settings);
    const scenes = scene?.scene?.manager?.scenes;

    if (!Array.isArray(scenes) || scenes.length === 0) {
      if (scene) {
        this.applySettings(scene, normalizedSettings);
      }
      return normalizedSettings;
    }

    for (const targetScene of scenes) {
      if (!targetScene || !targetScene.sys) continue;
      this.applySettings(targetScene, normalizedSettings);
    }

    return normalizedSettings;
  },

  ensureAudioContext(scene) {
    const settings = CubePathStorage.getAudioSettings();
    scene.audioSettings = settings;
    scene.soundEnabled = settings.soundEnabled;

    if (!settings.soundEnabled) return null;

    if (!scene.audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      scene.audioCtx = new AudioCtx();
    }

    if (scene.audioCtx.state === 'suspended') {
      scene.audioCtx.resume();
    }

    return scene.audioCtx;
  },

  getMaster(scene) {
    return CubePathStorage.getAudioSettings().masterVolume;
  },

  getSfx(scene) {
    const s = CubePathStorage.getAudioSettings();
    return (s.soundEnabled ? 1 : 0) * s.masterVolume * s.sfxVolume;
  },

  getMusic(scene) {
    const s = CubePathStorage.getAudioSettings();
    return (s.soundEnabled && s.musicEnabled ? 1 : 0) * s.masterVolume * s.musicVolume;
  },

  playTone(scene, frequency = 440, duration = 0.08, type = 'sine', volume = 0.03, slideTo = null) {
    const ctx = this.ensureAudioContext(scene);
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);

    if (slideTo !== null) {
      osc.frequency.linearRampToValueAtTime(slideTo, ctx.currentTime + duration);
    }

    const finalVolume = Math.max(0.0001, volume * this.getSfx(scene));
    gain.gain.setValueAtTime(finalVolume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  },

  playUiClick(scene) {
    this.playTone(scene, 720, 0.045, 'square', 0.028, 560);
  },

  playStep(scene) {
    this.playTone(scene, 520, 0.05, 'square', 0.03, 430);
  },

  playBreak(scene) {
    this.playTone(scene, 220, 0.09, 'triangle', 0.05, 120);
  },

  playDeath(scene) {
    this.playTone(scene, 260, 0.22, 'sawtooth', 0.06, 70);
  },

  playWin(scene) {
    this.playTone(scene, 523, 0.08, 'square', 0.04);
    scene.time.delayedCall(90, () => this.playTone(scene, 659, 0.08, 'square', 0.04));
    scene.time.delayedCall(180, () => this.playTone(scene, 784, 0.12, 'square', 0.045));
  },

  startMusic(scene, key = 'music-main') {
    const settings = CubePathStorage.getAudioSettings();
    scene.audioSettings = settings;
    scene.soundEnabled = settings.soundEnabled;

    if (!scene.sound || !scene.cache || !scene.cache.audio || !scene.cache.audio.exists(key)) {
      return;
    }

    if (scene.musicTrack && scene.musicTrack.key === key) {
      this.applySettings(scene);

      if (settings.soundEnabled && settings.musicEnabled) {
        if (scene.musicTrack.isPaused) {
          scene.musicTrack.resume();
        } else if (!scene.musicTrack.isPlaying) {
          scene.musicTrack.play({ loop: true, volume: this.getMusic(scene) });
        }
      }

      return;
    }

    if (scene.musicTrack) {
      try {
        scene.musicTrack.stop();
        scene.musicTrack.destroy();
      } catch {}
      scene.musicTrack = null;
    }

    scene.musicTrack = scene.sound.add(key, {
      loop: true,
      volume: this.getMusic(scene)
    });

    if (settings.soundEnabled && settings.musicEnabled) {
      scene.musicTrack.play();
    }
  },

  stopMusic(scene) {
    if (!scene.musicTrack) return;

    try {
      scene.musicTrack.stop();
      scene.musicTrack.destroy();
    } catch {}

    scene.musicTrack = null;
    scene.musicWasPlayingBeforeAd = false;
  },

  pauseMusicForAd(scene) {
    if (!scene.musicTrack) {
      scene.musicWasPlayingBeforeAd = false;
      return;
    }

    scene.musicWasPlayingBeforeAd = !!scene.musicTrack.isPlaying;

    if (scene.musicTrack.isPlaying) {
      scene.musicTrack.pause();
    }
  },

  resumeMusicAfterAd(scene) {
    if (!scene.musicTrack) return;

    const settings = CubePathStorage.getAudioSettings();
    if (!settings.soundEnabled || !settings.musicEnabled) {
      scene.musicWasPlayingBeforeAd = false;
      return;
    }

    if (scene.musicWasPlayingBeforeAd) {
      scene.musicTrack.setVolume(this.getMusic(scene));

      if (scene.musicTrack.isPaused) {
        scene.musicTrack.resume();
      } else if (!scene.musicTrack.isPlaying) {
        scene.musicTrack.play({ loop: true, volume: this.getMusic(scene) });
      }
    }

    scene.musicWasPlayingBeforeAd = false;
  },

  applySettings(scene, settings = null) {
    const s = this.normalizeSettings(settings);
    scene.audioSettings = s;
    scene.soundEnabled = s.soundEnabled;

    if (scene.soundButtonText && typeof scene.soundButtonText.setText === 'function') {
      scene.soundButtonText.setText(s.soundEnabled ? 'Звук: ВКЛ' : 'Звук: ВЫКЛ');
    }

    if (!scene.musicTrack) return;

    const targetVolume = s.soundEnabled && s.musicEnabled
      ? s.masterVolume * s.musicVolume
      : 0;

    scene.musicTrack.setVolume(targetVolume);

    if (!s.soundEnabled || !s.musicEnabled) {
      if (scene.musicTrack.isPlaying) {
        scene.musicTrack.pause();
      }
      return;
    }

    if (scene.musicTrack.isPaused) {
      scene.musicTrack.resume();
      return;
    }

    if (!scene.musicTrack.isPlaying) {
      scene.musicTrack.play({ loop: true, volume: targetVolume });
    }
  }
};
