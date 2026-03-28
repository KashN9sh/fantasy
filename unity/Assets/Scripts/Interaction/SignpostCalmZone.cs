using UnityEngine;

namespace TikhayaTropa.Interaction
{
    /// <summary>
    /// Зона у указателя: если игрок почти стоит ~2 с — «тихое чудо» (сценарий гл. 2).
    /// </summary>
    public class SignpostCalmZone : MonoBehaviour
    {
        [SerializeField] float calmSeconds = 2f;
        [SerializeField] float maxSpeedSqr = 0.04f;

        float _calmTime;

        public bool IsCalmEnough => _calmTime >= calmSeconds;

        void OnTriggerExit2D(Collider2D other)
        {
            if (other.CompareTag("Player")) _calmTime = 0f;
        }

        void OnTriggerStay2D(Collider2D other)
        {
            if (!other.CompareTag("Player")) return;
            var rb = other.attachedRigidbody;
            if (rb == null) return;
            if (rb.linearVelocity.sqrMagnitude > maxSpeedSqr)
                _calmTime = 0f;
            else
                _calmTime += Time.deltaTime;
        }
    }
}
