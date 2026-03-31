#if UNITY_EDITOR
using System;
using System.Collections.Generic;
using System.Linq;
using TikhayaTropa.Animation;
using UnityEditor;
using UnityEngine;

namespace TikhayaTropa.EditorTools
{
    public class SpriteAtlasAnimationWindow : EditorWindow
    {
        enum WindowTab
        {
            Slicer,
            Animation,
            AtlasBrowser
        }

        enum BrowserPreviewMode
        {
            Sprite,
            Clip
        }

        SpriteAnimationAtlas _atlas;
        float _leftPanelWidth = 320f;
        bool _isResizingPanels;
        Vector2 _leftScroll;
        Vector2 _rightScroll;
        int _selectedClip = -1;

        int _sliceColumns = 4;
        int _sliceRows = 2;
        int _slicePadding = 0;
        int _selectedSheetIndex;

        string _newClipId = "clip";
        float _newClipFps = 8f;
        readonly HashSet<int> _frameSelection = new();
        bool _isFrameRangeDrag;
        int _frameDragAnchor = -1;
        int _frameDragCurrent = -1;
        int _lastFrameClick = -1;

        bool _previewPlaying;
        int _previewFrame;
        double _lastPreviewTime;
        const float SplitterWidth = 1f;
        WindowTab _windowTab;
        Vector2 _browserScroll;
        int _browserSpriteIndex = -1;
        int _browserClipIndex = -1;
        int _browserClipPreviewFrame;
        bool _browserClipPlaying;
        double _browserLastPreviewTime;
        BrowserPreviewMode _browserPreviewMode = BrowserPreviewMode.Sprite;
        readonly Dictionary<string, bool> _sheetFoldouts = new();
        readonly Dictionary<string, bool> _clipFoldouts = new();

        [MenuItem("TikhayaTropa/Sprites/Sprite Manager")]
        static void Open() => GetWindow<SpriteAtlasAnimationWindow>("Sprite Manager");

        void OnEnable()
        {
            EditorApplication.update += OnEditorUpdate;
        }

        void OnDisable()
        {
            EditorApplication.update -= OnEditorUpdate;
        }

        void OnGUI()
        {
            DrawTopTabs();

            if (_windowTab == WindowTab.AtlasBrowser)
            {
                DrawAtlasBrowserTab();
                return;
            }

            EditorGUILayout.BeginHorizontal();
            DrawLeftPanel(_leftPanelWidth);
            DrawPanelSplitter();
            DrawRightPanel();
            EditorGUILayout.EndHorizontal();
        }

        void DrawTopTabs()
        {
            var selected = (int)_windowTab;
            selected = GUILayout.Toolbar(selected, new[] { "Slicer", "Animation", "Atlas Browser" });
            _windowTab = (WindowTab)selected;
            EditorGUILayout.Space(4);
        }

        void DrawLeftPanel(float width)
        {
            EditorGUILayout.BeginVertical(GUILayout.Width(Mathf.Max(0f, width)));
            _atlas = (SpriteAnimationAtlas)EditorGUILayout.ObjectField("Atlas Asset", _atlas, typeof(SpriteAnimationAtlas), false);

            if (_atlas == null)
            {
                if (GUILayout.Button("Create Atlas Asset"))
                    CreateAtlasAsset();
                EditorGUILayout.HelpBox("Создай или выбери SpriteAnimationAtlas.", MessageType.Info);
                EditorGUILayout.EndVertical();
                return;
            }

            var so = new SerializedObject(_atlas);
            so.Update();
            EnsureSheetMigration();
            DrawSheetsPanel();
            so.ApplyModifiedProperties();

            if (_windowTab == WindowTab.Slicer)
                DrawSlicePanel();
            else
                DrawAnimationPanel();
            EditorGUILayout.EndVertical();
        }

        void DrawSlicePanel()
        {
            EditorGUILayout.Space(8);
            EditorGUILayout.LabelField("Slice Spritesheet", EditorStyles.boldLabel);
            _sliceColumns = EditorGUILayout.IntField("Columns", Mathf.Max(1, _sliceColumns));
            _sliceRows = EditorGUILayout.IntField("Rows", Mathf.Max(1, _sliceRows));
            _slicePadding = EditorGUILayout.IntField("Padding", Mathf.Max(0, _slicePadding));

            if (GUILayout.Button("Slice Texture to Sprites"))
                SliceTexture();

            var sprites = GetTextureSprites(GetSelectedSheet());
            if (sprites.Count == 0)
            {
                EditorGUILayout.HelpBox("Нет нарезанных спрайтов. Нажми Slice.", MessageType.Warning);
                return;
            }
        }

