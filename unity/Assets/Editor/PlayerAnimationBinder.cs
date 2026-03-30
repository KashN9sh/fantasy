#if UNITY_EDITOR
using System.Linq;
using TikhayaTropa.Player;
using UnityEditor;
using UnityEngine;

namespace TikhayaTropa.EditorTools
{
    /// <summary>Подставляет Player_0…7 из Assets/Aseprite/Player.png в PlayerController (после реимпорта текстуры).</summary>
    public static class PlayerAnimationBinder
    {
        const string PlayerPng = "Assets/Aseprite/Player.png";

        [MenuItem("TikhayaTropa/Player — привязать кадры анимации (Player.png)")]
        public static void BindFramesToPlayersInScene()
        {
            var sprites = AssetDatabase.LoadAllAssetsAtPath(PlayerPng)
                .OfType<Sprite>()
                .OrderBy(s => ParsePlayerIndex(s.name))
                .ToArray();

            if (sprites.Length < 8)
            {
                Debug.LogError($"TikhayaTropa: в {PlayerPng} ожидается 8 спрайтов (Player_0…7), найдено {sprites.Length}. Проверь Slice.");
                return;
            }

            var players = Object.FindObjectsByType<PlayerController>(FindObjectsSortMode.None);
            if (players.Length == 0)
            {
                Debug.LogWarning("TikhayaTropa: в сцене нет PlayerController.");
                return;
            }

            foreach (var pc in players)
            {
                Undo.RecordObject(pc, "Bind player animation frames");
                var so = new SerializedObject(pc);
                var walk = so.FindProperty("walkRightSprites");
                var idle = so.FindProperty("idleSprites");
                walk.ClearArray();
                idle.ClearArray();
                for (var i = 0; i < 4; i++)
                {
                    walk.InsertArrayElementAtIndex(i);
                    walk.GetArrayElementAtIndex(i).objectReferenceValue = sprites[i];
                }

                for (var i = 0; i < 4; i++)
                {
                    idle.InsertArrayElementAtIndex(i);
                    idle.GetArrayElementAtIndex(i).objectReferenceValue = sprites[4 + i];
                }

                so.ApplyModifiedPropertiesWithoutUndo();
                var sr = pc.GetComponent<SpriteRenderer>();
                if (sr != null && sprites[4] != null)
                {
                    Undo.RecordObject(sr, "Default idle sprite");
                    sr.sprite = sprites[4];
                }

                EditorUtility.SetDirty(pc);
                if (sr != null) EditorUtility.SetDirty(sr);
            }

            Debug.Log($"TikhayaTropa: кадры Player.png привязаны к {players.Length} PlayerController.");
        }

        static int ParsePlayerIndex(string spriteName)
        {
            if (string.IsNullOrEmpty(spriteName) || !spriteName.StartsWith("Player_"))
                return 999;
            return int.TryParse(spriteName["Player_".Length..], out var n) ? n : 999;
        }
    }
}
#endif
