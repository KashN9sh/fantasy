using UnityEngine;

namespace TikhayaTropa.Blobber.Runtime.Logic
{
    [DisallowMultipleComponent]
    public class BlobberMoveToTargetAgent : MonoBehaviour
    {
        Transform _target;
        float _speed;
        bool _active;

        public void SetTarget(Transform target, float speed)
        {
            _target = target;
            _speed = Mathf.Max(0.01f, speed);
            _active = _target != null;
        }

        void Update()
        {
            if (!_active || _target == null) return;

            var current = transform.position;
            var desired = _target.position;
            transform.position = Vector3.MoveTowards(current, desired, _speed * Time.deltaTime);
            if (Vector3.SqrMagnitude(transform.position - desired) < 0.0001f)
                _active = false;
        }
    }
}
