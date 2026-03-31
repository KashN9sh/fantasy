#if UNITY_EDITOR
using System.Collections.Generic;
using System.IO;
using System.Linq;
using TikhayaTropa.Blobber;
using TikhayaTropa.Blobber.Data;
using TikhayaTropa.Blobber.Runtime;
using TikhayaTropa.Core;
using TikhayaTropa.UI;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.InputSystem.UI;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

namespace TikhayaTropa.EditorTools.Blobber
{
    public static class BlobberSceneBaker
    {
        public static void BakeSelected()
        {
            var map = Selection.activeObject as BlobberMapAsset;
            if (map == null)
            {
                Debug.LogError("Выбери BlobberMapAsset в Project.");
                return;
            }

            Bake(map, FindProjectSettings());
        }

        public static void Bake(BlobberMapAsset map, BlobberProjectSettings settings)
        {
            var outPath = ResolveScenePath(map);
            Directory.CreateDirectory(Path.GetDirectoryName(outPath) ?? "Assets/Scenes");
            var scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);

            BuildLighting();
            var systems = new GameObject("BlobberSystems");
            systems.AddComponent<BlobberQuestHooks>();

            var dungeon = new GameObject("BlobberDungeon");
            var geo = dungeon.AddComponent<BlobberDungeonGeometry>();
            ApplyMapToGeometry(geo, map);

            var player = BuildPlayer(map);
            var start = new GameObject("StartPoint");
            start.transform.position = map.CellCenter(map.startCell.x, map.startCell.y, 0.2f);
            start.transform.rotation = Quaternion.Euler(0f, map.startYaw, 0f);

            var director = systems.AddComponent<BlobberSceneDirector>();
            So(director, "player", player);
            So(director, "startPoint", start.transform);

            BuildUi();
            BuildObjects(
                map,
                settings != null ? settings.objectCatalog : null,
                settings != null ? settings.dialogueDatabase : null,
                settings != null ? settings.logicGraphDatabase : null);
            EnsureEventSystem();

            EditorSceneManager.SaveScene(scene, outPath);
            AddToBuildSettingsIfMissing(outPath);
            Debug.Log($"Blobber bake: {map.name} -> {outPath}");
        }

        static string ResolveScenePath(BlobberMapAsset map)
        {
            var baseName = map.name;
            if (!baseName.EndsWith(".unity")) baseName += ".unity";
            return $"Assets/Scenes/{baseName}";
        }

        static BlobberProjectSettings FindProjectSettings()
        {
            var guids = AssetDatabase.FindAssets("t:BlobberProjectSettings");
            if (guids.Length == 0) return null;
            var path = AssetDatabase.GUIDToAssetPath(guids[0]);
            return AssetDatabase.LoadAssetAtPath<BlobberProjectSettings>(path);
        }

        static void BuildLighting()
        {
            var lightGo = new GameObject("Directional Light");
            var light = lightGo.AddComponent<Light>();
            light.type = LightType.Directional;
            light.intensity = 1.1f;
            light.color = new Color(1f, 0.96f, 0.9f, 1f);
            lightGo.transform.rotation = Quaternion.Euler(45f, -30f, 0f);
        }

        static BlobberFpsController BuildPlayer(BlobberMapAsset map)
        {
            var go = new GameObject("BlobberPlayer");
            go.transform.position = map.CellCenter(map.startCell.x, map.startCell.y, 0.2f);
            go.transform.rotation = Quaternion.Euler(0f, map.startYaw, 0f);
            var cc = go.AddComponent<CharacterController>();
            cc.height = 1.8f;
            cc.radius = 0.34f;
            cc.center = new Vector3(0f, 0.9f, 0f);

            var eye = new GameObject("Eye");
            eye.transform.SetParent(go.transform, false);
            eye.transform.localPosition = new Vector3(0f, 1.65f, 0f);
            var cam = eye.AddComponent<Camera>();
            cam.nearClipPlane = 0.05f;
            cam.farClipPlane = 120f;
            cam.fieldOfView = 74f;
            cam.clearFlags = CameraClearFlags.SolidColor;
            cam.backgroundColor = new Color(0.06f, 0.07f, 0.09f, 1f);
            eye.tag = "MainCamera";
            eye.AddComponent<AudioListener>();

            var fps = go.AddComponent<BlobberFpsController>();
            So(fps, "eye", eye.transform);

            var ir = go.AddComponent<BlobberInteractionRaycaster>();
            So(ir, "rayOrigin", eye.transform);
            return fps;
        }

