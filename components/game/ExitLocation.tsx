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
}

const textHeightAllowance = 20;

export default function ExitLocation({
  index,
  side,
  tileSize,
  type,
  value,
  style,
}: ExitLocationProps): React.ReactNode {
  const animatedStyle = useAnimatedStyle(() => {
    const width =
      side === "left" || side === "right"
        ? textHeightAllowance
        : tileSize.value;

    const height =
      side === "left" || side === "right"
        ? tileSize.value
        : textHeightAllowance;

    const offset = index * tileSize.value;

    let positionStyle: { [key: string]: number } = {};

    switch (side) {
      case "top":
        positionStyle = { top: -textHeightAllowance, left: offset };
        break;
      case "bottom":
        positionStyle = { bottom: -textHeightAllowance, left: offset };
        break;
      case "left":
        positionStyle = { left: -textHeightAllowance, top: offset };
        break;
      case "right":
        positionStyle = { right: -textHeightAllowance, top: offset };
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
    fontSize: Math.min(16, textHeightAllowance),
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
});
