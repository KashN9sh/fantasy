#if UNITY_EDITOR
using System.Linq;
using TikhayaTropa.Animation;
using TikhayaTropa.Blobber.Data;
using UnityEditor;
using UnityEngine;

namespace TikhayaTropa.EditorTools.Blobber
{
    public class BlobberCatalogEntryModalWindow : EditorWindow
    {
        BlobberObjectCatalog _catalog;
        string _entryId;
        SerializedObject _serializedCatalog;
        SpriteAnimationAtlas _atlas;
        Vector2 _scroll;
        int _atlasIndex = -1;

        public static void Open(BlobberObjectCatalog catalog, string entryId)
        {
            var w = GetWindow<BlobberCatalogEntryModalWindow>(true, "Edit Library Item", true);
            w.minSize = new Vector2(440f, 540f);
            w._catalog = catalog;
            w._entryId = entryId;
            w._serializedCatalog = new SerializedObject(catalog);
            w.ShowUtility();
            w.Focus();
        }

        void OnGUI()
        {
            if (_catalog == null)
            {
                EditorGUILayout.HelpBox("Каталог не найден.", MessageType.Error);
                if (GUILayout.Button("Close")) Close();
                return;
            }

            _serializedCatalog.Update();
            var entries = _serializedCatalog.FindProperty("entries");
            var idx = FindEntryIndex(entries, _entryId);
            if (idx < 0)
            {
                EditorGUILayout.HelpBox("Элемент библиотеки не найден.", MessageType.Warning);
                if (GUILayout.Button("Close")) Close();
                return;
            }

            var entry = entries.GetArrayElementAtIndex(idx);

            EditorGUILayout.LabelField("Library Item", EditorStyles.boldLabel);
            EditorGUILayout.LabelField("Catalog", _catalog.name);
            EditorGUILayout.LabelField("Id", _entryId);
            EditorGUILayout.Space(6);

            _scroll = EditorGUILayout.BeginScrollView(_scroll);
            DrawEntryInspector(entry);
            EditorGUILayout.EndScrollView();

            _serializedCatalog.ApplyModifiedProperties();
            EditorUtility.SetDirty(_catalog);

            EditorGUILayout.Space(8);
            EditorGUILayout.BeginHorizontal();
            if (GUILayout.Button("Save"))
            {
                AssetDatabase.SaveAssets();
                Close();
            }
            if (GUILayout.Button("Cancel"))
                Close();
            EditorGUILayout.EndHorizontal();
        }

        static int FindEntryIndex(SerializedProperty entries, string entryId)
        {
            for (var i = 0; i < entries.arraySize; i++)
            {
                var e = entries.GetArrayElementAtIndex(i);
                var id = e.FindPropertyRelative("id")?.stringValue;
                if (id == entryId) return i;
            }
            return -1;
        }

        void DrawEntryInspector(SerializedProperty entry)
        {
            var id = entry.FindPropertyRelative("id");
            var displayName = entry.FindPropertyRelative("displayName");
            var visualKind = entry.FindPropertyRelative("visualKind");
            var previewPrimitive = entry.FindPropertyRelative("previewPrimitive");
            var previewColor = entry.FindPropertyRelative("previewColor");
            var spriteAsset = entry.FindPropertyRelative("spriteAsset");
            var animationClipId = entry.FindPropertyRelative("animationClipId");
            var useBillboard = entry.FindPropertyRelative("useBillboard");
            var spriteScaleMode = entry.FindPropertyRelative("spriteScaleMode");
            var defaultScale = entry.FindPropertyRelative("defaultScale");
            var interactionType = entry.FindPropertyRelative("interactionType");
            var defaultParams = entry.FindPropertyRelative("defaultParams");

            EditorGUILayout.PropertyField(id);
            EditorGUILayout.PropertyField(displayName);
            EditorGUILayout.Space(4);

            DrawAtlasSelector();
            EditorGUILayout.PropertyField(visualKind, new GUIContent("Visual"));
            var kind = (BlobberVisualKind)visualKind.enumValueIndex;
            if (kind == BlobberVisualKind.Primitive)
            {
                EditorGUILayout.PropertyField(previewPrimitive);
                EditorGUILayout.PropertyField(previewColor);
            }
            else if (kind == BlobberVisualKind.Sprite)
            {
                DrawSpritePicker(spriteAsset);
                EditorGUILayout.PropertyField(useBillboard, new GUIContent("Billboard"));
                EditorGUILayout.PropertyField(spriteScaleMode, new GUIContent("Scale Mode"));
            }
            else
            {
                DrawClipPicker(animationClipId);
                EditorGUILayout.PropertyField(useBillboard, new GUIContent("Billboard"));
                EditorGUILayout.PropertyField(spriteScaleMode, new GUIContent("Scale Mode"));
            }

            DrawScaleFields(kind, spriteScaleMode, spriteAsset, animationClipId, defaultScale);
            EditorGUILayout.Space(6);
            EditorGUILayout.PropertyField(interactionType);
            EditorGUILayout.PropertyField(defaultParams, true);
        }

