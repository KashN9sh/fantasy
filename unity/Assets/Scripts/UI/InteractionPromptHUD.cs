using UnityEngine;
using UnityEngine.UI;

namespace TikhayaTropa.UI
{
    /// <summary>Подсказка [E] над объектом в мире (экранный UI, следует за камерой).</summary>
    public class InteractionPromptHUD : MonoBehaviour
    {
        public static InteractionPromptHUD Instance { get; private set; }

        [SerializeField] CanvasGroup canvasGroup;
        [SerializeField] Text promptText;
        [SerializeField] float screenOffsetY = 10f;

        Canvas _canvas;
        RectTransform _rect;
        bool _hasAnchor;
        Vector3 _worldAnchor;

        void Awake()
        {
            Instance = this;
            _rect = transform as RectTransform;
            _canvas = GetComponentInParent<Canvas>();

            if (promptText != null)
            {
                promptText.text = string.Empty;
                promptText.raycastTarget = false;
            }

            if (canvasGroup != null)
                canvasGroup.alpha = 0f;
        }

        void OnDestroy()
        {
            if (Instance == this) Instance = null;
        }

        void LateUpdate()
        {
            if (canvasGroup == null || canvasGroup.alpha < 0.01f || !_hasAnchor) return;
            RefreshPosition();
        }

        void RefreshPosition()
        {
            if (_canvas == null || _rect == null) return;
            var cam = Camera.main;
            if (cam == null) return;

            var screen = cam.WorldToScreenPoint(_worldAnchor);
            if (screen.z <= 0f) return;

            var canvasRt = _canvas.transform as RectTransform;
            var camForRect = _canvas.renderMode == RenderMode.ScreenSpaceOverlay ? null : _canvas.worldCamera;
            if (!RectTransformUtility.ScreenPointToLocalPointInRectangle(canvasRt, screen, camForRect, out var local))
                return;

            _rect.anchoredPosition = local + new Vector2(0f, screenOffsetY);
        }

        /// <param name="worldAnchor">Верх объекта в мировых координатах; при <c>null</c> подсказка скрыта.</param>
        public void SetPrompt(string text, Vector3? worldAnchor = null)
        {
            if (promptText == null) return;

            if (string.IsNullOrEmpty(text) || !worldAnchor.HasValue)
            {
                promptText.text = string.Empty;
                _hasAnchor = false;
                if (canvasGroup != null)
                    canvasGroup.alpha = 0f;
                else
                    promptText.enabled = false;
                return;
            }

            promptText.text = $"[E] {text}";
            _worldAnchor = worldAnchor.Value;
            _hasAnchor = true;

            if (canvasGroup != null)
                canvasGroup.alpha = 1f;
            else
                promptText.enabled = true;

            RefreshPosition();
        }
    }
}
