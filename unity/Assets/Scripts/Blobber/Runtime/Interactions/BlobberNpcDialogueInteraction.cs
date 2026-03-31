using System.Collections.Generic;
using TikhayaTropa.Blobber.Data;
using TikhayaTropa.Core;
using TikhayaTropa.UI;
using UnityEngine;

namespace TikhayaTropa.Blobber.Runtime.Interactions
{
    public class BlobberNpcDialogueInteraction : BlobberInspectInteraction
    {
        [SerializeField] string dialogueId = string.Empty;
        BlobberDialogueDatabase _db;

        public void ApplyFrom(BlobberObjectInstance src, BlobberDialogueDatabase db)
        {
            base.ApplyFrom(src);
            dialogueId = src.parameters.dialogueId;
            _db = db;
        }

        public override void Interact(GameState state)
        {
            if (_db == null || string.IsNullOrEmpty(dialogueId))
            {
                base.Interact(state);
                return;
            }

            var tree = _db.Find(dialogueId);
            if (tree == null)
            {
                base.Interact(state);
                return;
            }

            ShowNode(state, tree, tree.rootNodeId);
        }

        void ShowNode(GameState state, BlobberDialogueTree tree, string nodeId)
        {
            var node = tree.nodes.Find(n => n.id == nodeId);
            if (node == null)
            {
                DialoguePanel.Instance?.ShowMessage("Диалог не найден.");
                return;
            }

            ApplyEffect(state, node.effect);
            if (node.choices == null || node.choices.Count == 0)
            {
                DialoguePanel.Instance?.ShowMessage(node.text, DialogueSpeaker.Npc);
                SaveSystem.Save(state);
                return;
            }

            var choices = new List<DialoguePanel.DialogueChoice>();
            foreach (var ch in node.choices)
            {
                var next = ch.nextNodeId;
                choices.Add(new DialoguePanel.DialogueChoice
                {
                    Label = ch.label,
                    OnSelect = () =>
                    {
                        ApplyEffect(state, ch.effect);
                        if (string.IsNullOrEmpty(next))
                            DialoguePanel.Instance?.ShowMessage("...", DialogueSpeaker.Npc);
                        else
                            ShowNode(state, tree, next);
                    }
                });
            }

            DialoguePanel.Instance?.ShowChoices(node.text, choices, DialogueSpeaker.Npc);
            SaveSystem.Save(state);
        }

        static void ApplyEffect(GameState state, BlobberDialogueEffect fx)
        {
            if (state == null || fx == null) return;
            if (!string.IsNullOrEmpty(fx.setFlag)) state.SetFlag(fx.setFlag);
            if (!string.IsNullOrEmpty(fx.addDiaryId) && !string.IsNullOrEmpty(fx.addDiaryText))
                state.AddDiaryEntry(fx.addDiaryId, fx.addDiaryText);
            if (fx.acceptance != 0) state.ModStat(StatKind.Acceptance, fx.acceptance);
            if (fx.care != 0) state.ModStat(StatKind.Care, fx.care);
            if (fx.selfKnowledge != 0) state.ModStat(StatKind.SelfKnowledge, fx.selfKnowledge);
            if (fx.trust != 0) state.ModStat(StatKind.Trust, fx.trust);
        }
    }
}
