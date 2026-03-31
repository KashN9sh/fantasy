#if UNITY_EDITOR
using System;
using System.Collections.Generic;
using System.Linq;
using TikhayaTropa.Blobber.Data;
using UnityEditor;
using UnityEngine;

namespace TikhayaTropa.EditorTools.Blobber
{
    public class BlobberMapEditorWindow : EditorWindow
    {
        enum EditorToolMode
        {
            TilePaint,
            ObjectPlace,
            ObjectMove
        }

        BlobberMapAsset _map;
        BlobberProjectSettings _settings;
        Vector2 _scroll;
        Vector2 _libraryScroll;
        int _selectedObject = -1;
        int _dragObjectIndex = -1;
        bool _isDraggingObject;
        BlobberTileKind _paintTile = BlobberTileKind.Floor;
        EditorToolMode _toolMode = EditorToolMode.TilePaint;
        string _newObjectId = "obj";
        string _selectedCatalogId = string.Empty;
        string _librarySearch = string.Empty;
        string _pendingMultilineEnterControl = string.Empty;

        [MenuItem("TikhayaTropa/Map Editor")]
        static void Open() => GetWindow<BlobberMapEditorWindow>("Map Editor");

        void OnEnable()
        {
            _settings = FindProjectSettings();
        }

        void OnGUI()
        {
            HandleMultilineEnterHotkey();
            EditorGUILayout.BeginHorizontal();
            DrawLeftPanel();
            DrawGridPanel();
            DrawRightPanel();
            EditorGUILayout.EndHorizontal();
        }

        void DrawLeftPanel()
        {
            EditorGUILayout.BeginVertical(GUILayout.Width(260));
            _map = (BlobberMapAsset)EditorGUILayout.ObjectField("Map Asset", _map, typeof(BlobberMapAsset), false);
            _settings = (BlobberProjectSettings)EditorGUILayout.ObjectField("Project Settings", _settings, typeof(BlobberProjectSettings), false);

            if (_map == null)
            {
                if (GUILayout.Button("Create Map Asset"))
                    CreateMapAsset();
                EditorGUILayout.HelpBox("Выбери или создай BlobberMapAsset.", MessageType.Info);
                EditorGUILayout.EndVertical();
                return;
            }

            EditorGUI.BeginChangeCheck();
            var w = EditorGUILayout.IntField("Width", _map.width);
            var h = EditorGUILayout.IntField("Height", _map.height);
            if (EditorGUI.EndChangeCheck())
            {
                Undo.RecordObject(_map, "Resize blobber map");
                _map.Resize(w, h);
                EditorUtility.SetDirty(_map);
            }

            _map.cellSize = EditorGUILayout.FloatField("Cell Size", _map.cellSize);
            _map.wallHeight = EditorGUILayout.FloatField("Wall Height", _map.wallHeight);
            _map.startCell = EditorGUILayout.Vector2IntField("Start Cell", _map.startCell);
            _map.startYaw = EditorGUILayout.FloatField("Start Yaw", _map.startYaw);

            EditorGUILayout.Space(8);
            if (GUILayout.Button("Bake Scene"))
            {
                BlobberSceneBaker.Bake(_map, _settings);
                GUIUtility.ExitGUI();
            }

            if (GUILayout.Button("Validate"))
                ShowValidationDialog();

            EditorGUILayout.EndVertical();
        }

        void DrawToolPanel()
        {
            EditorGUILayout.LabelField("Tools", EditorStyles.boldLabel);
            EditorGUILayout.BeginHorizontal();
            if (GUILayout.Toggle(_toolMode == EditorToolMode.TilePaint, "Tile", "Button"))
                _toolMode = EditorToolMode.TilePaint;
            if (GUILayout.Toggle(_toolMode == EditorToolMode.ObjectPlace, "Place", "Button"))
                _toolMode = EditorToolMode.ObjectPlace;
            if (GUILayout.Toggle(_toolMode == EditorToolMode.ObjectMove, "Move", "Button"))
                _toolMode = EditorToolMode.ObjectMove;
            EditorGUILayout.EndHorizontal();
        }

