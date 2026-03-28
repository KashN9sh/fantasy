using TikhayaTropa.Core;
using TikhayaTropa.Interaction;
using TikhayaTropa.UI;
using UnityEngine;
using UnityEngine.InputSystem;

namespace TikhayaTropa.Player
{
    public class PlayerInteraction : MonoBehaviour
    {
        [SerializeField] InputActionAsset inputActions;
        [SerializeField] float radius = 1.05f;
        [SerializeField] LayerMask interactableLayers = ~0;

        InputAction _interact;
        InputAction _diary;
        IInteractable _current;

        void Awake()
        {
            GameState.EnsureExists();
            var map = inputActions.FindActionMap("Player");
            _interact = map.FindAction("Interact");
            _diary = map.FindAction("Diary");
        }

        void OnEnable()
        {
            inputActions.FindActionMap("Player").Enable();
        }

        void OnDisable()
        {
            inputActions.FindActionMap("Player").Disable();
        }

        void Update()
        {
            var st = GameState.Instance;
            var diaryOpen = DiaryPanel.Instance != null && DiaryPanel.Instance.IsOpen;

            if (_diary.WasPressedThisFrame() && DiaryPanel.Instance != null)
            {
                var dialogueBlocking = DialoguePanel.Instance != null && DialoguePanel.Instance.IsBlocking;
                if (diaryOpen || (!dialogueBlocking && (st == null || !st.InputFrozen)))
                    DiaryPanel.Instance.Toggle();
            }

            if (diaryOpen)
            {
                InteractionPromptHUD.Instance?.SetPrompt(null);
                return;
            }

            if (st != null && st.InputFrozen)
            {
                InteractionPromptHUD.Instance?.SetPrompt(null);
                return;
            }

            if (DialoguePanel.Instance != null && DialoguePanel.Instance.IsBlocking)
            {
                InteractionPromptHUD.Instance?.SetPrompt(null);
                return;
            }

            _current = FindBestInteractable(st);
            InteractionPromptHUD.Instance?.SetPrompt(_current != null && (st == null || _current.CanInteract(st))
                ? _current.PromptText
                : null);

            if (!_interact.WasPressedThisFrame() || _current == null || st == null) return;
            if (!_current.CanInteract(st)) return;
            _current.Interact(st);
        }

        IInteractable FindBestInteractable(GameState state)
        {
            var col = GetComponent<Collider2D>();
            var pos = col != null ? (Vector2)col.bounds.center : (Vector2)transform.position;
            var hits = Physics2D.OverlapCircleAll(pos, radius, interactableLayers);
            IInteractable best = null;
            var bestD = float.MaxValue;
            foreach (var c in hits)
            {
                foreach (var mb in c.GetComponents<MonoBehaviour>())
                {
                    if (mb is not IInteractable inter) continue;
                    if (state != null && !inter.CanInteract(state)) continue;
                    var d = ((Vector2)c.transform.position - pos).sqrMagnitude;
                    if (d >= bestD) continue;
                    bestD = d;
                    best = inter;
                }
            }
            return best;
        }

        void OnDrawGizmosSelected()
        {
            Gizmos.color = Color.cyan;
            Gizmos.DrawWireSphere(transform.position, radius);
        }
    }
}
