using TikhayaTropa.Blobber.Data;
using TikhayaTropa.Blobber.Runtime.Interactions;
using TikhayaTropa.Blobber.Runtime.Logic;
using UnityEngine;

namespace TikhayaTropa.Blobber.Runtime
{
    public static class BlobberRuntimeInteractableFactory
    {
        public static MonoBehaviour Build(GameObject host, BlobberObjectInstance obj, BlobberDialogueDatabase dialogueDb, BlobberLogicGraphDatabase logicDb = null)
        {
            var interaction = obj.interactionType switch
            {
                BlobberInteractionType.None => null,
                BlobberInteractionType.SceneTransition => CreateSceneTransition(host, obj),
                BlobberInteractionType.CatScare => CreateCatScare(host, obj),
                BlobberInteractionType.CustomAction => CreateCustomAction(host, obj),
                BlobberInteractionType.NpcDialogue => CreateNpcDialogue(host, obj, dialogueDb),
                _ => CreateInspect(host, obj)
            };

            if (!string.IsNullOrWhiteSpace(obj.parameters.logicGraphId) && logicDb != null)
            {
                var runner = host.GetComponent<BlobberLogicRunner>() ?? host.AddComponent<BlobberLogicRunner>();
                runner.Configure(logicDb, obj.parameters.logicGraphId);
            }

            return interaction;
        }

        static MonoBehaviour CreateInspect(GameObject host, BlobberObjectInstance obj)
        {
            var c = host.AddComponent<BlobberInspectInteraction>();
            c.ApplyFrom(obj);
            return c;
        }

        static MonoBehaviour CreateNpcDialogue(GameObject host, BlobberObjectInstance obj, BlobberDialogueDatabase db)
        {
            var c = host.AddComponent<BlobberNpcDialogueInteraction>();
            c.ApplyFrom(obj, db);
            return c;
        }

        static MonoBehaviour CreateSceneTransition(GameObject host, BlobberObjectInstance obj)
        {
            var c = host.AddComponent<BlobberSceneTransitionInteraction>();
            c.ApplyFrom(obj);
            return c;
        }

        static MonoBehaviour CreateCatScare(GameObject host, BlobberObjectInstance obj)
        {
            var c = host.AddComponent<BlobberCatScareInteraction>();
            c.ApplyFrom(obj);
            return c;
        }

        static MonoBehaviour CreateCustomAction(GameObject host, BlobberObjectInstance obj)
        {
            var c = host.AddComponent<BlobberCustomActionInteraction>();
            c.ApplyFrom(obj);
            return c;
        }
    }
}
