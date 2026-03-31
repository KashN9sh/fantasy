#if UNITY_EDITOR
using System;
using System.Linq;
using TikhayaTropa.Blobber.Data;
using UnityEditor;
using UnityEngine;

namespace TikhayaTropa.EditorTools.Blobber
{
    public class BlobberLogicGraphEditorWindow : EditorWindow
    {
        BlobberLogicGraphDatabase _db;
        string _selectedGraphId = string.Empty;
        string _selectedNodeId = string.Empty;
        Vector2 _leftScroll;
        Vector2 _rightScroll;
        Vector2 _canvasScroll;
        int _linkFromIndex;
        int _linkToIndex;

        [MenuItem("TikhayaTropa/Blobber/Logic Graph Editor")]
        static void Open() => GetWindow<BlobberLogicGraphEditorWindow>("Blobber Logic Graph");

        public static void OpenWith(string graphId)
        {
            var w = GetWindow<BlobberLogicGraphEditorWindow>("Blobber Logic Graph");
            w._selectedGraphId = graphId ?? string.Empty;
            w.Focus();
            w.Repaint();
        }

        void OnEnable()
        {
            _db = FindDb();
        }

        void OnGUI()
        {
            EditorGUILayout.BeginHorizontal();
            DrawLeftPanel();
            DrawCanvas();
            DrawRightPanel();
            EditorGUILayout.EndHorizontal();
        }

        void DrawLeftPanel()
        {
            EditorGUILayout.BeginVertical(GUILayout.Width(280f));
            _db = (BlobberLogicGraphDatabase)EditorGUILayout.ObjectField("Logic DB", _db, typeof(BlobberLogicGraphDatabase), false);
            if (_db == null)
            {
                EditorGUILayout.HelpBox("Назначь BlobberLogicGraphDatabase.", MessageType.Info);
                EditorGUILayout.EndVertical();
                return;
            }

            EditorGUILayout.Space(6);
            EditorGUILayout.LabelField("Graphs", EditorStyles.boldLabel);
            _leftScroll = EditorGUILayout.BeginScrollView(_leftScroll);
            foreach (var graph in _db.graphs)
            {
                var selected = graph.graphId == _selectedGraphId;
                var label = $"{graph.displayName} ({Short(graph.graphId)})";
                if (GUILayout.Toggle(selected, label, "Button"))
                    _selectedGraphId = graph.graphId;
            }
            EditorGUILayout.EndScrollView();

            if (GUILayout.Button("Create Graph"))
                CreateGraph();
            if (CurrentGraph() != null && GUILayout.Button("Delete Graph"))
                DeleteCurrentGraph();

            EditorGUILayout.EndVertical();
        }

        void DrawCanvas()
        {
            EditorGUILayout.BeginVertical();
            var graph = CurrentGraph();
            if (graph == null)
            {
                EditorGUILayout.HelpBox("Выбери graph слева.", MessageType.Info);
                EditorGUILayout.EndVertical();
                return;
            }

            _canvasScroll = EditorGUILayout.BeginScrollView(_canvasScroll);
            var canvasRect = GUILayoutUtility.GetRect(1200f, 900f);
            EditorGUI.DrawRect(canvasRect, new Color(0.14f, 0.14f, 0.16f, 1f));

            DrawLinks(graph, canvasRect);
            DrawNodes(graph, canvasRect);
            HandleNodeDrag(graph, canvasRect);

            EditorGUILayout.EndScrollView();
            EditorGUILayout.EndVertical();
        }

        void DrawRightPanel()
        {
            EditorGUILayout.BeginVertical(GUILayout.Width(360f));
            var graph = CurrentGraph();
            if (graph == null)
            {
                EditorGUILayout.EndVertical();
                return;
            }

            _rightScroll = EditorGUILayout.BeginScrollView(_rightScroll);
            EditorGUILayout.LabelField("Node Tools", EditorStyles.boldLabel);
            if (GUILayout.Button("Add Event Node")) AddNode(graph, BlobberLogicNodeType.Event);
            if (GUILayout.Button("Add Condition Node")) AddNode(graph, BlobberLogicNodeType.Condition);
            if (GUILayout.Button("Add Action Node")) AddNode(graph, BlobberLogicNodeType.Action);

            EditorGUILayout.Space(8);
            DrawLinkTools(graph);
            EditorGUILayout.Space(8);
            DrawSelectedNode(graph);
            EditorGUILayout.EndScrollView();
            EditorGUILayout.EndVertical();
        }

