window.CubePathStorage = {
  getMode() {
    return localStorage.getItem('cubePathMode') || 'tutorial';
  },

  setMode(mode) {
    localStorage.setItem('cubePathMode', mode);
  },

  getCurrentLevel(mode = this.getMode()) {
    const raw = localStorage.getItem(`cubePathCurrentLevel_${mode}`);
    const value = raw ? parseInt(raw, 10) : 0;
    return Number.isNaN(value) ? 0 : value;
  },

  setCurrentLevel(level, mode = this.getMode()) {
    localStorage.setItem(`cubePathCurrentLevel_${mode}`, String(level));
  },

  getUnlockedLevel(mode = this.getMode()) {
    const raw = localStorage.getItem(`cubePathUnlockedLevel_${mode}`);
    const value = raw ? parseInt(raw, 10) : 0;
    return Number.isNaN(value) ? 0 : value;
  },

  setUnlockedLevel(level, mode = this.getMode()) {
    localStorage.setItem(`cubePathUnlockedLevel_${mode}`, String(level));
  },

  getBestTime(mode, levelIndex) {
    const raw = localStorage.getItem(`cubePathBestTime_${mode}_${levelIndex}`);
    const value = raw ? parseFloat(raw) : null;
    return Number.isNaN(value) ? null : value;
  },

  getBestMoves(mode, levelIndex) {
    const raw = localStorage.getItem(`cubePathBestMoves_${mode}_${levelIndex}`);
    const value = raw ? parseInt(raw, 10) : null;
    return Number.isNaN(value) ? null : value;
  },

  saveBestResult(mode, levelIndex, timeSeconds, moves) {
    const currentBestTime = this.getBestTime(mode, levelIndex);
    const currentBestMoves = this.getBestMoves(mode, levelIndex);

    if (currentBestTime === null || timeSeconds < currentBestTime) {
      localStorage.setItem(`cubePathBestTime_${mode}_${levelIndex}`, String(timeSeconds));
    }

    if (currentBestMoves === null || moves < currentBestMoves) {
      localStorage.setItem(`cubePathBestMoves_${mode}_${levelIndex}`, String(moves));
    }
  },

  getStarComponents(mode, levelIndex) {
    const raw = localStorage.getItem(`cubePathStarComponents_${mode}_${levelIndex}`);
    if (!raw) {
      return { clear: false, time: false, coins: false };
    }

    try {
      const parsed = JSON.parse(raw);
      return {
        clear: !!parsed.clear,
        time: !!parsed.time,
        coins: !!parsed.coins
      };
    } catch {
      return { clear: false, time: false, coins: false };
    }
  },

  saveStarComponents(mode, levelIndex, nextComponents) {
    const current = this.getStarComponents(mode, levelIndex);

    const merged = {
      clear: current.clear || !!nextComponents.clear,
      time: current.time || !!nextComponents.time,
      coins: current.coins || !!nextComponents.coins
    };

    localStorage.setItem(
      `cubePathStarComponents_${mode}_${levelIndex}`,
      JSON.stringify(merged)
    );

    return merged;
  },

  countStarsFromComponents(components) {
    return (components.clear ? 1 : 0) +
      (components.time ? 1 : 0) +
      (components.coins ? 1 : 0);
  },

  getBestStars(mode, levelIndex) {
    return this.countStarsFromComponents(this.getStarComponents(mode, levelIndex));
  },

  getTotalEarnedStars(mode = 'campaign') {
    const totalLevels = this.getTotalLevels(mode);
    let total = 0;

    for (let i = 0; i < totalLevels; i++) {
      total += this.getBestStars(mode, i);
    }

    return total;
  },

  getBiomeIndexForLevel(levelIndex) {
    return Math.floor(levelIndex / 20);
  },

  getBiomeStartLevel(biomeIndex) {
    return biomeIndex * 20;
  },

  getBiomeUnlockRequirement(biomeIndex) {
    const requirements = [0, 40, 80, 120, 160];
    return requirements[biomeIndex] ?? 140;
  },

  isBiomeUnlocked(biomeIndex, mode = 'campaign') {
    if (mode !== 'campaign') return true;
    return this.getTotalEarnedStars('campaign') >= this.getBiomeUnlockRequirement(biomeIndex);
  },

  getHighestUnlockedBiome(mode = 'campaign') {
    if (mode !== 'campaign') return 0;

    let highest = 0;
    for (let i = 0; i < 5; i++) {
      if (this.isBiomeUnlocked(i, mode)) highest = i;
    }
    return highest;
  },

  getBiomeName(biomeIndex) {
    const names = ['Классика', 'Лёд', 'Пустыня', 'Вулкан', 'Руины'];
    return names[biomeIndex] ?? `Биом ${biomeIndex + 1}`;
  },

  getSurvivalBest() {
    const raw = localStorage.getItem('cubePathSurvivalBest');
    const value = raw ? parseInt(raw, 10) : 0;
    return Number.isNaN(value) ? 0 : value;
  },

  setSurvivalBest(value) {
    localStorage.setItem('cubePathSurvivalBest', String(value));
  },

  getAudioSettings() {
    const raw = localStorage.getItem('cubePathAudioSettings');
    if (!raw) {
      return {
        soundEnabled: true,
        musicEnabled: true,
        masterVolume: 0.7,
        sfxVolume: 0.8,
        musicVolume: 0.35
      };
    }

    try {
      const parsed = JSON.parse(raw);
      return {
        soundEnabled: parsed.soundEnabled ?? true,
        musicEnabled: parsed.musicEnabled ?? true,
        masterVolume: parsed.masterVolume ?? 0.7,
        sfxVolume: parsed.sfxVolume ?? 0.8,
        musicVolume: parsed.musicVolume ?? 0.35
      };
    } catch {
      return {
        soundEnabled: true,
        musicEnabled: true,
        masterVolume: 0.7,
        sfxVolume: 0.8,
        musicVolume: 0.35
      };
    }
  },

  saveAudioSettings(settings) {
    localStorage.setItem('cubePathAudioSettings', JSON.stringify(settings));
  },

  getCubeCoins() {
    const raw = localStorage.getItem('cubePathCubeCoins');
    const value = raw ? parseInt(raw, 10) : 0;
    return Number.isNaN(value) ? 0 : Math.max(0, value);
  },

  setCubeCoins(value) {
    localStorage.setItem('cubePathCubeCoins', String(Math.max(0, Math.floor(value))));
  },

  addCubeCoins(amount = 1) {
    const current = this.getCubeCoins();
    const next = current + Math.max(0, Math.floor(amount));
    this.setCubeCoins(next);
    return next;
  },

  spendCubeCoins(amount = 1) {
    const current = this.getCubeCoins();
    const safeAmount = Math.max(0, Math.floor(amount));

    if (current < safeAmount) return false;

    this.setCubeCoins(current - safeAmount);
    return true;
  },

  getBoostInventory() {
    const raw = localStorage.getItem('cubePathBoostInventory');

    if (!raw) {
      return {
        freeze: 3,
        energy: 3
      };
    }

    try {
      const parsed = JSON.parse(raw);
      return {
        freeze: Number.isFinite(parsed.freeze) ? Math.max(0, parsed.freeze) : 3,
        energy: Number.isFinite(parsed.energy) ? Math.max(0, parsed.energy) : 3
      };
    } catch {
      return {
        freeze: 3,
        energy: 3
      };
    }
  },

  saveBoostInventory(inventory) {
    const safe = {
      freeze: Math.max(0, Math.floor(inventory.freeze ?? 0)),
      energy: Math.max(0, Math.floor(inventory.energy ?? 0))
    };

    localStorage.setItem('cubePathBoostInventory', JSON.stringify(safe));
  },

  getBoostCount(boostType) {
    const inventory = this.getBoostInventory();
    return Math.max(0, inventory[boostType] ?? 0);
  },

  setBoostCount(boostType, value) {
    const inventory = this.getBoostInventory();
    inventory[boostType] = Math.max(0, Math.floor(value));
    this.saveBoostInventory(inventory);
  },

  addBoost(boostType, amount = 1) {
    const inventory = this.getBoostInventory();
    inventory[boostType] = Math.max(0, Math.floor((inventory[boostType] ?? 0) + amount));
    this.saveBoostInventory(inventory);
  },

  consumeBoost(boostType, amount = 1) {
    const inventory = this.getBoostInventory();
    const current = Math.max(0, Math.floor(inventory[boostType] ?? 0));

    if (current < amount) return false;

    inventory[boostType] = current - amount;
    this.saveBoostInventory(inventory);
    return true;
  },
  getOwnedSkins() {
    const raw = localStorage.getItem('cubePathOwnedSkins');
    if (!raw) return ['classic'];

    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length ? parsed : ['classic'];
    } catch {
      return ['classic'];
    }
  },

  saveOwnedSkins(list) {
    const safe = Array.from(new Set(['classic', ...(list || [])]));
    localStorage.setItem('cubePathOwnedSkins', JSON.stringify(safe));
  },

  ownsSkin(skinId) {
    return this.getOwnedSkins().includes(skinId);
  },

  unlockSkin(skinId) {
    const list = this.getOwnedSkins();
    if (!list.includes(skinId)) {
      list.push(skinId);
      this.saveOwnedSkins(list);
    }
  },

  getEquippedSkin() {
    return localStorage.getItem('cubePathEquippedSkin') || 'classic';
  },

  setEquippedSkin(skinId) {
    localStorage.setItem('cubePathEquippedSkin', skinId);
  },

  getOwnedHats() {
    const raw = localStorage.getItem('cubePathOwnedHats');
    if (!raw) return ['none'];

    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length ? parsed : ['none'];
    } catch {
      return ['none'];
    }
  },

  saveOwnedHats(list) {
    const safe = Array.from(new Set(['none', ...(list || [])]));
    localStorage.setItem('cubePathOwnedHats', JSON.stringify(safe));
  },

  ownsHat(hatId) {
    return this.getOwnedHats().includes(hatId);
  },

  unlockHat(hatId) {
    const list = this.getOwnedHats();
    if (!list.includes(hatId)) {
      list.push(hatId);
      this.saveOwnedHats(list);
    }
  },

  getEquippedHat() {
    return localStorage.getItem('cubePathEquippedHat') || 'none';
  },

  setEquippedHat(hatId) {
    localStorage.setItem('cubePathEquippedHat', hatId);
  },
  canContinueCampaign() {
    const tutorialUnlocked = this.getUnlockedLevel('tutorial');
    const campaignUnlocked = this.getUnlockedLevel('campaign');

    return tutorialUnlocked > 0 || campaignUnlocked > 0;
  },

  getContinueCampaignLevel() {
    return Math.max(0, this.getUnlockedLevel('campaign'));
  },
  awardCubeCoinsForNewStars(mode, levelIndex, nextComponents) {
    const before = this.getStarComponents(mode, levelIndex);
    const beforeCount = this.countStarsFromComponents(before);

    const merged = this.saveStarComponents(mode, levelIndex, nextComponents);
    const afterCount = this.countStarsFromComponents(merged);

    const gained = Math.max(0, afterCount - beforeCount);
    if (gained > 0) {
      this.addCubeCoins(gained);
    }

    return {
      mergedComponents: merged,
      gainedCubeCoins: gained,
      totalCubeCoins: this.getCubeCoins()
    };
  },

  getTotalLevels(mode = this.getMode()) {
    if (mode === 'tutorial') return window.CubePathData.tutorialLevels.length;
    if (mode === 'campaign') return 100;
    if (mode === 'survival') return 999999;
    return 0;
  },

  resetAllProgress() {
    const modes = ['tutorial', 'campaign', 'survival'];

    localStorage.removeItem('cubePathMode');
    localStorage.removeItem('cubePathSurvivalBest');
    localStorage.removeItem('cubePathAudioSettings');
    localStorage.removeItem('cubePathCubeCoins');
    localStorage.removeItem('cubePathBoostInventory');
    localStorage.removeItem('cubePathOwnedSkins');
    localStorage.removeItem('cubePathEquippedSkin');
    localStorage.removeItem('cubePathOwnedHats');
    localStorage.removeItem('cubePathEquippedHat');

    for (const mode of modes) {
      localStorage.removeItem(`cubePathCurrentLevel_${mode}`);
      localStorage.removeItem(`cubePathUnlockedLevel_${mode}`);

      for (let i = 0; i < 200; i++) {
        localStorage.removeItem(`cubePathBestTime_${mode}_${i}`);
        localStorage.removeItem(`cubePathBestMoves_${mode}_${i}`);
        localStorage.removeItem(`cubePathStarComponents_${mode}_${i}`);
      }
    }
  }
};