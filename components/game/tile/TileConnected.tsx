import Tile, { TileProps } from "@/components/game/tile/Tile";
import * as GameTypes from "@/game/Game.types";
import React from "react";
import { StyleSheet } from "react-native";
import {
  interpolate,
  interpolateColor,
  SharedValue,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";
import {
  TileAnimatingState,
  TileState,
  TileSubscriber,
  useAnimationProgress,
  useSubscribeToTile,
  useTileInitialState,
} from "../Game.context";
import flags from "@/constants/flags";

export interface TileConnectedProps extends Pick<TileProps, "style"> {
  id: GameTypes.TileId;
  size: SharedValue<number>;
}

const staticUpdatePoint = 0.5;

export default React.memo(function TileConnected({
  id,
  size,
  style: styleProp,
}: TileConnectedProps): React.ReactNode {
  const initialState = useTileInitialState(id);
  const animationProgress = useAnimationProgress();

  const currentState = useSharedValue<TileState | null>(initialState);
  const nextState = useSharedValue<TileAnimatingState | null>(null);

  useSubscribeToTile(
    id,
    React.useCallback<TileSubscriber>(
      (_currentState, _nextState) => {
        currentState.value = _currentState;
        nextState.value = _nextState;
      },
      [currentState, nextState]
    )
  );

  const value = useDerivedValue<number | null>(() => {
    const currentValue = currentState.value?.value ?? null;
    const nextValue = nextState.value?.value ?? null;

    if (currentValue !== null && nextValue !== null) {
      if (flags.animateNumbers) {
        return interpolate(
          animationProgress.value,
          [0, 1],
          [currentValue, nextValue]
        );
      }

      return animationProgress.value < staticUpdatePoint
        ? currentValue
        : nextValue;
    }

    if (currentValue !== null) {
      return currentValue;
    }

    return nextValue;
  });

  const backgroundColor = useDerivedValue<string | null>(() => {
    const currentValue = currentState.value?.backgroundColor;
    const nextValue = nextState.value?.backgroundColor;

    if (currentValue && nextValue) {
      if (flags.animateTileColors) {
        return interpolateColor(
          animationProgress.value,
          [0, 1],
          [currentValue, nextValue]
        );
      }

      return animationProgress.value < staticUpdatePoint
        ? currentValue
        : nextValue;
    }

    if (currentValue) {
      return currentValue;
    }

    if (nextValue) {
      return nextValue;
    }

    return null;
  });

  const textColor = useDerivedValue<string | null>(() => {
    const currentValue = currentState.value?.textColor;
    const nextValue = nextState.value?.textColor;

    if (currentValue && nextValue) {
      if (flags.animateTileColors) {
        return interpolateColor(
          animationProgress.value,
          [0, 1],
          [currentValue, nextValue]
        );
      }

      return animationProgress.value < staticUpdatePoint
        ? currentValue
        : nextValue;
    }

    if (currentValue) {
      return currentValue;
    }

    if (nextValue) {
      return nextValue;
    }

    return null;
  });

  const animatedStyle = useAnimatedStyle(() => {
    let top: number;
    let left: number;
    let scaleX: number;
    let scaleY: number;
    let opacity: number;

    function topFromState(state: NonNullable<TileState>): number {
      return size.value * state.position[0];
    }

    function leftFromState(state: NonNullable<TileState>): number {
      return size.value * state.position[1];
    }

    if (currentState.value && nextState.value) {
      // Moving and/or merging or changing value
      top = interpolate(
        animationProgress.value,
        [0, 1],
        [topFromState(currentState.value), topFromState(nextState.value)]
      );
      left = interpolate(
        animationProgress.value,
        [0, 1],
        [leftFromState(currentState.value), leftFromState(nextState.value)]
      );

      if (nextState.value.collapsing) {
        const collapsing = interpolate(animationProgress.value, [0, 1], [1, 0]);

        if (nextState.value.collapsing === "x") {
          // Merging horizontally
          scaleY = 1;
          scaleX = collapsing;
        } else if (nextState.value.collapsing === "y") {
          // Merging vertically
          scaleY = collapsing;
          scaleX = 1;
        } else {
          // Collapsing/ disappearing
          scaleX = collapsing;
          scaleY = collapsing;
        }

        opacity = interpolate(animationProgress.value, [0, 1], [1, 0]);
      } else if (nextState.value.scalePop) {
        // This tile is consuming some other tiles so pop it
        opacity = 1;
        scaleX = interpolate(
          animationProgress.value,
          [0, 0.25, 0.75, 1],
          [1, 0.95, 1.01, 1]
        );
        scaleY = scaleX;
      } else {
        // Just moving
        opacity = 1;
        scaleX = 1;
        scaleY = 1;
      }
    } else if (currentState.value) {
      // Initial state, or no changes
      top = topFromState(currentState.value);
      left = leftFromState(currentState.value);
      opacity = 1;
      scaleX = 1;
      scaleY = scaleX;
    } else if (nextState.value) {
      // Spawning a new tile
      top = topFromState(nextState.value);
      left = leftFromState(nextState.value);
      opacity = 1;
      scaleX = animationProgress.value;
      scaleY = scaleX;
    } else {
      top = -9999;
      left = -9999;
      opacity = 0;
      scaleX = 0;
      scaleY = scaleX;
    }

    return {
      top,
      left,
      transform: [{ scaleX }, { scaleY }],
      opacity,
    };
  });

  const style = React.useMemo(
    () => [styles.container, animatedStyle, styleProp],
    [animatedStyle, styleProp]
  );

  return (
    <Tile
      value={value}
      style={style}
      height={size}
      width={size}
      id={id}
      backgroundColor={backgroundColor}
      textColor={textColor}
    />
  );
});

const styles = StyleSheet.create({
  container: {
    position: "absolute",
  },
});