        void DrawLinkTools(BlobberLogicGraphData graph)
        {
            if (graph.nodes.Count == 0) return;
            EditorGUILayout.LabelField("Links", EditorStyles.boldLabel);
            var labels = graph.nodes.Select(n => $"{n.title} [{n.nodeType}]").ToArray();
            _linkFromIndex = Mathf.Clamp(_linkFromIndex, 0, labels.Length - 1);
            _linkToIndex = Mathf.Clamp(_linkToIndex, 0, labels.Length - 1);
            _linkFromIndex = EditorGUILayout.Popup("From", _linkFromIndex, labels);
            _linkToIndex = EditorGUILayout.Popup("To", _linkToIndex, labels);
            if (GUILayout.Button("Create Link"))
            {
                var from = graph.nodes[_linkFromIndex].id;
                var to = graph.nodes[_linkToIndex].id;
                if (!graph.links.Any(l => l.fromNodeId == from && l.toNodeId == to) && from != to)
                {
                    Undo.RecordObject(_db, "Create logic link");
                    graph.links.Add(new BlobberLogicLinkData { fromNodeId = from, toNodeId = to });
                    EditorUtility.SetDirty(_db);
                }
            }
        }

        void DrawSelectedNode(BlobberLogicGraphData graph)
        {
            var node = graph.nodes.Find(n => n.id == _selectedNodeId);
            if (node == null)
            {
                EditorGUILayout.HelpBox("Выбери node на canvas.", MessageType.Info);
                return;
            }

            EditorGUILayout.LabelField("Selected Node", EditorStyles.boldLabel);
            Undo.RecordObject(_db, "Edit logic node");
            node.title = EditorGUILayout.TextField("Title", node.title);
            node.nodeType = (BlobberLogicNodeType)EditorGUILayout.EnumPopup("Type", node.nodeType);
            if (node.nodeType == BlobberLogicNodeType.Event)
                node.eventType = (BlobberLogicEventType)EditorGUILayout.EnumPopup("Event", node.eventType);
            if (node.nodeType == BlobberLogicNodeType.Condition)
                node.conditionType = (BlobberLogicConditionType)EditorGUILayout.EnumPopup("Condition", node.conditionType);
            if (node.nodeType == BlobberLogicNodeType.Action)
                node.actionType = (BlobberLogicActionType)EditorGUILayout.EnumPopup("Action", node.actionType);

            EditorGUILayout.Space(4);
            DrawTypedNodeParams(node);

            if (GUILayout.Button("Delete Node"))
            {
                DeleteNode(graph, node.id);
                return;
            }

            if (GUILayout.Button("Save"))
                AssetDatabase.SaveAssets();

            EditorUtility.SetDirty(_db);
        }

        void DrawTypedNodeParams(BlobberLogicNodeData node)
        {
            EditorGUILayout.LabelField("Params", EditorStyles.miniBoldLabel);
            switch (node.nodeType)
            {
                case BlobberLogicNodeType.Event:
                    DrawEventParams(node);
                    break;
                case BlobberLogicNodeType.Condition:
                    DrawConditionParams(node);
                    break;
                case BlobberLogicNodeType.Action:
                    DrawActionParams(node);
                    break;
            }
        }

        static void DrawEventParams(BlobberLogicNodeData node)
        {
            switch (node.eventType)
            {
                case BlobberLogicEventType.OnFlagChanged:
                    node.stringValue = EditorGUILayout.TextField("Flag Name (optional)", node.stringValue);
                    EditorGUILayout.HelpBox("Если пусто — срабатывает на любое изменение флага.", MessageType.None);
                    break;
                case BlobberLogicEventType.OnPlayerNear:
                    node.floatValue = EditorGUILayout.FloatField("Distance Hint", Mathf.Max(0f, node.floatValue));
                    EditorGUILayout.HelpBox("Событие тикает каждый кадр; обычно комбинируется с Condition DistanceLess.", MessageType.None);
                    break;
                default:
                    EditorGUILayout.HelpBox("У этого события нет обязательных параметров.", MessageType.None);
                    break;
            }
        }

