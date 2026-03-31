#if UNITY_EDITOR
using System;
using System.Collections.Generic;
using System.Linq;
using TikhayaTropa.Animation;
using UnityEditor;
using UnityEngine;

namespace TikhayaTropa.EditorTools.Blobber
{
    public class BlobberSpritePickerModalWindow : EditorWindow
    {
        SpriteAnimationAtlas _atlas;
        Action<Sprite> _onPick;
        string _selectedGroup = string.Empty;
        Sprite _selectedSprite;
        Vector2 _leftScroll;
        Vector2 _rightScroll;

        public static void Open(SpriteAnimationAtlas atlas, Sprite currentSprite, Action<Sprite> onPick)
        {
            var w = GetWindow<BlobberSpritePickerModalWindow>(true, "Select Sprite", true);
            w.minSize = new Vector2(760f, 520f);
            w._atlas = atlas;
            w._onPick = onPick;
            w._selectedSprite = currentSprite;
            w.InitSelection();
            w.ShowUtility();
            w.Focus();
        }

        void InitSelection()
        {
            var groups = GetGroupedSprites();
            if (groups.Count == 0) return;
            if (_selectedSprite == null || groups.All(g => g.sprites.All(s => s != _selectedSprite)))
                _selectedSprite = groups[0].sprites[0];
            var owner = groups.FirstOrDefault(g => g.sprites.Any(s => s == _selectedSprite));
            _selectedGroup = string.IsNullOrWhiteSpace(owner.group) ? groups[0].group : owner.group;
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

                var groups = GetGroupedSprites();
                if (groups.Count == 0)
                {
                    EditorGUILayout.HelpBox("В атласе нет спрайтов.", MessageType.Info);
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
                    _onPick?.Invoke(_selectedSprite);
                    Close();
                }
                if (GUILayout.Button("Cancel"))
                    Close();
                EditorGUILayout.EndHorizontal();
            }
            catch (Exception ex)
            {
                EditorGUILayout.HelpBox($"Sprite picker error:\n{ex}", MessageType.Error);
                if (GUILayout.Button("Close")) Close();
            }
        }

        void DrawLeft(List<(string group, List<Sprite> sprites)> groups)
        {
            EditorGUILayout.BeginVertical(GUILayout.Width(300f));
            _leftScroll = EditorGUILayout.BeginScrollView(_leftScroll);
            foreach (var g in groups)
            {
                var gname = string.IsNullOrWhiteSpace(g.group) ? "Default" : g.group;
                EditorGUILayout.LabelField(gname, EditorStyles.boldLabel);
                foreach (var sprite in g.sprites)
                {
                    if (sprite == null) continue;
                    var selected = _selectedSprite == sprite;
                    if (GUILayout.Toggle(selected, sprite.name, "Button"))
                    {
                        _selectedSprite = sprite;
                        _selectedGroup = gname;
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
            EditorGUILayout.LabelField($"Group: {(string.IsNullOrWhiteSpace(_selectedGroup) ? "Default" : _selectedGroup)}");
            EditorGUILayout.LabelField($"Sprite: {(_selectedSprite != null ? _selectedSprite.name : "(none)")}", EditorStyles.boldLabel);
            _rightScroll = EditorGUILayout.BeginScrollView(_rightScroll);
            var rect = GUILayoutUtility.GetRect(10f, 360f, GUILayout.ExpandWidth(true), GUILayout.ExpandHeight(true));
            EditorGUI.DrawRect(rect, new Color(0.12f, 0.12f, 0.14f, 1f));
            DrawSpritePreview(rect, _selectedSprite);
            EditorGUILayout.EndScrollView();
            EditorGUILayout.EndVertical();
        }

        List<(string group, List<Sprite> sprites)> GetGroupedSprites()
        {
            if (_atlas == null || _atlas.sourceTextures == null) return new List<(string, List<Sprite>)>();
            var grouped = new List<(string, List<Sprite>)>();
            foreach (var tex in _atlas.sourceTextures.Where(t => t != null))
            {
                var sprites = GetTextureSprites(tex);
                if (sprites.Count == 0) continue;
                grouped.Add((tex.name, sprites));
            }
            return grouped.OrderBy(g => g.Item1).ToList();
        }

        static List<Sprite> GetTextureSprites(Texture2D texture)
        {
            if (texture == null) return new List<Sprite>();
            var path = AssetDatabase.GetAssetPath(texture);
            return AssetDatabase.LoadAllAssetsAtPath(path)
                .OfType<Sprite>()
                .OrderBy(s => s.name)
                .ToList();
        }

        static void DrawSpritePreview(Rect rect, Sprite sprite)
        {
            if (sprite == null)
            {
                GUI.Label(rect, "No sprite", EditorStyles.centeredGreyMiniLabel);
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
