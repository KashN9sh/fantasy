#if UNITY_EDITOR
using System.Collections.Generic;
using System.IO;
using UnityEditor;
using UnityEngine;

namespace TikhayaTropa.EditorTools
{
    public class SpriteSheetSlicerWindow : EditorWindow
    {
        Texture2D _sourceTexture;
        string _outputFolder = "Assets/Sprites";
        int _columns = 4;
        int _rows = 2;
        int _padding;

        [MenuItem("TikhayaTropa/Sprites/Sprite Sheet Slicer")]
        static void Open() => GetWindow<SpriteSheetSlicerWindow>("Sprite Sheet Slicer");

        void OnGUI()
        {
            _sourceTexture = (Texture2D)EditorGUILayout.ObjectField("Source Texture", _sourceTexture, typeof(Texture2D), false);
            _outputFolder = EditorGUILayout.TextField("Output Folder", _outputFolder);
            if (GUILayout.Button("Pick Output Folder"))
                PickOutputFolder();

            EditorGUILayout.Space(8);
            _columns = EditorGUILayout.IntField("Columns", Mathf.Max(1, _columns));
            _rows = EditorGUILayout.IntField("Rows", Mathf.Max(1, _rows));
            _padding = EditorGUILayout.IntField("Padding", Mathf.Max(0, _padding));

            EditorGUILayout.Space(8);
            if (GUILayout.Button("Slice In Place"))
                Slice(_sourceTexture);
            if (GUILayout.Button("Copy To Folder And Slice"))
                CopyAndSlice();

            DrawPreview();
        }

        void DrawPreview()
        {
            var rect = GUILayoutUtility.GetRect(10f, 280f, GUILayout.ExpandWidth(true));
            EditorGUI.DrawRect(rect, new Color(0.12f, 0.12f, 0.14f, 1f));
            if (_sourceTexture == null)
            {
                GUI.Label(rect, "Assign source texture", EditorStyles.centeredGreyMiniLabel);
                return;
            }

            DrawTextureWithGrid(rect, _sourceTexture, Mathf.Max(1, _columns), Mathf.Max(1, _rows), Mathf.Max(0, _padding));
        }

        void PickOutputFolder()
        {
            var abs = EditorUtility.OpenFolderPanel("Pick output folder", Application.dataPath, string.Empty);
            if (string.IsNullOrWhiteSpace(abs)) return;
            if (!abs.StartsWith(Application.dataPath)) return;
            _outputFolder = "Assets" + abs.Substring(Application.dataPath.Length);
        }

        void CopyAndSlice()
        {
            if (_sourceTexture == null) return;
            if (string.IsNullOrWhiteSpace(_outputFolder) || !_outputFolder.StartsWith("Assets")) return;
            Directory.CreateDirectory(_outputFolder);

            var srcPath = AssetDatabase.GetAssetPath(_sourceTexture);
            var fileName = Path.GetFileName(srcPath);
            var dstPath = AssetDatabase.GenerateUniqueAssetPath($"{_outputFolder}/{fileName}");
            FileUtil.CopyFileOrDirectory(srcPath, dstPath);
            AssetDatabase.ImportAsset(dstPath, ImportAssetOptions.ForceUpdate);
            var copied = AssetDatabase.LoadAssetAtPath<Texture2D>(dstPath);
            Slice(copied);
        }

        void Slice(Texture2D texture)
        {
            if (texture == null) return;
            var path = AssetDatabase.GetAssetPath(texture);
            var importer = AssetImporter.GetAtPath(path) as TextureImporter;
            if (importer == null) return;

            importer.textureType = TextureImporterType.Sprite;
            importer.spriteImportMode = SpriteImportMode.Multiple;
            importer.filterMode = FilterMode.Point;
            importer.mipmapEnabled = false;
            importer.alphaIsTransparency = true;

            var cols = Mathf.Max(1, _columns);
            var rows = Mathf.Max(1, _rows);
            var pad = Mathf.Max(0, _padding);
            var cellW = Mathf.FloorToInt((texture.width - pad * (cols - 1)) / (float)cols);
            var cellH = Mathf.FloorToInt((texture.height - pad * (rows - 1)) / (float)rows);
            if (cellW <= 0 || cellH <= 0) return;

            var meta = new List<SpriteMetaData>();
            var n = 0;
            for (var y = rows - 1; y >= 0; y--)
            {
                for (var x = 0; x < cols; x++)
                {
                    var px = x * (cellW + pad);
                    var py = y * (cellH + pad);
                    meta.Add(new SpriteMetaData
                    {
                        name = $"{texture.name}_{n:000}",
                        alignment = (int)SpriteAlignment.Center,
                        pivot = new Vector2(0.5f, 0.5f),
                        rect = new Rect(px, py, cellW, cellH)
                    });
                    n++;
                }
            }

#pragma warning disable CS0618
            importer.spritesheet = meta.ToArray();
#pragma warning restore CS0618
            importer.SaveAndReimport();
            AssetDatabase.Refresh();
        }

        static void DrawTextureWithGrid(Rect rect, Texture2D texture, int cols, int rows, int pad)
        {
            var texRect = FitRect(rect, texture.width, texture.height, 0.95f);
            GUI.DrawTexture(texRect, texture, ScaleMode.StretchToFill, true);

            Handles.BeginGUI();
            Handles.color = new Color(0.98f, 0.85f, 0.22f, 0.95f);
            var cellW = (texture.width - pad * (cols - 1)) / (float)cols;
            var cellH = (texture.height - pad * (rows - 1)) / (float)rows;
            if (cellW > 0f && cellH > 0f)
            {
                for (var y = 0; y < rows; y++)
                for (var x = 0; x < cols; x++)
                {
                    var px = x * (cellW + pad);
                    var py = y * (cellH + pad);
                    var gr = new Rect(
                        texRect.x + px / texture.width * texRect.width,
                        texRect.y + py / texture.height * texRect.height,
                        cellW / texture.width * texRect.width,
                        cellH / texture.height * texRect.height);
                    Handles.DrawSolidRectangleWithOutline(gr, new Color(0f, 0f, 0f, 0f), Handles.color);
                }
            }
            Handles.EndGUI();
        }

        static Rect FitRect(Rect area, float sourceW, float sourceH, float scale)
        {
            var s = Mathf.Min(area.width / sourceW, area.height / sourceH) * scale;
            var w = sourceW * s;
            var h = sourceH * s;
            return new Rect(area.center.x - w * 0.5f, area.center.y - h * 0.5f, w, h);
        }
    }
}
#endif
