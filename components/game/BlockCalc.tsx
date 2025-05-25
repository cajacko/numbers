import React from "react";
import { StyleSheet } from "react-native";
import {
  interpolate,
  SharedValue,
  useAnimatedStyle,
  useDerivedValue,
} from "react-native-reanimated";
import Block, { BlockProps } from "./Block";
import { GameState, GameStateBlock } from "./Game.types";

export interface BlockCalcProps extends Pick<BlockProps, "style"> {
  size: SharedValue<number>;
  prevState: SharedValue<GameState>;
  nextState: SharedValue<GameState | null>;
  progress: SharedValue<number>;
  blockId: string;
}

export default function BlockCalc({
  size,
  style: styleProp,
  prevState,
  blockId,
  nextState,
  progress,
}: BlockCalcProps): React.ReactNode {
  const prevBlock = useDerivedValue<GameStateBlock | null>(() => {
    return prevState.value.blocks[blockId] ?? null;
  });

  const nextBlock = useDerivedValue<GameStateBlock | null>(() => {
    return nextState.value?.blocks[blockId] ?? null;
  });

  const block = useDerivedValue<GameStateBlock | null>(() => {
    if (nextBlock.value) {
      return nextBlock.value;
    }

    if (prevBlock.value) {
      return prevBlock.value;
    }

    return null;
  });

  const value = useDerivedValue<number | null>(() => {
    if (nextBlock.value) {
      const prevValue: number | null = prevBlock.value?.value ?? null;

      if (prevValue === null) {
        // This is a new block, so we need to show the next value
        return nextBlock.value.value;
      }

      // We're moving between 2 numbers
      return interpolate(
        progress.value,
        [0, 1],
        [prevValue, nextBlock.value.value]
      );
    }

    return prevBlock.value?.value ?? null;
  });

  // Get top/ left position of the block
  const animatedStyle = useAnimatedStyle(() => {
    let opacity: number;
    let top: number;
    let left: number;
    let scale: number;

    if (nextBlock.value && !prevBlock.value) {
      opacity = 1;
      top = nextBlock.value.rowIndex * size.value;
      left = nextBlock.value.columnIndex * size.value;
      scale = progress.value;
    } else if (prevBlock.value && !nextBlock.value) {
      opacity = 1;
      top = prevBlock.value.rowIndex * size.value;
      left = prevBlock.value.columnIndex * size.value;
      scale = 1;
    } else if (prevBlock.value && nextBlock.value) {
      opacity = 1;

      if (nextBlock.value.animating?.includes("adding")) {
        scale = progress.value;
      } else {
        scale = 1;
      }

      // TODO:
      top = prevBlock.value.rowIndex * size.value;
      left = prevBlock.value.columnIndex * size.value;
    } else {
      opacity = 0;
      top = -9999;
      left = -9999;
      scale = 0;
    }

    return {
      top,
      left,
      opacity,
      height: size.value,
      width: size.value,
      maxHeight: size.value,
      maxWidth: size.value,
      transform: [
        {
          scale,
        },
      ],
    };
  });

  const style = React.useMemo(
    () => [styles.container, styleProp, animatedStyle],
    [styleProp, animatedStyle]
  );

  return <Block value={value} style={style} />;
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
  },
});
