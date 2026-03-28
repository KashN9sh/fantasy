using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

namespace TikhayaTropa.UI
{
    public class DialoguePanel : MonoBehaviour
    {
        public static DialoguePanel Instance { get; private set; }

        [SerializeField] GameObject panelRoot;
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
        }

        void OnDestroy()
        {
            if (Instance == this) Instance = null;
        }

        public void ShowMessage(string text)
        {
            if (TikhayaTropa.Core.GameState.Instance != null)
                TikhayaTropa.Core.GameState.Instance.InputFrozen = true;
            ClearChoices();
            bodyText.text = text;
            panelRoot.SetActive(true);
            closeButton.gameObject.SetActive(true);
        }

        public void ShowChoices(string intro, IReadOnlyList<DialogueChoice> choices)
        {
            if (TikhayaTropa.Core.GameState.Instance != null)
                TikhayaTropa.Core.GameState.Instance.InputFrozen = true;
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
                img.color = new Color(0.32f, 0.29f, 0.26f, 1f);
                btn.targetGraphic = img;
            }

            btn.interactable = true;

            var le = btn.GetComponent<LayoutElement>();
            if (le == null) le = btn.gameObject.AddComponent<LayoutElement>();
            le.minHeight = 44f;
            le.preferredHeight = 44f;
            le.flexibleWidth = 1f;

            var rt = btn.GetComponent<RectTransform>();
            rt.localScale = Vector3.one;
            rt.anchorMin = new Vector2(0f, 1f);
            rt.anchorMax = new Vector2(1f, 1f);
            rt.pivot = new Vector2(0.5f, 1f);
            rt.sizeDelta = new Vector2(0f, 44f);
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
