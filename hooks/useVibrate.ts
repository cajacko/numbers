import * as Haptics from "expo-haptics";
import React from "react";

export default function useVibrate() {
  const canVibrate = true;

  let lastVibrated = React.useRef<Date | null>(null);
  let vibrateTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const vibrate = React.useCallback(
    (
      debugKey?: string,
      options?: {
        delay?: number;
        throttle?: number;
        impactStyle?: "light" | "heavy";
      }
    ) => {
      const impactStyle = options?.impactStyle ?? "light";

      if (vibrateTimeout.current) {
        clearTimeout(vibrateTimeout.current);
        vibrateTimeout.current = null;
      }

      function run() {
        const now = new Date();

        if (
          options?.throttle &&
          lastVibrated.current &&
          now.getTime() - lastVibrated.current.getTime() < options.throttle
        ) {
          return;
        }

        switch (impactStyle) {
          case "heavy": {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

            setTimeout(() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            }, 100);

            setTimeout(() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }, 200);

            setTimeout(() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
            }, 300);

            setTimeout(() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
            }, 400);
            break;
          }
          case "light":
          default:
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            break;
        }

        lastVibrated.current = now;
      }

      if (options?.delay) {
        vibrateTimeout.current = setTimeout(run, options.delay);
      } else {
        run();
        vibrateTimeout.current = null;
      }
    },
    []
  );

  const clearPendingVibrations = React.useCallback(() => {
    if (vibrateTimeout.current) {
      clearTimeout(vibrateTimeout.current);
      vibrateTimeout.current = null;
    }
  }, []);

  if (!canVibrate) return {};

  return {
    clearPendingVibrations,
    vibrate,
  };
}