        void DrawAnimationPanel()
        {
            EditorGUILayout.Space(8);
            EditorGUILayout.LabelField("Animation Builder", EditorStyles.boldLabel);
            var selectedSheet = GetSelectedSheet();
            if (selectedSheet == null)
            {
                EditorGUILayout.HelpBox("Выбери Source Sheet сверху, чтобы собрать клип из его кадров.", MessageType.Info);
                return;
            }

            var sprites = GetTextureSprites(selectedSheet);
            EditorGUILayout.LabelField($"Source Sheet: {selectedSheet.name}");
            EditorGUILayout.LabelField($"Sprites in sheet: {sprites.Count}");
            if (sprites.Count == 0)
            {
                EditorGUILayout.HelpBox("В выбранном sheet нет спрайтов. Сначала нарежь его во вкладке Slicer.", MessageType.Info);
            }
            else
            {
                _newClipId = EditorGUILayout.TextField("Clip Id", _newClipId);
                _newClipFps = EditorGUILayout.FloatField("FPS", Mathf.Max(0.1f, _newClipFps));
                DrawFrameSelectionGrid(sprites);

                EditorGUILayout.BeginHorizontal();
                if (GUILayout.Button("Select All"))
                {
                    _frameSelection.Clear();
                    for (var i = 0; i < sprites.Count; i++) _frameSelection.Add(i);
                }
                if (GUILayout.Button("Clear Selection"))
                    _frameSelection.Clear();
                EditorGUILayout.EndHorizontal();

                if (GUILayout.Button("Add Clip From Selection"))
                {
                    AddClipFromSelection(sprites);
                    SaveAtlasNow();
                }
            }

            EditorGUILayout.Space(8);
            EditorGUILayout.LabelField("Clips", EditorStyles.boldLabel);
            _leftScroll = EditorGUILayout.BeginScrollView(_leftScroll);
            foreach (var group in GetGroupedClipIndices())
            {
                if (!_clipFoldouts.ContainsKey(group.groupName)) _clipFoldouts[group.groupName] = true;
                _clipFoldouts[group.groupName] = EditorGUILayout.Foldout(_clipFoldouts[group.groupName], $"{group.groupName} ({group.indices.Count})", true);
                if (!_clipFoldouts[group.groupName]) continue;
                foreach (var i in group.indices)
                {
                    var clip = _atlas.clips[i];
                    var selected = i == _selectedClip;
                    if (GUILayout.Toggle(selected, $"{clip.id} ({clip.frames.Count} frames @ {clip.framesPerSecond:0.##}fps)", "Button"))
                        _selectedClip = i;
                }
            }
            EditorGUILayout.EndScrollView();

            if (GUILayout.Button("Delete Selected") && _selectedClip >= 0 && _selectedClip < _atlas.clips.Count)
            {
                Undo.RecordObject(_atlas, "Delete atlas clip");
                _atlas.clips.RemoveAt(_selectedClip);
                _selectedClip = Mathf.Clamp(_selectedClip - 1, -1, _atlas.clips.Count - 1);
                EditorUtility.SetDirty(_atlas);
                SaveAtlasNow();
            }
        }

        void DrawRightPanel()
        {
            EditorGUILayout.BeginVertical();
            _rightScroll = EditorGUILayout.BeginScrollView(_rightScroll);
            if (_windowTab == WindowTab.Slicer)
            {
                DrawSlicePreviewPanel();
                EditorGUILayout.EndScrollView();
                EditorGUILayout.EndVertical();
                if (_atlas != null) EditorUtility.SetDirty(_atlas);
                return;
            }

            // В Animation-вкладке не показываем превью нарезки.
            EditorGUILayout.Space(4);
            EditorGUILayout.LabelField("Preview", EditorStyles.boldLabel);

            if (_atlas == null || _selectedClip < 0 || _selectedClip >= _atlas.clips.Count)
            {
                EditorGUILayout.HelpBox("Выбери clip слева.", MessageType.Info);
                EditorGUILayout.EndScrollView();
                EditorGUILayout.EndVertical();
                return;
            }

            var clip = _atlas.clips[_selectedClip];
            clip.id = EditorGUILayout.TextField("Id", clip.id);
            clip.framesPerSecond = EditorGUILayout.FloatField("FPS", Mathf.Max(0.1f, clip.framesPerSecond));

            var previewSprite = GetPreviewSprite(clip);
            var previewRect = GUILayoutUtility.GetRect(10f, 420f, GUILayout.ExpandWidth(true));
            EditorGUI.DrawRect(previewRect, new Color(0.12f, 0.12f, 0.14f, 1f));
            DrawSpritePreview(previewRect, previewSprite);

            EditorGUILayout.BeginHorizontal();
            if (GUILayout.Button(_previewPlaying ? "Pause" : "Play"))
            {
                _previewPlaying = !_previewPlaying;
                _lastPreviewTime = EditorApplication.timeSinceStartup;
            }
            if (GUILayout.Button("Stop"))
            {
                _previewPlaying = false;
                _previewFrame = 0;
            }
            EditorGUILayout.EndHorizontal();

            EditorGUILayout.LabelField($"Frame: {Mathf.Clamp(_previewFrame, 0, Mathf.Max(0, clip.frames.Count - 1)) + 1}/{Mathf.Max(clip.frames.Count, 1)}");
            if (clip.frames.Count > 0)
            {
                _previewFrame = EditorGUILayout.IntSlider("Frame Scrub", Mathf.Clamp(_previewFrame, 0, clip.frames.Count - 1), 0, clip.frames.Count - 1);
            }

            EditorGUILayout.Space(10);
            EditorGUILayout.LabelField("Frames", EditorStyles.boldLabel);
            for (var i = 0; i < clip.frames.Count; i++)
            {
                var remove = false;
                EditorGUILayout.BeginHorizontal();
                clip.frames[i] = (Sprite)EditorGUILayout.ObjectField($"#{i}", clip.frames[i], typeof(Sprite), false);
                if (GUILayout.Button("X", GUILayout.Width(24f)))
                    remove = true;
                EditorGUILayout.EndHorizontal();

                if (!remove) continue;
                clip.frames.RemoveAt(i);
                i--;
                SaveAtlasNow();
            }

            EditorGUILayout.BeginHorizontal();
            if (GUILayout.Button("Append Frame Slot"))
            {
                clip.frames.Add(null);
                SaveAtlasNow();
            }
            if (GUILayout.Button("Remove Last Frame") && clip.frames.Count > 0)
            {
                clip.frames.RemoveAt(clip.frames.Count - 1);
                SaveAtlasNow();
            }
            EditorGUILayout.EndHorizontal();

            EditorGUILayout.EndScrollView();
            EditorGUILayout.EndVertical();

            EditorUtility.SetDirty(_atlas);
        }

