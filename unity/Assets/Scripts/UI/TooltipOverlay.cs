using UnityEngine;
using UnityEngine.InputSystem;
using UnityEngine.UI;

namespace TikhayaTropa.UI
{
    /// <summary>Плавающая подсказка у курсора (титул и др. UI).</summary>
    public class TooltipOverlay : MonoBehaviour
    {
        public static TooltipOverlay Instance { get; private set; }

        [SerializeField] RectTransform panel;
        [SerializeField] Text label;
        [SerializeField] Vector2 screenOffset = new(14f, -12f);

        Canvas _canvas;
        bool _visible;

        void Awake()
        {
            Instance = this;
            _canvas = GetComponentInParent<Canvas>();
            if (panel != null)
                panel.gameObject.SetActive(false);
        }

        void OnDestroy()
        {
            if (Instance == this) Instance = null;
        }

        public void Show(string text)
        {
            if (label == null || panel == null) return;
            label.text = text ?? string.Empty;
            panel.gameObject.SetActive(true);
            _visible = true;
        }

        public void Hide()
        {
            _visible = false;
            if (panel != null)
                panel.gameObject.SetActive(false);
        }

        void LateUpdate()
        {
            if (!_visible || panel == null || _canvas == null) return;

            var mouse = Mouse.current;
            if (mouse == null) return;

            var canvasRt = _canvas.transform as RectTransform;
            RectTransformUtility.ScreenPointToLocalPointInRectangle(
                canvasRt,
                mouse.position.ReadValue() + screenOffset,
                _canvas.renderMode == RenderMode.ScreenSpaceOverlay ? null : _canvas.worldCamera,
                out var local);
            panel.anchoredPosition = local;
        }
    }
}
