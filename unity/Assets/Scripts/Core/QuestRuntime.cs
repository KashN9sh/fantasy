using UnityEngine;

namespace TikhayaTropa.Core
{
    /// <summary>
    /// Заготовка каскадных квестов и таймеров на переходах — глава 1 пока в MeadowChapterDirector.
    /// </summary>
    public class QuestRuntime : MonoBehaviour
    {
        GameState _state;

        void Awake()
        {
            _state = GameState.Instance;
        }

        public void OnPlayerChangedLocation()
        {
            if (_state == null) return;
            _state.RegisterLocationTransition();
        }
    }
}