        void DrawAtlasBrowserTab()
        {
            EditorGUILayout.BeginVertical();
            _atlas = (SpriteAnimationAtlas)EditorGUILayout.ObjectField("Atlas Asset", _atlas, typeof(SpriteAnimationAtlas), false);
            DrawAtlasBrowserPanel();
            EditorGUILayout.EndVertical();
        }

        void PickSpritesFolder()
        {
            var abs = EditorUtility.OpenFolderPanel("Pick sprites folder", Application.dataPath, string.Empty);
            if (string.IsNullOrWhiteSpace(abs) || !abs.StartsWith(Application.dataPath)) return;
            _atlas.spriteFolder = "Assets" + abs.Substring(Application.dataPath.Length);
        }

        List<Sprite> GetFolderSprites()
        {
            if (_atlas == null || string.IsNullOrWhiteSpace(_atlas.spriteFolder) || !_atlas.spriteFolder.StartsWith("Assets"))
                return new List<Sprite>();
            var guids = AssetDatabase.FindAssets("t:Sprite", new[] { _atlas.spriteFolder });
            var sprites = new List<Sprite>();
            foreach (var guid in guids)
            {
                var path = AssetDatabase.GUIDToAssetPath(guid);
                var sprite = AssetDatabase.LoadAssetAtPath<Sprite>(path);
                if (sprite != null) sprites.Add(sprite);
            }
            return sprites.OrderBy(s => s.name).ToList();
        }

        void DrawAtlasBrowserPanel()
        {
            if (_atlas == null)
            {
                EditorGUILayout.HelpBox("Выбери Atlas Asset.", MessageType.Info);
                return;
            }

            var allSprites = GetAllSheetSprites();
            var grouped = GetGroupedSheetSprites();
            EditorGUILayout.LabelField("Atlas Browser", EditorStyles.boldLabel);
            EditorGUILayout.LabelField($"Sheets: {_atlas.sourceTextures.Count}");
            EditorGUILayout.LabelField($"Sprites in all sheets: {allSprites.Count}");
            EditorGUILayout.LabelField($"Clips in atlas: {_atlas.clips.Count}");
            EditorGUILayout.Space(6);
            _browserPreviewMode = (BrowserPreviewMode)GUILayout.Toolbar((int)_browserPreviewMode, new[] { "Sprite", "Clip" });
            if (_browserPreviewMode == BrowserPreviewMode.Clip && _atlas.clips.Count > 0 && (_browserClipIndex < 0 || _browserClipIndex >= _atlas.clips.Count))
                _browserClipIndex = 0;
            EditorGUILayout.Space(4);

            EditorGUILayout.BeginHorizontal();
            DrawAtlasBrowserLeftList(grouped);
            DrawAtlasBrowserRightPreview(allSprites);
            EditorGUILayout.EndHorizontal();
        }

        void DrawAtlasBrowserLeftList(List<(Texture2D sheet, List<Sprite> sprites, int globalStartIndex)> grouped)
        {
            EditorGUILayout.BeginVertical(GUILayout.Width(360f));
            _browserScroll = EditorGUILayout.BeginScrollView(_browserScroll);
            if (_browserPreviewMode == BrowserPreviewMode.Sprite)
            {
                EditorGUILayout.LabelField("Sprites by Sheets", EditorStyles.miniBoldLabel);
                Sprite spriteToDelete = null;
                var sheetToDelete = -1;
                for (var g = 0; g < grouped.Count; g++)
                {
                    var group = grouped[g];
                    var sheetName = group.sheet != null ? group.sheet.name : $"Sheet_{g}";
                    var key = sheetName + "#" + g;
                    if (!_sheetFoldouts.ContainsKey(key)) _sheetFoldouts[key] = true;
                    EditorGUILayout.BeginHorizontal();
                    _sheetFoldouts[key] = EditorGUILayout.Foldout(_sheetFoldouts[key], $"{sheetName} ({group.sprites.Count})", true);
                    if (GUILayout.Button("x", GUILayout.Width(22f)))
                    {
                        sheetToDelete = g;
                    }
                    EditorGUILayout.EndHorizontal();
                    if (sheetToDelete >= 0) break;
                    if (!_sheetFoldouts[key]) continue;

                    for (var i = 0; i < group.sprites.Count; i++)
                    {
                        var globalIndex = group.globalStartIndex + i;
                        var sprite = group.sprites[i];
                        EditorGUILayout.BeginHorizontal();
                        if (GUILayout.Toggle(globalIndex == _browserSpriteIndex, $"{globalIndex}: {sprite.name}", "Button"))
                            _browserSpriteIndex = globalIndex;
                        if (GUILayout.Button("x", GUILayout.Width(22f)))
                        {
                            spriteToDelete = sprite;
                        }
                        EditorGUILayout.EndHorizontal();
                        if (spriteToDelete != null) break;
                    }
                    if (spriteToDelete != null) break;
                }

                if (sheetToDelete >= 0)
                    DeleteSelectedSheet(sheetToDelete);
                else if (spriteToDelete != null)
                    DeleteSelectedSprite(spriteToDelete);
            }
            else
            {
                EditorGUILayout.LabelField("Clips", EditorStyles.miniBoldLabel);
                var clipToDelete = -1;
                foreach (var group in GetGroupedClipIndices())
                {
                    if (!_clipFoldouts.ContainsKey(group.groupName)) _clipFoldouts[group.groupName] = true;
                    _clipFoldouts[group.groupName] = EditorGUILayout.Foldout(_clipFoldouts[group.groupName], $"{group.groupName} ({group.indices.Count})", true);
                    if (!_clipFoldouts[group.groupName]) continue;

                    foreach (var i in group.indices)
                    {
                        var c = _atlas.clips[i];
                        EditorGUILayout.BeginHorizontal();
                        if (GUILayout.Toggle(i == _browserClipIndex, $"{c.id} ({c.frames.Count} @ {c.framesPerSecond:0.##}fps)", "Button"))
                        {
                            if (_browserClipIndex != i)
                            {
                                _browserClipPreviewFrame = 0;
                                _browserClipPlaying = false;
                            }
                            _browserClipIndex = i;
                        }
                        if (GUILayout.Button("x", GUILayout.Width(22f)))
                            clipToDelete = i;
                        EditorGUILayout.EndHorizontal();
                        if (clipToDelete >= 0) break;
                    }

                    if (clipToDelete >= 0) break;
                }

                if (clipToDelete >= 0)
                    DeleteClipAt(clipToDelete);
            }
            EditorGUILayout.EndScrollView();
            EditorGUILayout.EndVertical();
        }

