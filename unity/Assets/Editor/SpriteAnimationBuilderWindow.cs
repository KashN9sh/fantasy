#if UNITY_EDITOR
using System.Collections.Generic;
using System.Linq;
using TikhayaTropa.Animation;
using UnityEditor;
using UnityEngine;

namespace TikhayaTropa.EditorTools
{
    public class SpriteAnimationBuilderWindow : EditorWindow
    {
        SpriteAnimationAtlas _atlas;
        Vector2 _leftScroll;
        Vector2 _rightScroll;
        int _selectedClip = -1;
        string _newClipId = "clip";
        float _newClipFps = 8f;
        readonly HashSet<int> _frameSelection = new();
        bool _previewPlaying;
        int _previewFrame;
        double _lastPreviewTime;

        [MenuItem("TikhayaTropa/Sprites/Sprite Animation Builder")]
        static void Open() => GetWindow<SpriteAnimationBuilderWindow>("Sprite Animation Builder");

        void OnEnable() => EditorApplication.update += OnEditorUpdate;
        void OnDisable() => EditorApplication.update -= OnEditorUpdate;

        void OnGUI()
        {
            EditorGUILayout.BeginHorizontal();
            DrawLeft();
            DrawRight();
            EditorGUILayout.EndHorizontal();
        }

        void DrawLeft()
        {
            EditorGUILayout.BeginVertical(GUILayout.Width(520f));
            _atlas = (SpriteAnimationAtlas)EditorGUILayout.ObjectField("Atlas Asset", _atlas, typeof(SpriteAnimationAtlas), false);
            if (_atlas == null)
            {
                if (GUILayout.Button("Create Atlas Asset")) CreateAtlas();
                EditorGUILayout.EndVertical();
                return;
            }

            _atlas.spriteFolder = EditorGUILayout.TextField("Sprites Folder", _atlas.spriteFolder);
            if (GUILayout.Button("Pick Sprites Folder")) PickSpritesFolder();

            var sprites = GetFolderSprites();
            EditorGUILayout.LabelField($"Sprites in folder: {sprites.Count}");
            _newClipId = EditorGUILayout.TextField("Clip Id", _newClipId);
            _newClipFps = EditorGUILayout.FloatField("FPS", Mathf.Max(0.1f, _newClipFps));
            DrawFrameGrid(sprites);

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
                AddClipFromSelection(sprites);

            EditorGUILayout.Space(8);
            _leftScroll = EditorGUILayout.BeginScrollView(_leftScroll);
            for (var i = 0; i < _atlas.clips.Count; i++)
            {
                var c = _atlas.clips[i];
                if (GUILayout.Toggle(i == _selectedClip, $"{c.id} ({c.frames.Count} @ {c.framesPerSecond:0.##}fps)", "Button"))
                    _selectedClip = i;
            }
            EditorGUILayout.EndScrollView();
            EditorGUILayout.BeginHorizontal();
            if (GUILayout.Button("Delete Selected") && _selectedClip >= 0 && _selectedClip < _atlas.clips.Count)
            {
                _atlas.clips.RemoveAt(_selectedClip);
                _selectedClip = Mathf.Clamp(_selectedClip - 1, -1, _atlas.clips.Count - 1);
            }
            if (GUILayout.Button("Save Asset")) AssetDatabase.SaveAssets();
            EditorGUILayout.EndHorizontal();

            EditorUtility.SetDirty(_atlas);
            EditorGUILayout.EndVertical();
        }

        void DrawRight()
        {
            EditorGUILayout.BeginVertical();
            _rightScroll = EditorGUILayout.BeginScrollView(_rightScroll);
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

            var rect = GUILayoutUtility.GetRect(10f, 420f, GUILayout.ExpandWidth(true));
            EditorGUI.DrawRect(rect, new Color(0.12f, 0.12f, 0.14f, 1f));
            DrawSpritePreview(rect, clip.frames.Count == 0 ? null : clip.frames[Mathf.Clamp(_previewFrame, 0, clip.frames.Count - 1)]);

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

            if (clip.frames.Count > 0)
                _previewFrame = EditorGUILayout.IntSlider("Frame", Mathf.Clamp(_previewFrame, 0, clip.frames.Count - 1), 0, clip.frames.Count - 1);

            EditorGUILayout.EndScrollView();
            EditorGUILayout.EndVertical();
        }

