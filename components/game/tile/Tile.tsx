import Number from "@/components/game/Number";
import * as GameTypes from "@/game/Game.types";
import React from "react";
import { StyleProp, StyleSheet, Text, ViewStyle } from "react-native";
import Animated, {
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import flags from "@/constants/flags";

export interface TileProps {
  height: SharedValue<number>;
  width: SharedValue<number>;
  value: SharedValue<number | null>;
  style?: StyleProp<ViewStyle>;
  id: GameTypes.TileId;
  textColor: SharedValue<string | null>;
  backgroundColor: SharedValue<string | null>;
}

export default React.memo(function Tile({
  value,
  style: styleProp,
  height,
  width,
  id,
  backgroundColor,
  textColor,
}: TileProps): React.ReactNode {
  const animatedStyle = useAnimatedStyle(() => ({
    height: height.value,
    width: width.value,
  }));

  const wrapperAnimatedStyle = useAnimatedStyle(() => ({
    backgroundColor: backgroundColor.value ?? "#efe4da",
  }));

  const style = React.useMemo(
    () => [styles.container, animatedStyle, styleProp],
    [animatedStyle, styleProp]
  );

  const wrapperStyle = React.useMemo(
    () => [styles.wrapper, wrapperAnimatedStyle],
    [wrapperAnimatedStyle]
  );

  return (
    <Animated.View style={style} id={`tile-${id}`}>
      <Animated.View style={wrapperStyle}>
        <Number value={value} color={textColor} maxDigits={4} />
      </Animated.View>
      {!!id && flags.showTileIds && <Text style={styles.id}>{id}</Text>}
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