        void DrawAtlasBrowserRightPreview(List<Sprite> allSprites)
        {
            EditorGUILayout.BeginVertical();
            EditorGUILayout.LabelField(_browserPreviewMode == BrowserPreviewMode.Sprite ? "Sprite Preview" : "Clip Preview", EditorStyles.miniBoldLabel);

            if (_browserPreviewMode == BrowserPreviewMode.Sprite)
            {
                var previewRect = GUILayoutUtility.GetRect(10f, 520f, GUILayout.ExpandWidth(true), GUILayout.ExpandHeight(true));
                EditorGUI.DrawRect(previewRect, new Color(0.12f, 0.12f, 0.14f, 1f));
                if (_browserSpriteIndex >= 0 && _browserSpriteIndex < allSprites.Count)
                    DrawSpritePreview(previewRect, allSprites[_browserSpriteIndex]);
                else
                    GUI.Label(previewRect, "Выбери спрайт в списке", EditorStyles.centeredGreyMiniLabel);
            }
            else
            {
                if (_browserClipIndex >= 0 && _browserClipIndex < _atlas.clips.Count)
                {
                    var clip = _atlas.clips[_browserClipIndex];
                    EditorGUILayout.BeginHorizontal();
                    if (GUILayout.Button(_browserClipPlaying ? "Pause" : "Play"))
                    {
                        if (!_browserClipPlaying)
                            _browserClipPreviewFrame = Mathf.Clamp(_browserClipPreviewFrame, 0, Mathf.Max(0, clip.frames.Count - 1));
                        _browserClipPlaying = !_browserClipPlaying;
                        _browserLastPreviewTime = EditorApplication.timeSinceStartup;
                        Repaint();
                    }
                    if (GUILayout.Button("Stop"))
                    {
                        _browserClipPlaying = false;
                        _browserClipPreviewFrame = 0;
                        Repaint();
                    }
                    EditorGUILayout.EndHorizontal();
                    if (clip.frames.Count > 0)
                        _browserClipPreviewFrame = EditorGUILayout.IntSlider("Frame", Mathf.Clamp(_browserClipPreviewFrame, 0, clip.frames.Count - 1), 0, clip.frames.Count - 1);

                    var previewRect = GUILayoutUtility.GetRect(10f, 520f, GUILayout.ExpandWidth(true), GUILayout.ExpandHeight(true));
                    EditorGUI.DrawRect(previewRect, new Color(0.12f, 0.12f, 0.14f, 1f));
                    var frame = clip.frames.Count == 0 ? null : clip.frames[Mathf.Clamp(_browserClipPreviewFrame, 0, clip.frames.Count - 1)];
                    DrawSpritePreview(previewRect, frame);
                }
                else
                {
                    var previewRect = GUILayoutUtility.GetRect(10f, 520f, GUILayout.ExpandWidth(true), GUILayout.ExpandHeight(true));
                    EditorGUI.DrawRect(previewRect, new Color(0.12f, 0.12f, 0.14f, 1f));
                    GUI.Label(previewRect, "Выбери клип в списке", EditorStyles.centeredGreyMiniLabel);
                }
            }

            EditorGUILayout.EndVertical();
        }

        void DrawPanelSplitter()
        {
            var rect = GUILayoutUtility.GetRect(SplitterWidth, SplitterWidth, GUILayout.ExpandHeight(true));
            EditorGUIUtility.AddCursorRect(rect, MouseCursor.ResizeHorizontal);

            var e = Event.current;
            if (e.type == EventType.MouseDown && e.button == 0 && rect.Contains(e.mousePosition))
            {
                _isResizingPanels = true;
                e.Use();
                return;
            }

            if (_isResizingPanels && e.type == EventType.MouseDrag)
            {
                _leftPanelWidth += e.delta.x;
                Repaint();
                e.Use();
                return;
            }

            if (_isResizingPanels && (e.type == EventType.MouseUp || e.rawType == EventType.MouseUp))
            {
                _isResizingPanels = false;
                e.Use();
            }
        }