        void DrawLibraryPanel()
        {
            var catalog = _settings != null ? _settings.objectCatalog : null;
            EditorGUILayout.Space(6);
            EditorGUILayout.LabelField("Asset Library", EditorStyles.boldLabel);
            if (catalog == null)
            {
                EditorGUILayout.HelpBox("Назначь Object Catalog в Project Settings.", MessageType.Info);
                return;
            }

            if (catalog.entries.Count == 0)
            {
                EditorGUILayout.HelpBox("Каталог пуст. Создай первый элемент.", MessageType.Info);
                if (GUILayout.Button("Create Library Item"))
                {
                    CreateCatalogEntry(catalog);
                }
                return;
            }

            if (string.IsNullOrWhiteSpace(_selectedCatalogId) || !catalog.entries.Any(e => e.id == _selectedCatalogId))
                _selectedCatalogId = catalog.entries[0].id;

            EditorGUILayout.BeginVertical("box");
            _librarySearch = EditorGUILayout.TextField("Search", _librarySearch);
            _libraryScroll = EditorGUILayout.BeginScrollView(_libraryScroll, GUILayout.Height(180));
            var search = string.IsNullOrWhiteSpace(_librarySearch) ? string.Empty : _librarySearch.ToLowerInvariant();
            var e = Event.current;
            foreach (var entry in catalog.entries)
            {
                if (!string.IsNullOrEmpty(search))
                {
                    var id = entry.id ?? string.Empty;
                    var name = entry.displayName ?? string.Empty;
                    if (!id.ToLowerInvariant().Contains(search) && !name.ToLowerInvariant().Contains(search))
                        continue;
                }

                var selected = entry.id == _selectedCatalogId;
                var label = string.IsNullOrWhiteSpace(entry.displayName) ? entry.id : $"{entry.displayName} ({entry.id})";
                if (GUILayout.Toggle(selected, label, "Button"))
                    _selectedCatalogId = entry.id;

                var itemRect = GUILayoutUtility.GetLastRect();
                if (e.type == EventType.MouseDrag && itemRect.Contains(e.mousePosition))
                {
                    _selectedCatalogId = entry.id;
                    DragAndDrop.PrepareStartDrag();
                    DragAndDrop.objectReferences = System.Array.Empty<UnityEngine.Object>();
                    DragAndDrop.SetGenericData("BlobberCatalogId", entry.id);
                    DragAndDrop.StartDrag($"Blobber:{entry.id}");
                    e.Use();
                }
            }
            EditorGUILayout.EndScrollView();
            EditorGUILayout.EndVertical();

            EditorGUILayout.BeginHorizontal();
            if (GUILayout.Button("Create Library Item"))
                CreateCatalogEntry(catalog);
            if (GUILayout.Button("Edit Selected..."))
                OpenSelectedCatalogItemEditor();
            EditorGUILayout.EndHorizontal();
        }

