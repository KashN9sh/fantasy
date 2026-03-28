using TikhayaTropa.Core;
using UnityEngine;
using UnityEngine.InputSystem;

namespace TikhayaTropa.Player
{
    /// <summary>
    /// Сайдскроллер: горизонталь с сохранением вертикальной скорости (гравитация), прыжок, проверка земли (raycast).
    /// </summary>
    [RequireComponent(typeof(Rigidbody2D))]
    [RequireComponent(typeof(BoxCollider2D))]
    public class PlayerController : MonoBehaviour
    {
        [SerializeField] InputActionAsset inputActions;
        [Header("Move")]
        [SerializeField] float moveSpeed = 5f;
        [Header("Jump")]
        [SerializeField] float jumpSpeed = 7.2f;
        [SerializeField] float coyoteTime = 0.12f;
        [SerializeField] float jumpBufferTime = 0.1f;
        [Header("Ground check")]
        [SerializeField] LayerMask groundLayers = ~0;
        [SerializeField] float groundCheckDistance = 0.08f;
        [SerializeField] float skinWidth = 0.02f;

        Rigidbody2D _rb;
        BoxCollider2D _col;
        SpriteRenderer _sprite;
        InputAction _move;
        InputAction _jump;

        float _lastOnGroundTime;
        float _lastJumpPressedTime;

        static readonly RaycastHit2D[] RayHits = new RaycastHit2D[4];

        void Awake()
        {
            _rb = GetComponent<Rigidbody2D>();
            _col = GetComponent<BoxCollider2D>();
            _sprite = GetComponent<SpriteRenderer>();
            var map = inputActions.FindActionMap("Player");
            _move = map.FindAction("Move");
            _jump = map.FindAction("Jump");
        }

        void OnEnable()
        {
            inputActions.FindActionMap("Player").Enable();
        }

        void OnDisable()
        {
            inputActions.FindActionMap("Player").Disable();
        }

        void Update()
        {
            if (_jump.WasPressedThisFrame())
                _lastJumpPressedTime = jumpBufferTime;
            _lastJumpPressedTime -= Time.deltaTime;
        }

        void FixedUpdate()
        {
            if (GameState.Instance != null && GameState.Instance.InputFrozen)
            {
                _rb.linearVelocity = Vector2.zero;
                return;
            }

            var grounded = CheckGrounded();
            if (grounded)
                _lastOnGroundTime = coyoteTime;
            else
                _lastOnGroundTime -= Time.fixedDeltaTime;

            var input = _move.ReadValue<Vector2>();
            var moveX = input.x;
            if (Mathf.Abs(moveX) > 1f) moveX = Mathf.Sign(moveX);

            var v = _rb.linearVelocity;
            v.x = moveX * moveSpeed;
            _rb.linearVelocity = v;

            if (_sprite != null && Mathf.Abs(moveX) > 0.05f)
                _sprite.flipX = moveX < 0f;

            var canJump = _lastOnGroundTime > 0f && _lastJumpPressedTime > 0f;
            if (canJump)
            {
                v = _rb.linearVelocity;
                v.y = jumpSpeed;
                _rb.linearVelocity = v;
                _lastOnGroundTime = 0f;
                _lastJumpPressedTime = 0f;
            }
        }

        bool CheckGrounded()
        {
            var bounds = _col.bounds;
            var origin = new Vector2(bounds.center.x, bounds.min.y + skinWidth);
            var dist = groundCheckDistance + skinWidth;
            var mask = groundLayers.value == 0 ? Physics2D.DefaultRaycastLayers : groundLayers.value;

            var hitCount = Physics2D.RaycastNonAlloc(origin, Vector2.down, RayHits, dist, mask);
            for (var i = 0; i < hitCount; i++)
            {
                var h = RayHits[i];
                if (h.collider == null || h.collider.gameObject == gameObject) continue;
                if (h.collider.attachedRigidbody == _rb) continue;
                if (h.collider.isTrigger) continue;
                return true;
            }

            return false;
        }
    }
}
