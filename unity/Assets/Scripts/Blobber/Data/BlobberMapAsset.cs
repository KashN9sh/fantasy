using System;
using System.Collections.Generic;
using UnityEngine;

namespace TikhayaTropa.Blobber.Data
{
    public enum BlobberTileKind
    {
        Void,
        Floor,
        Wall,
        Marker
    }

    public enum BlobberInteractionType
    {
        Inspect,
        NpcDialogue,
        SceneTransition,
        CatScare,
        CustomAction,
        None
    }

    [Serializable]
    public class BlobberObjectParams
    {
        public string prompt = "Осмотреть";
        [TextArea(2, 8)] public string message = string.Empty;
        public string setFlag = string.Empty;
        public string requireFlag = string.Empty;
        public string diaryId = string.Empty;
        [TextArea(2, 8)] public string diaryText = string.Empty;
        public string dialogueId = string.Empty;
        public string targetScene = string.Empty;
        public string targetSpawn = string.Empty;
        public string customActionId = string.Empty;
        [TextArea(1, 8)] public string customPayload = string.Empty;
        public string logicGraphId = string.Empty;
        public int setChapterAct;
    }

    [Serializable]
    public class BlobberObjectInstance
    {
        public string id = Guid.NewGuid().ToString("N");
        public string catalogId = string.Empty;
        public BlobberInteractionType interactionType = BlobberInteractionType.None;
        public Vector2Int cell = new(1, 1);
        public float yOffset = 0.6f;
        public float yaw;
        public BlobberObjectParams parameters = new();
    }

    [CreateAssetMenu(menuName = "TikhayaTropa/Blobber/Map Asset", fileName = "BlobberMapAsset")]
    public class BlobberMapAsset : ScriptableObject
    {
        public int width = 18;
        public int height = 11;
        public float cellSize = 2.8f;
        public float wallHeight = 2.8f;
        public Color floorColor = new(0.22f, 0.2f, 0.24f, 1f);
        public Color wallColor = new(0.35f, 0.32f, 0.38f, 1f);
        public Color gridLineColor = new(0.08f, 0.08f, 0.1f, 1f);
        public Color markerColor = new(0.65f, 0.62f, 0.5f, 1f);
        public Vector2Int startCell = new(1, 1);
        public float startYaw;
        [SerializeField] List<BlobberTileKind> tiles = new();
        public List<BlobberObjectInstance> objects = new();

        public int Index(int x, int y) => y * width + x;

        public BlobberTileKind GetTile(int x, int y)
        {
            if (x < 0 || y < 0 || x >= width || y >= height) return BlobberTileKind.Void;
            EnsureTilesSize();
            return tiles[Index(x, y)];
        }

        public void SetTile(int x, int y, BlobberTileKind kind)
        {
            if (x < 0 || y < 0 || x >= width || y >= height) return;
            EnsureTilesSize();
            tiles[Index(x, y)] = kind;
        }

        public void Resize(int newWidth, int newHeight)
        {
            newWidth = Mathf.Max(4, newWidth);
            newHeight = Mathf.Max(4, newHeight);
            EnsureTilesSize();
            var old = new List<BlobberTileKind>(tiles);
            var oldW = width;
            var oldH = height;
            width = newWidth;
            height = newHeight;
            tiles = new List<BlobberTileKind>(width * height);
            for (var i = 0; i < width * height; i++) tiles.Add(BlobberTileKind.Void);
            for (var y = 0; y < Mathf.Min(oldH, newHeight); y++)
            for (var x = 0; x < Mathf.Min(oldW, newWidth); x++)
                tiles[Index(x, y)] = old[y * oldW + x];
        }

        public void EnsureTilesSize()
        {
            var need = width * height;
            if (tiles.Count == need) return;
            if (tiles.Count < need)
            {
                while (tiles.Count < need) tiles.Add(BlobberTileKind.Void);
            }
            else
            {
                tiles.RemoveRange(need, tiles.Count - need);
            }
        }

        public string[] ToMapLines()
        {
            EnsureTilesSize();
            var rows = new string[height];
            for (var y = 0; y < height; y++)
            {
                var chars = new char[width];
                for (var x = 0; x < width; x++)
                {
                    if (startCell.x == x && startCell.y == y)
                    {
                        chars[x] = 'S';
                        continue;
                    }
                    chars[x] = GetTile(x, y) switch
                    {
                        BlobberTileKind.Wall => '#',
                        BlobberTileKind.Floor => '.',
                        BlobberTileKind.Marker => 'M',
                        _ => '#'
                    };
                }
                rows[height - 1 - y] = new string(chars);
            }
            return rows;
        }

        public Vector3 CellCenter(int x, int y, float yWorld = 0f)
        {
            return new Vector3(x * cellSize + cellSize * 0.5f, yWorld, y * cellSize + cellSize * 0.5f);
        }
    }
}
