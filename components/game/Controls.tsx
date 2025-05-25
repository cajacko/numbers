import React from "react";
import { Button, StyleSheet, View } from "react-native";
import Animated, {
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";

export interface ControlsProps {
  handleAction: (action: "up" | "down" | "left" | "right") => void;
  reset: () => void;
  progress?: SharedValue<number>;
}

export default function Controls({
  handleAction,
  reset,
  progress,
}: ControlsProps): React.ReactNode {
  const animatedStyle = useAnimatedStyle(() => {
    const value = progress?.value ?? 0;

    return {
      width: `${value * 100}%`,
    };
  });

  return (
    <View style={styles.container}>
      {progress && <Animated.View style={[styles.progress, animatedStyle]} />}
      <View style={styles.buttonWrapper}>
        <Button title="Reset" onPress={reset} />
      </View>
      <View style={styles.buttonWrapper}>
        <Button title="Up" onPress={() => handleAction("up")} />
      </View>
      <View style={styles.buttonWrapper}>
        <Button title="Down" onPress={() => handleAction("down")} />
      </View>
      <View style={styles.buttonWrapper}>
        <Button title="Left" onPress={() => handleAction("left")} />
      </View>
      <View style={styles.buttonWrapper}>
        <Button title="Right" onPress={() => handleAction("right")} />
      </View>
    </View>
  );
}

const progressHeight = 5;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    padding: 10,
    position: "relative",
    paddingTop: progressHeight * 2,
  },
  progress: {
    height: progressHeight,
    backgroundColor: "blue",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  buttonWrapper: {
    marginHorizontal: 5, // Adds horizontal margin between buttons
  },
});
