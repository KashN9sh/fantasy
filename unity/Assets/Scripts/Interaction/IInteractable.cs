namespace TikhayaTropa.Interaction
{
    public interface IInteractable
    {
        string PromptText { get; }
        bool CanInteract(Core.GameState state);
        void Interact(Core.GameState state);
    }
}
