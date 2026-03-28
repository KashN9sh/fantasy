using System.Collections.Generic;
using TikhayaTropa.Core;
using TikhayaTropa.UI;
using UnityEngine;

namespace TikhayaTropa.Interaction
{
    public class HermitInteractable : MonoBehaviour, IInteractable
    {
        public string PromptText => "Поговорить с отшельником";

        public bool CanInteract(GameState state) => !state.HasFlag(GameFlags.HermitQ1Done);

        public void Interact(GameState state)
        {
            var choices = new List<DialoguePanel.DialogueChoice>
            {
                new()
                {
                    Label = "Мне стало слишком тяжело.",
                    OnSelect = () =>
                    {
                        state.ModStat(StatKind.Acceptance, 3);
                        state.ModStat(StatKind.SelfKnowledge, 2);
                        state.SetFlag(GameFlags.HermitQ1Done);
                        DialoguePanel.Instance?.ShowMessage(
                            "Отшельник: «Тяжесть — честный спутник. Она не уйдёт. Но можно научиться нести.»\n\n«Дальше — роща. Туман. Но через неё — деревня с тёплыми огнями.»");
                    }
                },
                new()
                {
                    Label = "Хочу, чтобы это закончилось.",
                    OnSelect = () =>
                    {
                        state.ModStat(StatKind.Acceptance, 1);
                        state.AddDiaryEntry("hermit-wish",
                            "Я хочу, чтобы стало легче. Но не знаю, как.");
                        state.AddItem("hermit-lantern");
                        state.SetFlag(GameFlags.HermitQ1Done);
                        DialoguePanel.Instance?.ShowMessage(
                            "Отшельник молчит, но протягивает тебе старый фонарь.\n\n«Свет не гаснет, если его нести бережно. Дальше — роща. Туман. Но через неё — деревня с тёплыми огнями.»");
                    }
                },
                new()
                {
                    Label = "Не знаю. Просто иду.",
                    OnSelect = () =>
                    {
                        state.ModStat(StatKind.SelfKnowledge, 2);
                        state.SetFlag(GameFlags.HermitQ1Done);
                        DialoguePanel.Instance?.ShowMessage(
                            "Отшельник: «Честно. Это тоже ответ. Может, самый честный.»\n\n«Дальше — роща. Туман. Но через неё — деревня с тёплыми огнями.»");
                    }
                }
            };

            DialoguePanel.Instance?.ShowChoices(
                "Старик не поднимает головы, пока ты не подходишь ближе.\n\n«Зачем ты здесь?»",
                choices);
        }
    }
}
