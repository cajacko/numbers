import React from "react";
import { View, Text, StyleSheet, StyleProp, ViewStyle } from "react-native";
import Animated, {
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";

export interface ExitLocationProps {
  value: number;
  type: "greater-than-equal-to" | "equal-to";
  side: "top" | "bottom" | "left" | "right";
  index: number;
  style?: StyleProp<ViewStyle>;
  tileSize: SharedValue<number>;
  columns: number;
  rows: number;
}

export const EXIT_LOCATION_OFFSET = 20;

export default function ExitLocation({
  index,
  side,
  tileSize,
  type,
  value,
  style,
  columns,
  rows,
}: ExitLocationProps): React.ReactNode {
  const animatedStyle = useAnimatedStyle(() => {
    const width =
      side === "left" || side === "right"
        ? EXIT_LOCATION_OFFSET
        : tileSize.value;

    const height =
      side === "left" || side === "right"
        ? tileSize.value
        : EXIT_LOCATION_OFFSET;

    const offset = index * tileSize.value;

    let positionStyle: { [key: string]: number } = {};

    switch (side) {
      case "top":
        positionStyle = { left: offset + EXIT_LOCATION_OFFSET, top: 0 };
        break;
      case "bottom":
        positionStyle = {
          left: offset + EXIT_LOCATION_OFFSET,
          top: rows * tileSize.value + EXIT_LOCATION_OFFSET,
        };
        break;
      case "left":
        positionStyle = { left: 0, top: offset + EXIT_LOCATION_OFFSET };
        break;
      case "right":
        positionStyle = {
          left: columns * tileSize.value + EXIT_LOCATION_OFFSET,
          top: offset + EXIT_LOCATION_OFFSET,
        };
        break;
    }

    return {
      ...positionStyle,
      height,
      width,
    };
  });

  // Rotate text based on side
  const textAnimatedStyle = useAnimatedStyle(() => {
    switch (side) {
      case "top":
        return { transform: [{ rotate: "0deg" }], width: tileSize.value };
      case "bottom":
        return { transform: [{ rotate: "0deg" }], width: tileSize.value };
      case "left":
        return { transform: [{ rotate: "-90deg" }], width: tileSize.value };
      case "right":
        return { transform: [{ rotate: "90deg" }], width: tileSize.value };
    }
  });

  return (
    <Animated.View style={[styles.container, style, animatedStyle]}>
      <Animated.Text style={[styles.text, textAnimatedStyle]}>
        {value}
        {type === "greater-than-equal-to" ? "+" : ""}
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    zIndex: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: Math.min(16, EXIT_LOCATION_OFFSET),
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
});
