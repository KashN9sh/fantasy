using System;
using System.Collections.Generic;
using UnityEngine;

namespace TikhayaTropa.Blobber.Data
{
    public enum BlobberVisualKind
    {
        Primitive,
        Sprite,
        Animation
    }

    public enum BlobberSpriteScaleMode
    {
        LinkedXY,
        FreeXY
    }

    [Serializable]
    public class BlobberObjectCatalogEntry
    {
        public string id = "object-id";
        public string displayName = "Object";
        public BlobberVisualKind visualKind = BlobberVisualKind.Primitive;
        public PrimitiveType previewPrimitive = PrimitiveType.Cylinder;
        public Color previewColor = new(0.65f, 0.62f, 0.5f, 1f);
        public Sprite spriteAsset;
        public string animationClipId = string.Empty;
        public bool useBillboard = true;
        public BlobberSpriteScaleMode spriteScaleMode = BlobberSpriteScaleMode.LinkedXY;
        public BlobberInteractionType interactionType = BlobberInteractionType.None;
        public BlobberObjectParams defaultParams = new();
        public Vector3 defaultScale = new(0.45f, 1.1f, 0.45f);
    }

    [CreateAssetMenu(menuName = "TikhayaTropa/Blobber/Object Catalog", fileName = "BlobberObjectCatalog")]
    public class BlobberObjectCatalog : ScriptableObject
    {
        public List<BlobberObjectCatalogEntry> entries = new();

        public BlobberObjectCatalogEntry Find(string id)
        {
            return entries.Find(e => e.id == id);
        }
    }
}
