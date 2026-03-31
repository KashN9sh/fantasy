using System;
using UnityEngine;

namespace TikhayaTropa.Blobber
{
    /// <summary>Сетка подземелья: # стена, . пол, S старт, M монстр (непроходимый декор).</summary>
    public sealed class BlobberMapRuntime
    {
        public int Width { get; }
        public int Height { get; }
        readonly char[,] _cells;

        public BlobberMapRuntime(string[] rows)
        {
            if (rows == null || rows.Length == 0)
                throw new ArgumentException("Пустая карта.");

            Height = rows.Length;
            Width = 0;
            foreach (var row in rows)
                Width = Mathf.Max(Width, row != null ? row.Length : 0);
            if (Width == 0)
                throw new ArgumentException("Ширина карты 0.");

            _cells = new char[Width, Height];
            for (var z = 0; z < Height; z++)
            {
                var line = rows[Height - 1 - z] ?? string.Empty;
                for (var x = 0; x < Width; x++)
                    _cells[x, z] = x < line.Length ? line[x] : '#';
            }
        }

        public char GetCell(int x, int z)
        {
            if (x < 0 || z < 0 || x >= Width || z >= Height) return '#';
            return _cells[x, z];
        }

        /// <summary>Проходимы . S и пустота; # и M блокируют.</summary>
        public bool IsWalkable(int x, int z)
        {
            var c = GetCell(x, z);
            return c == '.' || c == 'S' || c == ' ';
        }

        public bool TryGetStart(out int sx, out int sz)
        {
            for (var z = 0; z < Height; z++)
            {
                for (var x = 0; x < Width; x++)
                {
                    if (_cells[x, z] == 'S')
                    {
                        sx = x;
                        sz = z;
                        return true;
                    }
                }
            }

            for (var z = 0; z < Height; z++)
            {
                for (var x = 0; x < Width; x++)
                {
                    if (_cells[x, z] == '.')
                    {
                        sx = x;
                        sz = z;
                        return true;
                    }
                }
            }

            sx = sz = 0;
            return false;
        }
    }
}