        void DrawGridPanel()
        {
            EditorGUILayout.BeginVertical();
            if (_map == null)
            {
                EditorGUILayout.EndVertical();
                return;
            }

            _scroll = EditorGUILayout.BeginScrollView(_scroll);
            var cellSizePx = 26f;
            var gridRect = GUILayoutUtility.GetRect(_map.width * cellSizePx + 2, _map.height * cellSizePx + 2);
            var e = Event.current;
            if (_toolMode == EditorToolMode.ObjectMove)
                HandleObjectDragging(gridRect, cellSizePx, e);
            HandleLibraryDropOnGrid(gridRect, cellSizePx, e);

            for (var y = 0; y < _map.height; y++)
            {
                for (var x = 0; x < _map.width; x++)
                {
                    var r = new Rect(gridRect.x + x * cellSizePx, gridRect.y + (_map.height - 1 - y) * cellSizePx, cellSizePx, cellSizePx);
                    var tileColor = TileColor(_map.GetTile(x, y));
                    var borderColor = TileBorderColor(tileColor);
                    const float borderThickness = 0.5f;
                    EditorGUI.DrawRect(r, borderColor);
                    EditorGUI.DrawRect(
                        new Rect(
                            r.x + borderThickness,
                            r.y + borderThickness,
                            r.width - borderThickness * 2f,
                            r.height - borderThickness * 2f),
                        tileColor);
                    if (_map.startCell.x == x && _map.startCell.y == y)
                    {
                        GUI.Label(r, "S", EditorStyles.boldLabel);
                    }

                    if (_toolMode == EditorToolMode.TilePaint && !_isDraggingObject && r.Contains(e.mousePosition) && (e.type == EventType.MouseDown || e.type == EventType.MouseDrag) && e.button == 0)
                    {
                        Undo.RecordObject(_map, "Paint blobber tile");
                        _map.SetTile(x, y, _paintTile);
                        EditorUtility.SetDirty(_map);
                        Repaint();
                        e.Use();
                    }

                    if (_toolMode == EditorToolMode.ObjectPlace && r.Contains(e.mousePosition) && e.type == EventType.MouseDown && e.button == 0)
                    {
                        AddObjectAt(new Vector2Int(x, y), _selectedCatalogId);
                        e.Use();
                    }

                    if (r.Contains(e.mousePosition) && e.type == EventType.MouseDown && e.button == 1)
                    {
                        var menu = new GenericMenu();
                        var cx = x; var cy = y;
                        menu.AddItem(new GUIContent("Set Start Here"), false, () =>
                        {
                            Undo.RecordObject(_map, "Set blobber start");
                            _map.startCell = new Vector2Int(cx, cy);
                            EditorUtility.SetDirty(_map);
                        });
                        menu.ShowAsContext();
                        e.Use();
                    }
                }
            }
            
            DrawObjectMarkers(gridRect, cellSizePx);

            EditorGUILayout.EndScrollView();
            EditorGUILayout.EndVertical();
        }

        void DrawRightPanel()
        {
            EditorGUILayout.BeginVertical(GUILayout.Width(360));
            if (_map == null)
            {
                EditorGUILayout.EndVertical();
                return;
            }

            DrawToolPanel();
            EditorGUILayout.Space(8);

            if (_toolMode == EditorToolMode.TilePaint)
            {
                DrawTilePaintPanel();
            }
            else if (_toolMode == EditorToolMode.ObjectPlace)
            {
                DrawLibraryPanel();
            }
            else
            {
                DrawObjectMovePanel();
            }

            EditorGUILayout.EndVertical();
        }

        void DrawTilePaintPanel()
        {
            EditorGUILayout.LabelField("Tile Paint", EditorStyles.boldLabel);
            _paintTile = (BlobberTileKind)EditorGUILayout.EnumPopup("Paint Tile", _paintTile);
            if (GUILayout.Button("Fill all with Wall"))
            {
                Undo.RecordObject(_map, "Fill map walls");
                for (var y = 0; y < _map.height; y++)
                for (var x = 0; x < _map.width; x++)
                    _map.SetTile(x, y, BlobberTileKind.Wall);
                EditorUtility.SetDirty(_map);
            }
        }

        void DrawObjectMovePanel()
        {
            EditorGUILayout.LabelField("Objects", EditorStyles.boldLabel);
            for (var i = 0; i < _map.objects.Count; i++)
            {
                var o = _map.objects[i];
                var selected = i == _selectedObject;
                if (GUILayout.Toggle(selected, $"{o.id} ({o.interactionType}) @ {o.cell}", "Button"))
                    SelectObjectIndex(i);
            }

            if (_selectedObject >= 0 && _selectedObject < _map.objects.Count && GUILayout.Button("Delete Selected"))
            {
                Undo.RecordObject(_map, "Delete object");
                _map.objects.RemoveAt(_selectedObject);
                _selectedObject = -1;
                EditorUtility.SetDirty(_map);
            }

            if (_selectedObject >= 0 && _selectedObject < _map.objects.Count)
                DrawObjectInspector(_map.objects[_selectedObject]);
        }

