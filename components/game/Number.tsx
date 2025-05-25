import React from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useDerivedValue,
} from "react-native-reanimated";

export interface NumberProps {
  value: SharedValue<number | null>;
  fontSize?: number;
  color: SharedValue<string | null>;
}

const maxDigits = 2;
const zeroToNine = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

const Digit = React.memo(function Digit({
  value: sharedValue,
  reversedDigitIndex,
  fontSize,
  rounded = false,
  color,
}: {
  value: SharedValue<number | null>;
  color: SharedValue<string | null>;
  /**
   * Is this the last number, the 10's digits the 100's? Done as an index. So:
   * 0 = 1's
   * 1 = 10's
   * 2 = 100's
   * ...
   */
  reversedDigitIndex: number;
  fontSize: number;
  rounded?: boolean;
}) {
  /**
   * Returns the floored value of the countdown for this digit
   */
  const zeroToNineIndex = useDerivedValue((): number | null => {
    if (sharedValue.value === null) {
      return null;
    }

    let value = sharedValue.value;

    if (rounded) {
      value = Math.round(value);
    }

    const countdownString = value.toString().split(".")[0].split("");

    const digitString =
      countdownString[countdownString.length - 1 - reversedDigitIndex];

    const digit = parseInt(digitString, 10);

    return digit;
  });

  /**
   * Displays the correct digit for the countdown
   */
  const animatedStyle = useAnimatedStyle(() => {
    let opacity = 1;
    let marginTop = 0;

    if (zeroToNineIndex.value === null) {
      opacity = 0;
    } else {
      marginTop = -fontSize * zeroToNineIndex.value;
    }

    return {
      marginTop,
      opacity,
    };
  });

  const style = React.useMemo(
    () => [
      styles.digit,
      {
        height: fontSize * zeroToNine.length,
      },
      animatedStyle,
    ],
    [animatedStyle, fontSize]
  );

  const animatedTextStyle = useAnimatedStyle(() => ({
    color: color.value ?? "#000",
  }));

  const textStyle = React.useMemo(
    () => [
      {
        fontSize,
        lineHeight: fontSize,
      },
      animatedTextStyle,
    ],
    [fontSize, animatedTextStyle]
  );

  const wrapperStyle = React.useMemo(
    () => ({
      height: fontSize,
    }),
    [fontSize]
  );

  return (
    <Animated.View style={style}>
      {zeroToNine.map((number, i) => (
        <View key={i} style={wrapperStyle}>
          <Animated.Text style={textStyle}>{number}</Animated.Text>
        </View>
      ))}
    </Animated.View>
  );
});

const digitArray = new Array(maxDigits).fill(0);

export default React.memo(function Numbers({
  value,
  fontSize = 30,
  color,
}: NumberProps): React.ReactNode {
  const style = React.useMemo(
    () => StyleSheet.flatten([styles.container, { height: fontSize }]),
    [fontSize]
  );

  return (
    <View style={style}>
      {digitArray.map((_, i) => {
        const reversedDigitIndex = digitArray.length - 1 - i;

        return (
          <Digit
            key={i}
            value={value}
            fontSize={fontSize}
            reversedDigitIndex={reversedDigitIndex}
            color={color}
          />
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    flexDirection: "row",
  },
  digit: {
    flexDirection: "column",
  },
});
