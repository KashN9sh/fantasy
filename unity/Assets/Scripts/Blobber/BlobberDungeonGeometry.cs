using UnityEngine;

namespace TikhayaTropa.Blobber
{
    /// <summary>Строит пол и стены из примитивов + маркеры монстров.</summary>
    [DisallowMultipleComponent]
    public class BlobberDungeonGeometry : MonoBehaviour
    {
        [SerializeField] string[] mapLines;
        [SerializeField] float cellSize = 2.8f;
        [SerializeField] float wallHeight = 2.8f;
        [SerializeField] Color floorColor = new(0.22f, 0.2f, 0.24f, 1f);
        [SerializeField] Color wallColor = new(0.35f, 0.32f, 0.38f, 1f);
        [SerializeField] Color monsterColor = new(0.2f, 0.75f, 0.35f, 1f);
        [SerializeField] Color gridLineColor = new(0.08f, 0.08f, 0.1f, 1f);

        public BlobberMapRuntime Map { get; private set; }
        public float CellSize => cellSize;
        Material _wallMat;
        Material _floorMat;

        static readonly string[] DefaultMap =
        {
            "###############",
            "#S...........##",
            "#............##",
            "##..#######..##",
            "##..#.....#..##",
            "##....M....##",
            "##..#.....#..##",
            "##..#######..##",
            "##...........##",
            "###############"
        };

        void Awake()
        {
            var lines = mapLines != null && mapLines.Length > 0 ? mapLines : DefaultMap;
            Map = new BlobberMapRuntime(lines);
            _wallMat = CreateGridMaterial(wallColor, gridLineColor);
            _floorMat = CreateGridMaterial(floorColor, gridLineColor);
            Build(Map);
        }

        void Build(BlobberMapRuntime map)
        {
            var root = new GameObject("DungeonMesh");
            root.transform.SetParent(transform, false);

            for (var z = 0; z < map.Height; z++)
            {
                for (var x = 0; x < map.Width; x++)
                {
                    var c = map.GetCell(x, z);
                    var cx = x * cellSize + cellSize * 0.5f;
                    var cz = z * cellSize + cellSize * 0.5f;

                    if (c == '#')
                    {
                        var wall = GameObject.CreatePrimitive(PrimitiveType.Cube);
                        wall.name = $"Wall_{x}_{z}";
                        wall.transform.SetParent(root.transform, false);
                        wall.transform.position = new Vector3(cx, wallHeight * 0.5f, cz);
                        wall.transform.localScale = new Vector3(cellSize, wallHeight, cellSize);
                        ApplyMaterial(wall, _wallMat);
                    }
                    else
                    {
                        var floor = GameObject.CreatePrimitive(PrimitiveType.Cube);
                        floor.name = $"Floor_{x}_{z}";
                        floor.transform.SetParent(root.transform, false);
                        floor.transform.position = new Vector3(cx, -0.02f, cz);
                        floor.transform.localScale = new Vector3(cellSize * 0.98f, 0.04f, cellSize * 0.98f);
                        ApplyMaterial(floor, _floorMat);
                        Object.Destroy(floor.GetComponent<Collider>());
                    }

                    if (c == 'M')
                    {
                        var mon = GameObject.CreatePrimitive(PrimitiveType.Capsule);
                        mon.name = $"Monster_{x}_{z}";
                        mon.transform.SetParent(root.transform, false);
                        mon.transform.position = new Vector3(cx, 0.9f, cz);
                        mon.transform.localScale = new Vector3(0.45f, 0.9f, 0.45f);
                        ApplyMaterial(mon, CreateGridMaterial(monsterColor, gridLineColor));
                        mon.AddComponent<BlobberBillboard>();
                    }
                }
            }
        }

        static void ApplyMaterial(GameObject go, Material m)
        {
            var r = go.GetComponent<Renderer>();
            if (r == null) return;
            r.sharedMaterial = m;
        }

        static Material CreateGridMaterial(Color fill, Color line)
        {
            var sh = Shader.Find("Universal Render Pipeline/Unlit")
                     ?? Shader.Find("Unlit/Texture")
                     ?? Shader.Find("Universal Render Pipeline/Lit")
                     ?? Shader.Find("Standard");
            var m = new Material(sh);
            var t = CreateGridTexture(fill, line);
            if (m.HasProperty("_BaseMap")) m.SetTexture("_BaseMap", t);
            if (m.HasProperty("_MainTex")) m.mainTexture = t;
            if (m.HasProperty("_BaseColor")) m.SetColor("_BaseColor", Color.white);
            if (m.HasProperty("_Color")) m.color = Color.white;
            return m;
        }

        static Texture2D CreateGridTexture(Color fill, Color line)
        {
            var t = new Texture2D(16, 16, TextureFormat.RGBA32, false)
            {
                filterMode = FilterMode.Point,
                wrapMode = TextureWrapMode.Repeat
            };
            for (var y = 0; y < 16; y++)
            for (var x = 0; x < 16; x++)
            {
                var border = x == 0 || y == 0 || x == 15 || y == 15;
                t.SetPixel(x, y, border ? line : fill);
            }
            t.Apply(false, true);
            return t;
        }

        public Vector3 GridToWorldCenter(int gx, int gz) =>
            new(gx * cellSize + cellSize * 0.5f, 0f, gz * cellSize + cellSize * 0.5f);
    }
}
