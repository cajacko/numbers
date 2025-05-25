import React from "react";
import { Gesture } from "react-native-gesture-handler";
import { SharedValue, runOnJS } from "react-native-reanimated";
import { ControlsProps } from "../Controls";
import * as Types from "../Game.types";
// import gameLogic from "../logic/two048";

export interface UseHandleActionProps {
  prevState: SharedValue<Types.GameState>;
  nextState: SharedValue<Types.GameState | null>;
  progress: SharedValue<number>;
  isAnimating: SharedValue<boolean>;
  blockIds: string[];
  rows: number;
  columns: number;
}

const duration = 100;

export default function useActions({
  nextState,
  prevState,
  progress,
  isAnimating,
  blockIds,
  rows,
  columns,
}: UseHandleActionProps) {
  const finishAnimation = React.useCallback(() => {
    // runOnJS(console.log)("Animation finished");
    // Reset
    progress.value = 0;

    // const state = gameLogic.clearAnimations(nextState.value ?? prevState.value);

    // prevState.value = state;
    nextState.value = null;

    isAnimating.value = false;
  }, [prevState, nextState, isAnimating, progress]);

  const handleAction = React.useCallback<ControlsProps["handleAction"]>(
    (action) => {
      // if (isAnimating.value) {
      //   console.log("Already animating");
      //   return;
      // }
      // const newState = gameLogic.getNextGameState({
      //   prevState: prevState.value,
      //   action,
      //   blockIds,
      //   rows,
      //   columns,
      // });
      // // console.log("Action:", { action, prevState: prevState.value, newState });
      // isAnimating.value = true;
      // nextState.value = newState;
      // progress.value = withTiming(
      //   1,
      //   {
      //     duration,
      //   },
      //   (finished) => {
      //     if (!finished) {
      //       runOnJS(console.log)("Animation cancelled");
      //       return;
      //     }
      //     runOnJS(finishAnimation)();
      //   }
      // );
    },
    [
      nextState,
      prevState,
      progress,
      isAnimating,
      blockIds,
      rows,
      columns,
      finishAnimation,
    ]
  );

  const panGesture = Gesture.Pan().onEnd((e) => {
    const { translationX, translationY } = e;

    const absX = Math.abs(translationX);
    const absY = Math.abs(translationY);

    let direction: Types.Action | null = null;

    if (absX > absY && absX > 20) {
      direction = translationX > 0 ? "right" : "left";
    } else if (absY > 20) {
      direction = translationY > 0 ? "down" : "up";
    }

    if (direction) {
      runOnJS(handleAction)(direction);
    }
  });

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
          handleAction("up");
          break;
        case "ArrowDown":
          handleAction("down");
          break;
        case "ArrowLeft":
          handleAction("left");
          break;
        case "ArrowRight":
          handleAction("right");
          break;
      }
    };

    window.addEventListener?.("keydown", handleKeyDown);

    return () => {
      window.removeEventListener?.("keydown", handleKeyDown);
    };
  }, [handleAction]);

  const reset = React.useCallback(() => {
    isAnimating.value = false;
    nextState.value = null;

    // prevState.value = gameLogic.getInitialGameState({
    //   blockIds,
    //   rows,
    //   columns,
    // });
  }, [nextState, prevState, isAnimating, blockIds, rows, columns]);

  return { handleAction, panGesture, reset };
}
