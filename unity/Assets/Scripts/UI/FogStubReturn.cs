using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

namespace TikhayaTropa.UI
{
    public class FogStubReturn : MonoBehaviour
    {
        [SerializeField] string titleSceneName = "Title";

        void Start()
        {
            var b = GetComponentInChildren<Button>(true);
            if (b != null)
                b.onClick.AddListener(() => SceneManager.LoadScene(titleSceneName));
        }
    }
}
