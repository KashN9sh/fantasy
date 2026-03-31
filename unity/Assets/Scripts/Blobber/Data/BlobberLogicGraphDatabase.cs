using System.Collections.Generic;
using UnityEngine;

namespace TikhayaTropa.Blobber.Data
{
    [CreateAssetMenu(menuName = "TikhayaTropa/Blobber/Logic Graph Database", fileName = "BlobberLogicGraphDatabase")]
    public class BlobberLogicGraphDatabase : ScriptableObject
    {
        public List<BlobberLogicGraphData> graphs = new();

        public BlobberLogicGraphData Find(string graphId)
        {
            return graphs.Find(g => g.graphId == graphId);
        }
    }
}