        void OnEditorUpdate()
        {
            if (!_previewPlaying || _atlas == null || _selectedClip < 0 || _selectedClip >= _atlas.clips.Count) return;
            var clip = _atlas.clips[_selectedClip];
            if (clip.frames.Count == 0) return;
            var now = EditorApplication.timeSinceStartup;
            var dt = 1.0 / Mathf.Max(0.1f, clip.framesPerSecond);
            if (now - _lastPreviewTime < dt) return;
            _previewFrame = (_previewFrame + 1) % clip.frames.Count;
            _lastPreviewTime = now;
            Repaint();
        }

        void AddClipFromSelection(List<Sprite> sprites)
        {
            if (_atlas == null || _frameSelection.Count == 0) return;
            var clip = new SpriteAnimationClipDef
            {
                id = string.IsNullOrWhiteSpace(_newClipId) ? $"clip_{_atlas.clips.Count + 1}" : _newClipId.Trim(),
                framesPerSecond = Mathf.Max(0.1f, _newClipFps),
                frames = _frameSelection.OrderBy(v => v).Where(v => v >= 0 && v < sprites.Count).Select(v => sprites[v]).ToList()
            };
            _atlas.clips.Add(clip);
            _selectedClip = _atlas.clips.Count - 1;
        }

        void DrawFrameGrid(List<Sprite> sprites)
        {
            EditorGUILayout.LabelField("Frames", EditorStyles.boldLabel);
            const float size = 56f;
            var columns = Mathf.Max(1, Mathf.FloorToInt((500f) / (size + 8f)));
            var rows = Mathf.CeilToInt(sprites.Count / (float)columns);
            for (var r = 0; r < rows; r++)
            {
                EditorGUILayout.BeginHorizontal();
                for (var c = 0; c < columns; c++)
                {
                    var idx = r * columns + c;
                    if (idx >= sprites.Count)
                    {
                        GUILayout.Space(size + 6f);
                        continue;
                    }
                    var selected = _frameSelection.Contains(idx);
                    var rect = GUILayoutUtility.GetRect(size, size + 16f, GUILayout.Width(size + 6f));
                    var thumb = new Rect(rect.x, rect.y, size, size);
                    EditorGUI.DrawRect(thumb, selected ? new Color(0.88f, 0.72f, 0.2f, 1f) : new Color(0.22f, 0.22f, 0.25f, 1f));
                    DrawSpritePreview(thumb, sprites[idx]);
                    GUI.Label(new Rect(rect.x, rect.y + size + 1, size, 14), idx.ToString(), EditorStyles.centeredGreyMiniLabel);
                    if (Event.current.type == EventType.MouseDown && rect.Contains(Event.current.mousePosition))
                    {
                        if (selected) _frameSelection.Remove(idx);
                        else _frameSelection.Add(idx);
                        Event.current.Use();
                    }
                }
                EditorGUILayout.EndHorizontal();
            }
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

        void PickSpritesFolder()
        {
            var abs = EditorUtility.OpenFolderPanel("Pick sprites folder", Application.dataPath, string.Empty);
            if (string.IsNullOrWhiteSpace(abs) || !abs.StartsWith(Application.dataPath)) return;
            _atlas.spriteFolder = "Assets" + abs.Substring(Application.dataPath.Length);
        }

        static void DrawSpritePreview(Rect rect, Sprite sprite)
        {
            if (sprite == null || sprite.texture == null)
            {
                GUI.Label(rect, "No frame", EditorStyles.centeredGreyMiniLabel);
                return;
            }
            var tex = sprite.texture;
            var sr = sprite.rect;
            var uv = new Rect(sr.x / tex.width, sr.y / tex.height, sr.width / tex.width, sr.height / tex.height);
            var scale = Mathf.Min(rect.width / sr.width, rect.height / sr.height) * 0.92f;
            var w = sr.width * scale;
            var h = sr.height * scale;
            var drawRect = new Rect(rect.center.x - w * 0.5f, rect.center.y - h * 0.5f, w, h);
            GUI.DrawTextureWithTexCoords(drawRect, tex, uv, true);
        }

        void CreateAtlas()
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