        void DrawObjectInspector(BlobberObjectInstance o)
        {
            EditorGUILayout.Space(8);
            EditorGUILayout.LabelField("Selected Object", EditorStyles.boldLabel);
            Undo.RecordObject(_map, "Edit blobber object");

            o.id = EditorGUILayout.TextField("Id", o.id);
            o.catalogId = DrawCatalogPopup(o.catalogId);
            if (GUILayout.Button("Make Id Unique"))
                o.id = MakeUniqueObjectId(o.id, o);
            o.interactionType = (BlobberInteractionType)EditorGUILayout.EnumPopup("Interaction", o.interactionType);
            o.cell = EditorGUILayout.Vector2IntField("Cell", o.cell);
            o.yOffset = EditorGUILayout.FloatField("Y Offset", o.yOffset);
            o.yaw = EditorGUILayout.FloatField("Yaw", o.yaw);

            EditorGUILayout.Space(4);
            EditorGUILayout.LabelField("Params", EditorStyles.miniBoldLabel);
            o.parameters.prompt = EditorGUILayout.TextField("Prompt", o.parameters.prompt);
            o.parameters.message = DrawNamedMultiline("ml_message", o.parameters.message, 48f);
            o.parameters.setFlag = EditorGUILayout.TextField("Set Flag", o.parameters.setFlag);
            o.parameters.requireFlag = EditorGUILayout.TextField("Require Flag", o.parameters.requireFlag);
            o.parameters.diaryId = EditorGUILayout.TextField("Diary Id", o.parameters.diaryId);
            o.parameters.diaryText = DrawNamedMultiline("ml_diary", o.parameters.diaryText, 36f);
            if (o.interactionType == BlobberInteractionType.NpcDialogue)
                o.parameters.dialogueId = DrawDialoguePopup(o.parameters.dialogueId);
            if (o.interactionType == BlobberInteractionType.SceneTransition)
            {
                o.parameters.targetScene = EditorGUILayout.TextField("Target Scene", o.parameters.targetScene);
                o.parameters.targetSpawn = EditorGUILayout.TextField("Target Spawn", o.parameters.targetSpawn);
            }
            if (o.interactionType == BlobberInteractionType.CustomAction)
            {
                o.parameters.customActionId = EditorGUILayout.TextField("Action Id", o.parameters.customActionId);
                o.parameters.customPayload = DrawNamedMultiline("ml_payload", o.parameters.customPayload, 36f);
            }
            o.parameters.setChapterAct = EditorGUILayout.IntField("Set Chapter Act", o.parameters.setChapterAct);
            
            EditorGUILayout.Space(8);
            EditorGUILayout.LabelField("Logic Graph", EditorStyles.miniBoldLabel);
            o.parameters.logicGraphId = DrawLogicGraphPopup(o.parameters.logicGraphId);
            EditorGUILayout.BeginHorizontal();
            if (GUILayout.Button("Open Graph"))
                BlobberLogicGraphEditorWindow.OpenWith(o.parameters.logicGraphId);
            if (GUILayout.Button("Create Graph"))
                o.parameters.logicGraphId = CreateLogicGraphAndGetId(o.id);
            EditorGUILayout.EndHorizontal();

            EditorUtility.SetDirty(_map);
        }

        string DrawCatalogPopup(string current)
        {
            var catalog = _settings != null ? _settings.objectCatalog : null;
            if (catalog == null || catalog.entries.Count == 0)
                return EditorGUILayout.TextField("Catalog Id", current);

            var ids = catalog.entries.Select(e => e.id).ToArray();
            var idx = Mathf.Max(0, System.Array.IndexOf(ids, current));
            idx = EditorGUILayout.Popup("Catalog", idx, ids);
            return ids[idx];
        }

        string DrawDialoguePopup(string current)
        {
            var db = _settings != null ? _settings.dialogueDatabase : null;
            if (db == null || db.dialogues.Count == 0)
                return EditorGUILayout.TextField("Dialogue Id", current);
            var ids = db.dialogues.Select(d => d.dialogueId).ToArray();
            var idx = Mathf.Max(0, System.Array.IndexOf(ids, current));
            idx = EditorGUILayout.Popup("Dialogue", idx, ids);
            return ids[idx];
        }

