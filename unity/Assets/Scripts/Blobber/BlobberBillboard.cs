using UnityEngine;

namespace TikhayaTropa.Blobber
{
    /// <summary>Вертикальный билборд к главной камере (ось Y вверх).</summary>
    public class BlobberBillboard : MonoBehaviour
    {
        void LateUpdate()
        {
            var cam = Camera.main;
            if (cam == null) return;
            var to = cam.transform.position - transform.position;
            to.y = 0f;
            if (to.sqrMagnitude < 0.0001f) return;
            transform.rotation = Quaternion.LookRotation(-to.normalized, Vector3.up);
        }
    }
}
