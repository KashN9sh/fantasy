using TikhayaTropa.Blobber.Data;
using TikhayaTropa.Core;
using TikhayaTropa.UI;
using UnityEngine;

namespace TikhayaTropa.Blobber.Runtime.Interactions
{
    public class BlobberCatScareInteraction : BlobberInspectInteraction
    {
        [SerializeField] float scareSpeedThreshold = 6f;
        [SerializeField] float scareDistance = 1.8f;
        [SerializeField] string scaredFlag = GameFlags.CatScared;
        [SerializeField] string trustedFlag = GameFlags.CatTrusted;

        BlobberFpsController _player;
        Vector3 _prevPlayerPos;

        public override void ApplyFrom(BlobberObjectInstance src)
        {
            base.ApplyFrom(src);
        }

        void Start()
        {
            _player = Object.FindAnyObjectByType<BlobberFpsController>();
            if (_player != null) _prevPlayerPos = _player.transform.position;
        }

        void Update()
        {
            if (_player == null)
            {
                _player = Object.FindAnyObjectByType<BlobberFpsController>();
                return;
            }

            var delta = _player.transform.position - _prevPlayerPos;
            var speed = delta.magnitude / Mathf.Max(Time.deltaTime, 0.0001f);
            _prevPlayerPos = _player.transform.position;

            var st = GameState.Instance;
            if (st == null || st.HasFlag(scaredFlag) || st.HasFlag(trustedFlag)) return;

            var dist = Vector3.Distance(transform.position, _player.transform.position);
            if (dist <= scareDistance && speed >= scareSpeedThreshold)
            {
                st.SetFlag(scaredFlag);
                DialoguePanel.Instance?.ShowMessage("Кот вздрагивает и ускользает в тень. Кажется, ты подошёл слишком резко.");
                transform.position += transform.right * 2.2f;
                SaveSystem.Save(st);
            }
        }
    }
}
