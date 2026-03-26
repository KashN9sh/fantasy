export interface ItemDef {
  id: string;
  name: string;
  description: string;
  symbolism: string;
}

export const items: Record<string, ItemDef> = {
  'revived-petal': {
    id: 'revived-petal',
    name: 'Ожившийлепесток',
    description: 'Лепесток цветка, который ты спас от увядания.',
    symbolism: 'Забота возвращается. Даже маленькое действие может вернуть к жизни.',
  },
  'meadow-bouquet': {
    id: 'meadow-bouquet',
    name: 'Букет с луга',
    description: 'Три полевых цветка — голубой, жёлтый, белый.',
    symbolism: 'Простая красота. Не нужно искать совершенство.',
  },
  'hermit-lantern': {
    id: 'hermit-lantern',
    name: 'Фонарь Отшельника',
    description: 'Маленький фонарь, который светит тёплым, неярким светом.',
    symbolism: 'Свет не обязан быть ярким, чтобы помогать.',
  },
  'echo-stone': {
    id: 'echo-stone',
    name: 'Камень Эха',
    description: 'Гладкий камень из ущелья. Если приложить к уху — слышно тихое гудение.',
    symbolism: 'Прошлое не исчезает, но становится тише.',
  },
  'fog-thread': {
    id: 'fog-thread',
    name: 'Нить тумана',
    description: 'Тонкая, почти невидимая нить. Холодная на ощупь, но не пугает.',
    symbolism: 'Тревога может быть тонкой, как нить. И такой же — преходящей.',
  },
  'warm-coal': {
    id: 'warm-coal',
    name: 'Тёплый уголёк',
    description: 'Уголёк от костра, который никогда не остывает.',
    symbolism: 'Тепло, которое мы несём внутри — не гаснет.',
  },
  'mirror-shard': {
    id: 'mirror-shard',
    name: 'Осколок зеркала',
    description: 'Показывает не отражение, а мягкий свет.',
    symbolism: 'Самопознание — не всегда отражение. Иногда — просто свет.',
  },
  'root-fragment': {
    id: 'root-fragment',
    name: 'Кусочек корня',
    description: 'Часть Корня — глубинной основы тропы.',
    symbolism: 'Связь с тем, что глубже тревоги. С самой сутью.',
  },
};
