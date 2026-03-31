#if UNITY_EDITOR
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
        Vector2 _scroll;

        public static void Open(BlobberObjectCatalog catalog, string entryId)
        {
            var w = CreateInstance<BlobberCatalogEntryModalWindow>();
            w.titleContent = new GUIContent("Edit Library Item");
            w.minSize = new Vector2(440f, 540f);
            w._catalog = catalog;
            w._entryId = entryId;
            w._serializedCatalog = new SerializedObject(catalog);
            w.ShowModalUtility();
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
            EditorGUILayout.PropertyField(entry, true);
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
    }
}
#endif