        static void BuildObjects(BlobberMapAsset map, BlobberObjectCatalog catalog, BlobberDialogueDatabase db, BlobberLogicGraphDatabase logicDb)
        {
            var root = new GameObject("BlobberObjects");
            foreach (var obj in map.objects)
            {
                var entry = catalog != null ? catalog.Find(obj.catalogId) : null;
                var primitive = entry != null ? entry.previewPrimitive : PrimitiveType.Cylinder;
                var color = entry != null ? entry.previewColor : map.markerColor;
                var scale = entry != null ? entry.defaultScale : new Vector3(0.45f, 1.1f, 0.45f);

                var go = GameObject.CreatePrimitive(primitive);
                go.transform.SetParent(root.transform, false);
                go.name = string.IsNullOrEmpty(obj.id) ? $"Object_{obj.cell.x}_{obj.cell.y}" : obj.id;
                go.transform.position = map.CellCenter(obj.cell.x, obj.cell.y, obj.yOffset);
                go.transform.rotation = Quaternion.Euler(0f, obj.yaw, 0f);
                go.transform.localScale = scale;

                var r = go.GetComponent<Renderer>();
                if (r != null)
                {
                    var m = new Material(Shader.Find("Universal Render Pipeline/Lit") ?? Shader.Find("Standard"));
                    if (m.HasProperty("_BaseColor")) m.SetColor("_BaseColor", color);
                    else if (m.HasProperty("_Color")) m.color = color;
                    r.sharedMaterial = m;
                }

                BlobberRuntimeInteractableFactory.Build(go, obj, db, logicDb);
            }
        }

        static void ApplyMapToGeometry(BlobberDungeonGeometry geo, BlobberMapAsset map)
        {
            var so = new SerializedObject(geo);
            so.FindProperty("cellSize").floatValue = map.cellSize;
            so.FindProperty("wallHeight").floatValue = map.wallHeight;
            so.FindProperty("floorColor").colorValue = map.floorColor;
            so.FindProperty("wallColor").colorValue = map.wallColor;
            so.FindProperty("gridLineColor").colorValue = map.gridLineColor;
            so.FindProperty("monsterColor").colorValue = map.markerColor;
            var arr = so.FindProperty("mapLines");
            var lines = map.ToMapLines();
            arr.arraySize = lines.Length;
            for (var i = 0; i < lines.Length; i++)
                arr.GetArrayElementAtIndex(i).stringValue = lines[i];
            so.ApplyModifiedPropertiesWithoutUndo();
        }

        static void BuildUi()
        {
            var canvas = NewCanvas("BlobberHUD", 100);
            BuildPromptHud(canvas.transform);
            BuildDialogueUi(canvas.transform);
            BuildDiaryUi(canvas.transform);
            BuildHint(canvas.transform);
        }

        static Canvas NewCanvas(string name, int sort)
        {
            var go = new GameObject(name);
            var c = go.AddComponent<Canvas>();
            c.renderMode = RenderMode.ScreenSpaceOverlay;
            c.sortingOrder = sort;
            go.AddComponent<CanvasScaler>().uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
            go.GetComponent<CanvasScaler>().referenceResolution = new Vector2(1280, 720);
            go.AddComponent<GraphicRaycaster>();
            return c;
        }

        static RectTransform UiChild(string name, Transform parent)
        {
            var go = new GameObject(name, typeof(RectTransform));
            go.transform.SetParent(parent, false);
            return go.GetComponent<RectTransform>();
        }

