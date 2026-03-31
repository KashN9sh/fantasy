using TikhayaTropa.Blobber.Data;
using TikhayaTropa.Core;
using UnityEngine;
using UnityEngine.SceneManagement;

namespace TikhayaTropa.Blobber.Runtime.Interactions
{
    public class BlobberSceneTransitionInteraction : BlobberInspectInteraction
    {
        [SerializeField] string targetScene = string.Empty;
        [SerializeField] string targetSpawn = string.Empty;

        public override void ApplyFrom(BlobberObjectInstance src)
        {
            base.ApplyFrom(src);
            targetScene = src.parameters.targetScene;
            targetSpawn = src.parameters.targetSpawn;
        }

        public override void Interact(GameState state)
        {
            base.Interact(state);
            if (state == null || string.IsNullOrEmpty(targetScene)) return;
            state.RegisterLocationTransition();
            state.SetFlag(GameFlags.BlobberChapter2Done, targetScene == "Meadow" || targetScene == "FogGroveStub");
            SaveSystem.Save(state);
            SceneManager.LoadScene(targetScene);
        }
    }
}
