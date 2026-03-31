using System.Collections.Generic;
using UnityEngine;

namespace TikhayaTropa.Blobber.Runtime.Visual
{
    public class BlobberSpriteAnimationPlayer : MonoBehaviour
    {
        public SpriteRenderer spriteRenderer;
        public List<Sprite> frames = new();
        public float framesPerSecond = 8f;
        public bool loop = true;

        float _time;
        int _frame;

        void Awake()
        {
            if (spriteRenderer == null)
                spriteRenderer = GetComponent<SpriteRenderer>();
        }

        void OnEnable()
        {
            _time = 0f;
            _frame = 0;
            ApplyFrame();
        }

        void Update()
        {
            if (spriteRenderer == null || frames == null || frames.Count == 0)
                return;

            var step = 1f / Mathf.Max(0.1f, framesPerSecond);
            _time += Time.deltaTime;
            while (_time >= step)
            {
                _time -= step;
                if (loop)
                    _frame = (_frame + 1) % frames.Count;
                else
                    _frame = Mathf.Min(_frame + 1, frames.Count - 1);
            }

            ApplyFrame();
        }

        void ApplyFrame()
        {
            if (spriteRenderer == null || frames == null || frames.Count == 0)
                return;
            _frame = Mathf.Clamp(_frame, 0, frames.Count - 1);
            spriteRenderer.sprite = frames[_frame];
        }
    }
}
