using TikhayaTropa.Core;
using TikhayaTropa.UI;
using UnityEngine;
using UnityEngine.SceneManagement;

namespace TikhayaTropa.Blobber
{
    /// <summary>Простое взаимодействие: текст, флаг, запись в дневник и/или переход в сцену.</summary>
    public class BlobberSimpleInteractable : MonoBehaviour, IBlobberInteractable
    {
        [SerializeField] string promptText = "Осмотреть";
        [SerializeField] string message = "...";
        [SerializeField] string setFlag = string.Empty;
        [SerializeField] string requireFlag = string.Empty;
        [SerializeField] string diaryId = string.Empty;
        [SerializeField] string diaryText = string.Empty;
        [SerializeField] string loadScene = string.Empty;
        [SerializeField] int setChapterAct = 0;

        public string PromptText => promptText;
        public Vector3 PromptWorldPosition => transform.position + Vector3.up * 1.3f;

        public bool CanInteract(GameState state)
        {
            if (state == null) return false;
            if (!string.IsNullOrEmpty(requireFlag) && !state.HasFlag(requireFlag)) return false;
            return true;
        }

        public void Interact(GameState state)
        {
            if (state == null) return;

            if (!string.IsNullOrEmpty(message))
                DialoguePanel.Instance?.ShowMessage(message);

            if (!string.IsNullOrEmpty(setFlag))
                state.SetFlag(setFlag);

            if (!string.IsNullOrEmpty(diaryId) && !string.IsNullOrEmpty(diaryText))
                state.AddDiaryEntry(diaryId, diaryText);

            if (setChapterAct > 0)
                state.SetChapterAct(setChapterAct);

            if (!string.IsNullOrEmpty(loadScene))
            {
                state.RegisterLocationTransition();
                SaveSystem.Save(state);
                SceneManager.LoadScene(loadScene);
            }
        }
    }
}
