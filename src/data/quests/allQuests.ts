import type { QuestDef } from '../../systems/QuestManager';

export const allQuests: QuestDef[] = [
  // ============================================================
  // MAIN STORY
  // ============================================================

  {
    id: 'chapter-1',
    title: 'Глава 1: Первый шаг',
    description: 'Пройти калитку, освоиться на тропе, встретить Отшельника.',
    phases: [
      {
        id: 'act-1',
        description: 'Пройти через калитку и исследовать луга.',
        advanceWhen: { type: 'flag', flag: 'gate-opened' },
        nextPhase: 'act-2',
      },
      {
        id: 'act-2',
        description: 'Встретить Отшельника и ответить на его вопрос.',
        advanceWhen: { type: 'flag', flag: 'hermit-q1-done' },
        nextPhase: 'completed',
      },
      {
        id: 'completed',
        description: 'Первые шаги сделаны.',
        enterEffects: {
          diaryEntry: {
            id: 'ch1-complete',
            title: 'Первые шаги',
            text: 'Порог пройден. Тропа только начинается.',
          },
        },
      },
    ],
  },

  {
    id: 'chapter-2',
    title: 'Глава 2: Голоса в тумане',
    description: 'Пройти рощу, встретить Веру, перейти мост.',
    phases: [
      {
        id: 'act-1',
        description: 'Войти в Туманную рощу.',
        advanceWhen: { type: 'flag', flag: 'entered-foggy-grove' },
        nextPhase: 'act-2',
      },
      {
        id: 'act-2',
        description: 'Встретить Веру и пройти рощу.',
        advanceWhen: { type: 'flag', flag: 'vera-met' },
        nextPhase: 'act-3',
      },
      {
        id: 'act-3',
        description: 'Перейти мост через овраг.',
        advanceWhen: { type: 'flag', flag: 'bridge-crossed' },
        nextPhase: 'completed',
      },
      {
        id: 'completed',
        description: 'Роща пройдена.',
        enterEffects: {
          diaryEntry: {
            id: 'ch2-complete',
            title: 'Сквозь туман',
            text: 'Роща научила: можно идти, даже когда не видно далеко.',
          },
        },
      },
    ],
  },

  {
    id: 'chapter-3',
    title: 'Глава 3: Тёплые огни',
    description: 'Познакомиться с жителями Деревни Огоньков.',
    phases: [
      {
        id: 'act-1',
        description: 'Войти в деревню.',
        advanceWhen: { type: 'flag', flag: 'entered-firefly-village' },
        nextPhase: 'act-2',
      },
      {
        id: 'act-2',
        description: 'Познакомиться с жителями и побывать у костра.',
        advanceWhen: {
          type: 'any',
          conditions: [
            { type: 'flag', flag: 'bonfire-scene' },
            { type: 'flag', flag: 'mila-met' },
          ],
        },
        nextPhase: 'completed',
      },
      {
        id: 'completed',
        description: 'Деревня стала домом на тропе.',
        enterEffects: {
          diaryEntry: {
            id: 'ch3-complete',
            title: 'Деревня',
            text: 'Деревня Огоньков — место, где можно согреться.',
          },
        },
      },
    ],
  },

  {
    id: 'chapter-4',
    title: 'Глава 4: Течение',
    description: 'Встретить Лина и Иру. Отпустить прошлое.',
    phases: [
      {
        id: 'act-1',
        description: 'Прийти на берег.',
        advanceWhen: { type: 'flag', flag: 'entered-quiet-river' },
        nextPhase: 'act-2',
      },
      {
        id: 'act-2',
        description: 'Встретить Лина или Иру, посетить Камни Памяти.',
        advanceWhen: {
          type: 'any',
          conditions: [
            { type: 'flag', flag: 'lin-tree-heard' },
            { type: 'flag', flag: 'stone-released' },
          ],
        },
        nextPhase: 'completed',
      },
      {
        id: 'completed',
        description: 'Река унесла то, что готов отпустить.',
        enterEffects: {
          diaryEntry: {
            id: 'ch4-complete',
            title: 'Река',
            text: 'Река уносит то, что мы готовы отпустить.',
          },
        },
      },
    ],
  },

  {
    id: 'chapter-5',
    title: 'Глава 5: Эхо внутри',
    description: 'Различить свои мысли от чужих. Вторая встреча с Отшельником.',
    phases: [
      {
        id: 'act-1',
        description: 'Подняться на Холмы Шёпота.',
        advanceWhen: { type: 'flag', flag: 'entered-whisper-hills' },
        nextPhase: 'act-2',
      },
      {
        id: 'act-2',
        description: 'Встретить Отшельника в пещере.',
        advanceWhen: { type: 'flag', flag: 'hermit-q2-done' },
        nextPhase: 'completed',
      },
      {
        id: 'completed',
        description: 'Начал различать свои мысли от шума.',
        enterEffects: {
          diaryEntry: {
            id: 'ch5-complete',
            title: 'Холмы',
            text: 'Свои мысли — тёплые. Чужие — холодные. Теперь я слышу разницу.',
          },
        },
      },
    ],
  },

  {
    id: 'chapter-6',
    title: 'Глава 6: Отражения',
    description: 'Столкнуться с привычкой сравнивать. Увидеть себя.',
    phases: [
      {
        id: 'act-1',
        description: 'Войти в Рощу Зеркал.',
        advanceWhen: { type: 'flag', flag: 'entered-mirror-grove' },
        nextPhase: 'act-2',
      },
      {
        id: 'act-2',
        description: 'Заглянуть в Лужу правды.',
        advanceWhen: {
          type: 'any',
          conditions: [
            { type: 'flag', flag: 'truth-seen' },
            { type: 'flag', flag: 'truth-touched' },
            { type: 'flag', flag: 'truth-left' },
          ],
        },
        nextPhase: 'completed',
      },
      {
        id: 'completed',
        description: 'Встретился с привычкой сравнивать.',
        enterEffects: {
          diaryEntry: {
            id: 'ch6-complete',
            title: 'Зеркала',
            text: 'Чужой путь — только фрагмент. Мой узор — в том, что я делаю.',
          },
        },
      },
    ],
  },

  {
    id: 'chapter-7',
    title: 'Глава 7: Подъём',
    description: 'Пройти трудное, третья встреча с Отшельником.',
    phases: [
      {
        id: 'act-1',
        description: 'Начать подъём по горной тропе.',
        advanceWhen: { type: 'flag', flag: 'entered-mountain-path' },
        nextPhase: 'act-2',
      },
      {
        id: 'act-2',
        description: 'Встретить Отшельника у источника.',
        advanceWhen: { type: 'flag', flag: 'hermit-q3-done' },
        nextPhase: 'completed',
      },
      {
        id: 'completed',
        description: 'Прошёл самый трудный участок.',
        enterEffects: {
          diaryEntry: {
            id: 'ch7-complete',
            title: 'Вершина',
            text: 'Было трудно. И я смог. Не потому что сильный — потому что шёл.',
          },
        },
      },
    ],
  },

  {
    id: 'chapter-8',
    title: 'Глава 8: Сад',
    description: 'Интеграция пережитого. Финальная встреча.',
    phases: [
      {
        id: 'act-1',
        description: 'Войти в Сад Тишины.',
        advanceWhen: { type: 'flag', flag: 'entered-garden' },
        nextPhase: 'act-2',
      },
      {
        id: 'act-2',
        description: 'Ответить на четвёртый вопрос Отшельника.',
        advanceWhen: { type: 'flag', flag: 'hermit-q4-done' },
        nextPhase: 'act-3',
      },
      {
        id: 'act-3',
        description: 'Посадить что-то в своём участке.',
        advanceWhen: { type: 'flag', flag: 'ritual-plant-done' },
        nextPhase: 'completed',
      },
      {
        id: 'completed',
        description: 'Сад тишины заполнен.',
        enterEffects: {
          diaryEntry: {
            id: 'ch8-complete',
            title: 'Сад',
            text: 'Тревога осталась. Но тропа стала тише.',
          },
        },
      },
    ],
  },

  // ============================================================
  // SIDE QUESTS
  // ============================================================

  {
    id: 'vera-map',
    title: 'Вспомнить тропу',
    description: 'Помочь Вере описать места для карты.',
    phases: [
      {
        id: 'act-1',
        description: 'Вера попросила описать три места: мост, поляну и развилку.',
        enterEffects: {
          diaryEntry: {
            id: 'vera-map-start',
            title: 'Карта Веры',
            text: 'Вера рисует карту, но линии обрываются. Она просит описать места — мост, поляну, развилку.',
          },
        },
        advanceWhen: { type: 'flag', flag: 'vera-bridge-described' },
        nextPhase: 'act-2',
      },
      {
        id: 'act-2',
        description: 'Описать ещё два места.',
        advanceWhen: { type: 'flag', flag: 'vera-places-described' },
        nextPhase: 'act-3',
      },
      {
        id: 'act-3',
        description: 'Вернуться к Вере с описаниями.',
        advanceWhen: { type: 'flag', flag: 'vera-map-delivered' },
        nextPhase: 'completed',
      },
      {
        id: 'completed',
        description: 'Карта готова.',
        enterEffects: {
          addItems: ['vera-map'],
          params: { acceptance: 3, trust: 3 },
          diaryEntry: {
            id: 'vera-map-done',
            title: 'Карта готова',
            text: 'Вера дорисовала карту. Честная или красивая — но её.',
          },
        },
      },
      {
        id: 'expired',
        description: 'Вера ушла, не дождавшись.',
        enterEffects: {
          setFlags: ['vera-left'],
          diaryEntry: {
            id: 'vera-map-expired',
            title: 'Пустое место',
            text: 'Вера ушла. Записка: «Я пошла искать дорогу сама.»',
          },
        },
      },
    ],
    inactivity: [
      { phase: 'act-1', limit: 3, expiredPhase: 'expired' },
      { phase: 'act-2', limit: 3, expiredPhase: 'expired' },
    ],
    npcDialogues: [
      {
        npcId: 'vera',
        routes: {
          'act-1': 'vera-quest-act1',
          'act-2': 'vera-quest-act2',
          'act-3': 'vera-quest-act3',
          'completed': 'vera-quest-done',
          'expired': 'vera-expired',
        },
      },
    ],
  },

  {
    id: 'lin-tree',
    title: 'Сухое дерево',
    description: 'Помочь Лину решить, что делать с засохшим деревом.',
    phases: [
      {
        id: 'act-1',
        description: 'Лин рассказал о дереве. Нужно вернуться позже.',
        enterEffects: {
          diaryEntry: {
            id: 'lin-tree-start',
            title: 'Сухое дерево',
            text: 'Лин поливал дерево каждый день. А оно всё равно засохло.',
          },
        },
        advanceWhen: { type: 'flag', flag: 'lin-returned' },
        nextPhase: 'act-2',
      },
      {
        id: 'act-2',
        description: 'Лин бросил лейку. Предложить решение.',
        advanceWhen: {
          type: 'any',
          conditions: [
            { type: 'flag', flag: 'lin-chose-plant' },
            { type: 'flag', flag: 'lin-chose-memorial' },
            { type: 'flag', flag: 'lin-chose-leave' },
          ],
        },
        nextPhase: 'act-3',
      },
      {
        id: 'act-3',
        description: 'Увидеть результат выбора.',
        advanceWhen: { type: 'flag', flag: 'lin-tree-resolved' },
        nextPhase: 'completed',
      },
      {
        id: 'completed',
        description: 'Дерево обрело смысл.',
        enterEffects: {
          params: { acceptance: 5 },
          diaryEntry: {
            id: 'lin-tree-done',
            title: 'Решение Лина',
            text: 'У дерева теперь есть история. И это важнее, чем листья.',
          },
        },
      },
      {
        id: 'expired',
        description: 'Лин ушёл от дерева.',
        enterEffects: {
          setFlags: ['lin-left'],
          diaryEntry: {
            id: 'lin-tree-expired',
            title: 'Лин ушёл',
            text: 'У дерева — записка: «Я не дождался, пока кто-то подскажет.»',
          },
        },
      },
    ],
    inactivity: [
      { phase: 'act-2', limit: 3, expiredPhase: 'expired' },
    ],
    npcDialogues: [
      {
        npcId: 'lin',
        routes: {
          'act-1': 'lin-tree-act1',
          'act-2': 'lin-tree-act2',
          'act-3': 'lin-tree-act3',
          'completed': 'lin-tree-done',
          'expired': 'lin-expired',
        },
      },
    ],
  },

  {
    id: 'ira-jug',
    title: 'Кувшин историй',
    description: 'Рассказать Ире о пережитом на тропе.',
    phases: [
      {
        id: 'collecting',
        description: 'Рассказывать Ире истории после значимых событий.',
        enterEffects: {
          diaryEntry: {
            id: 'ira-jug-start',
            title: 'Кувшин',
            text: 'Ира собирает истории. Не свои — чужие. Я согласился рассказать.',
          },
        },
        advanceWhen: { type: 'flag', flag: 'ira-jug-full' },
        nextPhase: 'completed',
      },
      {
        id: 'completed',
        description: 'Кувшин наполнен.',
        enterEffects: {
          addItems: ['echo-jug'],
          params: { trust: 5, acceptance: 3 },
          diaryEntry: {
            id: 'ira-jug-done',
            title: 'Полный кувшин',
            text: 'Кувшин полон историй. Ира: «Ты наполнил его жизнью.»',
          },
        },
      },
    ],
    npcDialogues: [
      {
        npcId: 'ira',
        routes: {
          'collecting': 'ira-jug-collecting',
          'completed': 'ira-jug-done',
        },
      },
    ],
  },

  {
    id: 'mila-tea',
    title: 'Рецепт спокойствия',
    description: 'Собрать травы для Милы и заварить чай.',
    phases: [
      {
        id: 'gathering',
        description: 'Собрать: дикий шалфей (Камни Памяти), лаванду (дупло в роще), мяту (луга у скамейки).',
        enterEffects: {
          diaryEntry: {
            id: 'mila-tea-start',
            title: 'Рецепт Милы',
            text: 'Мила не спит. Ей нужны шалфей, лаванда и мята — для чая спокойствия.',
          },
        },
        advanceWhen: {
          type: 'all',
          conditions: [
            { type: 'item', item: 'wild-sage' },
            { type: 'item', item: 'dried-lavender' },
            {
              type: 'any',
              conditions: [
                { type: 'item', item: 'wild-mint' },
                { type: 'item', item: 'garden-mint' },
              ],
            },
          ],
        },
        nextPhase: 'brewing',
      },
      {
        id: 'brewing',
        description: 'Вернуться к Миле и заварить чай.',
        advanceWhen: { type: 'flag', flag: 'mila-tea-brewed' },
        nextPhase: 'completed',
      },
      {
        id: 'completed',
        description: 'Чай заварен. Мила спокойна.',
        enterEffects: {
          addItems: ['mila-cup'],
          removeItems: ['wild-sage', 'dried-lavender', 'wild-mint', 'garden-mint'],
          params: { care: 8, trust: 5 },
          diaryEntry: {
            id: 'mila-tea-done',
            title: 'Чай спокойствия',
            text: 'Заварили чай вместе. Мила заснула — впервые за долгое время.',
          },
        },
      },
      {
        id: 'partial',
        description: 'Не все травы найдены, но Мила благодарна.',
        enterEffects: {
          params: { care: 3 },
          diaryEntry: {
            id: 'mila-tea-partial',
            title: 'Неполный рецепт',
            text: 'Не хватило трав. Мила: «Не тот рецепт, но мне стало теплее.»',
          },
        },
      },
      {
        id: 'expired-tired',
        description: 'Мила устала ждать.',
        enterEffects: {
          setFlags: ['mila-tired'],
          diaryEntry: {
            id: 'mila-tired',
            title: 'Мила устала',
            text: 'У Милы тени под глазами. Она всё ещё ждёт трав.',
          },
        },
        advanceWhen: { type: 'flag', flag: 'mila-tea-brewed' },
        nextPhase: 'completed',
      },
      {
        id: 'expired-asleep',
        description: 'Мила заснула от усталости.',
        enterEffects: {
          setFlags: ['mila-asleep'],
          diaryEntry: {
            id: 'mila-asleep',
            title: 'Мила заснула',
            text: 'Мила заснула за столом в чайной. Не от чая — от усталости.',
          },
        },
      },
    ],
    inactivity: [
      { phase: 'gathering', limit: 3, expiredPhase: 'expired-tired' },
      { phase: 'expired-tired', limit: 2, expiredPhase: 'expired-asleep' },
    ],
    npcDialogues: [
      {
        npcId: 'mila',
        routes: {
          'gathering': 'mila-tea-gathering',
          'brewing': 'mila-tea-brewing',
          'completed': 'mila-tea-done',
          'expired-tired': 'mila-tired',
          'expired-asleep': 'mila-asleep',
        },
      },
    ],
  },

  {
    id: 'tom-melody',
    title: 'Тихая мелодия',
    description: 'Помочь Тому снова начать играть.',
    phases: [
      {
        id: 'act-1',
        description: 'Том не играет. Предложить сыграть для чего-то безопасного.',
        enterEffects: {
          diaryEntry: {
            id: 'tom-melody-start',
            title: 'Тихая мелодия',
            text: 'Том не играет. Руки немеют не от холода — от страха.',
          },
        },
        advanceWhen: {
          type: 'any',
          conditions: [
            { type: 'flag', flag: 'tom-try-wind' },
            { type: 'flag', flag: 'tom-try-fire' },
            { type: 'flag', flag: 'tom-try-note' },
          ],
        },
        nextPhase: 'act-2',
      },
      {
        id: 'act-2',
        description: 'Том пробует. Найти его и послушать.',
        advanceWhen: { type: 'flag', flag: 'tom-played' },
        nextPhase: 'act-3',
      },
      {
        id: 'act-3',
        description: 'Том играет увереннее.',
        advanceWhen: { type: 'flag', flag: 'tom-confident' },
        nextPhase: 'completed',
      },
      {
        id: 'completed',
        description: 'Том играет. Музыка вернулась.',
        enterEffects: {
          addItems: ['tom-notebook'],
          params: { trust: 5, care: 3 },
          diaryEntry: {
            id: 'tom-melody-done',
            title: 'Мелодия',
            text: 'Том: «Я не стал лучше играть. Я перестал бояться играть плохо.»',
          },
        },
      },
      {
        id: 'expired',
        description: 'Том ушёл.',
        enterEffects: {
          setFlags: ['tom-left'],
          diaryEntry: {
            id: 'tom-melody-expired',
            title: 'Тишина в беседке',
            text: 'Том ушёл. Записка: «Ушёл искать тишину подальше.»',
          },
        },
      },
    ],
    inactivity: [
      { phase: 'act-1', limit: 3, expiredPhase: 'expired' },
      { phase: 'act-2', limit: 3, expiredPhase: 'expired' },
    ],
    npcDialogues: [
      {
        npcId: 'tom',
        routes: {
          'act-1': 'tom-melody-act1',
          'act-2': 'tom-melody-act2',
          'act-3': 'tom-melody-act3',
          'completed': 'tom-melody-done',
          'expired': 'tom-expired',
        },
      },
    ],
  },

  {
    id: 'fedya-letter',
    title: 'Письмо тому, кто заблудится',
    description: 'Прочитать письмо и решить, что с ним делать.',
    phases: [
      {
        id: 'received',
        description: 'Федя вручил письмо. Прочитать и решить.',
        enterEffects: {
          addItems: ['fedya-letter'],
          diaryEntry: {
            id: 'fedya-letter-start',
            title: 'Письмо',
            text: 'Федя вручил конверт: «Это для того, кто заблудится после тебя.»',
          },
        },
        advanceWhen: {
          type: 'any',
          conditions: [
            { type: 'flag', flag: 'fedya-letter-left' },
            { type: 'flag', flag: 'fedya-letter-kept' },
          ],
        },
        nextPhase: 'completed',
      },
      {
        id: 'completed',
        description: 'Письмо нашло место.',
        enterEffects: {
          params: { trust: 3 },
        },
      },
    ],
  },

  {
    id: 'kostya-bread',
    title: 'Хлеб для странника',
    description: 'Отнести хлеб тому, кому нужно.',
    phases: [
      {
        id: 'carrying',
        description: 'Костя дал буханку. Отнести кому-нибудь — но не тянуть.',
        enterEffects: {
          addItems: ['fresh-bread'],
          diaryEntry: {
            id: 'kostya-bread-start',
            title: 'Хлеб',
            text: 'Костя: «Отнеси кому-нибудь. Только не тяни — хлеб чёрствеет.»',
          },
        },
        advanceWhen: { type: 'flag', flag: 'bread-delivered' },
        nextPhase: 'completed',
      },
      {
        id: 'completed',
        description: 'Хлеб доставлен.',
        enterEffects: {
          removeItems: ['fresh-bread', 'stale-bread'],
          params: { care: 5, trust: 3 },
          diaryEntry: {
            id: 'kostya-bread-done',
            title: 'Хлеб доставлен',
            text: 'Хлеб нашёл, кого нужно.',
          },
        },
      },
      {
        id: 'stale',
        description: 'Хлеб зачерствел.',
        enterEffects: {
          removeItems: ['fresh-bread'],
          addItems: ['stale-bread'],
          diaryEntry: {
            id: 'kostya-bread-stale',
            title: 'Чёрствый хлеб',
            text: 'Хлеб зачерствел. Костя: «Чёрствый тоже можно размочить в чае.»',
          },
        },
        advanceWhen: { type: 'flag', flag: 'bread-delivered' },
        nextPhase: 'completed',
      },
    ],
    inactivity: [
      { phase: 'carrying', limit: 2, expiredPhase: 'stale' },
    ],
  },

  {
    id: 'yarik-anchor',
    title: 'Якорь',
    description: 'Помочь Ярику выковать Якорь.',
    phases: [
      {
        id: 'forging',
        description: 'Держать меха, пока Ярик куёт.',
        enterEffects: {
          diaryEntry: {
            id: 'yarik-anchor-start',
            title: 'Якорь',
            text: 'Ярик: «Я кую якори. Не для кораблей — для людей.»',
          },
        },
        advanceWhen: { type: 'flag', flag: 'anchor-forged' },
        nextPhase: 'completed',
      },
      {
        id: 'completed',
        description: 'Якорь готов.',
        enterEffects: {
          addItems: ['yarik-anchor'],
          params: { acceptance: 3 },
          diaryEntry: {
            id: 'yarik-anchor-done',
            title: 'Якорь готов',
            text: 'Маленький, тяжёлый. Чтобы, когда несёт — было за что ухватиться.',
          },
        },
      },
    ],
  },

  {
    id: 'polina-book',
    title: 'Забытая книга',
    description: 'Найти книгу Полины.',
    phases: [
      {
        id: 'searching',
        description: 'Полина: «Книга найдёт тебя сама. Ты просто будь внимателен.»',
        enterEffects: {
          diaryEntry: {
            id: 'polina-book-start',
            title: 'Забытая книга',
            text: 'Полина: «Она найдёт тебя сама. Просто будь внимателен.»',
          },
        },
        advanceWhen: { type: 'item', item: 'polina-book' },
        nextPhase: 'found',
      },
      {
        id: 'found',
        description: 'Книга найдена. Вернуть или оставить.',
        advanceWhen: {
          type: 'any',
          conditions: [
            { type: 'flag', flag: 'book-returned' },
            { type: 'flag', flag: 'book-kept' },
          ],
        },
        nextPhase: 'completed',
      },
      {
        id: 'completed',
        description: 'Книга нашла место.',
        enterEffects: {
          params: { selfKnowledge: 5 },
          diaryEntry: {
            id: 'polina-book-done',
            title: 'Книга',
            text: 'Книга нашлась. Внутри — история о тревоге, написанная тепло и бережно.',
          },
        },
      },
    ],
  },

  {
    id: 'raya-garden',
    title: 'Общий сад',
    description: 'Посадить что-то в общинном саду.',
    phases: [
      {
        id: 'planting',
        description: 'Выбрать семя и посадить.',
        enterEffects: {
          diaryEntry: {
            id: 'raya-garden-start',
            title: 'Общий сад',
            text: 'Рая: «Хочешь посадить что-нибудь?»',
          },
        },
        advanceWhen: { type: 'flag', flag: 'raya-planted' },
        nextPhase: 'completed',
      },
      {
        id: 'completed',
        description: 'Посажено.',
        enterEffects: {
          params: { care: 5 },
          diaryEntry: {
            id: 'raya-garden-done',
            title: 'Посадка',
            text: 'Рая: «Важно не что посадил — а что при этом чувствовал.»',
          },
        },
      },
    ],
  },

  {
    id: 'mark-star',
    title: 'Звезда без имени',
    description: 'Назвать звезду.',
    phases: [
      {
        id: 'naming',
        description: 'Марк показал безымянную звезду.',
        enterEffects: {
          diaryEntry: {
            id: 'mark-star-start',
            title: 'Звезда',
            text: 'Марк: «У неё нет имени. Назови.»',
          },
        },
        advanceWhen: { type: 'flag', flag: 'star-named' },
        nextPhase: 'completed',
      },
      {
        id: 'completed',
        description: 'Звезда названа.',
        enterEffects: {
          params: { selfKnowledge: 3 },
          diaryEntry: {
            id: 'mark-star-done',
            title: 'Имя звезды',
            text: 'Марк: «Теперь она — твоя. Всегда была, просто не знала имени.»',
          },
        },
      },
    ],
  },

  {
    id: 'nina-thread',
    title: 'Узоры памяти',
    description: 'Рассказать Нине свой узор.',
    phases: [
      {
        id: 'choosing',
        description: 'Нина просит описать узор — цветом и ощущением.',
        enterEffects: {
          diaryEntry: {
            id: 'nina-thread-start',
            title: 'Узоры',
            text: 'Нина: «Каждый несёт узор. Расскажи мне свой.»',
          },
        },
        advanceWhen: { type: 'flag', flag: 'nina-pattern-chosen' },
        nextPhase: 'weaving',
      },
      {
        id: 'weaving',
        description: 'Нина ткёт клубок.',
        advanceWhen: { type: 'flag', flag: 'nina-thread-done' },
        nextPhase: 'completed',
      },
      {
        id: 'completed',
        description: 'Клубок готов.',
        enterEffects: {
          addItems: ['nina-thread'],
          params: { selfKnowledge: 5 },
          diaryEntry: {
            id: 'nina-thread-complete',
            title: 'Клубок',
            text: 'Нина: «Вот. Твой клубок. Маленький, тёплый.»',
          },
        },
      },
    ],
    npcDialogues: [
      {
        npcId: 'nina',
        routes: {
          'choosing': 'nina-thread-choosing',
          'weaving': 'nina-thread-weaving',
          'completed': 'nina-thread-done',
        },
      },
    ],
  },
];
