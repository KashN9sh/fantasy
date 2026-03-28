using TikhayaTropa.Core;
using TikhayaTropa.UI;
using UnityEngine;

namespace TikhayaTropa.Interaction
{
    public class ExamineInteractable : MonoBehaviour, IInteractable
    {
        [TextArea] [SerializeField] string prompt = "Осмотреть";
        [TextArea] [SerializeField] string examineText;
        [SerializeField] StatKind optionalStat;
        [SerializeField] int optionalStatDelta;
        [SerializeField] bool applyStatOnlyOnce = true;

        bool _statApplied;

        public string PromptText => prompt;

        public bool CanInteract(GameState state) => true;

        public void Interact(GameState state)
        {
            if (applyStatOnlyOnce && _statApplied) { }
            else if (optionalStatDelta != 0)
            {
                state.ModStat(optionalStat, optionalStatDelta);
                _statApplied = true;
            }
            DialoguePanel.Instance?.ShowMessage(examineText, DialogueSpeaker.Narrator);
        }
    }
}
