using TikhayaTropa.Blobber.Data;
using TikhayaTropa.Core;
using TikhayaTropa.UI;
using UnityEngine;
using TikhayaTropa.Blobber.Runtime.Logic;

namespace TikhayaTropa.Blobber.Runtime.Interactions
{
    public class BlobberInspectInteraction : MonoBehaviour, IBlobberInteractable
    {
        [SerializeField] string promptText = "Осмотреть";
        [SerializeField, TextArea(2, 8)] string message = "...";
        [SerializeField] string setFlag = string.Empty;
        [SerializeField] string requireFlag = string.Empty;
        [SerializeField] string diaryId = string.Empty;
        [SerializeField, TextArea(2, 8)] string diaryText = string.Empty;
        [SerializeField] int setChapterAct;

        public string PromptText => promptText;
        public Vector3 PromptWorldPosition => transform.position + Vector3.up * 1.2f;

        public virtual void ApplyFrom(BlobberObjectInstance src)
        {
            promptText = src.parameters.prompt;
            message = src.parameters.message;
            setFlag = src.parameters.setFlag;
            requireFlag = src.parameters.requireFlag;
            diaryId = src.parameters.diaryId;
            diaryText = src.parameters.diaryText;
            setChapterAct = src.parameters.setChapterAct;
        }

        public bool CanInteract(GameState state)
        {
            if (state == null) return false;
            return string.IsNullOrEmpty(requireFlag) || state.HasFlag(requireFlag);
        }

        public virtual void Interact(GameState state)
        {
            GetComponent<BlobberLogicRunner>()?.TriggerInteract();
            if (state == null) return;
            if (!string.IsNullOrEmpty(message))
                DialoguePanel.Instance?.ShowMessage(message);
            if (!string.IsNullOrEmpty(setFlag))
                state.SetFlag(setFlag);
            if (!string.IsNullOrEmpty(diaryId) && !string.IsNullOrEmpty(diaryText))
                state.AddDiaryEntry(diaryId, diaryText);
            if (setChapterAct > 0)
                state.SetChapterAct(setChapterAct);
            SaveSystem.Save(state);
        }
    }
}
