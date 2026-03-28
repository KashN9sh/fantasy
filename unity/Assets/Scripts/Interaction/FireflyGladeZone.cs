using TikhayaTropa.Core;
using TikhayaTropa.UI;
using UnityEngine;

namespace TikhayaTropa.Interaction
{
    /// <summary>
    /// Поляна светлячков (гл. 2): постоять спокойно — статы и флаг для ослабления тумана в UI.
    /// </summary>
    [RequireComponent(typeof(Collider2D))]
    public class FireflyGladeZone : MonoBehaviour, IInteractable
    {
        [SerializeField] float waitSeconds = 4f;
        [SerializeField] float calmVelocityMax = 0.22f;
        [SerializeField] float rushVelocity = 6.5f;

        float _calmTimer;
        bool _inside;
        Transform _player;

        public string PromptText
        {
            get
            {
                var st = GameState.Instance;
                if (st == null) return string.Empty;
                if (st.HasFlag(GameFlags.FireflyGladeDone)) return string.Empty;
                if (!_inside) return "Сесть на поляну";
                return _calmTimer >= waitSeconds
                    ? "Дождаться светлячков"
                    : "Замри — светлячки осторожно подлетают";
            }
        }

        public bool CanInteract(GameState state) =>
            !state.HasFlag(GameFlags.FireflyGladeDone) && _inside;

        public void Interact(GameState state)
        {
            if (state.HasFlag(GameFlags.FireflyGladeDone) || !_inside) return;
            if (_calmTimer < waitSeconds)
            {
                DialoguePanel.Instance?.ShowMessage(
                    "Ты замираешь. Маленькие огоньки ещё на расстоянии — дай им секунды.",
                    DialogueSpeaker.Narrator);
                return;
            }

            state.SetFlag(GameFlags.FireflyGladeDone);
            state.ModStat(StatKind.Care, 5);
            state.ModStat(StatKind.Acceptance, 3);
            state.AddDiaryEntry("firefly-glade",
                "На поляне в тумане зажглись светлячки. Стало чуть теплее — будто роща вдохнула.");
            DialoguePanel.Instance?.ShowMessage(
                "Точки тёплого света кружат ближе. Туман над травой редеет на мгновение — не исчезает, но отступает на шаг.",
                DialogueSpeaker.Narrator);
        }

        void Update()
        {
            var st = GameState.Instance;
            if (st == null || st.HasFlag(GameFlags.FireflyGladeDone)) return;

            if (!_inside || _player == null)
            {
                _calmTimer = 0f;
                return;
            }

            var rb = _player.GetComponent<Rigidbody2D>();
            var v = rb != null ? rb.linearVelocity.magnitude : 0f;
            if (v > rushVelocity)
                _calmTimer = Mathf.Max(0f, _calmTimer - Time.deltaTime * 2.2f);
            else if (v < calmVelocityMax)
                _calmTimer += Time.deltaTime;
            else
                _calmTimer = Mathf.Max(0f, _calmTimer - Time.deltaTime * 0.35f);
        }

        void OnTriggerEnter2D(Collider2D other)
        {
            if (!other.CompareTag("Player")) return;
            _inside = true;
            _player = other.transform;
            _calmTimer = 0f;
        }

        void OnTriggerExit2D(Collider2D other)
        {
            if (!other.CompareTag("Player")) return;
            _inside = false;
            _player = null;
            _calmTimer = 0f;
        }
    }
}
