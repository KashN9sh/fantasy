using TikhayaTropa.Blobber.Data;
using TikhayaTropa.Core;
using UnityEngine;

namespace TikhayaTropa.Blobber.Runtime.Interactions
{
    public class BlobberCustomActionInteraction : BlobberInspectInteraction
    {
        [SerializeField] string customActionId = string.Empty;
        [SerializeField, TextArea(1, 8)] string customPayload = string.Empty;

        public override void ApplyFrom(BlobberObjectInstance src)
        {
            base.ApplyFrom(src);
            customActionId = src.parameters.customActionId;
            customPayload = src.parameters.customPayload;
        }

        public override void Interact(GameState state)
        {
            base.Interact(state);
            if (string.IsNullOrWhiteSpace(customActionId)) return;

            var receivers = Object.FindObjectsByType<MonoBehaviour>(FindObjectsSortMode.None);
            foreach (var receiver in receivers)
            {
                if (receiver is IBlobberCustomActionReceiver actionReceiver &&
                    actionReceiver.TryHandle(customActionId, customPayload, gameObject, state))
                    return;
            }

            Debug.LogWarning($"Blobber custom action '{customActionId}' has no receiver in scene.");
        }
    }
}
