export interface NPCDef {
  id: string;
  name: string;
  role: string;
  description: string;
}

export const npcs: Record<string, NPCDef> = {
  hermit: {
    id: 'hermit',
    name: 'Отшельник',
    role: 'Проводник',
    description: 'Старик у начала тропы. Говорит мало, но каждое слово — как камень в фундаменте.',
  },
  vera: {
    id: 'vera',
    name: 'Вера',
    role: 'Спутница — доверие',
    description: 'Тёплая, открытая. Верит в людей и в то, что вместе — легче.',
  },
  lin: {
    id: 'lin',
    name: 'Лин',
    role: 'Спутник — внимательность',
    description: 'Собиратель звуков. Учит слушать мир и себя.',
  },
  ira: {
    id: 'ira',
    name: 'Ира',
    role: 'Спутница — лёгкость',
    description: 'Смотрит на облака и находит красоту в сером. Учит не бороться с тревогой, а добавлять рядом что-то светлое.',
  },
  keeper: {
    id: 'keeper',
    name: 'Хранитель',
    role: 'Хранитель ущелья',
    description: 'Молчаливый страж Ущелья Эха. Помогает пройти через воспоминания.',
  },
  mira: {
    id: 'mira',
    name: 'Мира',
    role: 'Спутница — принятие',
    description: 'Живёт у Туманной Топи. Не боится тумана, потому что научилась дышать в нём.',
  },
  tikhon: {
    id: 'tikhon',
    name: 'Тихон',
    role: 'Спутник — покой',
    description: 'Садовник Сада Забытых Имён. Ухаживает за тем, что другие оставили.',
  },
};
