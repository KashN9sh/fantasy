using UnityEngine;

namespace TikhayaTropa.Core
{
    /// <summary>
    /// Переходы локаций и счётчики. Сквозной квест «Четыре вопроса» стартует по флагу
    /// <see cref="GameFlags.HermitFourQuestionsStarted"/> при первом разговоре с отшельником.
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
