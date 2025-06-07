import { useGameContext } from "@/components/game/Game.context";
import * as GameTypes from "@/game/Game.types";
import React from "react";
import { Gesture } from "react-native-gesture-handler";
import { runOnJS, SharedValue } from "react-native-reanimated";

function positionToEditLocation(
  gridSize: GameTypes.GridSize,
  position: GameTypes.Position
): GameTypes.EditAction["location"] | null {
  const { rows, columns } = gridSize;
  const [row, column] = position;

  const isAboveGrid = row < 0;
  const isBelowGrid = row >= rows;
  const isLeftOfGrid = column < 0;
  const isRightOfGrid = column >= columns;

  if (isAboveGrid && isLeftOfGrid) {
    return null; // Tapping on the top-left corner outside the grid
  }

  if (isBelowGrid && isRightOfGrid) {
    return null; // Tapping on the bottom-right corner outside the grid
  }

  if (isAboveGrid && isRightOfGrid) {
    return null; // Tapping on the top-right corner outside the grid
  }

  if (isBelowGrid && isLeftOfGrid) {
    return null; // Tapping on the bottom-left corner outside the grid
  }

  if (isAboveGrid) {
    // Tapping on the top row outside the grid
    return {
      type: "exit-location",
      side: "top",
      index: column,
    };
  }
  if (isBelowGrid) {
    // Tapping on the bottom row outside the grid
    return {
      type: "exit-location",
      side: "bottom",
      index: column,
    };
  }
  if (isLeftOfGrid) {
    // Tapping on the left column outside the grid
    return {
      type: "exit-location",
      side: "left",
      index: row,
    };
  }
  if (isRightOfGrid) {
    // Tapping on the right column outside the grid
    return {
      type: "exit-location",
      side: "right",
      index: row,
    };
  }

  // Otherwise, it's a tile
  return { type: "tile", position };
}

export default function useGameController(props: {
  editMode: boolean;
  gridPadding: number;
  tileSize: SharedValue<number>;
}) {
  const { editMode, gridPadding, tileSize } = props;
  const {
    handleAction,
    reset,
    levelSettings: {
      gridSize: { columns, rows },
    },
  } = useGameContext();

  const onTap = React.useCallback(
    (position: GameTypes.Position, type: "tap" | "hold") => {
      if (!editMode) {
        if (type !== "tap") return;

        handleAction({ type: "tap" });

        return;
      }

      const location = positionToEditLocation({ rows, columns }, position);

      if (!location) {
        return;
      }

      handleAction({
        type: type === "tap" ? "edit-tap" : "edit-hold",
        location,
      });
    },
    [editMode, handleAction, rows, columns]
  );

  React.useEffect(() => {
    if (editMode) return;
    if (typeof window === "undefined") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
          handleAction?.({ type: "up" });
          break;
        case "ArrowDown":
          handleAction?.({ type: "down" });
          break;
        case "ArrowLeft":
          handleAction?.({ type: "left" });
          break;
        case "ArrowRight":
          handleAction?.({ type: "right" });
          break;
        case "Enter":
        case " ":
          handleAction?.({ type: "tap" });
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

          runOnJS(onTap)([row, column], "tap");
        }),
    [onTap, gridPadding, tileSize]
  );

  const holdGesture = React.useMemo(
    () =>
      Gesture.LongPress()
        .enabled(editMode)
        .minDuration(500) // must be a long press
        .onStart((args) => {
          // Get the row/ column from the tile size and position. whilst removing the grid padding
          // This can result in a negative value, which indicates tapping on our exit locations, so
          // we can leave
          const adjustedX = args.x - gridPadding;
          const adjustedY = args.y - gridPadding;
          const column = Math.floor(adjustedX / tileSize.value);
          const row = Math.floor(adjustedY / tileSize.value);

          runOnJS(onTap)([row, column], "hold");
        }),
    [onTap, gridPadding, tileSize, editMode]
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
            runOnJS(handleAction)({ type: action });
          }
        }),
    [handleAction, editMode]
  );

  const gesture = React.useMemo(
    () => Gesture.Race(panGesture, tapGesture, holdGesture),
    [tapGesture, panGesture, holdGesture]
  );

  return {
    gesture,
    handleAction,
    reset,
  };
}
