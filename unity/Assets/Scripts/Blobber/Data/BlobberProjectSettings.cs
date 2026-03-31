using UnityEngine;
using TikhayaTropa.Animation;

namespace TikhayaTropa.Blobber.Data
{
    [CreateAssetMenu(menuName = "TikhayaTropa/Blobber/Project Settings", fileName = "BlobberProjectSettings")]
    public class BlobberProjectSettings : ScriptableObject
    {
        public BlobberObjectCatalog objectCatalog;
        public BlobberDialogueDatabase dialogueDatabase;
        public BlobberLogicGraphDatabase logicGraphDatabase;
        public SpriteAnimationAtlas spriteAnimationAtlas;
    }
}
