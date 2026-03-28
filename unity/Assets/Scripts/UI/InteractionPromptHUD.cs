using UnityEngine;
using UnityEngine.UI;

namespace TikhayaTropa.UI
{
    /// <summary>Контекстный тултип [E] у нижней кромки; без постоянной шпаргалки по управлению.</summary>
    public class InteractionPromptHUD : MonoBehaviour
    {
        public static InteractionPromptHUD Instance { get; private set; }

        [SerializeField] CanvasGroup canvasGroup;
        [SerializeField] Text promptText;

        void Awake()
        {
            Instance = this;
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

        public void SetPrompt(string text)
        {
            if (promptText == null) return;
            if (string.IsNullOrEmpty(text))
            {
                promptText.text = string.Empty;
                if (canvasGroup != null)
                    canvasGroup.alpha = 0f;
                else
                    promptText.enabled = false;
                return;
            }

            promptText.text = $"[E] {text}";
            if (canvasGroup != null)
                canvasGroup.alpha = 1f;
            else
                promptText.enabled = true;
        }
    }
}