        string DrawLogicGraphPopup(string current)
        {
            var db = _settings != null ? _settings.logicGraphDatabase : null;
            if (db == null || db.graphs.Count == 0)
                return EditorGUILayout.TextField("Logic Graph Id", current);

            var graphIds = db.graphs.Select(g => g.graphId).ToList();
            var graphLabels = db.graphs.Select(g => $"{g.displayName} ({ShortId(g.graphId)})").ToList();

            // Always allow empty graph and preserve unknown ids for proper object switching.
            var ids = new List<string> { string.Empty };
            var labels = new List<string> { "None" };
            ids.AddRange(graphIds);
            labels.AddRange(graphLabels);

            if (!string.IsNullOrWhiteSpace(current) && !ids.Contains(current))
            {
                ids.Add(current);
                labels.Add($"Missing ({ShortId(current)})");
            }

            var idx = System.Array.IndexOf(ids.ToArray(), current ?? string.Empty);
            idx = Mathf.Max(0, idx);
            idx = EditorGUILayout.Popup("Logic Graph", idx, labels.ToArray());
            return ids[idx];
        }

        void AddObjectAt(Vector2Int cell, string preferredCatalogId = null)
        {
            if (_map == null) return;
            Undo.RecordObject(_map, "Add blobber object");
            var inst = new BlobberObjectInstance
            {
                id = MakeUniqueObjectId("obj"),
                cell = cell,
                interactionType = BlobberInteractionType.None
            };
            var catalog = _settings != null ? _settings.objectCatalog : null;
            if (catalog != null && catalog.entries.Count > 0)
            {
                var e = !string.IsNullOrWhiteSpace(preferredCatalogId)
                    ? catalog.Find(preferredCatalogId)
                    : null;
                e ??= catalog.entries[0];
                inst.catalogId = e.id;
                inst.id = MakeUniqueObjectId(string.IsNullOrWhiteSpace(e.id) ? "obj" : e.id);
                inst.interactionType = e.interactionType;
                inst.parameters = e.defaultParams != null ? JsonUtility.FromJson<BlobberObjectParams>(JsonUtility.ToJson(e.defaultParams)) : new BlobberObjectParams();
            }
            _map.objects.Add(inst);
            _selectedObject = _map.objects.Count - 1;
            EditorUtility.SetDirty(_map);
        }

        void CreateCatalogEntry(BlobberObjectCatalog catalog)
        {
            if (catalog == null) return;
            Undo.RecordObject(catalog, "Create blobber catalog entry");
            var baseId = "object";
            var id = baseId;
            var i = 1;
            while (catalog.entries.Any(e => e.id == id))
            {
                id = $"{baseId}-{i}";
                i++;
            }

            var entry = new BlobberObjectCatalogEntry
            {
                id = id,
                displayName = $"Object {i}",
                interactionType = BlobberInteractionType.None
            };
            catalog.entries.Add(entry);
            _selectedCatalogId = entry.id;
            EditorUtility.SetDirty(catalog);
            AssetDatabase.SaveAssets();
            Selection.activeObject = catalog;
            Repaint();
        }

        void OpenSelectedCatalogItemEditor()
        {
            var catalog = _settings != null ? _settings.objectCatalog : null;
            if (catalog == null || string.IsNullOrWhiteSpace(_selectedCatalogId))
            {
                EditorUtility.DisplayDialog("Asset Library", "Сначала выбери элемент библиотеки.", "OK");
                return;
            }

            BlobberCatalogEntryModalWindow.Open(catalog, _selectedCatalogId);
        }

        string CreateLogicGraphAndGetId(string seedId)
        {
            var db = _settings != null ? _settings.logicGraphDatabase : null;
            if (db == null)
            {
                EditorUtility.DisplayDialog("Logic Graph", "Назначь Logic Graph Database в Project Settings.", "OK");
                return string.Empty;
            }

            Undo.RecordObject(db, "Create logic graph");
            var graphId = MakeUniqueGraphId(db, string.IsNullOrWhiteSpace(seedId) ? "graph" : $"{seedId}_logic");
            var graph = new BlobberLogicGraphData
            {
                graphId = graphId,
                displayName = graphId
            };
            db.graphs.Add(graph);
            EditorUtility.SetDirty(db);
            AssetDatabase.SaveAssets();
            BlobberLogicGraphEditorWindow.OpenWith(graph.graphId);
            return graph.graphId;
        }

