using TikhayaTropa.Core;
using UnityEngine;
using UnityEngine.SceneManagement;

namespace TikhayaTropa.Blobber
{
    [DisallowMultipleComponent]
    public class BlobberSceneDirector : MonoBehaviour
    {
        [SerializeField] BlobberFpsController player;
        [SerializeField] Transform startPoint;

        void Start()
        {
            GameState.EnsureExists();

            if (player == null)
                player = Object.FindAnyObjectByType<BlobberFpsController>();

            if (player == null) return;

            var st = GameState.Instance;
            var scene = SceneManager.GetActiveScene().name;
            if (st != null && st.TryGetBlobberPose(scene, out var pos, out var yaw))
                player.TeleportTo(pos, yaw);
            else if (startPoint != null)
                player.TeleportTo(startPoint.position, startPoint.eulerAngles.y);

            if (st != null)
                st.SetBlobberPose(scene, player.transform.position, player.transform.eulerAngles.y);
        }
    }
}
