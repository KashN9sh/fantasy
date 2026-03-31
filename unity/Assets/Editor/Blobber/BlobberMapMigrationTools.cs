#if UNITY_EDITOR
using System.Collections.Generic;
using TikhayaTropa.Blobber.Data;
using UnityEditor;
using UnityEngine;

namespace TikhayaTropa.EditorTools.Blobber
{
    public static class BlobberMapMigrationTools
    {
        [MenuItem("TikhayaTropa/Blobber/Create CH1+CH2 Map Assets")]
        public static void CreateChapterMaps()
        {
            BlobberAssetBootstrap.Bootstrap();
            CreateOrUpdate("Assets/Blobber/Data/BlobberMeadow.asset", MeadowMap(), MeadowObjects());
            CreateOrUpdate("Assets/Blobber/Data/BlobberFogGrove.asset", FogMap(), FogObjects());
            EnsureDialogueTrees();
            EnsureLogicGraphs();
            AssetDatabase.SaveAssets();
            Debug.Log("Blobber CH1/CH2 assets prepared.");
        }

        static void EnsureDialogueTrees()
        {
            var db = AssetDatabase.LoadAssetAtPath<BlobberDialogueDatabase>("Assets/Blobber/Data/BlobberDialogueDatabase.asset");
            if (db == null) return;

            EnsureDialogue(db, "hermit_intro", "node-start",
                "Отшельник сидит на тёплом камне. «Не торопись. Что у тебя внутри сейчас громче всего?»",
                ("Мне тяжело.", "node-a"), ("Не знаю, просто иду.", "node-b"));
            EnsureNode(db, "hermit_intro", "node-a",
                "«Тяжесть — честный спутник. Она не уйдёт сразу, но её можно нести бережно.»");
            EnsureNode(db, "hermit_intro", "node-b",
                "«Честно — тоже путь. Иногда этого достаточно, чтобы сделать следующий шаг.»");

            EnsureDialogue(db, "vera_fog", "node-start",
                "Вера разворачивает карту. «В тумане не нужно видеть весь путь. Достаточно видеть следующий шаг».",
                ("Я боюсь ошибиться.", "node-a"), ("Тогда пойду медленнее.", "node-b"));
            EnsureNode(db, "vera_fog", "node-a",
                "«Ошибиться не страшно. Страшнее стоять на месте, когда сердце просит идти». ");
            EnsureNode(db, "vera_fog", "node-b",
                "«Это хороший выбор. Медленный шаг лучше, чем никакой». ");

            EditorUtility.SetDirty(db);
        }

        static void EnsureLogicGraphs()
        {
            var logicDb = AssetDatabase.LoadAssetAtPath<BlobberLogicGraphDatabase>("Assets/Blobber/Data/BlobberLogicGraphDatabase.asset");
            if (logicDb == null) return;

            EnsureGraph(logicDb, "cat_scare_graph", "Cat Scare Graph", BlobberLogicEventType.OnPlayerNear);
            EnsureGraph(logicDb, "door_transition_graph", "Door Transition Graph", BlobberLogicEventType.OnInteract);
            EnsureGraph(logicDb, "sprite_swap_graph", "Sprite Swap Graph", BlobberLogicEventType.OnInteract);
            EditorUtility.SetDirty(logicDb);
        }

        static void EnsureGraph(BlobberLogicGraphDatabase db, string graphId, string displayName, BlobberLogicEventType evt)
        {
            var graph = db.graphs.Find(g => g.graphId == graphId);
            if (graph == null)
            {
                graph = new BlobberLogicGraphData
                {
                    graphId = graphId,
                    displayName = displayName
                };
                graph.nodes.Add(new BlobberLogicNodeData
                {
                    id = $"{graphId}_event",
                    title = "Event",
                    nodeType = BlobberLogicNodeType.Event,
                    eventType = evt,
                    editorPosition = new Vector2(100, 120)
                });
                db.graphs.Add(graph);
            }
        }

        static void EnsureDialogue(BlobberDialogueDatabase db, string id, string rootId, string rootText, params (string label, string nextId)[] choices)
        {
            var tree = db.dialogues.Find(d => d.dialogueId == id);
            if (tree == null)
            {
                tree = new BlobberDialogueTree { dialogueId = id, rootNodeId = rootId };
                db.dialogues.Add(tree);
            }

            var root = tree.nodes.Find(n => n.id == rootId);
            if (root == null)
            {
                root = new BlobberDialogueNode { id = rootId };
                tree.nodes.Add(root);
            }

            root.text = rootText;
            root.choices.Clear();
            foreach (var ch in choices)
                root.choices.Add(new BlobberDialogueChoiceNode { label = ch.label, nextNodeId = ch.nextId });
        }