        static string MakeUniqueGraphId(BlobberLogicGraphDatabase db, string seed)
        {
            var normalized = string.IsNullOrWhiteSpace(seed) ? "graph" : seed.Trim().ToLowerInvariant().Replace(" ", "_");
            normalized = new string(normalized.Where(c => char.IsLetterOrDigit(c) || c == '_' || c == '-').ToArray());
            if (string.IsNullOrWhiteSpace(normalized)) normalized = "graph";

            var candidate = normalized;
            var i = 1;
            while (db.graphs.Any(g => g.graphId == candidate))
            {
                candidate = $"{normalized}_{i}";
                i++;
            }

            return candidate;
        }

        void HandleLibraryDropOnGrid(Rect gridRect, float cellSizePx, Event e)
        {
            var dragCatalogId = DragAndDrop.GetGenericData("BlobberCatalogId") as string;
            if (string.IsNullOrWhiteSpace(dragCatalogId)) return;
            if (!gridRect.Contains(e.mousePosition)) return;

            if (e.type == EventType.DragUpdated)
            {
                DragAndDrop.visualMode = DragAndDropVisualMode.Copy;
                e.Use();
                return;
            }

            if (e.type == EventType.DragPerform)
            {
                DragAndDrop.AcceptDrag();
                if (TryMouseToCell(gridRect, cellSizePx, e.mousePosition, out var cell))
                    AddObjectAt(cell, dragCatalogId);
                DragAndDrop.SetGenericData("BlobberCatalogId", null);
                e.Use();
                return;
            }

            if (e.type == EventType.DragExited)
            {
                DragAndDrop.SetGenericData("BlobberCatalogId", null);
            }
        }

        string MakeUniqueObjectId(string baseId, BlobberObjectInstance ignore = null)
        {
            if (_map == null) return string.IsNullOrWhiteSpace(baseId) ? "obj-1" : baseId;

            var normalizedBase = string.IsNullOrWhiteSpace(baseId) ? "obj" : baseId.Trim();
            var used = new HashSet<string>(_map.objects.Where(o => o != ignore).Select(o => o.id));
            if (!used.Contains(normalizedBase))
                return normalizedBase;

            var i = 1;
            while (true)
            {
                var candidate = $"{normalizedBase}-{i}";
                if (!used.Contains(candidate))
                    return candidate;
                i++;
            }
        }

        void ShowValidationDialog()
        {
            var msgs = BlobberValidation.Validate(
                _map,
                _settings != null ? _settings.dialogueDatabase : null,
                _settings != null ? _settings.logicGraphDatabase : null);
            var body = msgs.Count == 0 ? "Ошибок не найдено." : string.Join("\n", msgs);
            EditorUtility.DisplayDialog("Blobber Validation", body, "OK");
        }

        void CreateMapAsset()
        {
            var path = EditorUtility.SaveFilePanelInProject("Create Blobber Map", "BlobberMap", "asset", "Choose location");
            if (string.IsNullOrEmpty(path)) return;
            var map = CreateInstance<BlobberMapAsset>();
            map.Resize(map.width, map.height);
            for (var y = 0; y < map.height; y++)
            for (var x = 0; x < map.width; x++)
                map.SetTile(x, y, x == 0 || y == 0 || x == map.width - 1 || y == map.height - 1 ? BlobberTileKind.Wall : BlobberTileKind.Floor);
            AssetDatabase.CreateAsset(map, path);
            AssetDatabase.SaveAssets();
            _map = map;
            Selection.activeObject = map;
        }

        static BlobberProjectSettings FindProjectSettings()
        {
            var guids = AssetDatabase.FindAssets("t:BlobberProjectSettings");
            if (guids.Length == 0) return null;
            var path = AssetDatabase.GUIDToAssetPath(guids[0]);
            return AssetDatabase.LoadAssetAtPath<BlobberProjectSettings>(path);
        }

        void DrawObjectMarkers(Rect gridRect, float cellSizePx)
        {
            for (var i = 0; i < _map.objects.Count; i++)
            {
                var o = _map.objects[i];
                if (!IsCellInsideMap(o.cell)) continue;

                var cellRect = CellRect(gridRect, cellSizePx, o.cell.x, o.cell.y);
                var color = i == _selectedObject ? new Color(0.95f, 0.72f, 0.22f, 1f) : new Color(0.28f, 0.72f, 0.9f, 1f);
                var marker = new Rect(cellRect.x + 6f, cellRect.y + 6f, cellRect.width - 12f, cellRect.height - 12f);
                EditorGUI.DrawRect(marker, color);
                GUI.Label(marker, "O", EditorStyles.centeredGreyMiniLabel);
            }
        }

