import React from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useDerivedValue,
} from "react-native-reanimated";

// TODO: Have it auto expand to fit the digits, but still require a expectedMaxDigits prop, then we
// only cause a react render in unexpected edge cases but still satisfy the user. And this would
// only be with huge numbers so it shouldn't update often as it would be the highest decimal

export interface NumberProps {
  value: SharedValue<number | null>;
  fontSize?: number;
  color?: SharedValue<string | null>;
  style?: StyleProp<ViewStyle>;
  maxDigits: number;
}

const zeroToNine = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

const Digit = React.memo(function Digit({
  value: sharedValue,
  reversedDigitIndex,
  fontSize,
  rounded = false,
  color,
}: {
  value: SharedValue<number | null>;
  color?: SharedValue<string | null>;
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
   * Returns the floored value of the countdown for this digit.
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

    if (isNaN(digit) || digit === undefined) return null;

    if (digit !== 0) return digit;

    let isLeadingZero = true;

    for (let i = reversedDigitIndex + 1; i < countdownString.length; i++) {
      const nextDigit = parseInt(
        countdownString[countdownString.length - 1 - i],
        10
      );

      if (nextDigit !== 0) {
        isLeadingZero = false;
        break;
      }
    }

    if (isLeadingZero) return null;

    return digit;
  });

  /**
   * Displays the correct digit for the countdown
   */
  const animatedStyle = useAnimatedStyle(() => {
    let opacity = 1;
    let marginTop = 0;
    let width: number | undefined;

    if (zeroToNineIndex.value === null) {
      opacity = 0;
      width = 0;
    } else {
      // TODO: May need to do width per digit
      width = fontSize * 0.6;
      marginTop = -fontSize * zeroToNineIndex.value;
    }

    return {
      marginTop,
      opacity,
      width,
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
    color: color?.value ?? "#000",
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

export default React.memo(function Numbers({
  value,
  fontSize = 30,
  color,
  style: styleProp,
  maxDigits,
}: NumberProps): React.ReactNode {
  const style = React.useMemo(
    () =>
      StyleSheet.flatten([styles.container, { height: fontSize }, styleProp]),
    [fontSize, styleProp]
  );

  const digitArray = React.useMemo(
    () => new Array(maxDigits).fill(0),
    [maxDigits]
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
