using TikhayaTropa.Core;
using TikhayaTropa.UI;
using UnityEngine;
using UnityEngine.InputSystem;

namespace TikhayaTropa.Blobber
{
    [DisallowMultipleComponent]
    public class BlobberInteractionRaycaster : MonoBehaviour
    {
        [SerializeField] Transform rayOrigin;
        [SerializeField] float maxDistance = 3.3f;
        [SerializeField] LayerMask mask = ~0;

        IBlobberInteractable _current;

        void Awake()
        {
            GameState.EnsureExists();
        }

        void Update()
        {
            var st = GameState.Instance;
            if (st == null)
            {
                GameState.EnsureExists();
                st = GameState.Instance;
            }
            var kb = Keyboard.current;
            if (kb != null && kb.jKey.wasPressedThisFrame && DiaryPanel.Instance != null)
                DiaryPanel.Instance.Toggle();

            if (st != null && st.InputFrozen)
            {
                InteractionPromptHUD.Instance?.SetPrompt(null);
                return;
            }

            var origin = rayOrigin != null ? rayOrigin : transform;
            _current = null;
            if (Physics.Raycast(origin.position, origin.forward, out var hit, maxDistance, mask, QueryTriggerInteraction.Collide))
            {
                foreach (var mb in hit.collider.GetComponents<MonoBehaviour>())
                {
                    if (mb is not IBlobberInteractable it) continue;
                    if (st != null && !it.CanInteract(st)) continue;
                    _current = it;
                    break;
                }
            }

            if (_current != null)
                InteractionPromptHUD.Instance?.SetPrompt(_current.PromptText, _current.PromptWorldPosition);
            else
                InteractionPromptHUD.Instance?.SetPrompt(null);

            var interactPressed = kb != null && (kb.eKey.wasPressedThisFrame || kb.fKey.wasPressedThisFrame || kb.enterKey.wasPressedThisFrame);
            if (interactPressed && _current != null && st != null && _current.CanInteract(st))
                _current.Interact(st);
        }
    }
}
