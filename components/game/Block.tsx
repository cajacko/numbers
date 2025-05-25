import React from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import Animated, { SharedValue } from "react-native-reanimated";
import Number from "./Number";

export interface BlockProps {
  value: SharedValue<number | null>;
  style?: StyleProp<ViewStyle>;
}

export default function Block({
  value,
  style: styleProp,
}: BlockProps): React.ReactNode {
  const style = React.useMemo(() => [styles.container, styleProp], [styleProp]);

  return (
    <Animated.View style={style}>
      <View style={styles.wrapper}>
        <Number value={value} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 4,
  },
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: "#efe4da",
    flex: 1,
  },
});
