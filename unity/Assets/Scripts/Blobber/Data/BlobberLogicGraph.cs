using System;
using System.Collections.Generic;
using UnityEngine;

namespace TikhayaTropa.Blobber.Data
{
    public enum BlobberLogicNodeType
    {
        Event,
        Condition,
        Action
    }

    public enum BlobberLogicEventType
    {
        OnInteract,
        OnUpdate,
        OnPlayerNear,
        OnFlagChanged
    }

    public enum BlobberLogicConditionType
    {
        HasFlag,
        PlayerSpeedGreater,
        DistanceLess,
        ObjectStateEquals
    }

    public enum BlobberLogicActionType
    {
        SetFlag,
        MoveToMarker,
        PlayAnimation,
        SetSprite,
        ShowMessage,
        LoadScene,
        SetObjectActive
    }

    [Serializable]
    public class BlobberLogicNodeData
    {
        public string id = Guid.NewGuid().ToString("N");
        public string title = "Node";
        public BlobberLogicNodeType nodeType;
        public BlobberLogicEventType eventType = BlobberLogicEventType.OnInteract;
        public BlobberLogicConditionType conditionType = BlobberLogicConditionType.HasFlag;
        public BlobberLogicActionType actionType = BlobberLogicActionType.ShowMessage;
        public Vector2 editorPosition = new(120f, 120f);

        // Generic typed values for low-code node payload.
        public string stringValue = string.Empty;
        public string stringValue2 = string.Empty;
        public float floatValue;
        public int intValue;
        public bool boolValue = true;
    }

    [Serializable]
    public class BlobberLogicLinkData
    {
        public string fromNodeId = string.Empty;
        public string toNodeId = string.Empty;
    }

    [Serializable]
    public class BlobberLogicGraphData
    {
        public string graphId = Guid.NewGuid().ToString("N");
        public string displayName = "Logic Graph";
        public List<BlobberLogicNodeData> nodes = new();
        public List<BlobberLogicLinkData> links = new();
    }

}