        void DrawSlicePreviewPanel()
        {
            EditorGUILayout.LabelField("Slice Preview", EditorStyles.boldLabel);
            var previewRect = GUILayoutUtility.GetRect(10f, 260f, GUILayout.ExpandWidth(true));
            EditorGUI.DrawRect(previewRect, new Color(0.12f, 0.12f, 0.14f, 1f));

            if (_atlas == null || _atlas.sourceTexture == null)
            {
                GUI.Label(previewRect, "Назначь Source Texture", EditorStyles.centeredGreyMiniLabel);
                return;
            }

            var texture = GetSelectedSheet();
            if (texture == null)
            {
                GUI.Label(previewRect, "Выбери sheet в списке", EditorStyles.centeredGreyMiniLabel);
                return;
            }

            DrawTextureWithSliceGrid(previewRect, texture, Mathf.Max(1, _sliceColumns), Mathf.Max(1, _sliceRows), Mathf.Max(0, _slicePadding));
        }

        void OnEditorUpdate()
        {
            var now = EditorApplication.timeSinceStartup;
            var repainted = false;

            if (_previewPlaying && _atlas != null && _selectedClip >= 0 && _selectedClip < _atlas.clips.Count)
            {
                var clip = _atlas.clips[_selectedClip];
                if (clip.frames != null && clip.frames.Count > 0)
                {
                    var frameDuration = 1.0 / Mathf.Max(0.1f, clip.framesPerSecond);
                    if (now - _lastPreviewTime >= frameDuration)
                    {
                        _previewFrame = (_previewFrame + 1) % clip.frames.Count;
                        _lastPreviewTime = now;
                        repainted = true;
                    }
                }
            }

            if (_browserClipPlaying && _atlas != null && _browserClipIndex >= 0 && _browserClipIndex < _atlas.clips.Count)
            {
                var browserClip = _atlas.clips[_browserClipIndex];
                if (browserClip.frames != null && browserClip.frames.Count > 0)
                {
                    var browserFrameDuration = 1.0 / Mathf.Max(0.1f, browserClip.framesPerSecond);
                    if (now - _browserLastPreviewTime >= browserFrameDuration)
                    {
                        _browserClipPreviewFrame = (_browserClipPreviewFrame + 1) % browserClip.frames.Count;
                        _browserLastPreviewTime = now;
                        repainted = true;
                    }
                }
            }

            if (repainted)
                Repaint();
        }

        void AddClipFromSelection(List<Sprite> sprites)
        {
            if (_atlas == null || sprites.Count == 0) return;
            if (_frameSelection.Count == 0)
            {
                EditorUtility.DisplayDialog("Create Clip", "Выбери хотя бы один кадр.", "OK");
                return;
            }

            Undo.RecordObject(_atlas, "Add atlas clip");
            var clip = new SpriteAnimationClipDef
            {
                id = string.IsNullOrWhiteSpace(_newClipId) ? $"clip_{_atlas.clips.Count + 1}" : _newClipId.Trim(),
                group = GetCurrentClipGroupName(sprites),
                framesPerSecond = Mathf.Max(0.1f, _newClipFps),
                frames = new List<Sprite>()
            };
            foreach (var i in _frameSelection.OrderBy(v => v))
            {
                if (i >= 0 && i < sprites.Count)
                    clip.frames.Add(sprites[i]);
            }
            _atlas.clips.Add(clip);
            _selectedClip = _atlas.clips.Count - 1;
            EditorUtility.SetDirty(_atlas);
        }

        string GetCurrentClipGroupName(List<Sprite> sprites)
        {
            var selectedSheet = GetSelectedSheet();
            if (selectedSheet != null && !string.IsNullOrWhiteSpace(selectedSheet.name))
                return selectedSheet.name;

            if (sprites != null && sprites.Count > 0 && sprites[0] != null && sprites[0].texture != null)
                return sprites[0].texture.name;

            return "Default";
        }

        List<(string groupName, List<int> indices)> GetGroupedClipIndices()
        {
            var result = new List<(string groupName, List<int> indices)>();
            if (_atlas == null) return result;

            var map = new Dictionary<string, List<int>>();
            for (var i = 0; i < _atlas.clips.Count; i++)
            {
                var clip = _atlas.clips[i];
                var groupName = string.IsNullOrWhiteSpace(clip.group) ? InferClipGroupName(clip) : clip.group;
                if (string.IsNullOrWhiteSpace(clip.group))
                    clip.group = groupName;
                if (!map.TryGetValue(groupName, out var list))
                {
                    list = new List<int>();
                    map[groupName] = list;
                }
                list.Add(i);
            }

            foreach (var kv in map.OrderBy(p => p.Key))
                result.Add((kv.Key, kv.Value));
            return result;
        }

        string InferClipGroupName(SpriteAnimationClipDef clip)
        {
            if (clip?.frames == null || clip.frames.Count == 0) return "Default";
            var first = clip.frames.FirstOrDefault(s => s != null);
            if (first == null || first.texture == null) return "Default";
            return first.texture.name;
        }

