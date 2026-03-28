using System.Collections;
using TikhayaTropa.Core;
using UnityEngine;
using UnityEngine.UI;

namespace TikhayaTropa.Directors
{
    /// <summary>Один раз после интро лугов: обучение управлению.</summary>
    public class ControlsTutorialController : MonoBehaviour
    {
        [SerializeField] Canvas tutorialRoot;
        [SerializeField] Text bodyText;
        [SerializeField] Button dismissButton;
        [TextArea(4, 14)] [SerializeField] string tutorialCopy =
            "Ходьба — A / D или стрелки влево-вправо.\n" +
            "Бег — зажми Shift.\n" +
            "Прыжок — Пробел.\n" +
            "Дневник — J.\n" +
            "Взаимодействие с миром — E.\n\n" +
            "Рядом с объектами появится короткая подсказка, что можно сделать.";

        void Start()
        {
            if (tutorialRoot != null)
                tutorialRoot.gameObject.SetActive(false);
            StartCoroutine(Run());
        }

        IEnumerator Run()
        {
            yield return null;
            var st = GameState.Instance;
            if (st == null || tutorialRoot == null || bodyText == null || dismissButton == null)
                yield break;
            if (st.HasFlag(GameFlags.ControlsTutorialDone))
                yield break;

            while (!st.HasFlag(GameFlags.IntroCinematicDone))
                yield return null;

            if (st.HasFlag(GameFlags.ControlsTutorialDone))
                yield break;

            bodyText.text = tutorialCopy;
            tutorialRoot.gameObject.SetActive(true);
            st.InputFrozen = true;

            void Dismiss()
            {
                st.SetFlag(GameFlags.ControlsTutorialDone);
                tutorialRoot.gameObject.SetActive(false);
                st.InputFrozen = false;
                dismissButton.onClick.RemoveListener(Dismiss);
            }

            dismissButton.onClick.AddListener(Dismiss);
        }
    }
}