        void DrawScaleFields(BlobberVisualKind kind, SerializedProperty spriteScaleMode, SerializedProperty spriteAsset, SerializedProperty animationClipId, SerializedProperty defaultScale)
        {
            var x = defaultScale.FindPropertyRelative("x");
            var y = defaultScale.FindPropertyRelative("y");
            var z = defaultScale.FindPropertyRelative("z");
            var isSpriteLike = kind == BlobberVisualKind.Sprite || kind == BlobberVisualKind.Animation;

            EditorGUI.BeginChangeCheck();
            float nx, ny, nz;
            var rowRect = EditorGUILayout.GetControlRect();
            rowRect = EditorGUI.IndentedRect(rowRect);
            var fieldRect = EditorGUI.PrefixLabel(rowRect, new GUIContent("Default Scale"));
            var oldLabelWidth = EditorGUIUtility.labelWidth;
            EditorGUIUtility.labelWidth = 12f;
            if (isSpriteLike)
            {
                var gap = 6f;
                var w = (fieldRect.width - gap) * 0.5f;
                var xr = new Rect(fieldRect.x, fieldRect.y, w, fieldRect.height);
                var yr = new Rect(fieldRect.x + w + gap, fieldRect.y, w, fieldRect.height);
                nx = EditorGUI.FloatField(xr, "X", x.floatValue);
                ny = EditorGUI.FloatField(yr, "Y", y.floatValue);
                nz = z.floatValue;
            }
            else
            {
                var gap = 6f;
                var w = (fieldRect.width - gap * 2f) / 3f;
                var xr = new Rect(fieldRect.x, fieldRect.y, w, fieldRect.height);
                var yr = new Rect(fieldRect.x + w + gap, fieldRect.y, w, fieldRect.height);
                var zr = new Rect(fieldRect.x + (w + gap) * 2f, fieldRect.y, w, fieldRect.height);
                nx = EditorGUI.FloatField(xr, "X", x.floatValue);
                ny = EditorGUI.FloatField(yr, "Y", y.floatValue);
                nz = EditorGUI.FloatField(zr, "Z", z.floatValue);
            }
            EditorGUIUtility.labelWidth = oldLabelWidth;
            var changed = EditorGUI.EndChangeCheck();

            if (!changed) return;

            var oldX = x.floatValue;
            var oldY = y.floatValue;
            x.floatValue = nx;
            y.floatValue = ny;
            z.floatValue = nz;

            var linked = isSpriteLike &&
                         (BlobberSpriteScaleMode)spriteScaleMode.enumValueIndex == BlobberSpriteScaleMode.LinkedXY;
            if (!linked) return;

            var aspect = ResolveVisualAspect(kind, spriteAsset, animationClipId);
            if (aspect <= 0.0001f) return;

            var xChanged = Mathf.Abs(nx - oldX) > 0.0001f;
            var yChanged = Mathf.Abs(ny - oldY) > 0.0001f;

            // Двусторонняя "цепочка": изменили X -> считаем Y, изменили Y -> считаем X.
            if (xChanged && !yChanged)
            {
                y.floatValue = x.floatValue / aspect;
            }
            else
            {
                x.floatValue = y.floatValue * aspect;
            }
        }

        float ResolveVisualAspect(BlobberVisualKind kind, SerializedProperty spriteAsset, SerializedProperty animationClipId)
        {
            if (kind == BlobberVisualKind.Sprite)
            {
                var s = spriteAsset.objectReferenceValue as Sprite;
                if (s == null) return 1f;
                var size = s.bounds.size;
                return size.y > 0.0001f ? size.x / size.y : 1f;
            }

            if (kind == BlobberVisualKind.Animation && _atlas != null && _atlas.clips != null)
            {
                var id = animationClipId.stringValue;
                var clip = _atlas.clips.FirstOrDefault(c => c != null && c.id == id);
                if (clip == null || clip.frames == null || clip.frames.Count == 0) return 1f;
                var maxW = 0f;
                var maxH = 0f;
                foreach (var f in clip.frames)
                {
                    if (f == null) continue;
                    var size = f.bounds.size;
                    maxW = Mathf.Max(maxW, size.x);
                    maxH = Mathf.Max(maxH, size.y);
                }
                return maxH > 0.0001f ? maxW / maxH : 1f;
            }

            return 1f;
        }