        static void DrawConditionParams(BlobberLogicNodeData node)
        {
            switch (node.conditionType)
            {
                case BlobberLogicConditionType.HasFlag:
                    node.stringValue = EditorGUILayout.TextField("Flag Name", node.stringValue);
                    node.boolValue = EditorGUILayout.Toggle("Must Be Set", node.boolValue);
                    break;
                case BlobberLogicConditionType.PlayerSpeedGreater:
                    node.floatValue = EditorGUILayout.FloatField("Min Player Speed", Mathf.Max(0f, node.floatValue));
                    break;
                case BlobberLogicConditionType.DistanceLess:
                    node.stringValue = EditorGUILayout.TextField("Target Name (self/player/object)", node.stringValue);
                    node.floatValue = EditorGUILayout.FloatField("Max Distance", Mathf.Max(0.01f, node.floatValue));
                    break;
                case BlobberLogicConditionType.ObjectStateEquals:
                    node.stringValue = EditorGUILayout.TextField("Object Name", node.stringValue);
                    node.boolValue = EditorGUILayout.Toggle("Should Be Active", node.boolValue);
                    break;
            }
        }

        static void DrawActionParams(BlobberLogicNodeData node)
        {
            switch (node.actionType)
            {
                case BlobberLogicActionType.SetFlag:
                    node.stringValue = EditorGUILayout.TextField("Flag Name", node.stringValue);
                    node.boolValue = EditorGUILayout.Toggle("Set Value", node.boolValue);
                    break;
                case BlobberLogicActionType.MoveToMarker:
                    node.stringValue = EditorGUILayout.TextField("Marker Name", node.stringValue);
                    node.floatValue = EditorGUILayout.FloatField("Move Speed (0 = instant)", Mathf.Max(0f, node.floatValue));
                    break;
                case BlobberLogicActionType.PlayAnimation:
                    node.stringValue = EditorGUILayout.TextField("Animation State Name", node.stringValue);
                    node.stringValue2 = EditorGUILayout.TextField("Target Object Name (empty = self)", node.stringValue2);
                    break;
                case BlobberLogicActionType.SetSprite:
                    node.stringValue = EditorGUILayout.TextField("Sprite Path in Resources", node.stringValue);
                    node.stringValue2 = EditorGUILayout.TextField("Target Object Name (empty = self)", node.stringValue2);
                    break;
                case BlobberLogicActionType.ShowMessage:
                    node.stringValue = EditorGUILayout.TextArea(node.stringValue, GUILayout.MinHeight(44f));
                    break;
                case BlobberLogicActionType.LoadScene:
                    node.stringValue = EditorGUILayout.TextField("Scene Name", node.stringValue);
                    break;
                case BlobberLogicActionType.SetObjectActive:
                    node.stringValue = EditorGUILayout.TextField("Target Object Name (empty = self)", node.stringValue);
                    node.boolValue = EditorGUILayout.Toggle("Active", node.boolValue);
                    break;
            }
        }

        void DrawNodes(BlobberLogicGraphData graph, Rect canvasRect)
        {
            foreach (var node in graph.nodes)
            {
                var rect = NodeRect(node, canvasRect);
                var color = node.nodeType switch
                {
                    BlobberLogicNodeType.Event => new Color(0.25f, 0.39f, 0.62f, 1f),
                    BlobberLogicNodeType.Condition => new Color(0.43f, 0.34f, 0.2f, 1f),
                    _ => new Color(0.25f, 0.43f, 0.28f, 1f)
                };
                EditorGUI.DrawRect(rect, color);
                if (node.id == _selectedNodeId)
                    EditorGUI.DrawRect(new Rect(rect.x - 1f, rect.y - 1f, rect.width + 2f, 2f), Color.yellow);
                GUI.Label(rect, $"{node.title}\n{node.nodeType}", EditorStyles.whiteLabel);
            }
        }

        void DrawLinks(BlobberLogicGraphData graph, Rect canvasRect)
        {
            Handles.BeginGUI();
            foreach (var link in graph.links)
            {
                var from = graph.nodes.Find(n => n.id == link.fromNodeId);
                var to = graph.nodes.Find(n => n.id == link.toNodeId);
                if (from == null || to == null) continue;
                var a = NodeRect(from, canvasRect).center;
                var b = NodeRect(to, canvasRect).center;
                Handles.DrawAAPolyLine(2.5f, a, b);
            }
            Handles.EndGUI();
        }

