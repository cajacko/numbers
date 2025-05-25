import Tile from "@/components/game/tile/Tile";
import * as GameTypes from "@/game/Game.types";
import React from "react";
import { StyleSheet } from "react-native";
import {
  interpolate,
  SharedValue,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";
import {
  TileState,
  TileSubscriber,
  useAnimationProgress,
  useSubscribeToTile,
  useTileInitialState,
} from "../Game.context";

export interface TileConnectedProps {
  id: GameTypes.TileId;
  size: SharedValue<number>;
}

export default React.memo(function TileConnected({
  id,
  size,
}: TileConnectedProps): React.ReactNode {
  const initialState = useTileInitialState(id);
  const animationProgress = useAnimationProgress();

  const currentState = useSharedValue<TileState>(initialState);
  const nextState = useSharedValue<TileState | null>(null);

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
      return interpolate(
        animationProgress.value,
        [0, 1],
        [currentValue, nextValue]
      );
    }

    if (currentValue !== null) {
      return currentValue;
    }

    // TODO: Is this correct?

    return nextValue;
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

    if (currentState.value && animationProgress.value === 0) {
      // Initial state, no animation
      top = topFromState(currentState.value);
      left = leftFromState(currentState.value);
      opacity = 1;
      scaleX = 1;
      scaleY = 1;
    } else if (nextState.value && animationProgress.value === 1) {
      // Finished Animating
      top = topFromState(nextState.value);
      left = leftFromState(nextState.value);
      opacity = 1;
      scaleX = 1;
      scaleY = 1;
    } else if (currentState.value && nextState.value) {
      // Moving and/or merging
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
      opacity = 1;
      scaleX = 1;
      scaleY = 1;
    } else if (nextState.value && !currentState.value) {
      // Spawning a new tile
      top = topFromState(nextState.value);
      left = leftFromState(nextState.value);
      opacity = 1;
      scaleX = animationProgress.value;
      scaleY = animationProgress.value;
    } else {
      top = -9999;
      left = -9999;
      opacity = 0;
      scaleX = 0;
      scaleY = 0;
    }

    return {
      top,
      left,
      transform: [{ scaleX }, { scaleY }],
      opacity,
    };
  });

  const style = React.useMemo(
    () => [styles.container, animatedStyle],
    [animatedStyle]
  );

  return (
    <Tile value={value} style={style} height={size} width={size} id={id} />
  );
});

const styles = StyleSheet.create({
  container: {
    position: "absolute",
  },
});
