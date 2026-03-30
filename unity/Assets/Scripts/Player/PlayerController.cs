using TikhayaTropa.Core;
using UnityEngine;
using UnityEngine.InputSystem;

namespace TikhayaTropa.Player
{
    /// <summary>
    /// Сайдскроллер: горизонталь с сохранением вертикальной скорости (гравитация), прыжок, проверка земли (raycast).
    /// Анимация: 4 кадра ходьбы вправо (flipX влево) + 4 кадра idle спереди.
    /// </summary>
    [RequireComponent(typeof(Rigidbody2D))]
    [RequireComponent(typeof(BoxCollider2D))]
    public class PlayerController : MonoBehaviour
    {
        [SerializeField] InputActionAsset inputActions;
        [Header("Move")]
        [SerializeField] float moveSpeed = 5f;
        [SerializeField] float sprintSpeed = 8.25f;
        [Header("Jump")]
        [SerializeField] float jumpSpeed = 7.2f;
        [SerializeField] float coyoteTime = 0.12f;
        [SerializeField] float jumpBufferTime = 0.1f;
        [Header("Ground check")]
        [SerializeField] LayerMask groundLayers = ~0;
        [SerializeField] float groundCheckDistance = 0.08f;
        [SerializeField] float skinWidth = 0.02f;
        [Header("Animation")]
        [Tooltip("Кадры 0–3: шаг вправо. Пусто — только flipX без смены спрайта.")]
        [SerializeField] Sprite[] walkRightSprites = new Sprite[4];
        [Tooltip("Кадры 0–3: idle спереди.")]
        [SerializeField] Sprite[] idleSprites = new Sprite[4];
        [SerializeField] float walkFrameRate = 9f;
        [SerializeField] float idleFrameRate = 3f;

        Rigidbody2D _rb;
        BoxCollider2D _col;
        SpriteRenderer _sprite;
        InputAction _move;
        InputAction _jump;
        InputAction _sprint;

        float _lastOnGroundTime;
        float _lastJumpPressedTime;
        bool _grounded;
        float _walkPhase;
        float _idlePhase;

        static readonly RaycastHit2D[] RayHits = new RaycastHit2D[4];

        void Awake()
        {
            _rb = GetComponent<Rigidbody2D>();
            _col = GetComponent<BoxCollider2D>();
            _sprite = GetComponent<SpriteRenderer>();
            var map = inputActions.FindActionMap("Player");
            _move = map.FindAction("Move");
            _jump = map.FindAction("Jump");
            _sprint = map.FindAction("Sprint");
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
                _grounded = false;
                return;
            }

            _grounded = CheckGrounded();
            if (_grounded)
                _lastOnGroundTime = coyoteTime;
            else
                _lastOnGroundTime -= Time.fixedDeltaTime;

            var input = _move.ReadValue<Vector2>();
            var moveX = input.x;
            if (Mathf.Abs(moveX) > 1f) moveX = Mathf.Sign(moveX);

            var speed = moveSpeed;
            if (_sprint != null && _sprint.IsPressed() && Mathf.Abs(moveX) > 0.02f)
                speed = sprintSpeed;

            var v = _rb.linearVelocity;
            v.x = moveX * speed;
            _rb.linearVelocity = v;

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

        void LateUpdate()
        {
            if (_sprite == null) return;

            if (GameState.Instance != null && GameState.Instance.InputFrozen)
            {
                if (idleSprites != null && idleSprites.Length > 0 && idleSprites[0] != null)
                    _sprite.sprite = idleSprites[0];
                _sprite.flipX = false;
                return;
            }

            var moveX = _move.ReadValue<Vector2>().x;
            if (Mathf.Abs(moveX) > 1f) moveX = Mathf.Sign(moveX);

            var wantsMove = Mathf.Abs(moveX) > 0.05f;
            var useWalk = wantsMove;

            if (HasFour(walkRightSprites) && HasFour(idleSprites))
            {
                if (useWalk)
                {
                    _walkPhase += Time.deltaTime * walkFrameRate;
                    var wi = Mathf.FloorToInt(_walkPhase) % 4;
                    var s = walkRightSprites[wi];
                    if (s != null) _sprite.sprite = s;
                    _sprite.flipX = moveX < 0f;
                }
                else
                {
                    _idlePhase += Time.deltaTime * idleFrameRate;
                    var ii = Mathf.FloorToInt(_idlePhase) % 4;
                    var s = idleSprites[ii];
                    if (s != null) _sprite.sprite = s;
                    _sprite.flipX = false;
                }
            }
            else if (Mathf.Abs(moveX) > 0.05f)
                _sprite.flipX = moveX < 0f;
        }

        static bool HasFour(Sprite[] a) => a != null && a.Length >= 4 && a[0] != null && a[1] != null && a[2] != null && a[3] != null;

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
