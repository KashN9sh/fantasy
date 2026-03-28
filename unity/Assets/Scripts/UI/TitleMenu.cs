using TikhayaTropa.Core;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

namespace TikhayaTropa.UI
{
    public class TitleMenu : MonoBehaviour
    {
        [SerializeField] string meadowSceneName = "Meadow";
        [SerializeField] Button newGameButton;
        [SerializeField] Button continueButton;
        [SerializeField] Button quitButton;

        void Start()
        {
            if (GameState.Instance == null)
            {
                var go = new GameObject("GameSession");
                go.AddComponent<GameState>();
            }

            continueButton.interactable = SaveSystem.SaveExists();

            newGameButton.onClick.AddListener(() =>
            {
                SaveSystem.DeleteSave();
                GameState.Instance.NewGame();
                SceneManager.LoadScene(meadowSceneName);
            });

            continueButton.onClick.AddListener(() =>
            {
                if (!SaveSystem.TryLoad(GameState.Instance)) return;
                SceneManager.LoadScene(meadowSceneName);
            });

            if (quitButton != null)
                quitButton.onClick.AddListener(Application.Quit);
        }
    }
}
