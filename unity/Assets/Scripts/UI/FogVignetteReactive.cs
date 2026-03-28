using TikhayaTropa.Core;
using UnityEngine;
using UnityEngine.UI;

namespace TikhayaTropa.UI
{
    /// <summary>
    /// Слегка разрежает туман при фонаре отшельника и после ритуала на поляне светлячков.
    /// </summary>
    [RequireComponent(typeof(Image))]
    public class FogVignetteReactive : MonoBehaviour
    {
        Image _img;

        void Awake()
        {
            _img = GetComponent<Image>();
        }

        void Start()
        {
            var st = GameState.Instance;
            if (st != null) st.OnStateChanged += OnStateChanged;
            Apply();
        }

        void OnDestroy()
        {
            if (GameState.Instance != null) GameState.Instance.OnStateChanged -= OnStateChanged;
        }

        void OnStateChanged() => Apply();

        void Apply()
        {
            if (_img == null) return;
            var st = GameState.Instance;
            var a = 0.38f;
            if (st != null && st.HasItem("hermit-lantern")) a -= 0.07f;
            if (st != null && st.HasFlag(GameFlags.FireflyGladeDone)) a -= 0.09f;
            _img.color = new Color(0.72f, 0.7f, 0.78f, Mathf.Clamp(a, 0.14f, 0.42f));
        }
    }
}
