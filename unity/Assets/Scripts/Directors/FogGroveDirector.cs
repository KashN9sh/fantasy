using System.Collections;
using TikhayaTropa.Core;
using TikhayaTropa.UI;
using UnityEngine;

namespace TikhayaTropa.Directors
{
    /// <summary>
    /// Первый заход в рощу — короткая реплика (гл. 2).
    /// </summary>
    public class FogGroveDirector : MonoBehaviour
    {
        [TextArea] [SerializeField] string welcomeLine =
            "Туман обволакивает тропу. Собственные шаги звучат громче, чем на лугу.";

        IEnumerator Start()
        {
            yield return null;
            var st = GameState.Instance;
            if (st == null || st.HasFlag(GameFlags.FogGroveWelcomeDone)) yield break;
            st.SetFlag(GameFlags.FogGroveWelcomeDone);
            DialoguePanel.Instance?.ShowMessage(welcomeLine);
        }
    }
}
