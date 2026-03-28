using TikhayaTropa.Core;
using TikhayaTropa.UI;
using UnityEngine;

namespace TikhayaTropa.Interaction
{
    public class GateInteractable : MonoBehaviour, IInteractable
    {
        [TextArea] [SerializeField] string inscription = "Кто идёт — тот уже начал.";
        [TextArea] [SerializeField] string diaryAfterPass =
            "Я прошёл через калитку. Назад нельзя. Впереди — неизвестно. Но я иду.";

        int _step;

        public string PromptText => !GameState.Instance || !GameState.Instance.HasFlag(GameFlags.GatePassed)
            ? _step == 0
                ? "Осмотреть калитку"
                : "Войти на тропу (E)"
            : string.Empty;

        public bool CanInteract(GameState state) => !state.HasFlag(GameFlags.GatePassed);

        public void Interact(GameState state)
        {
            if (_step == 0)
            {
                DialoguePanel.Instance?.ShowMessage(inscription);
                _step = 1;
                return;
            }

            state.SetFlag(GameFlags.GatePassed);
            state.SetChapterAct(2);
            state.AddDiaryEntry("gate", diaryAfterPass);
            DialoguePanel.Instance?.ShowMessage("Ты переступаешь порог. Тропа принимает шаг.");
            _step = 0;
        }
    }
}
