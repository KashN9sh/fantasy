#if UNITY_EDITOR
using System.IO;
using TikhayaTropa.Core;
using TikhayaTropa.Directors;
using TikhayaTropa.Interaction;
using TikhayaTropa.Player;
using TikhayaTropa.UI;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.InputSystem;
using UnityEngine.Rendering.Universal;
using UnityEngine.SceneManagement;
using UnityEngine.InputSystem.UI;
using UnityEngine.UI;

namespace TikhayaTropa.EditorTools
{
    public static class TikhayaTropaSceneBuilder
    {
        /// <summary>Дочерний UI-объект с корректным RectTransform (cast с Transform падает до добавления компонента).</summary>
        static RectTransform CreateUiChild(string name, Transform parent)
        {
            var go = new GameObject(name, typeof(RectTransform));
            go.transform.SetParent(parent, false);
            return go.GetComponent<RectTransform>();
        }

        static Sprite _flatUiSprite;

        static Sprite FlatUiSprite()
        {
            if (_flatUiSprite != null) return _flatUiSprite;
            var t = Texture2D.whiteTexture;
            _flatUiSprite = Sprite.Create(t, new Rect(0, 0, t.width, t.height), new Vector2(0.5f, 0.5f), 100f);
            return _flatUiSprite;
        }

        const string ArtDir = "Assets/GeneratedArt";
        const string ScenesDir = "Assets/Scenes";
        const string UiFontPath = "Assets/Fonts/SMB1NESClassix-Regular.otf";

        static Font LoadUiFont()
        {
            var f = AssetDatabase.LoadAssetAtPath<Font>(UiFontPath);
            return f != null ? f : Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
        }

        [MenuItem("TikhayaTropa/Собрать сцены (Title, Meadow, FogGroveStub)")]
        public static void BuildAll()
        {
            Directory.CreateDirectory(ArtDir);
            Directory.CreateDirectory(ScenesDir);
            var input = AssetDatabase.LoadAssetAtPath<InputActionAsset>("Assets/InputSystem_Actions.inputactions");
            var playerSprite = GetOrCreateSprite($"{ArtDir}/ph_player.png", 12, 20, new Color32(92, 64, 42, 255));
            var npcSprite = GetOrCreateSprite($"{ArtDir}/ph_npc.png", 14, 22, new Color32(55, 48, 42, 255));
            var catSprite = GetOrCreateSprite($"{ArtDir}/ph_cat.png", 10, 8, new Color32(180, 90, 40, 255));
            var gateSprite = GetOrCreateSprite($"{ArtDir}/ph_gate.png", 16, 24, new Color32(70, 55, 40, 255));
            var groundSprite = GetOrCreateSprite($"{ArtDir}/ph_ground.png", 64, 48, new Color32(168, 184, 122, 255));

            BuildTitleScene();
            BuildMeadowScene(input, playerSprite, npcSprite, catSprite, gateSprite, groundSprite);
            BuildFogStubScene(input, playerSprite, npcSprite, groundSprite, gateSprite);

            var title = AssetDatabase.LoadAssetAtPath<SceneAsset>($"{ScenesDir}/Title.unity");
            var meadow = AssetDatabase.LoadAssetAtPath<SceneAsset>($"{ScenesDir}/Meadow.unity");
            var fog = AssetDatabase.LoadAssetAtPath<SceneAsset>($"{ScenesDir}/FogGroveStub.unity");
            EditorBuildSettings.scenes = new[]
            {
                new EditorBuildSettingsScene(AssetDatabase.GetAssetPath(title), true),
                new EditorBuildSettingsScene(AssetDatabase.GetAssetPath(meadow), true),
                new EditorBuildSettingsScene(AssetDatabase.GetAssetPath(fog), true)
            };

            AssetDatabase.SaveAssets();
            Debug.Log("TikhayaTropa: сцены Title, Meadow, FogGroveStub созданы и добавлены в Build Settings.");
        }

