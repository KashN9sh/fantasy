using TikhayaTropa.Core;
using TikhayaTropa.UI;
using UnityEngine;

namespace TikhayaTropa.Interaction
{
    /// <summary>
    /// Старое дупло: записка + сухая лаванда (гл. 2).
    /// </summary>
    public class HollowTreeInteractable : MonoBehaviour, IInteractable
    {
        [TextArea] [SerializeField] string prompt = "Заглянуть в дупло";
        [TextArea] [SerializeField] string examineText =
            "В жестяной коробке — записка: «Если ты читаешь это — значит, ты не заблудился. Ты просто ещё не нашёл дорогу. Это не одно и то же.»\n\nРядом — пучок сухой лаванды.";
        [TextArea] [SerializeField] string doneFlavor =
            "Коробка пуста, но запах лаванды ещё держится в дупле.";

        public string PromptText => prompt;

        public bool CanInteract(GameState state) => true;

        public void Interact(GameState state)
        {
            if (state.HasFlag(GameFlags.HollowLavenderTaken))
            {
                DialoguePanel.Instance?.ShowMessage(doneFlavor, DialogueSpeaker.Narrator);
                return;
            }

            state.SetFlag(GameFlags.HollowLavenderTaken);
            state.AddItem("dried-lavender");
            state.AddDiaryEntry("hollow-lavender",
                "В дупле нашёл записку и лаванду. Слова о дороге — не о заблуждении.");
            DialoguePanel.Instance?.ShowMessage(examineText, DialogueSpeaker.Narrator);
        }
    }
}
