using System.Text;
using TikhayaTropa.Core;
using UnityEngine;
using UnityEngine.UI;

namespace TikhayaTropa.UI
{
    public class DiaryPanel : MonoBehaviour
    {
        public static DiaryPanel Instance { get; private set; }

        [SerializeField] GameObject panelRoot;
        [SerializeField] Text entriesText;

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

        /// <summary>Панель открыта (для ввода: закрытие по J даже при InputFrozen).</summary>
        public bool IsOpen => panelRoot != null && panelRoot.activeSelf;

        void Awake()
        {
            Instance = this;

            var bg = panelRoot != null ? panelRoot.GetComponent<Image>() : null;
            if (bg != null && bg.sprite == null)
            {
                bg.sprite = FlatUiSprite;
                bg.type = Image.Type.Simple;
            }

            if (GameState.Instance != null)
                GameState.Instance.OnDiaryChanged += Refresh;

            panelRoot.SetActive(false);
        }

        void OnDestroy()
        {
            if (GameState.Instance != null)
                GameState.Instance.OnDiaryChanged -= Refresh;
            if (Instance == this) Instance = null;
        }

        public void Toggle()
        {
            if (panelRoot.activeSelf)
            {
                panelRoot.SetActive(false);
                if (GameState.Instance != null) GameState.Instance.InputFrozen = false;
            }
            else
            {
                Refresh();
                panelRoot.SetActive(true);
                if (GameState.Instance != null) GameState.Instance.InputFrozen = true;
            }
        }

        void Refresh()
        {
            if (entriesText == null) return;
            var st = GameState.Instance;
            var sb = new StringBuilder();
            sb.AppendLine("Дневник тропы\n");
            if (st == null || st.DiaryEntries.Count == 0)
                sb.AppendLine("(пока пусто)");
            else
            {
                foreach (var e in st.DiaryEntries)
                    sb.AppendLine($"— {e.text}\n");
            }

            entriesText.text = sb.ToString();
        }
    }
}
