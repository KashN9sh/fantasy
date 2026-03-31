using System;
using System.Collections.Generic;
using UnityEngine;

namespace TikhayaTropa.Animation
{
    [Serializable]
    public class SpriteAnimationClipDef
    {
        public string id = "idle";
        // Логическая "папка" клипа (обычно имя source sheet, например Player).
        public string group = "Default";
        public float framesPerSecond = 8f;
        public List<Sprite> frames = new();
    }

    [CreateAssetMenu(menuName = "TikhayaTropa/Animation/Sprite Animation Atlas", fileName = "SpriteAnimationAtlas")]
    public class SpriteAnimationAtlas : ScriptableObject
    {
        // Legacy field (kept for backward compatibility).
        public Texture2D sourceTexture;
        public List<Texture2D> sourceTextures = new();
        public string spriteFolder = "Assets";
        public List<SpriteAnimationClipDef> clips = new();
    }
}
