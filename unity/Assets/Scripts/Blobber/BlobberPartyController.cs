using TikhayaTropa.Core;
using UnityEngine;
using UnityEngine.InputSystem;

namespace TikhayaTropa.Blobber
{
    /// <summary>Дискретное движение по сетке от первого лица (Might &amp; Magic–стиль).</summary>
    [DisallowMultipleComponent]
    [RequireComponent(typeof(BlobberDungeonGeometry))]
    public class BlobberPartyController : MonoBehaviour
    {
        [SerializeField] float eyeHeight = 1.75f;
        [SerializeField] float stepCooldownSec = 0.22f;
        [SerializeField] float turnCooldownSec = 0.16f;

        BlobberDungeonGeometry _geo;
        Transform _eye;
        int _gx, _gz, _facing;
        float _stepCd;
        float _turnCd;

        void Awake()
        {
            _geo = GetComponent<BlobberDungeonGeometry>();
            var camGo = new GameObject("Eye");
            camGo.transform.SetParent(transform, false);
            var cam = camGo.AddComponent<Camera>();
            cam.nearClipPlane = 0.05f;
            cam.farClipPlane = 80f;
            cam.fieldOfView = 74f;
            cam.clearFlags = CameraClearFlags.SolidColor;
            cam.backgroundColor = new Color(0.04f, 0.04f, 0.06f, 1f);
            camGo.tag = "MainCamera";
            camGo.AddComponent<AudioListener>();
            _eye = camGo.transform;
        }

        void Start()
        {
            if (!_geo.Map.TryGetStart(out _gx, out _gz))
            {
                Debug.LogError("Blobber: нет точки старта S или пола .");
                _gx = _gz = 1;
            }

            _facing = 0;
            SnapCamera();
        }

        void Update()
        {
            if (GameState.Instance != null && GameState.Instance.InputFrozen) return;

            _stepCd -= Time.deltaTime;
            _turnCd -= Time.deltaTime;

            var kb = Keyboard.current;
            if (kb == null) return;

            if (_turnCd <= 0f)
            {
                if (kb.qKey.wasPressedThisFrame || kb.leftArrowKey.wasPressedThisFrame)
                {
                    _facing = BlobberFacing.TurnLeft(_facing);
                    _turnCd = turnCooldownSec;
                    SnapCamera();
                }
                else if (kb.eKey.wasPressedThisFrame || kb.rightArrowKey.wasPressedThisFrame)
                {
                    _facing = BlobberFacing.TurnRight(_facing);
                    _turnCd = turnCooldownSec;
                    SnapCamera();
                }
            }

            if (_stepCd > 0f) return;

            var f = BlobberFacing.Forward[_facing];
            // Вычисляем стрейф от forward, чтобы A/D всегда были стабильны:
            // left = (-f.z, f.x), right = (f.z, -f.x)
            var left = new Vector2Int(-f.y, f.x);
            var right = new Vector2Int(f.y, -f.x);

            if (kb.wKey.wasPressedThisFrame || kb.upArrowKey.wasPressedThisFrame)
            {
                if (TryMove(f.x, f.y))
                    _stepCd = stepCooldownSec;
            }
            else if (kb.sKey.wasPressedThisFrame || kb.downArrowKey.wasPressedThisFrame)
            {
                if (TryMove(-f.x, -f.y))
                    _stepCd = stepCooldownSec;
            }
            else if (kb.aKey.wasPressedThisFrame)
            {
                if (TryMove(left.x, left.y))
                    _stepCd = stepCooldownSec;
            }
            else if (kb.dKey.wasPressedThisFrame)
            {
                if (TryMove(right.x, right.y))
                    _stepCd = stepCooldownSec;
            }
        }

        bool TryMove(int dx, int dz)
        {
            var nx = _gx + dx;
            var nz = _gz + dz;
            if (!_geo.Map.IsWalkable(nx, nz)) return false;
            _gx = nx;
            _gz = nz;
            SnapCamera();
            return true;
        }

        void SnapCamera()
        {
            var w = _geo.GridToWorldCenter(_gx, _gz);
            w.y = eyeHeight;
            _eye.position = w;
            _eye.rotation = Quaternion.Euler(0f, BlobberFacing.YawDegrees(_facing), 0f);
        }
    }
}
