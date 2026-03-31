using TikhayaTropa.Core;
using UnityEngine;
using UnityEngine.InputSystem;
using UnityEngine.SceneManagement;

namespace TikhayaTropa.Blobber
{
    [DisallowMultipleComponent]
    [RequireComponent(typeof(CharacterController))]
    public class BlobberFpsController : MonoBehaviour
    {
        [SerializeField] Transform eye;
        [SerializeField] float moveSpeed = 3.6f;
        [SerializeField] float lookSensitivity = 1.6f;
        [SerializeField] float minPitch = -75f;
        [SerializeField] float maxPitch = 75f;

        CharacterController _cc;
        float _pitch;
        bool _cursorForcedByUi;

        public Transform Eye => eye != null ? eye : transform;

        void Awake()
        {
            _cc = GetComponent<CharacterController>();
            if (eye == null) eye = transform;
            Cursor.lockState = CursorLockMode.Locked;
            Cursor.visible = false;
        }

        void OnDisable()
        {
            Cursor.lockState = CursorLockMode.None;
            Cursor.visible = true;
        }

        void Update()
        {
            var st = GameState.Instance;
            if (st != null && st.InputFrozen)
            {
                if (!_cursorForcedByUi)
                {
                    Cursor.lockState = CursorLockMode.None;
                    Cursor.visible = true;
                    _cursorForcedByUi = true;
                }
                return;
            }

            if (_cursorForcedByUi)
            {
                Cursor.lockState = CursorLockMode.Locked;
                Cursor.visible = false;
                _cursorForcedByUi = false;
            }

            var kb = Keyboard.current;
            if (kb != null && kb.escapeKey.wasPressedThisFrame)
            {
                var free = Cursor.lockState == CursorLockMode.None;
                Cursor.lockState = free ? CursorLockMode.Locked : CursorLockMode.None;
                Cursor.visible = !free;
            }

            var mouse = Mouse.current;
            if (mouse != null && Cursor.lockState == CursorLockMode.Locked)
            {
                var delta = mouse.delta.ReadValue() * lookSensitivity * Time.deltaTime * 60f;
                transform.Rotate(0f, delta.x, 0f);
                _pitch = Mathf.Clamp(_pitch - delta.y, minPitch, maxPitch);
                Eye.localRotation = Quaternion.Euler(_pitch, 0f, 0f);
            }

            var dir = Vector3.zero;
            if (kb != null)
            {
                if (kb.wKey.isPressed || kb.upArrowKey.isPressed) dir += transform.forward;
                if (kb.sKey.isPressed || kb.downArrowKey.isPressed) dir -= transform.forward;
                if (kb.aKey.isPressed) dir -= transform.right;
                if (kb.dKey.isPressed) dir += transform.right;
            }

            dir.y = 0f;
            if (dir.sqrMagnitude > 1f) dir.Normalize();
            _cc.SimpleMove(dir * moveSpeed);

            if (st != null)
                st.SetBlobberPose(SceneManager.GetActiveScene().name, transform.position, transform.eulerAngles.y);
        }

        public void TeleportTo(Vector3 pos, float yaw)
        {
            if (_cc != null) _cc.enabled = false;
            transform.position = pos;
            transform.rotation = Quaternion.Euler(0f, yaw, 0f);
            if (_cc != null) _cc.enabled = true;
        }
    }
}
