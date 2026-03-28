using System;
using System.Collections.Generic;

namespace TikhayaTropa.Core
{
    [Serializable]
    public class GameStateData
    {
        public string[] flags = Array.Empty<string>();
        public int acceptance;
        public int care;
        public int selfKnowledge;
        public int trust;
        public string[] inventory = Array.Empty<string>();
        public DiaryEntryData[] diary = Array.Empty<DiaryEntryData>();
        public int chapterAct = 1;
        public int locationTransitionCount;
    }

    [Serializable]
    public class DiaryEntryData
    {
        public string id;
        public string text;
    }
}
