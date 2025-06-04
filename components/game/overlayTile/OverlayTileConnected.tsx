import OverlayTile, {
  OverlayTileProps,
} from "@/components/game/overlayTile/OverlayTile";
import * as GameTypes from "@/game/Game.types";
import React from "react";
import { StyleSheet } from "react-native";
import {
  interpolate,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { OverlayTileState, useGameContext } from "../Game.context";

export interface OverlayTileConnectedProps
  extends Pick<OverlayTileProps, "style"> {
  id: GameTypes.TileId;
  size: SharedValue<number>;
}

export default React.memo(function OverlayTileConnected({
  id,
  size,
  style: styleProp,
}: OverlayTileConnectedProps): React.ReactNode {
  const { animationProgress, subscribeToOverlayTile, getOverlayTile } =
    useGameContext();

  const currentState = useSharedValue<OverlayTileState | null>(
    getOverlayTile(id)
  );
  const nextState = useSharedValue<OverlayTileState | null>(null);

  const [state, setState] = React.useState<OverlayTileState | null>(
    getOverlayTile(id)
  );

  React.useEffect(() => {
    const { unsubscribe } =
      subscribeToOverlayTile?.(id, (_currentState, _nextState) => {
        currentState.value = _currentState;
        nextState.value = _nextState;

        if (_nextState) return;

        setState(_currentState);
      }) ?? {};

    return unsubscribe;
  }, [id, subscribeToOverlayTile, currentState, nextState]);

  const animatedStyle = useAnimatedStyle(() => {
    let top: number;
    let left: number;
    let scaleX: number;
    let scaleY: number;
    let opacity: number;
    let translateX: number = 0;
    let translateY: number = 0;

    function topFromState(state: NonNullable<OverlayTileState>): number {
      return size.value * state.position[0];
    }

    function leftFromState(state: NonNullable<OverlayTileState>): number {
      return size.value * state.position[1];
    }

    if (currentState.value && nextState.value) {
      // Moving
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

      // Just moving
      opacity = 1;
      scaleX = 1;
      scaleY = 1;
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
      // Animate in the 2nd half of the animation
      // Allows for no overlap if something is spawning in the same position
      scaleX = interpolate(animationProgress.value, [0, 0.5, 1], [0, 0, 1]);
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
      transform: [{ translateX }, { translateY }, { scaleX }, { scaleY }],
      opacity,
    };
  });

  const style = React.useMemo(
    () => [styles.container, animatedStyle, styleProp],
    [animatedStyle, styleProp]
  );

  return (
    <OverlayTile
      style={style}
      size={size}
      id={id}
      icons={state?.icons ?? null}
    />
  );
});

const styles = StyleSheet.create({
  container: {
    position: "absolute",
  },
});
