using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

namespace TikhayaTropa.UI
{
    public enum DialogueSpeaker
    {
        Narrator,
        Player,
        Npc
    }

    public class DialoguePanel : MonoBehaviour
    {
        public static DialoguePanel Instance { get; private set; }

        [SerializeField] GameObject panelRoot;
        [SerializeField] GameObject portraitStage;
        [SerializeField] Image portraitCenter;
        /// <summary>Старые сцены ссылаются на правый портрет; пока не пересобраны — подхватываем его.</summary>
        [SerializeField] Image portraitRight;
        [SerializeField] Sprite defaultNpcPortrait;

        Image NpcPortrait => portraitCenter != null ? portraitCenter : portraitRight;
        [SerializeField] Text bodyText;
        [SerializeField] Button closeButton;
        [SerializeField] Transform choiceButtonParent;
        [SerializeField] Button choiceButtonPrefab;

        readonly List<Button> _choicePool = new();

        static Sprite _flatUiSprite;

        static Sprite FlatUiSprite
        {
            get
            {
                if (_flatUiSprite != null) return _flatUiSprite;
                var t = Texture2D.whiteTexture;
                _flatUiSprite = Sprite.Create(t, new Rect(0, 0, t.width, t.height), new Vector2(0.5f, 0.5f), 100f);
                return _flatUiSprite;
            }
        }

        public bool IsBlocking => panelRoot != null && panelRoot.activeSelf;

        void Awake()
        {
            Instance = this;
            closeButton.onClick.AddListener(Close);
            panelRoot.SetActive(false);
            choiceButtonPrefab.gameObject.SetActive(false);
            if (portraitStage != null)
            {
                var left = portraitStage.transform.Find("PortraitLeft");
                if (left != null) left.gameObject.SetActive(false);
            }

            SnapDialogueLayout();
            EnsureDefaultPortrait();
        }

        /// <summary>Подгоняет якоря под VN-макет (в т.ч. после старых сцен с двумя портретами).</summary>
        void SnapDialogueLayout()
        {
            if (panelRoot == null) return;
            var pr = panelRoot.transform;
            const float bottomH = 0.26f;
            var stage = pr.Find("PortraitStage") as RectTransform;
            var bottom = pr.Find("BottomBar") as RectTransform;
            if (stage != null && bottom != null)
            {
                stage.anchorMin = new Vector2(0f, bottomH);
                stage.anchorMax = new Vector2(1f, 1f);
                stage.offsetMin = stage.offsetMax = Vector2.zero;
                bottom.anchorMin = Vector2.zero;
                bottom.anchorMax = new Vector2(1f, bottomH);
                bottom.offsetMin = bottom.offsetMax = Vector2.zero;
            }

            var img = NpcPortrait;
            if (img != null)
            {
                var rt = img.rectTransform;
                rt.anchorMin = new Vector2(0.18f, 0.02f);
                rt.anchorMax = new Vector2(0.82f, 0.98f);
                rt.offsetMin = rt.offsetMax = Vector2.zero;
            }

            if (bottom != null)
            {
                var body = bottom.Find("Body") as RectTransform;
                if (body != null)
                {
                    body.anchorMin = new Vector2(0.035f, 0.14f);
                    body.anchorMax = new Vector2(0.56f, 0.92f);
                    body.offsetMin = body.offsetMax = Vector2.zero;
                }

                var closeTf = bottom.Find("Close") as RectTransform;
                if (closeTf != null)
                {
                    closeTf.anchorMin = new Vector2(0.62f, 0.08f);
                    closeTf.anchorMax = new Vector2(0.96f, 0.42f);
                    closeTf.offsetMin = closeTf.offsetMax = Vector2.zero;
                }
            }

            RectTransform rail = pr.Find("ChoicesRail") as RectTransform;
            if (rail == null && bottom != null)
            {
                var ch = bottom.Find("Choices");
                if (ch != null)
                {
                    var go = new GameObject("ChoicesRail", typeof(RectTransform));
                    rail = go.GetComponent<RectTransform>();
                    rail.SetParent(pr, false);
                    rail.SetAsLastSibling();
                    rail.anchorMin = new Vector2(0.54f, bottomH + 0.02f);
                    rail.anchorMax = new Vector2(0.98f, 0.92f);
                    rail.offsetMin = new Vector2(8f, 0f);
                    rail.offsetMax = new Vector2(-12f, -8f);
                    ch.SetParent(rail, false);
                    var cRt = (RectTransform)ch;
                    cRt.anchorMin = Vector2.zero;
                    cRt.anchorMax = Vector2.one;
                    cRt.offsetMin = cRt.offsetMax = Vector2.zero;
                    cRt.localScale = Vector3.one;
                }
            }

            if (rail != null)
            {
                rail.anchorMin = new Vector2(0.54f, bottomH + 0.02f);
                rail.anchorMax = new Vector2(0.98f, 0.92f);
                rail.offsetMin = new Vector2(8f, 0f);
                rail.offsetMax = new Vector2(-12f, -8f);
                var vlg = rail.GetComponentInChildren<VerticalLayoutGroup>();
                if (vlg != null)
                {
                    vlg.spacing = 10;
                    vlg.padding = new RectOffset(0, 0, 4, 4);
                    vlg.childAlignment = TextAnchor.UpperRight;
                    vlg.childControlHeight = true;
                    vlg.childControlWidth = true;
                    vlg.childForceExpandHeight = false;
                    vlg.childForceExpandWidth = false;
                }
            }
        }

