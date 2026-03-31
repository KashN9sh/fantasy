#if UNITY_EDITOR
using System.IO;
using System.Linq;
using TikhayaTropa.Blobber;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

namespace TikhayaTropa.EditorTools
{
    /// <summary>Создаёт сцену-прототип FPS-подземелья на сетке.</summary>
    public static class BlobberPrototypeSceneBuilder
    {
        const string ScenePath = "Assets/Scenes/BlobberPrototype.unity";

        [MenuItem("TikhayaTropa/Сцены/Создать прототип Blobber (FPS сетка)")]
        public static void CreateBlobberPrototypeScene()
        {
            Directory.CreateDirectory("Assets/Scenes");

            if (EditorApplication.isPlaying)
            {
                Debug.LogError("TikhayaTropa: выйди из Play Mode.");
                return;
            }

            var scene = EditorSceneManager.NewScene(NewSceneSetup.DefaultGameObjects, NewSceneMode.Single);

            foreach (var go in Object.FindObjectsByType<GameObject>(FindObjectsSortMode.None).ToArray())
            {
                if (go != null && go.name == "Main Camera")
                    Object.DestroyImmediate(go);
            }

            var existingLight = Object.FindFirstObjectByType<Light>();
            if (existingLight == null)
            {
                var lg = new GameObject("Directional Light");
                var light = lg.AddComponent<Light>();
                light.type = LightType.Directional;
                light.intensity = 1.05f;
                light.color = new Color(1f, 0.96f, 0.9f, 1f);
                lg.transform.rotation = Quaternion.Euler(50f, -35f, 0f);
            }

            var root = new GameObject("BlobberDungeon");
            root.AddComponent<BlobberDungeonGeometry>();
            root.AddComponent<BlobberPartyController>();

            BuildHintCanvas();

            EditorSceneManager.SaveScene(scene, ScenePath);
            AssetDatabase.Refresh();

            AddToBuildSettingsIfMissing(ScenePath);
            Debug.Log($"TikhayaTropa: сцена Blobber сохранена как {ScenePath}. Управление: W/S вперёд-назад, A/D стрейф, Q/E или стрелки влево-вправо — поворот.");
        }

        static void BuildHintCanvas()
        {
            var canvasGo = new GameObject("BlobberUI");
            var canvas = canvasGo.AddComponent<Canvas>();
            canvas.renderMode = RenderMode.ScreenSpaceOverlay;
            canvas.sortingOrder = 100;
            canvasGo.AddComponent<CanvasScaler>().uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
            canvasGo.GetComponent<CanvasScaler>().referenceResolution = new Vector2(1280, 720);
            canvasGo.AddComponent<GraphicRaycaster>();

            var rt = new GameObject("Hint", typeof(RectTransform)).GetComponent<RectTransform>();
            rt.SetParent(canvasGo.transform, false);
            rt.anchorMin = new Vector2(0f, 0f);
            rt.anchorMax = new Vector2(1f, 0.18f);
            rt.offsetMin = new Vector2(16f, 8f);
            rt.offsetMax = new Vector2(-16f, -8f);
            var txt = rt.gameObject.AddComponent<Text>();
            txt.font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
            txt.fontSize = 18;
            txt.color = new Color(0.92f, 0.9f, 0.85f, 1f);
            txt.alignment = TextAnchor.LowerLeft;
            txt.text = "W / ↑ — вперёд   S / ↓ — назад   A / D — стрейф   Q / ← — поворот влево   E / → — поворот вправо";
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
