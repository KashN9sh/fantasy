using UnityEngine;
using UnityEngine.EventSystems;

namespace TikhayaTropa.UI
{
    /// <summary>Вешается на кнопку/панель с Graphic.raycastTarget — показывает <see cref="TooltipOverlay"/>.</summary>
    public class HoverTooltipTrigger : MonoBehaviour, IPointerEnterHandler, IPointerExitHandler
    {
        [SerializeField] [TextArea(1, 4)] string tooltip;

        public void OnPointerEnter(PointerEventData eventData)
        {
            if (string.IsNullOrEmpty(tooltip)) return;
            TooltipOverlay.Instance?.Show(tooltip);
        }

        public void OnPointerExit(PointerEventData eventData)
        {
            TooltipOverlay.Instance?.Hide();
        }
    }
}
