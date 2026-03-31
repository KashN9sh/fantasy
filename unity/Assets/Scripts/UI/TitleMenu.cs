using TikhayaTropa.Core;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

namespace TikhayaTropa.UI
{
    public class TitleMenu : MonoBehaviour
    {
        [SerializeField] string meadowSceneName = "Meadow";
        [SerializeField] string blobberSceneName = "BlobberMeadow";
        [SerializeField] Button newGameButton;
        [SerializeField] Button continueButton;
        [SerializeField] Button blobberPrototypeButton;
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

            if (blobberPrototypeButton != null)
            {
                blobberPrototypeButton.onClick.AddListener(() =>
                {
                    SaveSystem.DeleteSave();
                    GameState.Instance.NewGame();
                    SceneManager.LoadScene(blobberSceneName);
                });
            }

            continueButton.onClick.AddListener(() =>
            {
                if (!SaveSystem.TryLoad(GameState.Instance)) return;
                var blobberScene = GameState.Instance.BlobberScene;
                if (!string.IsNullOrEmpty(blobberScene) && Application.CanStreamedLevelBeLoaded(blobberScene))
                    SceneManager.LoadScene(blobberScene);
                else
                    SceneManager.LoadScene(meadowSceneName);
            });

            if (quitButton != null)
                quitButton.onClick.AddListener(Application.Quit);
        }
    }
}
