using System;
using System.Collections.Generic;
using UnityEngine;

namespace TikhayaTropa.Blobber.Data
{
    [Serializable]
    public class BlobberDialogueEffect
    {
        public string setFlag = string.Empty;
        public string addDiaryId = string.Empty;
        [TextArea(1, 5)] public string addDiaryText = string.Empty;
        public int acceptance;
        public int care;
        public int selfKnowledge;
        public int trust;
    }

    [Serializable]
    public class BlobberDialogueChoiceNode
    {
        public string label = "Выбор";
        public string nextNodeId = string.Empty;
        public BlobberDialogueEffect effect = new();
    }

    [Serializable]
    public class BlobberDialogueNode
    {
        public string id = "node-start";
        [TextArea(2, 8)] public string text = string.Empty;
        public List<BlobberDialogueChoiceNode> choices = new();
        public BlobberDialogueEffect effect = new();
    }

    [Serializable]
    public class BlobberDialogueTree
    {
        public string dialogueId = "dialogue-id";
        public string rootNodeId = "node-start";
        public List<BlobberDialogueNode> nodes = new();
    }

    [CreateAssetMenu(menuName = "TikhayaTropa/Blobber/Dialogue Database", fileName = "BlobberDialogueDatabase")]
    public class BlobberDialogueDatabase : ScriptableObject
    {
        public List<BlobberDialogueTree> dialogues = new();

        public BlobberDialogueTree Find(string dialogueId)
        {
            return dialogues.Find(d => d.dialogueId == dialogueId);
        }

        public BlobberDialogueNode FindNode(string dialogueId, string nodeId)
        {
            var tree = Find(dialogueId);
            if (tree == null) return null;
            return tree.nodes.Find(n => n.id == nodeId);
        }
    }
}
