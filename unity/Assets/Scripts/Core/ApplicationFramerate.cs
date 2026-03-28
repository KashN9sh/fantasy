using UnityEngine;

namespace TikhayaTropa.Core
{
    /// <summary>
    /// Ограничение FPS до 60 без привязки к v-sync монитора.
    /// </summary>
    public static class ApplicationFramerate
    {
        public const int TargetFps = 60;

        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.SubsystemRegistration)]
        static void Apply()
        {
            QualitySettings.vSyncCount = 0;
            Application.targetFrameRate = TargetFps;
        }
    }
}