        static void Stretch(RectTransform rt)
        {
            rt.anchorMin = Vector2.zero;
            rt.anchorMax = Vector2.one;
            rt.offsetMin = Vector2.zero;
            rt.offsetMax = Vector2.zero;
        }

        static Button CreateButton(Transform parent, string name, string label, Vector2 anchor, Vector2 size)
        {
            var rt = UiChild(name, parent);
            rt.anchorMin = anchor - size * 0.5f;
            rt.anchorMax = anchor + size * 0.5f;
            var img = rt.gameObject.AddComponent<Image>();
            img.color = new Color(0.26f, 0.24f, 0.2f, 1f);
            var btn = rt.gameObject.AddComponent<Button>();
            var lbl = UiChild("Label", rt);
            Stretch(lbl);
            var txt = lbl.gameObject.AddComponent<Text>();
            txt.font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
            txt.text = label;
            txt.fontSize = 18;
            txt.alignment = TextAnchor.MiddleCenter;
            txt.color = Color.white;
            return btn;
        }

        static void BuildPromptHud(Transform parent)
        {
            var rt = UiChild("InteractionPrompt", parent);
            rt.anchorMin = rt.anchorMax = new Vector2(0.5f, 0.5f);
            rt.pivot = new Vector2(0.5f, 0f);
            rt.sizeDelta = new Vector2(460f, 40f);
            var cg = rt.gameObject.AddComponent<CanvasGroup>();
            cg.alpha = 0f;
            cg.blocksRaycasts = false;
            var bg = rt.gameObject.AddComponent<Image>();
            bg.color = new Color(0.07f, 0.07f, 0.1f, 0.85f);
            bg.raycastTarget = false;
            var trt = UiChild("Label", rt);
            trt.anchorMin = Vector2.zero;
            trt.anchorMax = Vector2.one;
            trt.offsetMin = new Vector2(12, 6);
            trt.offsetMax = new Vector2(-12, -6);
            var txt = trt.gameObject.AddComponent<Text>();
            txt.font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
            txt.alignment = TextAnchor.MiddleCenter;
            txt.fontSize = 16;
            txt.color = new Color(0.94f, 0.91f, 0.85f, 1f);
            txt.raycastTarget = false;
            var hud = rt.gameObject.AddComponent<InteractionPromptHUD>();
            So(hud, "canvasGroup", cg);
            So(hud, "promptText", txt);
        }

        static void BuildDiaryUi(Transform parent)
        {
            var rt = UiChild("DiaryPanel", parent);
            Stretch(rt);
            var root = rt.gameObject;
            var img = root.AddComponent<Image>();
            img.color = new Color(0.08f, 0.07f, 0.09f, 0.94f);
            var trt = UiChild("Entries", rt);
            trt.anchorMin = new Vector2(0.1f, 0.1f);
            trt.anchorMax = new Vector2(0.9f, 0.9f);
            var txt = trt.gameObject.AddComponent<Text>();
            txt.font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
            txt.fontSize = 18;
            txt.color = new Color(0.92f, 0.9f, 0.84f);
            txt.alignment = TextAnchor.UpperLeft;
            var d = root.AddComponent<DiaryPanel>();
            So(d, "panelRoot", root);
            So(d, "entriesText", txt);
        }