        static void BuildTitleScene()
        {
            var scene = EditorSceneManager.NewScene(NewSceneSetup.DefaultGameObjects, NewSceneMode.Single);
            var camGo = GameObject.FindGameObjectWithTag("MainCamera");
            if (camGo != null)
            {
                var cam = camGo.GetComponent<Camera>();
                if (cam != null)
                {
                    cam.orthographic = true;
                    cam.clearFlags = CameraClearFlags.SolidColor;
                    cam.backgroundColor = new Color(0.08f, 0.07f, 0.09f, 1f);
                }
            }

            var canvas = NewCanvas("TitleCanvas", 100);
            var bgRt = CreateUiChild("Background", canvas.transform);
            var bgImg = bgRt.gameObject.AddComponent<Image>();
            bgImg.color = new Color(0.12f, 0.1f, 0.14f, 1f);
            StretchFull(bgRt);

            var title = CreateUiText(canvas.transform, "TitleText", "Тихая тропа", 42, TextAnchor.MiddleCenter, new Vector2(0, 80));
            title.color = new Color(0.95f, 0.9f, 0.82f);

            var ng = CreateButton(canvas.transform, "NewGame", "Новая игра", new Vector2(0, 10));
            var cont = CreateButton(canvas.transform, "Continue", "Продолжить", new Vector2(0, -50));
            var quit = CreateButton(canvas.transform, "Quit", "Выход", new Vector2(0, -110));

            var menu = canvas.gameObject.AddComponent<TitleMenu>();
            So(menu, "newGameButton", ng);
            So(menu, "continueButton", cont);
            So(menu, "quitButton", quit);

            EnsureEventSystem();
            EditorSceneManager.SaveScene(scene, $"{ScenesDir}/Title.unity");
        }

        static void BuildMeadowScene(InputActionAsset input, Sprite playerS, Sprite npcS, Sprite catS, Sprite gateS,
            Sprite groundS)
        {
            var scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);

            var camGo = new GameObject("Main Camera");
            camGo.tag = "MainCamera";
            var cam = camGo.AddComponent<Camera>();
            cam.orthographic = true;
            cam.orthographicSize = 5.625f;
            cam.backgroundColor = new Color(0.55f, 0.62f, 0.72f, 1f);
            cam.useOcclusionCulling = false;
            camGo.transform.position = new Vector3(0, 0, -10);
            camGo.AddComponent<AudioListener>();
            camGo.AddComponent<UniversalAdditionalCameraData>();
            var ppc = camGo.AddComponent<UnityEngine.U2D.PixelPerfectCamera>();
            ppc.refResolutionX = 320;
            ppc.refResolutionY = 180;
            ppc.assetsPPU = 16;
            ppc.upscaleRT = true;
            ppc.pixelSnapping = true;
            camGo.AddComponent<CameraFollow2D>();

            var lightGo = new GameObject("Global Light 2D");
            var light2d = lightGo.AddComponent<Light2D>();
            light2d.lightType = Light2D.LightType.Global;
            light2d.intensity = 1f;
            light2d.color = Color.white;

            const float floorY = -1.15f;
            const float floorHalfH = 0.21f;
            var floorTop = floorY + floorHalfH;

            NewSpriteObject("MeadowBackdrop", groundS, new Vector3(3f, 0.35f, 0f), new Vector3(28f, 14f, 1f), -15);

            var floorGo = new GameObject("Floor");
            floorGo.transform.position = new Vector3(4f, floorY, 0f);
            var floorBox = floorGo.AddComponent<BoxCollider2D>();
            floorBox.size = new Vector2(52f, floorHalfH * 2f);

            // Видимая «земля» под ногами (коллайдер Floor без спрайта).
            var groundVis = NewSpriteObject("MeadowGround", groundS, new Vector3(4f, floorY, 0f), new Vector3(13f, 0.2f, 1f), 0);
            groundVis.GetComponent<SpriteRenderer>().color = new Color(0.78f, 0.84f, 0.58f, 1f);

            var playerFeetY = floorTop + 0.425f;
            var player = NewSpriteObject("Player", playerS, new Vector3(-7.5f, playerFeetY, 0f), Vector3.one);
            player.tag = "Player";
            var prb = player.AddComponent<Rigidbody2D>();
            prb.gravityScale = 2.2f;
            prb.constraints = RigidbodyConstraints2D.FreezeRotation;
            prb.collisionDetectionMode = CollisionDetectionMode2D.Continuous;
            prb.interpolation = RigidbodyInterpolation2D.Interpolate;
            var pcol = player.AddComponent<BoxCollider2D>();
            pcol.size = new Vector2(0.5f, 0.85f);
            var pc = player.AddComponent<PlayerController>();
            So(pc, "inputActions", input);
            var pint = player.AddComponent<PlayerInteraction>();
            So(pint, "inputActions", input);

