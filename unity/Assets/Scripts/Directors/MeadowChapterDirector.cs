using System.Collections;
using TikhayaTropa.Core;
using UnityEngine;
using UnityEngine.UI;

namespace TikhayaTropa.Directors
{
    public class MeadowChapterDirector : MonoBehaviour
    {
        [SerializeField] Canvas introCanvas;
        [SerializeField] Image introBlack;
        [SerializeField] Text introLine;
        [SerializeField] float lineDuration = 4f;
        [SerializeField] float fadeDuration = 1.2f;

        IEnumerator Start()
        {
            var st = GameState.Instance;
            if (st == null || st.HasFlag(GameFlags.IntroCinematicDone)) yield break;

            st.InputFrozen = true;
            introCanvas.gameObject.SetActive(true);
            introBlack.color = Color.black;
            introLine.text = "Внутри — привычный гул. Ты уже знаешь его. Сегодня он громче обычного.";
            SetTextAlpha(introLine, 0f);

            for (var t = 0f; t < lineDuration * 0.35f; t += Time.deltaTime)
            {
                SetTextAlpha(introLine, Mathf.Clamp01(t / 0.8f));
                yield return null;
            }

            SetTextAlpha(introLine, 1f);
            yield return new WaitForSeconds(lineDuration * 0.65f);

            for (var t = 0f; t < fadeDuration; t += Time.deltaTime)
            {
                var k = t / fadeDuration;
                introBlack.color = new Color(0, 0, 0, 1f - k);
                SetTextAlpha(introLine, 1f - k);
                yield return null;
            }

            introCanvas.gameObject.SetActive(false);
            st.SetFlag(GameFlags.IntroCinematicDone);
            st.InputFrozen = false;
        }

        static void SetTextAlpha(Text text, float a)
        {
            var c = text.color;
            c.a = a;
            text.color = c;
        }
    }
}
