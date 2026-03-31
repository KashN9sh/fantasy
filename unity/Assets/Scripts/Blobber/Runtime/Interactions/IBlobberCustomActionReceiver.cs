using TikhayaTropa.Core;
using UnityEngine;

namespace TikhayaTropa.Blobber.Runtime.Interactions
{
    public interface IBlobberCustomActionReceiver
    {
        bool TryHandle(string actionId, string payload, GameObject source, GameState state);
    }
}
