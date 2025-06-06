import { useGameContext } from "@/components/game/Game.context";
import * as GameTypes from "@/game/Game.types";
import React from "react";
import { Gesture } from "react-native-gesture-handler";
import { runOnJS, SharedValue } from "react-native-reanimated";

export default function useGameController(props: {
  editMode: boolean;
  gridPadding: number;
  tileSize: SharedValue<number>;
}) {
  const { editMode, gridPadding, tileSize } = props;
  const { handleAction, reset } = useGameContext();

  const onTap = React.useCallback(
    (props: { row: number; column: number }) => {
      if (!editMode) {
        handleAction("tap");

        return;
      }

      console.log("Tapped tile at row:", props.row, "column:", props.column);
    },
    [editMode, handleAction]
  );

  React.useEffect(() => {
    if (editMode) return;
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
  }, [handleAction, editMode]);

  const tapGesture = React.useMemo(
    () =>
      Gesture.Tap()
        .maxDuration(250) // must be a short press
        .maxDeltaX(10)
        .maxDeltaY(10)
        .onEnd((args) => {
          // Get the row/ column from the tile size and position. whilst removing the grid padding
          // This can result in a negative value, which indicates tapping on our exit locations, so
          // we can leave
          const adjustedX = args.x - gridPadding;
          const adjustedY = args.y - gridPadding;
          const column = Math.floor(adjustedX / tileSize.value);
          const row = Math.floor(adjustedY / tileSize.value);

          runOnJS(onTap)({ row, column });
        }),
    [onTap, gridPadding, tileSize]
  );

  const panGesture = React.useMemo(
    () =>
      Gesture.Pan()
        .enabled(!editMode)
        .minDistance(10)
        .onEnd((e) => {
          const { translationX, translationY } = e;

          const absX = Math.abs(translationX);
          const absY = Math.abs(translationY);

          let action: GameTypes.RegularActionType | null = null;

          if (absX > absY && absX > 20) {
            action = translationX > 0 ? "right" : "left";
          } else if (absY > 20) {
            action = translationY > 0 ? "down" : "up";
          }

          if (action && handleAction) {
            runOnJS(handleAction)(action);
          }
        }),
    [handleAction, editMode]
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