            var standY = floorTop + 0.425f;
            var gate = NewSpriteObject("Gate", gateS, new Vector3(0f, standY, 0f), Vector3.one);
            var gtrig = gate.AddComponent<BoxCollider2D>();
            gtrig.isTrigger = true;
            gtrig.size = new Vector2(0.8f, 1.4f);
            gate.AddComponent<GateInteractable>();

            var well = NewTriggerZone("Well", new Vector3(-4f, standY, 0f), new Vector2(1.2f, 1.2f));
            var wellEx = well.AddComponent<ExamineInteractable>();
            SoText(wellEx, "prompt", "Заглянуть в колодец");
            SoText(wellEx, "examineText",
                "Темнота внизу молчит. Если прошептать сюда то, что тревожит, — ветер потом принесёт тепло на ладони.");
            SoEnum(wellEx, "optionalStat", 1);
            SoInt(wellEx, "optionalStatDelta", 2);

            var bench = NewTriggerZone("Bench", new Vector3(-2f, standY, 0f), new Vector2(1.8f, 0.8f));
            bench.AddComponent<BenchInscriptionsInteractable>();

            var hermit = NewSpriteObject("Hermit", npcS, new Vector3(6f, standY, 0f), Vector3.one);
            var htrig = hermit.AddComponent<BoxCollider2D>();
            htrig.isTrigger = true;
            htrig.size = new Vector2(0.7f, 1.1f);
            hermit.AddComponent<HermitInteractable>();

            var cat = NewSpriteObject("Cat", catS, new Vector3(3f, standY, 0f), Vector3.one);
            var catTrig = cat.AddComponent<CircleCollider2D>();
            catTrig.isTrigger = true;
            catTrig.radius = 1.1f;
            cat.AddComponent<CatRitualZone>();

            var exit = NewTriggerZone("ExitToGrove", new Vector3(11f, standY, 0f), new Vector2(0.6f, 2f));
            exit.AddComponent<TransitionZone>();

            var mgr = new GameObject("MeadowSystems");
            mgr.AddComponent<QuestRuntime>();
            mgr.AddComponent<AutoSaveListener>();
            var director = mgr.AddComponent<MeadowChapterDirector>();

            var introCanvas = NewCanvas("IntroCanvas", 200);
            var blackRt = CreateUiChild("Black", introCanvas.transform);
            var black = blackRt.gameObject.AddComponent<Image>();
            black.color = Color.black;
            StretchFull(blackRt);
            var introRt = CreateUiChild("IntroLine", introCanvas.transform);
            var introText = introRt.gameObject.AddComponent<Text>();
            introText.font = LoadUiFont();
            introText.fontSize = 22;
            introText.alignment = TextAnchor.MiddleCenter;
            introText.color = Color.white;
            StretchFull(introRt);
            introRt.offsetMin = new Vector2(40, 40);
            introRt.offsetMax = new Vector2(-40, -40);
            introCanvas.gameObject.SetActive(false);

            So(director, "introCanvas", introCanvas);
            So(director, "introBlack", black);
            So(director, "introLine", introText);

            var hudCanvas = NewCanvas("GameHUD", 0);
            BuildDialogueUi(hudCanvas.transform);
            BuildDiaryUi(hudCanvas.transform);
            BuildPromptHud(hudCanvas.transform);

            EnsureEventSystem();
            EditorSceneManager.SaveScene(scene, $"{ScenesDir}/Meadow.unity");
        }

        static void BuildFogStubScene(InputActionAsset input, Sprite playerS, Sprite npcS, Sprite groundS, Sprite gateS)
        {
            var scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);

