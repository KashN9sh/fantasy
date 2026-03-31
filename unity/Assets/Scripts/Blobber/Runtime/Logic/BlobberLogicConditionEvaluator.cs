using TikhayaTropa.Blobber.Data;
using TikhayaTropa.Core;
using UnityEngine;

namespace TikhayaTropa.Blobber.Runtime.Logic
{
    public sealed class BlobberLogicConditionEvaluator
    {
        readonly GameObject _self;
        readonly GameState _state;
        readonly Transform _player;
        readonly float _playerSpeed;

        public BlobberLogicConditionEvaluator(GameObject self, GameState state, Transform player, float playerSpeed)
        {
            _self = self;
            _state = state;
            _player = player;
            _playerSpeed = playerSpeed;
        }

        public bool Evaluate(BlobberLogicNodeData node)
        {
            return node.conditionType switch
            {
                BlobberLogicConditionType.HasFlag => EvaluateHasFlag(node),
                BlobberLogicConditionType.PlayerSpeedGreater => _playerSpeed > node.floatValue,
                BlobberLogicConditionType.DistanceLess => EvaluateDistanceLess(node),
                BlobberLogicConditionType.ObjectStateEquals => EvaluateObjectState(node),
                _ => true
            };
        }

        bool EvaluateHasFlag(BlobberLogicNodeData node)
        {
            if (_state == null || string.IsNullOrWhiteSpace(node.stringValue)) return false;
            var has = _state.HasFlag(node.stringValue);
            return node.boolValue ? has : !has;
        }

        bool EvaluateDistanceLess(BlobberLogicNodeData node)
        {
            if (_player == null) return false;
            var target = ResolveTarget(node.stringValue);
            if (target == null) return false;
            var dist = Vector3.Distance(_player.position, target.transform.position);
            return dist < Mathf.Max(0.01f, node.floatValue);
        }

        bool EvaluateObjectState(BlobberLogicNodeData node)
        {
            var target = ResolveTarget(node.stringValue);
            if (target == null) return false;
            return target.activeSelf == node.boolValue;
        }

        GameObject ResolveTarget(string key)
        {
            if (string.IsNullOrWhiteSpace(key) || key == "self") return _self;
            if (key == "player") return _player != null ? _player.gameObject : null;
            return GameObject.Find(key);
        }
    }
}
