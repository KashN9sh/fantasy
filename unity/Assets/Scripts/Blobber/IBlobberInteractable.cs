using UnityEngine;
using TikhayaTropa.Core;

namespace TikhayaTropa.Blobber
{
    public interface IBlobberInteractable
    {
        string PromptText { get; }
        bool CanInteract(GameState state);
        void Interact(GameState state);
        Vector3 PromptWorldPosition { get; }
    }
}