        void DrawSpritePicker(SerializedProperty spriteAsset)
        {
            if (_atlas == null)
            {
                EditorGUILayout.PropertyField(spriteAsset, new GUIContent("Sprite"));
                EditorGUILayout.HelpBox("Назначь Sprite Atlas в Project Settings или выбери его здесь.", MessageType.Info);
                return;
            }

            var sprites = _atlas.sourceTextures
                .Where(t => t != null)
                .SelectMany(GetTextureSprites)
                .ToList();

            if (sprites.Count == 0)
            {
                EditorGUILayout.PropertyField(spriteAsset, new GUIContent("Sprite"));
                EditorGUILayout.HelpBox("В атласе нет спрайтов. Нарежь лист во вкладке Sprite Manager.", MessageType.Info);
                return;
            }

            var current = spriteAsset.objectReferenceValue as Sprite;
            var currentIndex = sprites.FindIndex(s => s == current);
            if (currentIndex < 0) currentIndex = 0;
            var options = sprites.Select(s => $"{s.texture.name}/{s.name}").ToArray();
            EditorGUILayout.BeginHorizontal();
            var next = EditorGUILayout.Popup("Sprite", currentIndex, options);
            spriteAsset.objectReferenceValue = sprites[next];
            if (GUILayout.Button("Select...", GUILayout.Width(86f)))
            {
                var currentSprite = spriteAsset.objectReferenceValue as Sprite;
                BlobberSpritePickerModalWindow.Open(_atlas, currentSprite, picked =>
                {
                    if (picked != null)
                    {
                        spriteAsset.objectReferenceValue = picked;
                        _serializedCatalog.ApplyModifiedProperties();
                        EditorUtility.SetDirty(_catalog);
                        Repaint();
                    }
                });
                GUIUtility.ExitGUI();
            }
            EditorGUILayout.EndHorizontal();
        }

        void DrawClipPicker(SerializedProperty animationClipId)
        {
            if (_atlas == null || _atlas.clips == null || _atlas.clips.Count == 0)
            {
                EditorGUILayout.PropertyField(animationClipId, new GUIContent("Animation Clip Id"));
                EditorGUILayout.HelpBox("В атласе нет клипов. Создай их в Sprite Manager.", MessageType.Info);
                return;
            }

            var clipIds = _atlas.clips
                .Where(c => c != null && !string.IsNullOrWhiteSpace(c.id))
                .Select(c => c.id)
                .Distinct()
                .OrderBy(v => v)
                .ToList();
            if (clipIds.Count == 0)
            {
                EditorGUILayout.PropertyField(animationClipId, new GUIContent("Animation Clip Id"));
                return;
            }

            var current = animationClipId.stringValue ?? string.Empty;
            var currentIndex = Mathf.Max(0, clipIds.IndexOf(current));
            EditorGUILayout.BeginHorizontal();
            var next = EditorGUILayout.Popup("Animation Clip", currentIndex, clipIds.ToArray());
            animationClipId.stringValue = clipIds[next];
            if (GUILayout.Button("Select...", GUILayout.Width(86f)))
            {
                var currentId = animationClipId.stringValue;
                BlobberClipPickerModalWindow.Open(_atlas, currentId, pickedId =>
                {
                    if (!string.IsNullOrWhiteSpace(pickedId))
                    {
                        animationClipId.stringValue = pickedId;
                        _serializedCatalog.ApplyModifiedProperties();
                        EditorUtility.SetDirty(_catalog);
                        Repaint();
                    }
                });
                GUIUtility.ExitGUI();
            }
            EditorGUILayout.EndHorizontal();
        }

        static BlobberProjectSettings FindSettings()
        {
            var guids = AssetDatabase.FindAssets("t:BlobberProjectSettings");
            if (guids == null || guids.Length == 0) return null;
            return AssetDatabase.LoadAssetAtPath<BlobberProjectSettings>(AssetDatabase.GUIDToAssetPath(guids[0]));
        }

        static SpriteAnimationAtlas FindAtlasFromSettings()
        {
            var settings = FindSettings();
            return settings != null ? settings.spriteAnimationAtlas : null;
        }

        void DrawAtlasSelector()
        {
            var atlases = FindAllAtlases();
            if ((_atlas == null && atlases.Count > 0) || (_atlas != null && !atlases.Contains(_atlas)))
                _atlas = _atlas ?? FindAtlasFromSettings() ?? atlases[0];

            if (atlases.Count == 0)
            {
                EditorGUILayout.HelpBox("В проекте нет SpriteAnimationAtlas. Создай его через Bootstrap Assets или Sprite Manager.", MessageType.Info);
                return;
            }

            if (_atlas == null) _atlas = atlases[0];
            _atlasIndex = Mathf.Max(0, atlases.IndexOf(_atlas));
            var options = atlases.Select(a => a != null ? a.name : "(null)").ToArray();
            var next = EditorGUILayout.Popup("Sprite Atlas", _atlasIndex, options);
            _atlas = atlases[Mathf.Clamp(next, 0, atlases.Count - 1)];
        }

        static System.Collections.Generic.List<SpriteAnimationAtlas> FindAllAtlases()
        {
            var guids = AssetDatabase.FindAssets("t:SpriteAnimationAtlas");
            return guids
                .Select(AssetDatabase.GUIDToAssetPath)
                .Select(AssetDatabase.LoadAssetAtPath<SpriteAnimationAtlas>)
                .Where(a => a != null)
                .OrderBy(a => a.name)
                .ToList();
        }

        static System.Collections.Generic.List<Sprite> GetTextureSprites(Texture2D texture)
        {
            if (texture == null) return new System.Collections.Generic.List<Sprite>();
            var path = AssetDatabase.GetAssetPath(texture);
            return AssetDatabase.LoadAllAssetsAtPath(path)
                .OfType<Sprite>()
                .OrderBy(s => s.name)
                .ToList();
        }
    }
}
#endif
