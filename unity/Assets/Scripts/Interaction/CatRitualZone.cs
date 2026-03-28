using TikhayaTropa.Core;
using TikhayaTropa.UI;
using UnityEngine;

namespace TikhayaTropa.Interaction
{
    [RequireComponent(typeof(Collider2D))]
    public class CatRitualZone : MonoBehaviour, IInteractable
    {
        [SerializeField] float waitSeconds = 3f;
        [SerializeField] float scareVelocity = 2.2f;

        float _calmTimer;
        bool _inside;
        Transform _player;

        public string PromptText
        {
            get
            {
                var st = GameState.Instance;
                if (st == null) return string.Empty;
                if (st.HasFlag(GameFlags.CatTrusted)) return string.Empty;
                if (st.HasFlag(GameFlags.CatScared)) return "Кот далеко";
                return "Подождать рядом с котом";
            }
        }

        public bool CanInteract(GameState state)
        {
            if (state.HasFlag(GameFlags.CatTrusted) || state.HasFlag(GameFlags.CatScared)) return false;
            return _inside && _calmTimer >= waitSeconds;
        }

        public void Interact(GameState state)
        {
            if (!CanInteract(state)) return;
            state.SetFlag(GameFlags.CatTrusted);
            state.ModStat(StatKind.Care, 3);
            state.AddDiaryEntry("cat",
                "Иногда нужно просто сесть и подождать.");
            DialoguePanel.Instance?.ShowMessage("Рыжий кот доверяется и устраивается на коленях.");
        }

        void Update()
        {
            var st = GameState.Instance;
            if (st == null || st.HasFlag(GameFlags.CatTrusted) || st.HasFlag(GameFlags.CatScared)) return;

            if (!_inside || _player == null)
            {
                _calmTimer = 0f;
                return;
            }

            var rb = _player.GetComponent<Rigidbody2D>();
            var v = rb != null ? rb.linearVelocity.magnitude : 0f;
            if (v > scareVelocity)
            {
                st.SetFlag(GameFlags.CatScared);
                _calmTimer = 0f;
                DialoguePanel.Instance?.ShowMessage("Кот вздрагивает и убегает в траву.");
                return;
            }

            if (v < 0.15f)
                _calmTimer += Time.deltaTime;
            else
                _calmTimer = Mathf.Max(0f, _calmTimer - Time.deltaTime * 0.5f);
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
