import { useActionHandlers } from "@/components/game/Game.context";
import * as GameTypes from "@/game/Game.types";
import React from "react";
import { Gesture } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";

export default function useGameController() {
  const { handleAction, reset } = useActionHandlers() ?? {};

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
          handleAction?.("up");
          break;
        case "ArrowDown":
          handleAction?.("down");
          break;
        case "ArrowLeft":
          handleAction?.("left");
          break;
        case "ArrowRight":
          handleAction?.("right");
          break;
        case "Enter":
        case " ":
          handleAction?.("tap");
          break;
      }
    };

    window.addEventListener?.("keydown", handleKeyDown);

    return () => {
      window.removeEventListener?.("keydown", handleKeyDown);
    };
  }, [handleAction]);

  const tapGesture = React.useMemo(
    () =>
      Gesture.Tap()
        .maxDuration(250) // must be a short press
        .maxDeltaX(10)
        .maxDeltaY(10)
        .onEnd(() => {
          if (handleAction) {
            runOnJS(handleAction)("tap");
          }
        }),
    [handleAction]
  );

  const panGesture = React.useMemo(
    () =>
      Gesture.Pan()
        .minDistance(10)
        .onEnd((e) => {
          const { translationX, translationY } = e;

          const absX = Math.abs(translationX);
          const absY = Math.abs(translationY);

          let direction: GameTypes.Direction | null = null;

          if (absX > absY && absX > 20) {
            direction = translationX > 0 ? "right" : "left";
          } else if (absY > 20) {
            direction = translationY > 0 ? "down" : "up";
          }

          if (direction && handleAction) {
            runOnJS(handleAction)(direction);
          }
        }),
    [handleAction]
  );

  const gesture = React.useMemo(
    () => Gesture.Race(panGesture, tapGesture),
    [tapGesture, panGesture]
  );

  return {
    gesture,
    handleAction,
    reset,
  };
}
