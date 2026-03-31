using TikhayaTropa.Blobber.Data;
using TikhayaTropa.Core;
using TikhayaTropa.UI;
using UnityEngine;
using UnityEngine.SceneManagement;

namespace TikhayaTropa.Blobber.Runtime.Logic
{
    public sealed class BlobberLogicActionExecutor
    {
        readonly GameObject _self;
        readonly GameState _state;

        public BlobberLogicActionExecutor(GameObject self, GameState state)
        {
            _self = self;
            _state = state;
        }

        public void Execute(BlobberLogicNodeData node)
        {
            switch (node.actionType)
            {
                case BlobberLogicActionType.SetFlag:
                    if (_state != null && !string.IsNullOrWhiteSpace(node.stringValue))
                        _state.SetFlag(node.stringValue, node.boolValue);
                    break;
                case BlobberLogicActionType.MoveToMarker:
                    ExecuteMoveToMarker(node);
                    break;
                case BlobberLogicActionType.PlayAnimation:
                    ExecutePlayAnimation(node);
                    break;
                case BlobberLogicActionType.SetSprite:
                    ExecuteSetSprite(node);
                    break;
                case BlobberLogicActionType.ShowMessage:
                    if (!string.IsNullOrWhiteSpace(node.stringValue))
                        DialoguePanel.Instance?.ShowMessage(node.stringValue);
                    break;
                case BlobberLogicActionType.LoadScene:
                    if (!string.IsNullOrWhiteSpace(node.stringValue))
                        SceneManager.LoadScene(node.stringValue);
                    break;
                case BlobberLogicActionType.SetObjectActive:
                    ExecuteSetObjectActive(node);
                    break;
            }
        }

        void ExecuteMoveToMarker(BlobberLogicNodeData node)
        {
            if (string.IsNullOrWhiteSpace(node.stringValue)) return;
            var target = GameObject.Find(node.stringValue);
            if (target == null) return;

            if (node.floatValue <= 0f)
            {
                _self.transform.position = target.transform.position;
                return;
            }

            var mover = _self.GetComponent<BlobberMoveToTargetAgent>() ?? _self.AddComponent<BlobberMoveToTargetAgent>();
            mover.SetTarget(target.transform, node.floatValue);
        }

        void ExecutePlayAnimation(BlobberLogicNodeData node)
        {
            var target = ResolveTarget(node.stringValue2);
            if (target == null) return;
            var animator = target.GetComponent<Animator>();
            if (animator == null || string.IsNullOrWhiteSpace(node.stringValue)) return;
            animator.Play(node.stringValue);
        }

        void ExecuteSetSprite(BlobberLogicNodeData node)
        {
            var target = ResolveTarget(node.stringValue2);
            if (target == null) return;
            var sr = target.GetComponent<SpriteRenderer>();
            if (sr == null || string.IsNullOrWhiteSpace(node.stringValue)) return;
            var sprite = Resources.Load<Sprite>(node.stringValue);
            if (sprite != null)
                sr.sprite = sprite;
        }

        void ExecuteSetObjectActive(BlobberLogicNodeData node)
        {
            var target = ResolveTarget(node.stringValue);
            if (target != null)
                target.SetActive(node.boolValue);
        }

        GameObject ResolveTarget(string key)
        {
            if (string.IsNullOrWhiteSpace(key) || key == "self") return _self;
            return GameObject.Find(key);
        }
    }
}
