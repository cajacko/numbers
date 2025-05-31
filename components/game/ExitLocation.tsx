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

const height = 20;

export default function ExitLocation({
  index,
  side,
  tileSize,
  type,
  value,
  style,
}: ExitLocationProps): React.ReactNode {
  console.log("ExitLocation", {
    index,
    side,
  });

  // Rotate the exit location based on the side and offset based of the height so it's outside the
  // grid. And position it based on the index.
  const animatedStyle = useAnimatedStyle(() => {
    const offset = index * tileSize.value;

    let transformStyle: { transform: { rotate: string }[] } = { transform: [] };
    let positionStyle: { [key: string]: number } = {};

    switch (side) {
      case "top":
        transformStyle.transform.push({ rotate: "0deg" });
        positionStyle = { top: -height, left: offset };
        break;
      case "bottom":
        transformStyle.transform.push({ rotate: "0deg" });
        positionStyle = { bottom: -height, left: offset };
        break;
      case "left":
        transformStyle.transform.push({ rotate: "-90deg" });
        positionStyle = { left: -height, top: offset };
        break;
      case "right":
        transformStyle.transform.push({ rotate: "90deg" });
        positionStyle = { right: -height, top: offset };
        break;
    }

    return {
      ...positionStyle,
      ...transformStyle,
      width: tileSize.value,
      height: height,
    };
  });

  return (
    <Animated.View style={[styles.container, style, animatedStyle]}>
      <Text style={styles.text}>
        Exit {type === "greater-than-equal-to" ? ">=" : ""}
        {value}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    zIndex: 2,
    alignItems: "center",
    justifyContent: "center",
    height,
  },
  text: {
    fontSize: Math.min(16, height),
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
});
