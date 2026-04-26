window.CubePathI18n = (() => {
  const fallbackLanguage = 'ru';
  let currentLanguage = fallbackLanguage;
  let phaserPatched = false;

  const staticTranslations = {
    'Аркадная puzzle-lite игра': 'Arcade puzzle-lite game',
    'Продолжить': 'Continue',
    'Продолжить недоступно': 'Continue locked',
    'Кампания': 'Campaign',
    'Бесконечный режим': 'Endless Mode',
    'Выбор уровня': 'Level Select',
    'Магазин': 'Shop',
    'Настройки': 'Settings',
    'Управление': 'Controls',
    'Все клавиши и жесты — в разделе "Управление"': 'All keys and gestures: Controls',
    'Все клавиши и жесты — в "Управлении"': 'All keys and gestures: Controls',
    'Свайпы на телефоне, клавиши на ПК': 'Phone: swipe, PC: keys',
    'Свайп для телефона, клавиши для ПК': 'Phone: swipe, PC: keys',
    'ПК': 'PC',
    'Телефон': 'Phone',
    'W / A / S / D или стрелки — движение': 'W / A / S / D or arrows — move',
    'R — рестарт уровня': 'R — restart level',
    '1 / Z — буст ICE': '1 / Z — ICE boost',
    '2 / X — буст PWR': '2 / X — PWR boost',
    'Esc — пауза': 'Esc — pause',
    'Диагональный свайп — движение': 'Diagonal swipe — move',
    'Кнопка сверху справа — пауза': 'Top-right button — pause',
    'Кнопки ICE / PWR снизу — бусты': 'ICE / PWR buttons below — boosts',
    'Закрыть': 'Close',
    'Пауза': 'Pause',
    'Рестарт': 'Restart',
    'Продолжить': 'Continue',
    'Настройки': 'Settings',
    'В меню': 'Menu',
    'Меню': 'Menu',
    'Назад': 'Back',
    'Звук и музыка': 'Sound and music',
    'Звук': 'Sound',
    'Музыка': 'Music',
    'Общая громкость': 'Master volume',
    'Громкость эффектов': 'SFX volume',
    'Громкость музыки': 'Music volume',
    'ВКЛ': 'ON',
    'ВЫКЛ': 'OFF',
    'Колесо мыши / свайп вверх-вниз': 'Mouse wheel / swipe up-down',
    'Свайп вверх-вниз': 'Swipe up-down',
    'Свайп / колесо мыши': 'Swipe / mouse wheel',
    'Обучение': 'Tutorial',
    '3 коротких уровня с базовыми механиками': '3 short levels with basic mechanics',
    'Закрыт • в следующем обновлении': 'Locked • in the next update',
    'Стартовый биом': 'Starting biome',
    'В следующем обновлении': 'In the next update',
    'Бусты': 'Boosts',
    'Скины': 'Skins',
    'Шляпки': 'Hats',
    'Текущий вид': 'Current look',
    'Заморозка': 'Freeze',
    'Энергетик': 'Energy',
    'Останавливает разрушение плиток на короткое время': 'Stops tile breaking for a short time',
    'Ломает опасные клетки и преграды': 'Breaks dangerous tiles and obstacles',
    'Купить': 'Buy',
    'Не хватает': 'Not enough',
    'Надето': 'Equipped',
    'Куплено': 'Owned',
    'Надеть': 'Equip',
    'Не куплено': 'Not owned',
    'Доступно': 'Available',
    'Бесплатно': 'Free',
    'Снять': 'Unequip',
    'Не хватает кубикоинов': 'Not enough Cubecoins',
    'Скин куплен и надет': 'Skin purchased and equipped',
    'Шляпка куплена и надета': 'Hat purchased and equipped',
    'Этот скин уже куплен': 'This skin is already owned',
    'Эта шляпка уже куплена': 'This hat is already owned',
    'Шляпка снята': 'Hat removed',
    'Сейчас используется': 'Currently equipped',
    'Доступен для экипировки': 'Ready to equip',
    'Доступна для экипировки': 'Ready to equip',
    'Снять текущую шляпку': 'Remove current hat',
    'Украшение для кубика': 'Accessory for your cube',
    'Новый цвет кубика': 'New cube color',
    'Без шляпки': 'No hat',
    'Реклама загружается...': 'Loading ad...',
    'Реклама недоступна': 'Ad unavailable',
    'Награда не получена': 'Reward not received',
    'Получен буст: Заморозка': 'Boost received: Freeze',
    'Получен буст: Энергетик': 'Boost received: Energy',
    'Показ рекламы...': 'Showing ad...',
    'Все биомы открыты': 'All biomes unlocked',
    'Следующий биом открыт': 'Next biome unlocked',
    'Основная кампания завершена': 'Main campaign completed',
    'Попробуйте бесконечный режим': 'Try Endless Mode',
    'Ожидайте обновлений': 'More updates are coming',
    'Луг': 'Meadow',
    'Лёд': 'Ice',
    'Пустыня': 'Desert',
    'Вулкан': 'Volcano',
    'Руины': 'Ruins',
    'Классика': 'Classic',
    'Биом': 'Biome',
    'Прогресс до следующего биома': 'Progress to next biome',
    'Звук: ВКЛ': 'Sound: ON',
    'Звук: ВЫКЛ': 'Sound: OFF',
    'Обучение пройдено!': 'Tutorial complete!',
    'Кампания пройдена!': 'Campaign complete!',
    'Сумма лучших результатов:': 'Total best results:',
    'Лучшие результаты пока не найдены': 'No best results yet',
    'Играть заново': 'Play again',
    'Уровень пройден!': 'Level complete!',
    'Далее': 'Next',
    'Ты проиграл': 'You lost',
    'Использовать второй шанс?': 'Use a second chance?',
    'Возврат на последнюю безопасную клетку': 'Return to the last safe tile',
    'Второй шанс': 'Second chance',
    'Забег окончен': 'Run over',
    'Новый забег': 'New run',
    'Серый: ломается | Фиолетовый: быстро | Зеленый: прочный | Красный: смерть': 'Gray: breaks | Purple: fast | Green: sturdy | Red: death',
    'Лучшее': 'Best',
    'Монеты': 'Coins',
    'Кубикоины': 'Cubecoins',
    'Ходы': 'Moves',
    'Звезды кампании': 'Campaign stars',
    'Звук: ВКЛ': 'Sound: ON',
    'Звук: ВЫКЛ': 'Sound: OFF',
    'Рубин': 'Ruby',
    'Мята': 'Mint',
    'Небо': 'Sky',
    'Фиалка': 'Violet',
    'Обсидиан': 'Obsidian',
    'Изумруд': 'Emerald',
    'Закат': 'Sunset',
    'Роза': 'Rose',
    'Океан': 'Ocean',
    'Лимон': 'Lemon',
    'Иней': 'Frost',
    'Медь': 'Copper',
    'Бездна': 'Void',
    'Кепка': 'Cap',
    'Листик': 'Leaf',
    'Корона': 'Crown',
    'Шапка': 'Beanie',
    'Нимб': 'Halo',
    'Рожки': 'Horns',
    'Колпак': 'Party Hat',
    'Козырёк': 'Visor',
    'Антенна': 'Antenna',
    'Бантик': 'Bow',
    'Классический': 'Classic',
    'Неизвестно': 'Unknown',
    'Получено: +10 кубикоинов': 'Received: +10 Cubecoins',
    'Заморозка куплена': 'Freeze purchased',
    'Энергетик куплен': 'Energy purchased',
    'Смотреть рекламу за 10 кубикоинов': 'Watch an ad for 10 Cubecoins',
    'Смотреть рекламу за случайный буст': 'Watch an ad for a random boost',
    'Смотреть рекламу за второй шанс': 'Watch an ad for a second chance'
  };

  Object.assign(staticTranslations, {
    'Путь Кубика': 'Cube Path',
    '1 / Z — буст ЛЁД': '1 / Z — ICE boost',
    '2 / X — буст СИЛА': '2 / X — power boost',
    'Кнопки ЛЁД / СИЛА снизу — бусты': 'Bottom ICE / power buttons — boosts',
    'ЛЁД': 'ICE',
    'СИЛА': 'PWR',
    'Реклама начнется через': 'Ad starts in',
    'Сейчас откроется реклама': 'The ad is about to open',
    'Смотреть рекламу\nза 10 кубикоинов': 'Watch an ad\nfor 10 Cubecoins',
    'Реклама\nза 10 кубикоинов': 'Ad\nfor 10 Cubecoins',
    'Смотреть рекламу за случайный буст': 'Watch an ad for a random boost',
    'Смотреть рекламу за\nслучайный буст': 'Watch an ad for\na random boost',
    'Смотреть рекламу за\nвторой шанс': 'Watch an ad for\na second chance'
  });

  const dynamicTranslations = [
    [/^Уровень (\d+)$/, (match) => `Level ${match[1]}`],
    [/^Этап (\d+)$/, (match) => `Stage ${match[1]}`],
    [/^Время ([\d.,-]+)с$/, (match) => `Time ${match[1]}s`],
    [/^Кубикоинов:\s*(.+)$/, (match) => `Cubecoins: ${match[1]}`],
    [/^Кубикоины: (.+)$/, (match) => `Cubecoins: ${match[1]}`],
    [/^Монеты: (.+)$/, (match) => `Coins: ${match[1]}`],
    [/^Ходы: (.+)$/, (match) => `Moves: ${match[1]}`],
    [/^Лучшее: (.+) \/ (.+)$/, (match) => `Best: ${match[1]} / ${match[2]}`],
    [/^Биом: (.+)$/, (match) => `Biome: ${translateText(match[1])}`],
    [/^Звезды кампании: (.+)$/, (match) => `Campaign stars: ${match[1]}`],
    [/^До следующего биома: (.+)$/, (match) => `To the next biome: ${match[1]}`],
    [/^Пройдено уровней: (.+)$/, (match) => `Levels completed: ${match[1]}`],
    [/^Лучший результат: (.+)$/, (match) => `Best result: ${match[1]}`],
    [/^Скин: (.+)$/, (match) => `Skin: ${translateText(match[1])}`],
    [/^Шляпка: (.+)$/, (match) => `Hat: ${translateText(match[1])}`],
    [/^В наличии: (.+)$/, (match) => `Owned: ${match[1]}`],
    [/^Цена: (.+) кубикоинов$/, (match) => `Price: ${match[1]} Cubecoins`],
    [/^Цена: (.+)$/, (match) => `Price: ${match[1]}`],
    [/^Скин (.+) надет$/, (match) => `Skin ${translateText(match[1])} equipped`],
    [/^Шляпка (.+) надета$/, (match) => `Hat ${translateText(match[1])} equipped`],
    [/^Открыт • требуется (.+)★$/, (match) => `Unlocked • requires ${match[1]}★`],
    [/^Закрыт • требуется (.+)★$/, (match) => `Locked • requires ${match[1]}★`],
    [/^(.+)★ собрано$/, (match) => `${match[1]}★ collected`],
    [/^(.+)★ \/ (.+)★ • осталось (.+)★$/, (match) => `${match[1]}★ / ${match[2]}★ • ${match[3]}★ left`],
    [/^(.+)с \/ (.+)с$/, (match) => `${match[1]}s / ${match[2]}s`],
    [/^(.+)с \/ (.+) ходов$/, (match) => `${match[1]}s / ${match[2]} moves`],
    [/^Биом (\d+)$/, (match) => `Biome ${match[1]}`]
  ];

  function normalizeLanguage(language) {
    const value = String(language || '').trim().toLowerCase();

    if (!value) return fallbackLanguage;
    if (value.startsWith('ru')) return 'ru';
    return 'en';
  }

  function setDocumentLanguage(language) {
    if (document?.documentElement) {
      document.documentElement.lang = language;
    }
  }

  function translateArray(value) {
    return value.map((item) => translateValue(item));
  }

  function translateText(text) {
    if (typeof text !== 'string' || currentLanguage === 'ru') {
      return text;
    }

    const normalized = text.replace(/\r\n/g, '\n');

    if (Object.prototype.hasOwnProperty.call(staticTranslations, normalized)) {
      return staticTranslations[normalized];
    }

    for (const [pattern, handler] of dynamicTranslations) {
      const match = normalized.match(pattern);
      if (!match) continue;
      return handler(match);
    }

    if (normalized.includes('\n')) {
      return normalized.split('\n').map((line) => translateText(line)).join('\n');
    }

    return normalized;
  }

  function translateValue(value) {
    if (Array.isArray(value)) {
      return translateArray(value);
    }

    if (typeof value === 'string') {
      return translateText(value);
    }

    return value;
  }

  function patchPhaser(PhaserRef) {
    if (phaserPatched || !PhaserRef?.GameObjects?.GameObjectFactory || !PhaserRef?.GameObjects?.Text) {
      return;
    }

    phaserPatched = true;

    const originalFactoryText = PhaserRef.GameObjects.GameObjectFactory.prototype.text;
    PhaserRef.GameObjects.GameObjectFactory.prototype.text = function patchedFactoryText(x, y, text, style) {
      return originalFactoryText.call(this, x, y, translateValue(text), style);
    };

    const originalSetText = PhaserRef.GameObjects.Text.prototype.setText;
    PhaserRef.GameObjects.Text.prototype.setText = function patchedSetText(value) {
      return originalSetText.call(this, translateValue(value));
    };
  }

  function setLanguage(language) {
    currentLanguage = normalizeLanguage(language);
    setDocumentLanguage(currentLanguage);
    return currentLanguage;
  }

  function getLanguage() {
    return currentLanguage;
  }

  async function init() {
    setLanguage(fallbackLanguage);

    if (!window.CubePathAds?.init) {
      return currentLanguage;
    }

    try {
      await window.CubePathAds.init();
    } catch (_error) {
    }

    setLanguage(fallbackLanguage);
    return currentLanguage;
  }

  return {
    init,
    patchPhaser,
    setLanguage,
    getLanguage,
    translateText,
    translateValue
  };
})();