        static void BuildDialogueUi(Transform parent)
        {
            var rootRt = UiChild("DialoguePanel", parent);
            Stretch(rootRt);
            var root = rootRt.gameObject;
            var dim = root.AddComponent<Image>();
            dim.color = new Color(0.03f, 0.03f, 0.05f, 0.55f);
            var stage = UiChild("PortraitStage", rootRt);
            stage.anchorMin = new Vector2(0f, 0.26f);
            stage.anchorMax = new Vector2(1f, 1f);
            var portrait = UiChild("PortraitCenter", stage);
            portrait.anchorMin = new Vector2(0.2f, 0.05f);
            portrait.anchorMax = new Vector2(0.8f, 0.95f);
            var pimg = portrait.gameObject.AddComponent<Image>();
            var bottom = UiChild("BottomBar", rootRt);
            bottom.anchorMin = Vector2.zero;
            bottom.anchorMax = new Vector2(1f, 0.26f);
            var bimg = bottom.gameObject.AddComponent<Image>();
            bimg.color = new Color(0.1f, 0.1f, 0.14f, 0.95f);
            var bodyRt = UiChild("Body", bottom);
            bodyRt.anchorMin = new Vector2(0.04f, 0.14f);
            bodyRt.anchorMax = new Vector2(0.56f, 0.92f);
            var body = bodyRt.gameObject.AddComponent<Text>();
            body.font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
            body.fontSize = 20;
            body.color = new Color(0.95f, 0.93f, 0.88f, 1f);
            body.alignment = TextAnchor.UpperLeft;
            var closeBtn = CreateButton(bottom, "Close", "Закрыть", new Vector2(0.78f, 0.25f), new Vector2(0.34f, 0.34f));
            var rail = UiChild("ChoicesRail", rootRt);
            rail.anchorMin = new Vector2(0.54f, 0.28f);
            rail.anchorMax = new Vector2(0.98f, 0.92f);
            rail.offsetMin = new Vector2(8f, 0f);
            rail.offsetMax = new Vector2(-12f, -8f);
            var choices = UiChild("Choices", rail);
            Stretch(choices);
            var vlg = choices.gameObject.AddComponent<VerticalLayoutGroup>();
            vlg.spacing = 10;
            vlg.childControlHeight = true;
            vlg.childControlWidth = true;
            vlg.childForceExpandHeight = false;
            vlg.childForceExpandWidth = false;
            vlg.childAlignment = TextAnchor.UpperRight;
            var prefab = CreateButton(choices, "ChoicePrefab", "Выбор", new Vector2(0.5f, 1f), new Vector2(1f, 0f));
            prefab.gameObject.SetActive(false);
            var panel = root.AddComponent<DialoguePanel>();
            So(panel, "panelRoot", root);
            So(panel, "portraitStage", stage.gameObject);
            So(panel, "portraitCenter", pimg);
            So(panel, "bodyText", body);
            So(panel, "closeButton", closeBtn);
            So(panel, "choiceButtonParent", choices);
            So(panel, "choiceButtonPrefab", prefab);
        }

        static void BuildHint(Transform parent)
        {
            var rt = UiChild("Hint", parent);
            rt.anchorMin = new Vector2(0f, 0f);
            rt.anchorMax = new Vector2(1f, 0.14f);
            rt.offsetMin = new Vector2(16f, 6f);
            rt.offsetMax = new Vector2(-16f, -6f);
            var t = rt.gameObject.AddComponent<Text>();
            t.font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
            t.fontSize = 16;
            t.color = new Color(0.9f, 0.9f, 0.87f);
            t.alignment = TextAnchor.LowerLeft;
            t.text = "WASD — движение   Мышь — обзор   E/F/Enter — взаимодействие   J — дневник   Esc — курсор";
            t.raycastTarget = false;
        }

        static void EnsureEventSystem()
        {
            if (UnityEngine.Object.FindFirstObjectByType<EventSystem>() != null) return;
            var go = new GameObject("EventSystem");
            go.AddComponent<EventSystem>();
            go.AddComponent<InputSystemUIInputModule>();
        }

        static void So(UnityEngine.Object comp, string field, UnityEngine.Object value)
        {
            var so = new SerializedObject(comp);
            so.FindProperty(field).objectReferenceValue = value;
            so.ApplyModifiedPropertiesWithoutUndo();
        }

        static void AddToBuildSettingsIfMissing(string path)
        {
            var scenes = EditorBuildSettings.scenes.ToList();
            if (scenes.Any(s => s.path == path)) return;
            scenes.Add(new EditorBuildSettingsScene(path, true));
            EditorBuildSettings.scenes = scenes.ToArray();
        }
    }
}
#endif