            var camGo = new GameObject("Main Camera");
            camGo.tag = "MainCamera";
            var cam = camGo.AddComponent<Camera>();
            cam.orthographic = true;
            cam.orthographicSize = 5.625f;
            cam.backgroundColor = new Color(0.14f, 0.13f, 0.18f, 1f);
            cam.useOcclusionCulling = false;
            camGo.transform.position = new Vector3(0, 0, -10);
            camGo.AddComponent<AudioListener>();
            camGo.AddComponent<UniversalAdditionalCameraData>();
            var ppc = camGo.AddComponent<UnityEngine.U2D.PixelPerfectCamera>();
            ppc.refResolutionX = 320;
            ppc.refResolutionY = 180;
            ppc.assetsPPU = 16;
            ppc.upscaleRT = true;
            ppc.pixelSnapping = true;
            camGo.AddComponent<CameraFollow2D>();

            var lightGo = new GameObject("Global Light 2D");
            var light2d = lightGo.AddComponent<Light2D>();
            light2d.lightType = Light2D.LightType.Global;
            light2d.intensity = 0.85f;
            light2d.color = new Color(0.85f, 0.88f, 0.95f, 1f);

            const float floorY = -1.15f;
            const float floorHalfH = 0.21f;
            var floorTop = floorY + floorHalfH;

            var fogBack = NewSpriteObject("FogBackdrop", groundS, new Vector3(3f, 0.2f, 0f), new Vector3(26f, 12f, 1f), -15);
            fogBack.GetComponent<SpriteRenderer>().color = new Color(0.5f, 0.52f, 0.58f, 1f);

            var floorGo = new GameObject("Floor");
            floorGo.transform.position = new Vector3(4f, floorY, 0f);
            var floorBox = floorGo.AddComponent<BoxCollider2D>();
            floorBox.size = new Vector2(52f, floorHalfH * 2f);

            var groundVis = NewSpriteObject("FogGroundStrip", groundS, new Vector3(4f, floorY, 0f), new Vector3(13f, 0.2f, 1f), 0);
            groundVis.GetComponent<SpriteRenderer>().color = new Color(0.55f, 0.58f, 0.5f, 1f);

            var playerFeetY = floorTop + 0.425f;
            var player = NewSpriteObject("Player", playerS, new Vector3(-7.5f, playerFeetY, 0f), Vector3.one);
            player.tag = "Player";
            var prb = player.AddComponent<Rigidbody2D>();
            prb.gravityScale = 2.2f;
            prb.constraints = RigidbodyConstraints2D.FreezeRotation;
            prb.collisionDetectionMode = CollisionDetectionMode2D.Continuous;
            prb.interpolation = RigidbodyInterpolation2D.Interpolate;
            var pcol = player.AddComponent<BoxCollider2D>();
            pcol.size = new Vector2(0.5f, 0.85f);
            var pc = player.AddComponent<PlayerController>();
            So(pc, "inputActions", input);
            var pint = player.AddComponent<PlayerInteraction>();
            So(pint, "inputActions", input);

            var standY = floorTop + 0.425f;

            var sign = NewSpriteObject("LostSignpost", gateS, new Vector3(-3f, standY, 0f), new Vector3(0.5f, 1.05f, 1f), 5);
            var sbox = sign.AddComponent<BoxCollider2D>();
            sbox.isTrigger = true;
            sbox.size = new Vector2(0.55f, 1.35f);
            sign.AddComponent<LostSignpostInteractable>();
            var calmGo = new GameObject("CalmZone");
            calmGo.transform.SetParent(sign.transform, false);
            calmGo.transform.localPosition = Vector3.zero;
            var calmCircle = calmGo.AddComponent<CircleCollider2D>();
            calmCircle.isTrigger = true;
            calmCircle.radius = 2.4f;
            calmGo.AddComponent<SignpostCalmZone>();

            var vera = NewSpriteObject("Vera", npcS, new Vector3(0.5f, standY, 0f), Vector3.one);
            var vtrig = vera.AddComponent<BoxCollider2D>();
            vtrig.isTrigger = true;
            vtrig.size = new Vector2(0.65f, 1.15f);
            vera.AddComponent<VeraGroveInteractable>();

