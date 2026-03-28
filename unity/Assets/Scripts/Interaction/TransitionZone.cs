using TikhayaTropa.Core;
using TikhayaTropa.UI;
using UnityEngine;
using UnityEngine.SceneManagement;

namespace TikhayaTropa.Interaction
{
    public class TransitionZone : MonoBehaviour, IInteractable
    {
        [SerializeField] string targetSceneName = "FogGroveStub";
        [TextArea] [SerializeField] string blockedMessage =
            "Ты слышишь тихий голос: «Подожди. Я хочу тебя спросить.» — отшельник всё ещё ждёт у камня.";

        public string PromptText => "Идти дальше по тропе";

        public bool CanInteract(GameState state) => true;

        public void Interact(GameState state)
        {
            if (!state.HasFlag(GameFlags.HermitQ1Done))
            {
                DialoguePanel.Instance?.ShowMessage(blockedMessage);
                return;
            }

            state.RegisterLocationTransition();
            state.SetChapterAct(2);
            SceneManager.LoadScene(targetSceneName);
        }
    }
}