        void DrawFrameSelectionGrid(List<Sprite> sprites)
        {
            EditorGUILayout.LabelField("Frames", EditorStyles.miniBoldLabel);
            const float thumb = 64f;
            var availableWidth = Mathf.Max(120f, _leftPanelWidth - 70f);
            var columns = Mathf.Max(1, Mathf.FloorToInt(availableWidth / (thumb + 10f)));
            var rows = Mathf.CeilToInt(sprites.Count / (float)columns);

            for (var row = 0; row < rows; row++)
            {
                EditorGUILayout.BeginHorizontal();
                for (var col = 0; col < columns; col++)
                {
                    var idx = row * columns + col;
                    if (idx >= sprites.Count)
                    {
                        GUILayout.Space(thumb + 8f);
                        continue;
                    }

                    DrawFrameThumbButton(idx, sprites[idx], thumb);
                }
                EditorGUILayout.EndHorizontal();
            }

            var e = Event.current;
            if ((e.type == EventType.MouseUp || e.rawType == EventType.MouseUp) && _isFrameRangeDrag)
            {
                _isFrameRangeDrag = false;
                _frameDragAnchor = -1;
                _frameDragCurrent = -1;
                e.Use();
            }
        }

        void DrawFrameThumbButton(int index, Sprite sprite, float size)
        {
            var selected = _frameSelection.Contains(index);
            var bg = selected ? new Color(0.88f, 0.72f, 0.2f, 1f) : new Color(0.22f, 0.22f, 0.25f, 1f);

            var rect = GUILayoutUtility.GetRect(size, size + 18f, GUILayout.Width(size + 6f));
            var thumbRect = new Rect(rect.x, rect.y, size, size);
            var labelRect = new Rect(rect.x, rect.y + size + 2f, size, 16f);

            EditorGUI.DrawRect(thumbRect, bg);
            DrawSpritePreview(thumbRect, sprite);
            GUI.Label(labelRect, index.ToString(), EditorStyles.centeredGreyMiniLabel);

            var e = Event.current;
            if (e.type == EventType.MouseDown && e.button == 0 && rect.Contains(e.mousePosition))
            {
                if (e.shift && _lastFrameClick >= 0)
                {
                    SelectFrameRange(_lastFrameClick, index);
                    _isFrameRangeDrag = false;
                }
                else
                {
                    _isFrameRangeDrag = true;
                    _frameDragAnchor = index;
                    _frameDragCurrent = index;
                    SelectFrameRange(index, index);
                }
                _lastFrameClick = index;
                e.Use();
                Repaint();
                return;
            }

            if (e.type == EventType.MouseDrag && _isFrameRangeDrag && rect.Contains(e.mousePosition))
            {
                if (_frameDragCurrent != index)
                {
                    _frameDragCurrent = index;
                    SelectFrameRange(_frameDragAnchor, _frameDragCurrent);
                    Repaint();
                }
                e.Use();
            }
        }

        void SelectFrameRange(int a, int b)
        {
            _frameSelection.Clear();
            var min = Mathf.Min(a, b);
            var max = Mathf.Max(a, b);
            for (var i = min; i <= max; i++) _frameSelection.Add(i);
        }

        void SliceTexture()
        {
            if (_atlas == null || _atlas.sourceTexture == null)
            {
                EditorUtility.DisplayDialog("Slice", "Сначала назначь sourceTexture.", "OK");
                return;
            }

            var selected = GetSelectedSheet();
            if (selected == null)
            {
                EditorUtility.DisplayDialog("Slice", "Сначала выбери sheet.", "OK");
                return;
            }

            var path = AssetDatabase.GetAssetPath(selected);
            var importer = AssetImporter.GetAtPath(path) as TextureImporter;
            if (importer == null)
            {
                EditorUtility.DisplayDialog("Slice", "Не удалось получить TextureImporter.", "OK");
                return;
            }

            var tex = selected;
            var cols = Mathf.Max(1, _sliceColumns);
            var rows = Mathf.Max(1, _sliceRows);
            var pad = Mathf.Max(0, _slicePadding);
            var cellW = Mathf.FloorToInt((tex.width - pad * (cols - 1)) / (float)cols);
            var cellH = Mathf.FloorToInt((tex.height - pad * (rows - 1)) / (float)rows);
            if (cellW <= 0 || cellH <= 0)
            {
                EditorUtility.DisplayDialog("Slice", "Некорректные rows/columns/padding.", "OK");
                return;
            }

            importer.textureType = TextureImporterType.Sprite;
            importer.spriteImportMode = SpriteImportMode.Multiple;
            importer.filterMode = FilterMode.Point;
            importer.mipmapEnabled = false;
            importer.alphaIsTransparency = true;

            var meta = new List<SpriteMetaData>();
            var n = 0;
            for (var y = rows - 1; y >= 0; y--)
            {
                for (var x = 0; x < cols; x++)
                {
                    var px = x * (cellW + pad);
                    var py = y * (cellH + pad);
                    meta.Add(new SpriteMetaData
                    {
                        name = $"{tex.name}_{n:000}",
                        alignment = (int)SpriteAlignment.Center,
                        pivot = new Vector2(0.5f, 0.5f),
                        rect = new Rect(px, py, cellW, cellH)
                    });
                    n++;
                }
            }

#pragma warning disable CS0618
            importer.spritesheet = meta.ToArray();
#pragma warning restore CS0618
            EditorUtility.SetDirty(importer);
            importer.SaveAndReimport();
            AssetDatabase.Refresh();
            Repaint();
        }

        List<Sprite> GetTextureSprites(Texture2D texture)
        {
            if (_atlas == null || texture == null) return new List<Sprite>();
            var path = AssetDatabase.GetAssetPath(texture);
            return AssetDatabase.LoadAllAssetsAtPath(path)
                .OfType<Sprite>()
                .OrderBy(s => s.name)
                .ToList();
        }

