using UnityEngine;

namespace TikhayaTropa.Interaction
{
    public interface IInteractable
    {
        string PromptText { get; }
        bool CanInteract(Core.GameState state);
        void Interact(Core.GameState state);

        /// <summary>Точка над которой показывается подсказка [E]; по умолчанию — верх AABB коллайдера.</summary>
        Vector3 GetPromptWorldPosition(Collider2D hitCollider)
        {
            if (hitCollider == null) return Vector3.zero;
            var b = hitCollider.bounds;
            return new Vector3(b.center.x, b.max.y, b.center.z) + Vector3.up * 0.06f;
        }
    }
}