        void HandleObjectDragging(Rect gridRect, float cellSizePx, Event e)
        {
            if (_map == null || _map.objects.Count == 0) return;

            if (e.type == EventType.MouseDown && e.button == 0)
            {
                if (TryGetObjectIndexAtMouse(gridRect, cellSizePx, e.mousePosition, out var idx))
                {
                    SelectObjectIndex(idx);
                    _dragObjectIndex = idx;
                    _isDraggingObject = true;
                    e.Use();
                    Repaint();
                    return;
                }
            }

            if (!_isDraggingObject || _dragObjectIndex < 0 || _dragObjectIndex >= _map.objects.Count) return;

            if (e.type == EventType.MouseDrag || e.type == EventType.MouseMove)
            {
                if (TryMouseToCell(gridRect, cellSizePx, e.mousePosition, out var cell))
                {
                    var clamped = new Vector2Int(
                        Mathf.Clamp(cell.x, 0, _map.width - 1),
                        Mathf.Clamp(cell.y, 0, _map.height - 1));

                    var obj = _map.objects[_dragObjectIndex];
                    if (obj.cell != clamped)
                    {
                        Undo.RecordObject(_map, "Move blobber object");
                        obj.cell = clamped;
                        EditorUtility.SetDirty(_map);
                        Repaint();
                    }
                }
                e.Use();
            }
            else if (e.type == EventType.MouseUp || e.rawType == EventType.MouseUp)
            {
                _isDraggingObject = false;
                _dragObjectIndex = -1;
                e.Use();
            }
        }

        void HandleMultilineEnterHotkey()
        {
            var e = Event.current;
            if (e == null || e.type != EventType.KeyDown) return;
            if (e.keyCode != KeyCode.Return && e.keyCode != KeyCode.KeypadEnter) return;

            var focused = GUI.GetNameOfFocusedControl();
            if (!string.IsNullOrWhiteSpace(focused) && focused.StartsWith("ml_"))
            {
                _pendingMultilineEnterControl = focused;
                e.Use();
                Repaint();
            }
        }

        string DrawNamedMultiline(string controlName, string value, float minHeight)
        {
            if (_pendingMultilineEnterControl == controlName)
            {
                value = (value ?? string.Empty) + "\n";
                _pendingMultilineEnterControl = string.Empty;
            }

            GUI.SetNextControlName(controlName);
            return EditorGUILayout.TextArea(value ?? string.Empty, GUILayout.MinHeight(minHeight));
        }

        void SelectObjectIndex(int index)
        {
            if (_selectedObject == index) return;
            // Commit text fields before switching object, otherwise IMGUI may keep stale edited value.
            GUI.FocusControl(null);
            EditorGUIUtility.editingTextField = false;
            _selectedObject = index;
            Repaint();
        }

        bool TryGetObjectIndexAtMouse(Rect gridRect, float cellSizePx, Vector2 mousePos, out int idx)
        {
            for (var i = _map.objects.Count - 1; i >= 0; i--)
            {
                var o = _map.objects[i];
                if (!IsCellInsideMap(o.cell)) continue;
                if (CellRect(gridRect, cellSizePx, o.cell.x, o.cell.y).Contains(mousePos))
                {
                    idx = i;
                    return true;
                }
            }

            idx = -1;
            return false;
        }

        bool TryMouseToCell(Rect gridRect, float cellSizePx, Vector2 mousePos, out Vector2Int cell)
        {
            var lx = mousePos.x - gridRect.x;
            var ly = mousePos.y - gridRect.y;
            if (lx < 0f || ly < 0f)
            {
                cell = default;
                return false;
            }

            var gx = Mathf.FloorToInt(lx / cellSizePx);
            var gyTop = Mathf.FloorToInt(ly / cellSizePx);
            var gy = _map.height - 1 - gyTop;
            cell = new Vector2Int(gx, gy);
            return IsCellInsideMap(cell);
        }