        List<Sprite> GetAllSheetSprites()
        {
            if (_atlas == null) return new List<Sprite>();
            var result = new List<Sprite>();
            foreach (var tex in _atlas.sourceTextures)
                result.AddRange(GetTextureSprites(tex));
            return result;
        }

        List<(Texture2D sheet, List<Sprite> sprites, int globalStartIndex)> GetGroupedSheetSprites()
        {
            var result = new List<(Texture2D, List<Sprite>, int)>();
            if (_atlas == null) return result;

            var start = 0;
            foreach (var tex in _atlas.sourceTextures)
            {
                var sprites = GetTextureSprites(tex).OrderBy(s => s.name).ToList();
                result.Add((tex, sprites, start));
                start += sprites.Count;
            }

            return result;
        }

        Texture2D GetSelectedSheet()
        {
            if (_atlas == null || _atlas.sourceTextures.Count == 0) return null;
            _selectedSheetIndex = Mathf.Clamp(_selectedSheetIndex, 0, _atlas.sourceTextures.Count - 1);
            return _atlas.sourceTextures[_selectedSheetIndex];
        }

        void EnsureSheetMigration()
        {
            if (_atlas == null) return;
            if (_atlas.sourceTexture != null && !_atlas.sourceTextures.Contains(_atlas.sourceTexture))
                _atlas.sourceTextures.Add(_atlas.sourceTexture);
        }

        void DrawSheetsPanel()
        {
            if (_atlas == null) return;
            EditorGUILayout.LabelField("Source Sheets", EditorStyles.boldLabel);

            for (var i = 0; i < _atlas.sourceTextures.Count; i++)
            {
                EditorGUILayout.BeginHorizontal();
                var selected = i == _selectedSheetIndex;
                if (GUILayout.Toggle(selected, $"#{i}", "Button", GUILayout.Width(38f)))
                    _selectedSheetIndex = i;
                _atlas.sourceTextures[i] = (Texture2D)EditorGUILayout.ObjectField(_atlas.sourceTextures[i], typeof(Texture2D), false);
                if (GUILayout.Button("-", GUILayout.Width(24f)))
                {
                    _atlas.sourceTextures.RemoveAt(i);
                    _selectedSheetIndex = Mathf.Clamp(_selectedSheetIndex, 0, Mathf.Max(0, _atlas.sourceTextures.Count - 1));
                    i--;
                    SaveAtlasNow();
                }
                EditorGUILayout.EndHorizontal();
            }

            if (GUILayout.Button("Add Sheet"))
            {
                _atlas.sourceTextures.Add(null);
                SaveAtlasNow();
            }

            _atlas.sourceTexture = GetSelectedSheet();
        }

        void SaveAtlasNow()
        {
            if (_atlas == null) return;
            EditorUtility.SetDirty(_atlas);
            AssetDatabase.SaveAssets();
        }

        void DeleteSelectedSprite(Sprite sprite)
        {
            if (sprite == null) return;
            if (!EditorUtility.DisplayDialog("Delete Sprite", $"Удалить спрайт '{sprite.name}' из листа?", "Delete", "Cancel"))
                return;

            var path = AssetDatabase.GetAssetPath(sprite);
            var importer = AssetImporter.GetAtPath(path) as TextureImporter;
            if (importer == null) return;

#pragma warning disable CS0618
            var meta = importer.spritesheet;
#pragma warning restore CS0618
            if (meta == null || meta.Length == 0) return;

            var next = new List<SpriteMetaData>();
            var removed = false;
            foreach (var m in meta)
            {
                if (!removed && m.name == sprite.name)
                {
                    removed = true;
                    continue;
                }
                next.Add(m);
            }

            if (!removed) return;
#pragma warning disable CS0618
            importer.spritesheet = next.ToArray();
#pragma warning restore CS0618
            importer.SaveAndReimport();
            AssetDatabase.Refresh();
            _browserSpriteIndex = -1;
        }

        void DeleteSelectedSheet(int sheetIndex)
        {
            if (_atlas == null || sheetIndex < 0 || sheetIndex >= _atlas.sourceTextures.Count) return;
            var sheet = _atlas.sourceTextures[sheetIndex];
            var sheetName = sheet != null ? sheet.name : $"Sheet_{sheetIndex}";
            if (!EditorUtility.DisplayDialog("Delete Sheet", $"Удалить sheet '{sheetName}' из атласа?", "Delete", "Cancel"))
                return;

            _atlas.sourceTextures.RemoveAt(sheetIndex);
            _atlas.sourceTexture = GetSelectedSheet();
            _browserSpriteIndex = -1;
            SaveAtlasNow();
        }

        void DeleteClipAt(int clipIndex)
        {
            if (_atlas == null || clipIndex < 0 || clipIndex >= _atlas.clips.Count) return;
            var clip = _atlas.clips[clipIndex];
            var clipName = string.IsNullOrWhiteSpace(clip.id) ? $"Clip_{clipIndex}" : clip.id;
            if (!EditorUtility.DisplayDialog("Delete Clip", $"Удалить clip '{clipName}'?", "Delete", "Cancel"))
                return;

            Undo.RecordObject(_atlas, "Delete atlas clip");
            _atlas.clips.RemoveAt(clipIndex);
            if (_selectedClip == clipIndex) _selectedClip = -1;
            else if (_selectedClip > clipIndex) _selectedClip--;
            if (_browserClipIndex == clipIndex) _browserClipIndex = -1;
            else if (_browserClipIndex > clipIndex) _browserClipIndex--;
            _browserClipPreviewFrame = 0;
            _browserClipPlaying = false;
            SaveAtlasNow();
        }

