using System;
using System.Collections.Generic;
using UnityEngine;

namespace TikhayaTropa.Core
{
    public class GameState : MonoBehaviour
    {
        public static GameState Instance { get; private set; }

        readonly HashSet<string> _flags = new();
        readonly List<DiaryEntryData> _diary = new();
        readonly HashSet<string> _inventory = new();

        public int Acceptance { get; private set; }
        public int Care { get; private set; }
        public int SelfKnowledge { get; private set; }
        public int Trust { get; private set; }
        public int ChapterAct { get; private set; } = 1;
        public int LocationTransitionCount { get; private set; }
        public string BlobberScene { get; private set; } = string.Empty;
        public Vector3 BlobberPosition { get; private set; }
        public float BlobberYaw { get; private set; }

        public IReadOnlyList<DiaryEntryData> DiaryEntries => _diary;

        public event Action OnStateChanged;
        public event Action OnDiaryChanged;

        public bool InputFrozen { get; set; }

        /// <summary>
        /// Создаёт сессию, если игрок попал в игровую сцену без Title (Play на Meadow и т.п.).
        /// </summary>
        public static void EnsureExists()
        {
            if (Instance != null) return;
            var go = new GameObject("GameSession");
            go.AddComponent<GameState>();
            Instance.NewGame();
        }

        void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;
            DontDestroyOnLoad(gameObject);
        }

        void OnDestroy()
        {
            if (Instance == this) Instance = null;
        }

        public void NewGame()
        {
            _flags.Clear();
            _diary.Clear();
            _inventory.Clear();
            Acceptance = Care = SelfKnowledge = Trust = 0;
            ChapterAct = 1;
            LocationTransitionCount = 0;
            BlobberScene = string.Empty;
            BlobberPosition = Vector3.zero;
            BlobberYaw = 0f;
            InputFrozen = false;
            Notify();
        }

        public void ApplySave(GameStateData data)
        {
            _flags.Clear();
            if (data.flags != null)
                foreach (var f in data.flags) _flags.Add(f);
            Acceptance = data.acceptance;
            Care = data.care;
            SelfKnowledge = data.selfKnowledge;
            Trust = data.trust;
            _inventory.Clear();
            if (data.inventory != null)
                foreach (var i in data.inventory) _inventory.Add(i);
            _diary.Clear();
            if (data.diary != null)
                _diary.AddRange(data.diary);
            ChapterAct = data.chapterAct;
            LocationTransitionCount = data.locationTransitionCount;
            BlobberScene = data.blobberScene ?? string.Empty;
            BlobberPosition = new Vector3(data.blobberX, data.blobberY, data.blobberZ);
            BlobberYaw = data.blobberYaw;
            InputFrozen = false;
            Notify();
            OnDiaryChanged?.Invoke();
        }

        public GameStateData ToSaveData()
        {
            var flagArr = new string[_flags.Count];
            _flags.CopyTo(flagArr, 0);
            var invArr = new string[_inventory.Count];
            _inventory.CopyTo(invArr, 0);
            return new GameStateData
            {
                flags = flagArr,
                acceptance = Acceptance,
                care = Care,
                selfKnowledge = SelfKnowledge,
                trust = Trust,
                inventory = invArr,
                diary = _diary.ToArray(),
                chapterAct = ChapterAct,
                locationTransitionCount = LocationTransitionCount,
                blobberScene = BlobberScene,
                blobberX = BlobberPosition.x,
                blobberY = BlobberPosition.y,
                blobberZ = BlobberPosition.z,
                blobberYaw = BlobberYaw
            };
        }

        public void SetBlobberPose(string scene, Vector3 position, float yaw)
        {
            BlobberScene = scene ?? string.Empty;
            BlobberPosition = position;
            BlobberYaw = yaw;
            Notify();
        }

        public bool TryGetBlobberPose(string scene, out Vector3 position, out float yaw)
        {
            if (!string.IsNullOrEmpty(BlobberScene) && BlobberScene == scene)
            {
                position = BlobberPosition;
                yaw = BlobberYaw;
                return true;
            }

            position = Vector3.zero;
            yaw = 0f;
            return false;
        }

        public bool HasFlag(string flag) => _flags.Contains(flag);

        public void SetFlag(string flag, bool value = true)
        {
            if (value) _flags.Add(flag);
            else _flags.Remove(flag);
            Notify();
        }

        public void SetChapterAct(int act)
        {
            ChapterAct = act;
            Notify();
        }

        public void AddDiaryEntry(string id, string text)
        {
            for (var i = 0; i < _diary.Count; i++)
            {
                if (_diary[i].id != id) continue;
                _diary[i] = new DiaryEntryData { id = id, text = text };
                OnDiaryChanged?.Invoke();
                return;
            }
            _diary.Add(new DiaryEntryData { id = id, text = text });
            OnDiaryChanged?.Invoke();
        }

        public void ModStat(StatKind kind, int delta)
        {
            switch (kind)
            {
                case StatKind.Acceptance: Acceptance += delta; break;
                case StatKind.Care: Care += delta; break;
                case StatKind.SelfKnowledge: SelfKnowledge += delta; break;
                case StatKind.Trust: Trust += delta; break;
            }
            Notify();
        }

        public void AddItem(string itemId)
        {
            _inventory.Add(itemId);
            Notify();
        }

        public bool HasItem(string itemId) => _inventory.Contains(itemId);

        public void RegisterLocationTransition()
        {
            LocationTransitionCount++;
            Notify();
        }

        void Notify()
        {
            OnStateChanged?.Invoke();
        }
    }

    public enum StatKind
    {
        Acceptance,
        Care,
        SelfKnowledge,
        Trust
    }
}
