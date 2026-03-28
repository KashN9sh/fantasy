using TikhayaTropa.Core;
using UnityEngine;

namespace TikhayaTropa.UI
{
    /// <summary>
    /// Автосохранение при изменении состояния (вертикальный срез).
    /// </summary>
    public class AutoSaveListener : MonoBehaviour
    {
        void OnEnable()
        {
            if (GameState.Instance != null)
                GameState.Instance.OnStateChanged += OnState;
        }

        void OnDisable()
        {
            if (GameState.Instance != null)
                GameState.Instance.OnStateChanged -= OnState;
        }

        void OnState()
        {
            if (GameState.Instance != null)
                SaveSystem.Save(GameState.Instance);
        }
    }
}
