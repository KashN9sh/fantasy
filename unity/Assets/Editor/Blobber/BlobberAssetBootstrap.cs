#if UNITY_EDITOR
using System.IO;
using TikhayaTropa.Blobber.Data;
using UnityEditor;
using UnityEngine;

namespace TikhayaTropa.EditorTools.Blobber
{
    public static class BlobberAssetBootstrap
    {
        const string Root = "Assets/Blobber";

        [MenuItem("TikhayaTropa/Blobber/Bootstrap Assets")]
        public static void Bootstrap()
        {
            Directory.CreateDirectory(Root);
            Directory.CreateDirectory($"{Root}/Data");

            var catalogPath = $"{Root}/Data/BlobberObjectCatalog.asset";
            var dialogPath = $"{Root}/Data/BlobberDialogueDatabase.asset";
            var logicPath = $"{Root}/Data/BlobberLogicGraphDatabase.asset";
            var settingsPath = $"{Root}/Data/BlobberProjectSettings.asset";

            var catalog = AssetDatabase.LoadAssetAtPath<BlobberObjectCatalog>(catalogPath);
            if (catalog == null)
            {
                catalog = ScriptableObject.CreateInstance<BlobberObjectCatalog>();
                catalog.entries.Add(new BlobberObjectCatalogEntry { id = "inspect", displayName = "Inspect", interactionType = BlobberInteractionType.Inspect, previewPrimitive = PrimitiveType.Cube });
                catalog.entries.Add(new BlobberObjectCatalogEntry { id = "npc", displayName = "NPC Dialogue", interactionType = BlobberInteractionType.NpcDialogue, previewPrimitive = PrimitiveType.Capsule });
                catalog.entries.Add(new BlobberObjectCatalogEntry { id = "door", displayName = "Door Transition", interactionType = BlobberInteractionType.SceneTransition, previewPrimitive = PrimitiveType.Cylinder });
                catalog.entries.Add(new BlobberObjectCatalogEntry { id = "custom", displayName = "Custom Action", interactionType = BlobberInteractionType.CustomAction, previewPrimitive = PrimitiveType.Cube });
                catalog.entries.Add(new BlobberObjectCatalogEntry { id = "cat", displayName = "Cat Scare", interactionType = BlobberInteractionType.CatScare, previewPrimitive = PrimitiveType.Capsule });
                AssetDatabase.CreateAsset(catalog, catalogPath);
            }

            var db = AssetDatabase.LoadAssetAtPath<BlobberDialogueDatabase>(dialogPath);
            if (db == null)
            {
                db = ScriptableObject.CreateInstance<BlobberDialogueDatabase>();
                AssetDatabase.CreateAsset(db, dialogPath);
            }

            var logicDb = AssetDatabase.LoadAssetAtPath<BlobberLogicGraphDatabase>(logicPath);
            var logicAssetType = AssetDatabase.GetMainAssetTypeAtPath(logicPath);
            var invalidLogicAssetAtPath = logicAssetType != null && logicAssetType != typeof(BlobberLogicGraphDatabase);
            if (logicDb == null || invalidLogicAssetAtPath)
            {
                if (File.Exists(logicPath))
                    AssetDatabase.DeleteAsset(logicPath);
                logicDb = ScriptableObject.CreateInstance<BlobberLogicGraphDatabase>();
                AssetDatabase.CreateAsset(logicDb, logicPath);
            }

            var settings = AssetDatabase.LoadAssetAtPath<BlobberProjectSettings>(settingsPath);
            if (settings == null)
            {
                settings = ScriptableObject.CreateInstance<BlobberProjectSettings>();
                settings.objectCatalog = catalog;
                settings.dialogueDatabase = db;
                settings.logicGraphDatabase = logicDb;
                AssetDatabase.CreateAsset(settings, settingsPath);
            }
            else
            {
                settings.objectCatalog = settings.objectCatalog == null ? catalog : settings.objectCatalog;
                settings.dialogueDatabase = settings.dialogueDatabase == null ? db : settings.dialogueDatabase;
                settings.logicGraphDatabase = settings.logicGraphDatabase == null ? logicDb : settings.logicGraphDatabase;
                EditorUtility.SetDirty(settings);
            }

            AssetDatabase.SaveAssets();
            Selection.activeObject = settings;
            Debug.Log("Blobber bootstrap complete: catalog/dialogue/settings created.");
        }
    }
}
#endif
