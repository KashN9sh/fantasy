using System.Collections.Generic;
using TikhayaTropa.Blobber.Data;
using TikhayaTropa.Core;
using UnityEngine;

namespace TikhayaTropa.Blobber.Runtime.Logic
{
    [DisallowMultipleComponent]
    public class BlobberLogicRunner : MonoBehaviour
    {
        [SerializeField] BlobberLogicGraphDatabase graphDatabase;
        [SerializeField] string graphId = string.Empty;
        [SerializeField] bool enabledByDefault = true;

        BlobberLogicGraphData _graph;
        BlobberFpsController _player;
        Vector3 _lastPlayerPos;
        float _lastPlayerSpeed;
        readonly Dictionary<string, bool> _flagSnapshot = new();

        public void Configure(BlobberLogicGraphDatabase db, string id)
        {
            graphDatabase = db;
            graphId = id ?? string.Empty;
            ResolveGraph();
        }

        void Awake()
        {
            enabled = enabledByDefault;
            ResolveGraph();
        }

        void OnEnable()
        {
            GameState.EnsureExists();
            var st = GameState.Instance;
            if (st != null)
                st.OnStateChanged += OnStateChanged;
            CachePlayer();
        }

        void OnDisable()
        {
            var st = GameState.Instance;
            if (st != null)
                st.OnStateChanged -= OnStateChanged;
        }

        void Update()
        {
            if (_graph == null) return;
            CachePlayer();
            UpdatePlayerSpeed();
            RunEvent(BlobberLogicEventType.OnUpdate, null);
            RunEvent(BlobberLogicEventType.OnPlayerNear, null);
        }

        public void TriggerInteract()
        {
            RunEvent(BlobberLogicEventType.OnInteract, null);
        }

        void OnStateChanged()
        {
            if (_graph == null) return;
            foreach (var node in _graph.nodes)
            {
                if (node.nodeType != BlobberLogicNodeType.Condition || node.conditionType != BlobberLogicConditionType.HasFlag)
                    continue;
                if (string.IsNullOrWhiteSpace(node.stringValue)) continue;

                var st = GameState.Instance;
                var current = st != null && st.HasFlag(node.stringValue);
                var had = _flagSnapshot.TryGetValue(node.stringValue, out var old) && old;
                if (had != current)
                {
                    _flagSnapshot[node.stringValue] = current;
                    RunEvent(BlobberLogicEventType.OnFlagChanged, node.stringValue);
                }
            }
        }

        void RunEvent(BlobberLogicEventType evt, string flagName)
        {
            if (_graph == null) return;
            var state = GameState.Instance;
            var conditionEval = new BlobberLogicConditionEvaluator(gameObject, state, _player != null ? _player.transform : null, _lastPlayerSpeed);
            var actionExec = new BlobberLogicActionExecutor(gameObject, state);

            foreach (var node in _graph.nodes)
            {
                if (node.nodeType != BlobberLogicNodeType.Event || node.eventType != evt) continue;
                if (evt == BlobberLogicEventType.OnFlagChanged && !string.IsNullOrWhiteSpace(node.stringValue) && node.stringValue != flagName)
                    continue;

                Traverse(node.id, true, conditionEval, actionExec, new HashSet<string>(), 0);
            }
        }

        void Traverse(
            string nodeId,
            bool pass,
            BlobberLogicConditionEvaluator conditionEval,
            BlobberLogicActionExecutor actionExec,
            HashSet<string> visited,
            int depth)
        {
            if (_graph == null || string.IsNullOrWhiteSpace(nodeId)) return;
            if (depth > 64 || visited.Contains(nodeId)) return;
            visited.Add(nodeId);

            var node = _graph.nodes.Find(n => n.id == nodeId);
            if (node == null) return;

            var nextPass = pass;
            if (node.nodeType == BlobberLogicNodeType.Condition)
                nextPass = pass && conditionEval.Evaluate(node);
            else if (node.nodeType == BlobberLogicNodeType.Action && pass)
                actionExec.Execute(node);

            foreach (var link in _graph.links)
            {
                if (link.fromNodeId != nodeId) continue;
                Traverse(link.toNodeId, nextPass, conditionEval, actionExec, visited, depth + 1);
            }
        }

        void ResolveGraph()
        {
            _graph = graphDatabase != null && !string.IsNullOrWhiteSpace(graphId)
                ? graphDatabase.Find(graphId)
                : null;
        }

        void CachePlayer()
        {
            if (_player != null) return;
            _player = Object.FindAnyObjectByType<BlobberFpsController>();
            if (_player != null)
                _lastPlayerPos = _player.transform.position;
        }

        void UpdatePlayerSpeed()
        {
            if (_player == null)
            {
                _lastPlayerSpeed = 0f;
                return;
            }

            var pos = _player.transform.position;
            var delta = pos - _lastPlayerPos;
            _lastPlayerPos = pos;
            _lastPlayerSpeed = delta.magnitude / Mathf.Max(Time.deltaTime, 0.0001f);
        }
    }
}