            var hollow = NewSpriteObject("HollowTree", npcS, new Vector3(5.2f, standY, 0f), new Vector3(1.4f, 2.2f, 1f));
            hollow.GetComponent<SpriteRenderer>().color = new Color(0.35f, 0.38f, 0.32f, 1f);
            var hbox = hollow.AddComponent<BoxCollider2D>();
            hbox.isTrigger = true;
            hbox.size = new Vector2(1.1f, 2.4f);
            hollow.AddComponent<HollowTreeInteractable>();

            var sliceEnd = NewTriggerZone("SliceEndHint", new Vector3(10.5f, standY, 0f), new Vector2(1f, 2f));
            var sliceEx = sliceEnd.AddComponent<ExamineInteractable>();
            SoText(sliceEx, "prompt", "Смотреть вдаль по тропе");
            SoText(sliceEx, "examineText",
                "Тропа уходит в серую мглу. Дальше — деревня с огнями, но этот кусок пути в игре ещё не готов.");

            var fogMgr = new GameObject("FogGroveSystems");
            fogMgr.AddComponent<QuestRuntime>();
            fogMgr.AddComponent<AutoSaveListener>();
            fogMgr.AddComponent<FogGroveDirector>();

            var hudCanvas = NewCanvas("GameHUD", 0);
            var fogRt = CreateUiChild("FogVignette", hudCanvas.transform);
            fogRt.SetSiblingIndex(0);
            StretchFull(fogRt);
            var fogImg = fogRt.gameObject.AddComponent<Image>();
            fogImg.sprite = FlatUiSprite();
            fogImg.type = Image.Type.Simple;
            fogImg.color = new Color(0.72f, 0.7f, 0.78f, 0.38f);
            fogImg.raycastTarget = false;

            BuildDialogueUi(hudCanvas.transform);
            BuildDiaryUi(hudCanvas.transform);
            BuildPromptHud(hudCanvas.transform);