        void HandleNodeDrag(BlobberLogicGraphData graph, Rect canvasRect)
        {
            var e = Event.current;
            if (e.type == EventType.MouseDown && e.button == 0)
            {
                _selectedNodeId = string.Empty;
                foreach (var node in graph.nodes)
                {
                    if (!NodeRect(node, canvasRect).Contains(e.mousePosition)) continue;
                    _selectedNodeId = node.id;
                    e.Use();
                    Repaint();
                    break;
                }
            }

            if (e.type == EventType.MouseDrag && e.button == 0 && !string.IsNullOrWhiteSpace(_selectedNodeId))
            {
                var node = graph.nodes.Find(n => n.id == _selectedNodeId);
                if (node != null)
                {
                    Undo.RecordObject(_db, "Move logic node");
                    node.editorPosition += e.delta;
                    EditorUtility.SetDirty(_db);
                    e.Use();
                    Repaint();
                }
            }
        }

        void AddNode(BlobberLogicGraphData graph, BlobberLogicNodeType type)
        {
            Undo.RecordObject(_db, "Add logic node");
            graph.nodes.Add(new BlobberLogicNodeData
            {
                id = Guid.NewGuid().ToString("N"),
                title = type.ToString(),
                nodeType = type,
                editorPosition = new Vector2(80f + graph.nodes.Count * 14f, 80f + graph.nodes.Count * 8f)
            });
            EditorUtility.SetDirty(_db);
        }

        void DeleteNode(BlobberLogicGraphData graph, string nodeId)
        {
            Undo.RecordObject(_db, "Delete logic node");
            graph.nodes.RemoveAll(n => n.id == nodeId);
            graph.links.RemoveAll(l => l.fromNodeId == nodeId || l.toNodeId == nodeId);
            _selectedNodeId = string.Empty;
            EditorUtility.SetDirty(_db);
        }

        void CreateGraph()
        {
            if (_db == null) return;
            Undo.RecordObject(_db, "Create logic graph");
            var graphId = MakeUniqueGraphId("graph");
            var g = new BlobberLogicGraphData
            {
                graphId = graphId,
                displayName = graphId
            };
            _db.graphs.Add(g);
            _selectedGraphId = g.graphId;
            EditorUtility.SetDirty(_db);
        }

        void DeleteCurrentGraph()
        {
            var graph = CurrentGraph();
            if (graph == null || _db == null) return;
            if (!EditorUtility.DisplayDialog("Delete Graph", $"Удалить '{graph.displayName}'?", "Delete", "Cancel")) return;
            Undo.RecordObject(_db, "Delete logic graph");
            _db.graphs.Remove(graph);
            _selectedGraphId = _db.graphs.Count > 0 ? _db.graphs[0].graphId : string.Empty;
            _selectedNodeId = string.Empty;
            EditorUtility.SetDirty(_db);
        }

        BlobberLogicGraphData CurrentGraph()
        {
            if (_db == null || string.IsNullOrWhiteSpace(_selectedGraphId)) return null;
            return _db.Find(_selectedGraphId);
        }

        static BlobberLogicGraphDatabase FindDb()
        {
            var guids = AssetDatabase.FindAssets("t:BlobberLogicGraphDatabase");
            if (guids.Length == 0) return null;
            var path = AssetDatabase.GUIDToAssetPath(guids[0]);
            return AssetDatabase.LoadAssetAtPath<BlobberLogicGraphDatabase>(path);
        }

        static Rect NodeRect(BlobberLogicNodeData node, Rect canvasRect) =>
            new(canvasRect.x + node.editorPosition.x, canvasRect.y + node.editorPosition.y, 170f, 56f);

        static string Short(string id) => string.IsNullOrEmpty(id) ? "-" : id.Substring(0, Mathf.Min(6, id.Length));

        string MakeUniqueGraphId(string seed)
        {
            var normalized = string.IsNullOrWhiteSpace(seed) ? "graph" : seed.Trim().ToLowerInvariant().Replace(" ", "_");
            normalized = new string(normalized.Where(c => char.IsLetterOrDigit(c) || c == '_' || c == '-').ToArray());
            if (string.IsNullOrWhiteSpace(normalized)) normalized = "graph";

            var candidate = normalized;
            var i = 1;
            while (_db != null && _db.graphs.Any(g => g.graphId == candidate))
            {
                candidate = $"{normalized}_{i}";
                i++;
            }

            return candidate;
        }
    }
}
#endif
