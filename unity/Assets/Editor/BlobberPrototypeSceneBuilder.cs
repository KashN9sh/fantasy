#if UNITY_EDITOR
using TikhayaTropa.Blobber.Data;
using UnityEditor;
using UnityEngine;

namespace TikhayaTropa.EditorTools
{
    /// <summary>
    /// Legacy wrapper: поднимает data-ассеты и выпекает BlobberMeadow/FogGrove через новый визуальный pipeline.
    /// </summary>
    public static class BlobberPrototypeSceneBuilder
    {
        [MenuItem("TikhayaTropa/Сцены/Собрать Blobber главы 1-2")]
        public static void BuildBlobberChapterScenes()
        {
            TikhayaTropa.EditorTools.Blobber.BlobberAssetBootstrap.Bootstrap();
            TikhayaTropa.EditorTools.Blobber.BlobberMapMigrationTools.CreateChapterMaps();

            var meadow = AssetDatabase.LoadAssetAtPath<BlobberMapAsset>("Assets/Blobber/Data/BlobberMeadow.asset");
            var fog = AssetDatabase.LoadAssetAtPath<BlobberMapAsset>("Assets/Blobber/Data/BlobberFogGrove.asset");
            var settings = AssetDatabase.LoadAssetAtPath<BlobberProjectSettings>("Assets/Blobber/Data/BlobberProjectSettings.asset");

            if (meadow == null || fog == null || settings == null)
            {
                Debug.LogError("Blobber build: не удалось найти map/settings assets после bootstrap.");
                return;
            }

            TikhayaTropa.EditorTools.Blobber.BlobberSceneBaker.Bake(meadow, settings);
            TikhayaTropa.EditorTools.Blobber.BlobberSceneBaker.Bake(fog, settings);
            Debug.Log("TikhayaTropa: BlobberMeadow и BlobberFogGrove выпечены через новый визуальный pipeline.");
        }
    }
}
#endif