        static void DrawSpritePreview(Rect rect, Sprite sprite)
        {
            if (sprite == null)
            {
                GUI.Label(rect, "No frame", EditorStyles.centeredGreyMiniLabel);
                return;
            }

            var tex = sprite.texture;
            if (tex == null)
            {
                GUI.Label(rect, "No texture", EditorStyles.centeredGreyMiniLabel);
                return;
            }

            var sr = sprite.rect;
            var uv = new Rect(sr.x / tex.width, sr.y / tex.height, sr.width / tex.width, sr.height / tex.height);
            var scale = Mathf.Min(rect.width / sr.width, rect.height / sr.height) * 0.92f;
            var w = sr.width * scale;
            var h = sr.height * scale;
            var drawRect = new Rect(rect.center.x - w * 0.5f, rect.center.y - h * 0.5f, w, h);
            GUI.DrawTextureWithTexCoords(drawRect, tex, uv, true);

            // Явная пунктирная рамка кадра, чтобы видеть точные границы спрайта в превью.
            DrawDashedRectOutline(drawRect, new Color(0.78f, 0.82f, 0.9f, 0.95f), 1f, 5f, 3f);
        }

        static void DrawDashedRectOutline(Rect r, Color color, float thickness, float dashLength, float gapLength)
        {
            DrawDashedHorizontal(r.xMin, r.xMax, r.yMin, thickness, dashLength, gapLength, color);
            DrawDashedHorizontal(r.xMin, r.xMax, r.yMax - thickness, thickness, dashLength, gapLength, color);
            DrawDashedVertical(r.yMin, r.yMax, r.xMin, thickness, dashLength, gapLength, color);
            DrawDashedVertical(r.yMin, r.yMax, r.xMax - thickness, thickness, dashLength, gapLength, color);
        }

        static void DrawDashedHorizontal(float xMin, float xMax, float y, float thickness, float dashLength, float gapLength, Color color)
        {
            for (var x = xMin; x < xMax; x += dashLength + gapLength)
            {
                var w = Mathf.Min(dashLength, xMax - x);
                EditorGUI.DrawRect(new Rect(x, y, w, thickness), color);
            }
        }

        static void DrawDashedVertical(float yMin, float yMax, float x, float thickness, float dashLength, float gapLength, Color color)
        {
            for (var y = yMin; y < yMax; y += dashLength + gapLength)
            {
                var h = Mathf.Min(dashLength, yMax - y);
                EditorGUI.DrawRect(new Rect(x, y, thickness, h), color);
            }
        }

        static void DrawTextureWithSliceGrid(Rect rect, Texture2D texture, int cols, int rows, int pad)
        {
            if (texture == null)
            {
                GUI.Label(rect, "No texture", EditorStyles.centeredGreyMiniLabel);
                return;
            }

            var texRect = FitRect(rect, texture.width, texture.height, 0.95f);
            GUI.DrawTexture(texRect, texture, ScaleMode.StretchToFill, true);

            Handles.BeginGUI();
            Handles.color = new Color(0.98f, 0.85f, 0.22f, 0.95f);

            var cellW = (texture.width - pad * (cols - 1)) / (float)cols;
            var cellH = (texture.height - pad * (rows - 1)) / (float)rows;
            if (cellW <= 0f || cellH <= 0f)
            {
                Handles.EndGUI();
                GUI.Label(rect, "Некорректные параметры нарезки", EditorStyles.centeredGreyMiniLabel);
                return;
            }

            for (var y = 0; y < rows; y++)
            {
                for (var x = 0; x < cols; x++)
                {
                    var px = x * (cellW + pad);
                    var py = y * (cellH + pad);
                    var gr = new Rect(
                        texRect.x + px / texture.width * texRect.width,
                        texRect.y + py / texture.height * texRect.height,
                        cellW / texture.width * texRect.width,
                        cellH / texture.height * texRect.height);
                    Handles.DrawSolidRectangleWithOutline(gr, new Color(0f, 0f, 0f, 0f), Handles.color);
                }
            }
            Handles.EndGUI();
        }

        static Rect FitRect(Rect area, float sourceW, float sourceH, float scale)
        {
            var s = Mathf.Min(area.width / sourceW, area.height / sourceH) * scale;
            var w = sourceW * s;
            var h = sourceH * s;
            return new Rect(area.center.x - w * 0.5f, area.center.y - h * 0.5f, w, h);
        }

        Sprite GetPreviewSprite(SpriteAnimationClipDef clip)
        {
            if (clip == null || clip.frames == null || clip.frames.Count == 0) return null;
            _previewFrame = Mathf.Clamp(_previewFrame, 0, clip.frames.Count - 1);
            return clip.frames[_previewFrame];
        }

        void CreateAtlasAsset()
        {
            var path = EditorUtility.SaveFilePanelInProject("Create Sprite Animation Atlas", "SpriteAnimationAtlas", "asset", "Choose location");
            if (string.IsNullOrWhiteSpace(path)) return;
            var asset = CreateInstance<SpriteAnimationAtlas>();
            AssetDatabase.CreateAsset(asset, path);
            AssetDatabase.SaveAssets();
            _atlas = asset;
            Selection.activeObject = asset;
        }
    }
}
#endif
