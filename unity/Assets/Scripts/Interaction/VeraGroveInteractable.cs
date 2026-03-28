using System.Collections.Generic;
using TikhayaTropa.Core;
using TikhayaTropa.UI;
using UnityEngine;

namespace TikhayaTropa.Interaction
{
    /// <summary>
    /// Вера у указателя — квест «Вспомнить тропу» (заготовка гл. 2).
    /// </summary>
    public class VeraGroveInteractable : MonoBehaviour, IInteractable
    {
        public string PromptText => "Поговорить";

        public bool CanInteract(GameState state) => true;

        public void Interact(GameState state)
        {
            if (state.HasFlag(GameFlags.VeraQuestDeclined))
            {
                DialoguePanel.Instance?.ShowMessage(
                    "Вера кивает: «Ладно. Если передумаешь — я всё ещё здесь, пока туман держит карту.»");
                return;
            }

            if (state.HasFlag(GameFlags.VeraQuestAccepted))
            {
                DialoguePanel.Instance?.ShowMessage(
                    "Вера чертит карандашом по бумаге: «Вот этот поворот — как ты его чувствуешь? Мне нужны слова, не только шаги.»");
                return;
            }

            var choices = new List<DialoguePanel.DialogueChoice>
            {
                new()
                {
                    Label = "Постараюсь описать, как помню.",
                    OnSelect = () =>
                    {
                        state.SetFlag(GameFlags.VeraQuestAccepted);
                        state.ModStat(StatKind.Trust, 2);
                        state.ModStat(StatKind.SelfKnowledge, 1);
                        state.AddDiaryEntry("vera-quest",
                            "Вера просит помочь ей дорисовать карту рощи. Я согласился.");
                        DialoguePanel.Instance?.ShowMessage(
                            "Вера улыбается в пол-губы: «Хорошо. Тогда пойдём по твоей памяти — шаг за шагом.»");
                    }
                },
                new()
                {
                    Label = "Сейчас не готов.",
                    OnSelect = () =>
                    {
                        state.SetFlag(GameFlags.VeraQuestDeclined);
                        DialoguePanel.Instance?.ShowMessage(
                            "Вера кивает: «Понимаю. Может, кто-то другой. Или ты вернёшься, когда тишина станет легче.»");
                    }
                }
            };

            DialoguePanel.Instance?.ShowChoices(
                "Женщина с картой и карандашом сидит на валуне. Линии на бумаге обрываются в тумане.\n\n«Ты откуда? Если пройдёшь ещё раз и расскажешь, что видел — я смогу продлить карту.»",
                choices);
        }
    }
}