            EnsureEventSystem();
            EditorSceneManager.SaveScene(scene, $"{ScenesDir}/FogGroveStub.unity");
        }

        static void BuildDialogueUi(Transform parent)
        {
            var rootRt = CreateUiChild("DialoguePanel", parent);
            StretchFull(rootRt);
            var root = rootRt.gameObject;
            var panelImg = root.AddComponent<Image>();
            panelImg.color = new Color(0.05f, 0.05f, 0.06f, 0.92f);

            var bodyRt = CreateUiChild("Body", root.transform);
            var body = bodyRt.gameObject.AddComponent<Text>();
            body.font = LoadUiFont();
            body.fontSize = 20;
            body.color = new Color(0.93f, 0.9f, 0.85f);
            body.alignment = TextAnchor.UpperLeft;
            bodyRt.anchorMin = new Vector2(0.08f, 0.25f);
            bodyRt.anchorMax = new Vector2(0.92f, 0.88f);
            bodyRt.offsetMin = bodyRt.offsetMax = Vector2.zero;

            var closeRt = CreateUiChild("Close", root.transform);
            var closeGo = closeRt.gameObject;
            var closeBtn = closeGo.AddComponent<Button>();
            var closeImg = closeGo.AddComponent<Image>();
            closeImg.color = new Color(0.25f, 0.22f, 0.2f, 1f);
            closeRt.anchorMin = new Vector2(0.75f, 0.06f);
            closeRt.anchorMax = new Vector2(0.95f, 0.14f);
            closeRt.offsetMin = closeRt.offsetMax = Vector2.zero;
            var closeLabelRt = CreateUiChild("Label", closeGo.transform);
            var ct = closeLabelRt.gameObject.AddComponent<Text>();
            ct.font = LoadUiFont();
            ct.text = "Закрыть";
            ct.fontSize = 18;
            ct.alignment = TextAnchor.MiddleCenter;
            ct.color = Color.white;
            StretchFull(closeLabelRt);

            var cprt = CreateUiChild("Choices", root.transform);
            cprt.anchorMin = new Vector2(0.08f, 0.08f);
            cprt.anchorMax = new Vector2(0.92f, 0.35f);
            cprt.offsetMin = cprt.offsetMax = Vector2.zero;
            var vlg = cprt.gameObject.AddComponent<VerticalLayoutGroup>();
            vlg.spacing = 8;
            vlg.childAlignment = TextAnchor.UpperCenter;
            vlg.childControlHeight = true;
            vlg.childControlWidth = true;
            vlg.childForceExpandHeight = false;
            vlg.childForceExpandWidth = true;

            var prefabRt = CreateUiChild("ChoiceButtonPrefab", root.transform);
            var prefab = prefabRt.gameObject;
            var prefabBtn = prefab.AddComponent<Button>();
            var prefabImg = prefab.AddComponent<Image>();
            prefabImg.sprite = FlatUiSprite();
            prefabImg.type = Image.Type.Simple;
            prefabImg.color = new Color(0.3f, 0.28f, 0.25f, 1f);
            prefabBtn.targetGraphic = prefabImg;
            var prefabLe = prefab.AddComponent<LayoutElement>();
            prefabLe.minHeight = 44f;
            prefabLe.preferredHeight = 44f;
            prefabLe.flexibleWidth = 1f;
            prefabRt.anchorMin = new Vector2(0f, 1f);
            prefabRt.anchorMax = new Vector2(1f, 1f);
            prefabRt.pivot = new Vector2(0.5f, 1f);
            prefabRt.sizeDelta = new Vector2(0f, 44f);
            var prefabLblRt = CreateUiChild("Label", prefab.transform);
            var pt = prefabLblRt.gameObject.AddComponent<Text>();
            pt.font = LoadUiFont();
            pt.fontSize = 16;
            pt.alignment = TextAnchor.MiddleCenter;
            pt.color = Color.white;
            StretchFull(prefabLblRt);
            prefab.SetActive(false);

            var dp = root.AddComponent<DialoguePanel>();
            So(dp, "panelRoot", root);
            So(dp, "bodyText", body);
            So(dp, "closeButton", closeBtn);
            So(dp, "choiceButtonParent", cprt);
            So(dp, "choiceButtonPrefab", prefabBtn);
        }

        static void BuildDiaryUi(Transform parent)
        {
            var rootRt = CreateUiChild("DiaryPanel", parent);
            StretchFull(rootRt);
            var root = rootRt.gameObject;
            var img = root.AddComponent<Image>();
            img.sprite = FlatUiSprite();
            img.type = Image.Type.Simple;
            img.color = new Color(0.08f, 0.07f, 0.09f, 0.94f);
            var trt = CreateUiChild("Entries", root.transform);
            var txt = trt.gameObject.AddComponent<Text>();
            txt.font = LoadUiFont();
            txt.fontSize = 18;
            txt.color = new Color(0.92f, 0.9f, 0.84f);
            txt.alignment = TextAnchor.UpperLeft;
            trt.anchorMin = new Vector2(0.1f, 0.1f);
            trt.anchorMax = new Vector2(0.9f, 0.9f);
            trt.offsetMin = trt.offsetMax = Vector2.zero;
            var dp = root.AddComponent<DiaryPanel>();
            So(dp, "panelRoot", root);
            So(dp, "entriesText", txt);
        }

        static void BuildPromptHud(Transform parent)
        {
            var rt = CreateUiChild("InteractionPrompt", parent);
            var root = rt.gameObject;
            rt.anchorMin = new Vector2(0.05f, 0.02f);
            rt.anchorMax = new Vector2(0.95f, 0.1f);
            rt.offsetMin = rt.offsetMax = Vector2.zero;
            var txt = root.AddComponent<Text>();
            txt.font = LoadUiFont();
            txt.fontSize = 16;
            txt.color = new Color(0.95f, 0.92f, 0.85f, 0.95f);
            txt.alignment = TextAnchor.LowerLeft;
            var hud = root.AddComponent<InteractionPromptHUD>();
            So(hud, "promptText", txt);
        }

        static GameObject NewSpriteObject(string name, Sprite sprite, Vector3 pos, Vector3 scale, int sortingOrder = 10)
        {
            var go = new GameObject(name);
            go.transform.position = pos;
            go.transform.localScale = scale;
            var sr = go.AddComponent<SpriteRenderer>();
            sr.sprite = sprite;
            sr.sortingOrder = sortingOrder;
            return go;
        }

        static GameObject NewTriggerZone(string name, Vector3 pos, Vector2 size)
        {
            var go = new GameObject(name);
            go.transform.position = pos;
            var box = go.AddComponent<BoxCollider2D>();
            box.isTrigger = true;
            box.size = size;
            return go;
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
            go.GetComponent<RectTransform>().localScale = Vector3.one;
            return c;
        }

        static void StretchFull(RectTransform rt)
        {
            rt.anchorMin = Vector2.zero;
            rt.anchorMax = Vector2.one;
            rt.offsetMin = Vector2.zero;
            rt.offsetMax = Vector2.zero;
        }

        static Text CreateUiText(Transform parent, string name, string copy, int size, TextAnchor anchor, Vector2 anchored)
        {
            var rt = CreateUiChild(name, parent);
            var t = rt.gameObject.AddComponent<Text>();
            t.font = LoadUiFont();
            t.text = copy;
            t.fontSize = size;
            t.alignment = anchor;
            t.color = Color.white;
            rt.sizeDelta = new Vector2(800, 200);
            rt.anchoredPosition = anchored;
            return t;
        }

        static Button CreateButton(Transform parent, string name, string label, Vector2 pos)
        {
            var rt = CreateUiChild(name, parent);
            var go = rt.gameObject;
            var btn = go.AddComponent<Button>();
            var img = go.AddComponent<Image>();
            img.color = new Color(0.35f, 0.3f, 0.26f, 1f);
            rt.sizeDelta = new Vector2(220, 44);
            rt.anchoredPosition = pos;
            var lblRt = CreateUiChild("Label", go.transform);
            var t = lblRt.gameObject.AddComponent<Text>();
            t.font = LoadUiFont();
            t.text = label;
            t.fontSize = 20;
            t.alignment = TextAnchor.MiddleCenter;
            t.color = Color.white;
            StretchFull(lblRt);
            return btn;
        }

        static Sprite GetOrCreateSprite(string assetPath, int w, int h, Color32 fill)
        {
            Directory.CreateDirectory(Path.GetDirectoryName(assetPath) ?? ArtDir);
            if (!File.Exists(assetPath))
            {
                var tex = new Texture2D(w, h);
                var arr = new Color32[w * h];
                for (var i = 0; i < arr.Length; i++) arr[i] = fill;
                tex.SetPixels32(arr);
                tex.Apply();
                File.WriteAllBytes(assetPath, tex.EncodeToPNG());
                AssetDatabase.Refresh();
            }

            var ti = AssetImporter.GetAtPath(assetPath) as TextureImporter;
            if (ti != null)
            {
                ti.textureType = TextureImporterType.Sprite;
                ti.spritePixelsPerUnit = 16;
                ti.filterMode = FilterMode.Point;
                ti.textureCompression = TextureImporterCompression.Uncompressed;
                ti.mipmapEnabled = false;
                AssetDatabase.ImportAsset(assetPath, ImportAssetOptions.ForceUpdate);
            }

            return AssetDatabase.LoadAssetAtPath<Sprite>(assetPath);
        }

        static void So(Object comp, string field, Object value)
        {
            var so = new SerializedObject(comp);
            so.FindProperty(field).objectReferenceValue = value;
            so.ApplyModifiedPropertiesWithoutUndo();
        }

        static void SoText(Object comp, string field, string value)
        {
            var so = new SerializedObject(comp);
            so.FindProperty(field).stringValue = value;
            so.ApplyModifiedPropertiesWithoutUndo();
        }

        static void SoInt(Object comp, string field, int value)
        {
            var so = new SerializedObject(comp);
            so.FindProperty(field).intValue = value;
            so.ApplyModifiedPropertiesWithoutUndo();
        }

        static void SoEnum(Object comp, string field, int enumIndex)
        {
            var so = new SerializedObject(comp);
            so.FindProperty(field).enumValueIndex = enumIndex;
            so.ApplyModifiedPropertiesWithoutUndo();
        }

        static void EnsureEventSystem()
        {
            if (Object.FindFirstObjectByType<EventSystem>() != null) return;
            var go = new GameObject("EventSystem");
            go.AddComponent<EventSystem>();
            go.AddComponent<InputSystemUIInputModule>();
        }

        /// <summary>
        /// Одноразовая миграция старой Meadow (топ-даун + огромный коллайдер земли) в сайдскроллер.
        /// </summary>
        [MenuItem("TikhayaTropa/Обновить Meadow под сайдскроллер")]
        public static void UpgradeMeadowToSideScroller()
        {
            const string scenePath = "Assets/Scenes/Meadow.unity";
            if (!File.Exists(Path.Combine(Application.dataPath, "Scenes/Meadow.unity")))
            {
                Debug.LogError("TikhayaTropa: не найден Assets/Scenes/Meadow.unity");
                return;
            }

            EditorSceneManager.OpenScene(scenePath);

            const float floorY = -1.15f;
            const float floorHalfH = 0.21f;
            var floorTop = floorY + floorHalfH;
            var standY = floorTop + 0.425f;

            var legacyGround = GameObject.Find("Ground");
            if (legacyGround != null)
            {
                var bc = legacyGround.GetComponent<BoxCollider2D>();
                if (bc != null && bc.size.y > 2f)
                {
                    Undo.DestroyObjectImmediate(bc);
                    legacyGround.name = "MeadowBackdrop";
                    legacyGround.transform.position = new Vector3(3f, 0.35f, 0f);
                    legacyGround.transform.localScale = new Vector3(28f, 14f, 1f);
                    var sr = legacyGround.GetComponent<SpriteRenderer>();
                    if (sr != null) sr.sortingOrder = -15;
                }
            }

            if (GameObject.Find("MeadowBackdrop") == null && GameObject.Find("Floor") == null)
            {
                Debug.LogWarning("TikhayaTropa: нет фона и пола — выполни TikhayaTropa → Собрать сцены.");
            }

            if (GameObject.Find("Floor") == null)
            {
                var floorGo = new GameObject("Floor");
                floorGo.transform.position = new Vector3(4f, floorY, 0f);
                var box = floorGo.AddComponent<BoxCollider2D>();
                box.size = new Vector2(52f, floorHalfH * 2f);
                Undo.RegisterCreatedObjectUndo(floorGo, "Floor side-scroller");
            }

            if (GameObject.Find("MeadowGround") == null)
            {
                var groundS = AssetDatabase.LoadAssetAtPath<Sprite>($"{ArtDir}/ph_ground.png");
                if (groundS != null)
                {
                    var go = NewSpriteObject("MeadowGround", groundS, new Vector3(4f, floorY, 0f), new Vector3(13f, 0.2f, 1f), 0);
                    go.GetComponent<SpriteRenderer>().color = new Color(0.78f, 0.84f, 0.58f, 1f);
                    Undo.RegisterCreatedObjectUndo(go, "MeadowGround visual");
                }
                else
                    Debug.LogWarning("TikhayaTropa: нет ph_ground.png — выполни «Собрать сцены» или добавь спрайт.");
            }

            var player = GameObject.FindGameObjectWithTag("Player");
            if (player != null)
            {
                Undo.RecordObject(player.transform, "Player side-scroller");
                var rb = player.GetComponent<Rigidbody2D>();
                if (rb != null)
                {
                    Undo.RecordObject(rb, "RB gravity");
                    rb.gravityScale = 2.2f;
                }
                player.transform.position = new Vector3(-7.5f, standY, 0f);
            }

            void MoveRoot(string objectName, float x)
            {
                var go = GameObject.Find(objectName);
                if (go == null) return;
                Undo.RecordObject(go.transform, objectName);
                var p = go.transform.position;
                go.transform.position = new Vector3(x, standY, p.z);
            }

            MoveRoot("Gate", 0f);
            MoveRoot("Well", -4f);
            MoveRoot("Bench", -2f);
            MoveRoot("Cat", 3f);
            MoveRoot("Hermit", 6f);
            MoveRoot("ExitToGrove", 11f);

            var camGo = GameObject.FindGameObjectWithTag("MainCamera");
            if (camGo != null && camGo.GetComponent<CameraFollow2D>() == null)
            {
                Undo.AddComponent<CameraFollow2D>(camGo);
            }

            EditorSceneManager.MarkSceneDirty(EditorSceneManager.GetActiveScene());
            EditorSceneManager.SaveOpenScenes();
            Debug.Log("TikhayaTropa: Meadow обновлена под сайдскроллер (пол, гравитация, камера).");
        }
    }
}
#endif
