using TikhayaTropa.Core;
using TikhayaTropa.UI;
using UnityEngine;

namespace TikhayaTropa.Interaction
{
    /// <summary>
    /// Побочный квест «Надписи на скамейке»: несколько осмотров, награда в конце (сценарий, гл. 1).
    /// </summary>
    public class BenchInscriptionsInteractable : MonoBehaviour, IInteractable
    {
        [TextArea] [SerializeField] string prompt = "Скамейка под дубом";
        [TextArea] [SerializeField] string line1 =
            "На спинке — десятки мелких надписей. Большинство стёрлось от солнца и дождя.";
        [TextArea] [SerializeField] string line2 =
            "Кое-где угадываются отдельные слова: «…держалось…», «…легче…», «…спасибо…» — чужие следы.";
        [TextArea] [SerializeField] string line3 =
            "Одна строка почти целиком съедена мхом. Остаётся ощущение, что её писали дрожащей рукой.";
        [TextArea] [SerializeField] string lineFinal =
            "Ты присаживаешься чуть иначе — и внезапно читаешь ясно: «Я был здесь. Мне стало легче.»";
        [TextArea] [SerializeField] string doneFlavor =
            "Ты снова проводишь пальцами по знакомым бороздам дерева. Тепло остаётся.";

        public string PromptText => prompt;

        public bool CanInteract(GameState state) => true;

        public void Interact(GameState state)
        {
            if (state.HasFlag(GameFlags.BenchInscriptionsQuestDone))
            {
                DialoguePanel.Instance?.ShowMessage(doneFlavor);
                return;
            }

            if (!state.HasFlag(GameFlags.BenchInscriptionRead1))
            {
                state.SetFlag(GameFlags.BenchInscriptionRead1);
                DialoguePanel.Instance?.ShowMessage(line1);
                return;
            }

            if (!state.HasFlag(GameFlags.BenchInscriptionRead2))
            {
                state.SetFlag(GameFlags.BenchInscriptionRead2);
                DialoguePanel.Instance?.ShowMessage(line2);
                return;
            }

            if (!state.HasFlag(GameFlags.BenchInscriptionRead3))
            {
                state.SetFlag(GameFlags.BenchInscriptionRead3);
                DialoguePanel.Instance?.ShowMessage(line3);
                return;
            }

            state.SetFlag(GameFlags.BenchInscriptionsQuestDone);
            state.ModStat(StatKind.Acceptance, 1);
            state.AddDiaryEntry("bench-inscriptions",
                "Я перечитал надписи на скамейке. Чужие слова оказались близкими.");
            DialoguePanel.Instance?.ShowMessage(lineFinal);
        }
    }
}