        static void EnsureNode(BlobberDialogueDatabase db, string treeId, string nodeId, string text)
        {
            var tree = db.dialogues.Find(d => d.dialogueId == treeId);
            if (tree == null) return;
            var node = tree.nodes.Find(n => n.id == nodeId);
            if (node == null)
            {
                node = new BlobberDialogueNode { id = nodeId };
                tree.nodes.Add(node);
            }
            node.text = text;
            node.choices.Clear();
        }

        static void CreateOrUpdate(string path, string[] rows, List<BlobberObjectInstance> objs)
        {
            var map = AssetDatabase.LoadAssetAtPath<BlobberMapAsset>(path);
            if (map == null)
            {
                map = ScriptableObject.CreateInstance<BlobberMapAsset>();
                AssetDatabase.CreateAsset(map, path);
            }

            map.Resize(rows[0].Length, rows.Length);
            for (var y = 0; y < rows.Length; y++)
            for (var x = 0; x < rows[y].Length; x++)
            {
                var c = rows[rows.Length - 1 - y][x];
                map.SetTile(x, y, c == '#' ? BlobberTileKind.Wall : BlobberTileKind.Floor);
                if (c == 'S') map.startCell = new Vector2Int(x, y);
            }
            map.objects = objs;
            EditorUtility.SetDirty(map);
        }

        static string[] MeadowMap() => new[]
        {
            "##################",
            "#S...............#",
            "#........###.....#",
            "#........#.#.....#",
            "#....##..#.#.....#",
            "#....##..#.#.....#",
            "#........#.#.....#",
            "#.....#..#.......#",
            "#.....#..........#",
            "#.....#..........#",
            "##################"
        };

        static string[] FogMap() => new[]
        {
            "##################",
            "#S.....####......#",
            "#......#..#......#",
            "#..M...#..#..##..#",
            "#......#..#..##..#",
            "#......####......#",
            "#..........###...#",
            "#..........#.#...#",
            "#...####...#.#...#",
            "#...#......#.....#",
            "##################"
        };

        static List<BlobberObjectInstance> MeadowObjects() => new()
        {
            Obj("gate","inspect",new Vector2Int(2,2),BlobberInteractionType.Inspect,"Осмотреть калитку","На потемневшем дереве вырезано: «Кто идёт — тот уже начал»."),
            Obj("hermit","npc",new Vector2Int(6,4),BlobberInteractionType.NpcDialogue,"Поговорить с отшельником","",dialogueId:"hermit_intro"),
            Obj("well","inspect",new Vector2Int(8,7),BlobberInteractionType.Inspect,"Заглянуть в колодец","В глубине не видно воды."),
            Obj("bench","inspect",new Vector2Int(11,8),BlobberInteractionType.Inspect,"Присесть на скамейку","На спинке едва видно: «Я был здесь. Мне стало легче.»"),
            Obj("to_fog","door",new Vector2Int(15,6),BlobberInteractionType.SceneTransition,"Войти в туманную рощу","","BlobberFogGrove")
        };

        static List<BlobberObjectInstance> FogObjects() => new()
        {
            Obj("signpost","inspect",new Vector2Int(4,3),BlobberInteractionType.Inspect,"Осмотреть потерянный указатель","Три стрелки смотрят в разные стороны."),
            Obj("vera","npc",new Vector2Int(7,4),BlobberInteractionType.NpcDialogue,"Поговорить с Верой","",dialogueId:"vera_fog"),
            Obj("fireflies","inspect",new Vector2Int(10,8),BlobberInteractionType.Inspect,"Подождать светлячков","Светлячки собираются ближе."),
            Obj("cat","cat",new Vector2Int(8,6),BlobberInteractionType.CatScare,"Подойти к коту","",targetScene:""),
            Obj("to_meadow","door",new Vector2Int(16,6),BlobberInteractionType.SceneTransition,"Выйти к деревне огоньков","","Meadow")
        };

        static BlobberObjectInstance Obj(string id,string catalogId,Vector2Int cell,BlobberInteractionType type,string prompt,string message,string targetScene="",string dialogueId="")
        {
            return new BlobberObjectInstance
            {
                id=id,
                catalogId=catalogId,
                cell=cell,
                interactionType=type,
                parameters = new BlobberObjectParams
                {
                    prompt=prompt,
                    message=message,
                    targetScene=targetScene,
                    dialogueId=dialogueId,
                    logicGraphId = type == BlobberInteractionType.CatScare ? "cat_scare_graph" :
                                   type == BlobberInteractionType.SceneTransition ? "door_transition_graph" :
                                   string.Empty
                }
            };
        }
    }
}
#endif
