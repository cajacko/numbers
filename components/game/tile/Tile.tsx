import Number from "@/components/game/Number";
import * as GameTypes from "@/game/Game.types";
import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import Animated, {
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";

export interface TileProps {
  height: SharedValue<number>;
  width: SharedValue<number>;
  value: SharedValue<number | null>;
  style?: StyleProp<ViewStyle>;
  id: GameTypes.TileId;
}

export default React.memo(function Tile({
  value,
  style: styleProp,
  height,
  width,
  id,
}: TileProps): React.ReactNode {
  const animatedStyle = useAnimatedStyle(() => ({
    height: height.value,
    width: width.value,
  }));

  const style = React.useMemo(
    () => [styles.container, animatedStyle, styleProp],
    [animatedStyle, styleProp]
  );

  return (
    <Animated.View style={style} id={`tile-${id}`}>
      <View style={styles.wrapper}>
        <Number value={value} />
      </View>
      {!!id && <Text style={styles.id}>{id}</Text>}
    </Animated.View>
  );
});

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
  id: {
    position: "absolute",
    bottom: 10,
    left: 10,
  },
});
