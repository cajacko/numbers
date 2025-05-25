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
      }
    };

    window.addEventListener?.("keydown", handleKeyDown);

    return () => {
      window.removeEventListener?.("keydown", handleKeyDown);
    };
  }, [handleAction]);

  const panGesture = Gesture.Pan().onEnd((e) => {
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
  });

  return {
    panGesture,
    handleAction,
    reset,
  };
}
