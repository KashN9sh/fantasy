#if UNITY_EDITOR
using System;
using System.Collections.Generic;
using System.Linq;
using TikhayaTropa.Animation;
using UnityEditor;
using UnityEngine;

namespace TikhayaTropa.EditorTools.Blobber
{
    public class BlobberClipPickerModalWindow : EditorWindow
    {
        SpriteAnimationAtlas _atlas;
        Action<string> _onPick;
        string _selectedGroup = string.Empty;
        string _selectedClipId = string.Empty;
        Vector2 _leftScroll;
        Vector2 _rightScroll;
        bool _playing;
        int _frame;
        double _lastTick;

        public static void Open(SpriteAnimationAtlas atlas, string currentClipId, Action<string> onPick)
        {
            var w = GetWindow<BlobberClipPickerModalWindow>(true, "Select Animation Clip", true);
            w.minSize = new Vector2(760f, 520f);
            w._atlas = atlas;
            w._onPick = onPick;
            w._selectedClipId = currentClipId ?? string.Empty;
            w.InitSelection();
            w.ShowUtility();
            w.Focus();
        }

        void OnEnable()
        {
            EditorApplication.update += OnEditorUpdate;
        }

        void OnDisable()
        {
            EditorApplication.update -= OnEditorUpdate;
        }

        void InitSelection()
        {
            var groups = GetGroupedClips();
            if (groups.Count == 0) return;

            if (string.IsNullOrWhiteSpace(_selectedClipId) || groups.All(g => g.clips.All(c => c.id != _selectedClipId)))
                _selectedClipId = groups[0].clips[0].id;

            var owner = groups.FirstOrDefault(g => g.clips.Any(c => c.id == _selectedClipId));
            _selectedGroup = string.IsNullOrWhiteSpace(owner.group) ? groups[0].group : owner.group;
        }

        void OnEditorUpdate()
        {
            if (!_playing) return;
            var clip = FindSelectedClip();
            if (clip == null || clip.frames == null || clip.frames.Count == 0) return;
            var now = EditorApplication.timeSinceStartup;
            var dt = 1.0 / Mathf.Max(0.1f, clip.framesPerSecond);
            if (now - _lastTick < dt) return;
            _frame = (_frame + 1) % clip.frames.Count;
            _lastTick = now;
            Repaint();
        }

        void OnGUI()
        {
            try
            {
                if (_atlas == null)
                {
                    EditorGUILayout.HelpBox("SpriteAnimationAtlas не назначен.", MessageType.Warning);
                    if (GUILayout.Button("Close")) Close();
                    return;
                }

                var groups = GetGroupedClips();
                if (groups.Count == 0)
                {
                    EditorGUILayout.HelpBox("В атласе нет клипов.", MessageType.Info);
                    if (GUILayout.Button("Close")) Close();
                    return;
                }

                EditorGUILayout.BeginHorizontal();
                DrawLeft(groups);
                DrawRight();
                EditorGUILayout.EndHorizontal();

                EditorGUILayout.Space(6);
                EditorGUILayout.BeginHorizontal();
                if (GUILayout.Button("Select"))
                {
                    _onPick?.Invoke(_selectedClipId);
                    Close();
                }
                if (GUILayout.Button("Cancel"))
                    Close();
                EditorGUILayout.EndHorizontal();
            }
            catch (Exception ex)
            {
                EditorGUILayout.HelpBox($"Clip picker error:\n{ex}", MessageType.Error);
                if (GUILayout.Button("Close")) Close();
            }
        }

        void DrawLeft(List<(string group, List<SpriteAnimationClipDef> clips)> groups)
        {
            EditorGUILayout.BeginVertical(GUILayout.Width(300f));
            _leftScroll = EditorGUILayout.BeginScrollView(_leftScroll);
            foreach (var g in groups)
            {
                var gname = string.IsNullOrWhiteSpace(g.group) ? "Default" : g.group;
                EditorGUILayout.LabelField(gname, EditorStyles.boldLabel);
                foreach (var clip in g.clips)
                {
                    if (clip == null || string.IsNullOrWhiteSpace(clip.id)) continue;
                    var selected = _selectedClipId == clip.id;
                    if (GUILayout.Toggle(selected, $"{clip.id} ({clip.frames?.Count ?? 0} @ {clip.framesPerSecond:0.##}fps)", "Button"))
                    {
                        if (_selectedClipId != clip.id)
                        {
                            _selectedClipId = clip.id;
                            _selectedGroup = gname;
                            _frame = 0;
                            _playing = false;
                        }
                    }
                }
                EditorGUILayout.Space(4);
            }
            EditorGUILayout.EndScrollView();
            EditorGUILayout.EndVertical();
        }

        void DrawRight()
        {
            EditorGUILayout.BeginVertical();
            var clip = FindSelectedClip();
            if (clip == null)
            {
                EditorGUILayout.HelpBox("Выбери клип слева.", MessageType.Info);
                EditorGUILayout.EndVertical();
                return;
            }

            EditorGUILayout.LabelField($"Group: {(string.IsNullOrWhiteSpace(_selectedGroup) ? "Default" : _selectedGroup)}");
            EditorGUILayout.LabelField($"Clip: {clip.id}", EditorStyles.boldLabel);
            EditorGUILayout.BeginHorizontal();
            if (GUILayout.Button(_playing ? "Pause" : "Play"))
            {
                _playing = !_playing;
                _lastTick = EditorApplication.timeSinceStartup;
            }
            if (GUILayout.Button("Stop"))
            {
                _playing = false;
                _frame = 0;
            }
            EditorGUILayout.EndHorizontal();

            if (clip.frames != null && clip.frames.Count > 0)
                _frame = EditorGUILayout.IntSlider("Frame", Mathf.Clamp(_frame, 0, clip.frames.Count - 1), 0, clip.frames.Count - 1);

            _rightScroll = EditorGUILayout.BeginScrollView(_rightScroll);
            var rect = GUILayoutUtility.GetRect(10f, 360f, GUILayout.ExpandWidth(true), GUILayout.ExpandHeight(true));
            EditorGUI.DrawRect(rect, new Color(0.12f, 0.12f, 0.14f, 1f));
            var sprite = clip.frames == null || clip.frames.Count == 0 ? null : clip.frames[Mathf.Clamp(_frame, 0, clip.frames.Count - 1)];
            DrawSpritePreview(rect, sprite);
            EditorGUILayout.EndScrollView();
            EditorGUILayout.EndVertical();
        }

        SpriteAnimationClipDef FindSelectedClip()
        {
            if (_atlas == null || _atlas.clips == null) return null;
            return _atlas.clips.FirstOrDefault(c => c != null && c.id == _selectedClipId);
        }

        List<(string group, List<SpriteAnimationClipDef> clips)> GetGroupedClips()
        {
            if (_atlas == null || _atlas.clips == null) return new List<(string, List<SpriteAnimationClipDef>)>();
            return _atlas.clips
                .Where(c => c != null && !string.IsNullOrWhiteSpace(c.id))
                .GroupBy(c => string.IsNullOrWhiteSpace(c.group) ? "Default" : c.group)
                .OrderBy(g => g.Key)
                .Select(g => (g.Key, g.OrderBy(c => c.id).ToList()))
                .ToList();
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
        }
    }
}
#endif