        void OnDestroy()
        {
            if (Instance == this) Instance = null;
        }

        void EnsureDefaultPortrait()
        {
            var img = NpcPortrait;
            if (img != null && img.sprite == null && defaultNpcPortrait != null)
                img.sprite = defaultNpcPortrait;
        }

        void ApplySpeaker(DialogueSpeaker speaker)
        {
            if (portraitStage == null) return;

            // Портрет только у собеседника (NPC). Игрок и рассказчик — без фигуры в кадре.
            if (speaker == DialogueSpeaker.Npc)
            {
                portraitStage.SetActive(true);
                if (NpcPortrait != null)
                    NpcPortrait.color = Color.white;
            }
            else
            {
                portraitStage.SetActive(false);
            }
        }

        public void ShowMessage(string text) => ShowMessage(text, DialogueSpeaker.Npc);

        public void ShowMessage(string text, DialogueSpeaker speaker)
        {
            if (TikhayaTropa.Core.GameState.Instance != null)
                TikhayaTropa.Core.GameState.Instance.InputFrozen = true;
            EnsureDefaultPortrait();
            ApplySpeaker(speaker);
            ClearChoices();
            bodyText.text = text;
            panelRoot.SetActive(true);
            closeButton.gameObject.SetActive(true);
        }

        public void ShowChoices(string intro, IReadOnlyList<DialogueChoice> choices) =>
            ShowChoices(intro, choices, DialogueSpeaker.Npc);

        public void ShowChoices(string intro, IReadOnlyList<DialogueChoice> choices, DialogueSpeaker speaker)
        {
            if (TikhayaTropa.Core.GameState.Instance != null)
                TikhayaTropa.Core.GameState.Instance.InputFrozen = true;
            EnsureDefaultPortrait();
            ApplySpeaker(speaker);
            bodyText.text = intro;
            panelRoot.SetActive(true);
            closeButton.gameObject.SetActive(false);
            ClearChoices();

            foreach (var c in choices)
            {
                var btn = Instantiate(choiceButtonPrefab, choiceButtonParent);
                btn.gameObject.SetActive(true);
                ConfigureChoiceButtonForLayout(btn);

                var label = btn.GetComponentInChildren<Text>();
                if (label != null) label.text = c.Label;
                btn.onClick.AddListener(() =>
                {
                    c.OnSelect?.Invoke();
                    ClearChoices();
                    closeButton.gameObject.SetActive(true);
                });
                _choicePool.Add(btn);
            }

            if (choiceButtonParent is RectTransform crt)
                LayoutRebuilder.ForceRebuildLayoutImmediate(crt);
        }

        /// <summary>
        /// Префаб из редактора часто без спрайта и с targetGraphic=null — VL схлопывает кнопки до нуля.
        /// </summary>
        static void ConfigureChoiceButtonForLayout(Button btn)
        {
            var img = btn.GetComponent<Image>();
            if (img != null)
            {
                if (img.sprite == null)
                    img.sprite = FlatUiSprite;
                img.type = Image.Type.Simple;
                img.color = new Color(0.14f, 0.14f, 0.16f, 0.98f);
                btn.targetGraphic = img;
            }

            btn.interactable = true;

            var le = btn.GetComponent<LayoutElement>();
            if (le == null) le = btn.gameObject.AddComponent<LayoutElement>();
            le.minHeight = 46f;
            le.preferredHeight = 46f;
            le.minWidth = 220f;
            le.preferredWidth = 280f;
            le.flexibleWidth = 0f;

            var rt = btn.GetComponent<RectTransform>();
            rt.localScale = Vector3.one;
            rt.anchorMin = new Vector2(0f, 1f);
            rt.anchorMax = new Vector2(1f, 1f);
            rt.pivot = new Vector2(1f, 1f);
            rt.sizeDelta = new Vector2(0f, 46f);
            rt.anchoredPosition = Vector2.zero;
        }

        void ClearChoices()
        {
            foreach (var b in _choicePool)
            {
                if (b != null) Destroy(b.gameObject);
            }
            _choicePool.Clear();
        }

        void Close()
        {
            panelRoot.SetActive(false);
            ClearChoices();
            if (TikhayaTropa.Core.GameState.Instance != null)
                TikhayaTropa.Core.GameState.Instance.InputFrozen = false;
        }

        [Serializable]
        public class DialogueChoice
        {
            public string Label;
            public Action OnSelect;
        }
    }
}
