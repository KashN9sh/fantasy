using UnityEngine;
using UnityEngine.UI;

namespace TikhayaTropa.UI
{
    public class InteractionPromptHUD : MonoBehaviour
    {
        public static InteractionPromptHUD Instance { get; private set; }

        [SerializeField] Text promptText;

        void Awake()
        {
            Instance = this;
            promptText.text = string.Empty;
            if (promptText != null)
                promptText.raycastTarget = false;
        }

        void OnDestroy()
        {
            if (Instance == this) Instance = null;
        }

        public void SetPrompt(string text)
        {
            if (promptText == null) return;
            promptText.text = string.IsNullOrEmpty(text)
                ? "[A/D или стрелки] Ходьба   ·   [Пробел] Прыжок   ·   [J] Дневник"
                : $"[E] {text}   ·   [Пробел] Прыжок   ·   [J] Дневник";
        }
    }
}
