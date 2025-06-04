import * as GameTypes from "@/game/Game.types";
import React from "react";
import { StyleProp, StyleSheet, ViewStyle } from "react-native";
import Animated, {
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";

export interface OverlayTileProps {
  size: SharedValue<number>;
  style?: StyleProp<ViewStyle>;
  id: GameTypes.TileId;
  icons: GameTypes.OverlayIcon[] | null;
}

const iconContainerSizePercentage = 0.1;
const textSizePercentage = 0.5;

export default React.memo(function OverlayTile({
  style: styleProp,
  size,
  id,
  icons,
}: OverlayTileProps): React.ReactNode {
  const animatedStyle = useAnimatedStyle(() => ({
    height: size.value,
    width: size.value,
  }));

  const iconContainerAnimatedStyle = useAnimatedStyle(() => ({
    height: size.value * iconContainerSizePercentage,
    width: size.value * iconContainerSizePercentage,
  }));

  const textSizeAnimatedStyle = useAnimatedStyle(() => ({
    fontSize: size.value * iconContainerSizePercentage * textSizePercentage,
  }));

  const style = React.useMemo(
    () => [styles.container, animatedStyle, styleProp],
    [animatedStyle, styleProp]
  );

  const iconStyle = React.useMemo(
    () => [styles.iconContainer, iconContainerAnimatedStyle],
    [iconContainerAnimatedStyle]
  );

  const textStyle = React.useMemo(
    () => [styles.iconText, textSizeAnimatedStyle],
    [textSizeAnimatedStyle]
  );

  return (
    <Animated.View style={style} id={`tile-${id}`}>
      {icons?.map(({ value }, index) => {
        if (value > 3) return null;

        return (
          <Animated.View key={index} style={iconStyle}>
            <Animated.Text style={textStyle}>{value}</Animated.Text>
          </Animated.View>
        );
      })}
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    padding: 15,
  },
  iconContainer: {
    backgroundColor: "white",
    borderRadius: 1000,
    alignItems: "center",
    justifyContent: "center",
    aspectRatio: 1,
  },
  iconText: {
    fontSize: 12,
    color: "black",
  },
});
