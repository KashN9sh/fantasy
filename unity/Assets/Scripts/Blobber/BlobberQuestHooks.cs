using TikhayaTropa.Core;
using UnityEngine;

namespace TikhayaTropa.Blobber
{
    /// <summary>Вспомогательный компонент для сюжетных хуков в blobber-сценах.</summary>
    public class BlobberQuestHooks : MonoBehaviour
    {
        public void MarkChapter1Done()
        {
            if (GameState.Instance == null) return;
            GameState.Instance.SetFlag(GameFlags.BlobberChapter1Done);
            GameState.Instance.SetChapterAct(2);
        }

        public void MarkChapter2Done()
        {
            if (GameState.Instance == null) return;
            GameState.Instance.SetFlag(GameFlags.BlobberChapter2Done);
            GameState.Instance.SetChapterAct(3);
        }
    }
}
