using System.IO;
using UnityEngine;

namespace TikhayaTropa.Core
{
    public static class SaveSystem
    {
        const string FileName = "tikhaya_save.json";

        static string Path => System.IO.Path.Combine(Application.persistentDataPath, FileName);

        public static bool SaveExists() => File.Exists(Path);

        public static void Save(GameState state)
        {
            var json = JsonUtility.ToJson(state.ToSaveData(), true);
            File.WriteAllText(Path, json);
        }

        public static bool TryLoad(GameState state)
        {
            if (!File.Exists(Path)) return false;
            var json = File.ReadAllText(Path);
            var data = JsonUtility.FromJson<GameStateData>(json);
            if (data == null) return false;
            state.ApplySave(data);
            return true;
        }

        public static void DeleteSave()
        {
            if (File.Exists(Path)) File.Delete(Path);
        }
    }
}