        bool IsCellInsideMap(Vector2Int cell) =>
            cell.x >= 0 && cell.y >= 0 && cell.x < _map.width && cell.y < _map.height;

        Rect CellRect(Rect gridRect, float cellSizePx, int x, int y) =>
            new Rect(gridRect.x + x * cellSizePx, gridRect.y + (_map.height - 1 - y) * cellSizePx, cellSizePx, cellSizePx);

        static Color TileColor(BlobberTileKind t)
        {
            return t switch
            {
                BlobberTileKind.Wall => new Color(0.22f, 0.22f, 0.25f),
                BlobberTileKind.Floor => new Color(0.48f, 0.47f, 0.42f),
                BlobberTileKind.Marker => new Color(0.28f, 0.55f, 0.3f),
                _ => new Color(0.12f, 0.12f, 0.12f)
            };
        }

        static Color TileBorderColor(Color fill)
        {
            var brightness = fill.r * 0.299f + fill.g * 0.587f + fill.b * 0.114f;
            return brightness > 0.5f ? new Color(0.18f, 0.18f, 0.2f, 1f) : new Color(0.58f, 0.58f, 0.62f, 1f);
        }

        static string ShortId(string id) => string.IsNullOrWhiteSpace(id) ? "-" : id.Substring(0, Mathf.Min(6, id.Length));
    }

    static class BlobberValidation
    {
        public static List<string> Validate(BlobberMapAsset map, BlobberDialogueDatabase db, BlobberLogicGraphDatabase logicDb)
        {
            var issues = new List<string>();
            if (map == null) return issues;

            var ids = new HashSet<string>();
            foreach (var o in map.objects)
            {
                if (string.IsNullOrWhiteSpace(o.id)) issues.Add("Object with empty id.");
                else if (!ids.Add(o.id)) issues.Add($"Duplicate object id: {o.id}");

                if (o.interactionType == BlobberInteractionType.SceneTransition && string.IsNullOrWhiteSpace(o.parameters.targetScene))
                    issues.Add($"{o.id}: scene_transition without targetScene");

                if (o.interactionType == BlobberInteractionType.CustomAction && string.IsNullOrWhiteSpace(o.parameters.customActionId))
                    issues.Add($"{o.id}: custom_action without actionId");

                if (!string.IsNullOrWhiteSpace(o.parameters.dialogueId) && db != null && db.Find(o.parameters.dialogueId) == null)
                    issues.Add($"{o.id}: dialogueId '{o.parameters.dialogueId}' not found");

                if (!string.IsNullOrWhiteSpace(o.parameters.logicGraphId) && logicDb != null && logicDb.Find(o.parameters.logicGraphId) == null)
                    issues.Add($"{o.id}: logicGraphId '{o.parameters.logicGraphId}' not found");
            }

            if (map.GetTile(map.startCell.x, map.startCell.y) == BlobberTileKind.Wall)
                issues.Add("Start cell is wall.");

            var reachable = Flood(map, map.startCell);
            foreach (var o in map.objects)
                if (!reachable.Contains(o.cell)) issues.Add($"Unreachable object: {o.id} at {o.cell}");

            return issues;
        }

        static HashSet<Vector2Int> Flood(BlobberMapAsset map, Vector2Int start)
        {
            var vis = new HashSet<Vector2Int>();
            var q = new Queue<Vector2Int>();
            q.Enqueue(start);
            while (q.Count > 0)
            {
                var c = q.Dequeue();
                if (vis.Contains(c)) continue;
                if (c.x < 0 || c.y < 0 || c.x >= map.width || c.y >= map.height) continue;
                var t = map.GetTile(c.x, c.y);
                if (t == BlobberTileKind.Wall || t == BlobberTileKind.Void) continue;
                vis.Add(c);
                q.Enqueue(new Vector2Int(c.x + 1, c.y));
                q.Enqueue(new Vector2Int(c.x - 1, c.y));
                q.Enqueue(new Vector2Int(c.x, c.y + 1));
                q.Enqueue(new Vector2Int(c.x, c.y - 1));
            }
            return vis;
        }
    }
}
#endif
