using TikhayaTropa.Core;
using TikhayaTropa.UI;
using UnityEngine;

namespace TikhayaTropa.Interaction
{
    public class LostSignpostInteractable : MonoBehaviour, IInteractable
    {
        [SerializeField] SignpostCalmZone calmZone;

        [TextArea] [SerializeField] string examineText =
            "Упавший столб. Три стрелки смотрят в разные стороны — ни одной надписи. Куда ни глянь, всё одинаково неясно.";
        [TextArea] [SerializeField] string hintStandStill =
            "Если просто постоять рядом и послушать тишину — может, туман отступит на шаг.";
        [TextArea] [SerializeField] string wonderText =
            "Ты замираешь. В серой дымке вспыхивают мелкие тёплые точки — как светлячки. Туман над тропой редеет на мгновение, и снова смыкается.\n\nТы всё ещё не знаешь, куда идти. Но следующий шаг виден.";
        [TextArea] [SerializeField] string doneFlavor =
            "Стрелки по-прежнему молчат. Но тропа под ногами чуть отчётливее.";

        public string PromptText => "Осмотреть указатель";

        public bool CanInteract(GameState state) => true;

        void Awake()
        {
            if (calmZone == null) calmZone = GetComponentInChildren<SignpostCalmZone>();
        }

        public void Interact(GameState state)
        {
            if (state.HasFlag(GameFlags.FogSignpostWonder))
            {
                DialoguePanel.Instance?.ShowMessage(doneFlavor);
                return;
            }

            if (!state.HasFlag(GameFlags.FogSignpostExamined))
            {
                state.SetFlag(GameFlags.FogSignpostExamined);
                DialoguePanel.Instance?.ShowMessage(examineText);
                return;
            }

            if (calmZone == null || !calmZone.IsCalmEnough)
            {
                DialoguePanel.Instance?.ShowMessage(hintStandStill);
                return;
            }

            state.SetFlag(GameFlags.FogSignpostWonder);
            state.ModStat(StatKind.Acceptance, 2);
            state.AddDiaryEntry("fog-signpost",
                "Я постоял у пустого указателя. Туман на миг отступил — будто мир сказал: иди дальше, даже вслепую.");
            DialoguePanel.Instance?.ShowMessage(wonderText);
        }
    }
}
