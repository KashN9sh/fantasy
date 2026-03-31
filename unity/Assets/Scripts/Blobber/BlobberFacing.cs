using UnityEngine;

namespace TikhayaTropa.Blobber
{
    /// <summary>0 Север (+Z), 1 Восток (+X), 2 Юг (-Z), 3 Запад (-X).</summary>
    public static class BlobberFacing
    {
        public static readonly Vector2Int[] Forward =
        {
            new(0, 1),
            new(1, 0),
            new(0, -1),
            new(-1, 0)
        };

        public static readonly Vector2Int[] StrafeLeft =
        {
            new(-1, 0),
            new(0, -1),
            new(1, 0),
            new(0, 1)
        };

        public static float YawDegrees(int facing) => facing * 90f;

        public static int TurnLeft(int f) => (f + 3) & 3;

        public static int TurnRight(int f) => (f + 1) & 3;
    }
}
