using UnityEngine;

namespace TikhayaTropa.Player
{
    /// <summary>
    /// Плавное следование камеры за целью (типичный сайдскроллер).
    /// Если target не задан — ищется игрок по тегу Player.
    /// </summary>
    public class CameraFollow2D : MonoBehaviour
    {
        [SerializeField] Transform target;
        /// <summary>Положительный Y — камера выше игрока, персонаж и земля ниже в кадре (меньше «пустоты» под ногами).</summary>
        [SerializeField] Vector3 offset = new(0f, 1.7f, 0f);
        [SerializeField] float smoothTime = 0.18f;
        [SerializeField] bool lockY;

        Vector3 _smoothVel;

        void Start()
        {
            if (target == null)
            {
                var p = GameObject.FindGameObjectWithTag("Player");
                if (p != null) target = p.transform;
            }
        }

        void LateUpdate()
        {
            if (target == null) return;

            var desired = target.position + offset;
            desired.z = transform.position.z;
            if (lockY) desired.y = transform.position.y;

            transform.position = Vector3.SmoothDamp(transform.position, desired, ref _smoothVel, smoothTime);
        }
    }
}
