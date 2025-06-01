import { GameProvider, useGameContext } from "@/components/game/Game.context";
import GridConnected from "@/components/game/grid/GridConnected";
import React from "react";
import { Button, Dimensions, StyleSheet, Text, View } from "react-native";
import useGameController from "./hooks/useGameController";
import Number from "@/components/game/Number";
import { useSharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Clipboard from "expo-clipboard";

export interface GameProps {}

function ConnectedGame(props: GameProps): React.ReactNode {
  const { score, getTestProps, status, level } = useGameContext();
  const scoreColor = useSharedValue<string | null>("white");
  const { gesture, reset } = useGameController();
  const insets = useSafeAreaInsets();

  const copyTestProps = React.useCallback(async () => {
    const testProps = getTestProps();

    const string = JSON.stringify(testProps, null, 2);

    console.log("Test Props:", string);

    await Clipboard.setStringAsync(string);
  }, [getTestProps]);

  const [size, setSize] = React.useState<{
    width: number;
    height: number;
  }>(Dimensions.get("window"));

  const onLayout = React.useCallback(
    (event: { nativeEvent: { layout: { width: number; height: number } } }) => {
      const { width, height } = event.nativeEvent.layout;

      setSize({ width, height });
    },
    []
  );

  const headerHeight = 50;
  const footerHeight = 50;

  const availableSize = React.useMemo(() => {
    return {
      width: size.width - insets.left - insets.right,
      height:
        size.height - headerHeight - footerHeight - insets.top - insets.bottom,
    };
  }, [size, headerHeight, footerHeight, insets]);

  const headerStyle = React.useMemo(
    () =>
      StyleSheet.flatten([
        styles.meta,
        {
          height: headerHeight,
        },
      ]),
    [headerHeight]
  );

  const footerStyle = React.useMemo(
    () =>
      StyleSheet.flatten([
        styles.footer,
        {
          height: footerHeight,
        },
      ]),
    [footerHeight]
  );

  return (
    <>
      <View style={styles.container} onLayout={onLayout}>
        <View style={headerStyle}>
          <Text style={styles.text}>Level: {level}</Text>
          <Text style={styles.text}>- </Text>
          <Number
            color={scoreColor}
            value={score}
            fontSize={20}
            maxDigits={10}
          />
          {(status === "won" || status === "lost") && (
            <Text style={styles.text}>
              {status === "won" ? "You Won!" : "You Lost!"}
            </Text>
          )}
        </View>

        <GridConnected
          gesture={gesture}
          availableHeight={availableSize.height}
          availableWidth={availableSize.width}
        />

        <View style={footerStyle}>
          <View style={styles.reset}>
            <Button title="Copy Test Props" onPress={copyTestProps} />
          </View>
          {/* <View style={styles.reset}>
            <Button title="Settings" onPress={openSettings} />
          </View> */}
          {reset && (
            <View style={styles.reset}>
              <Button title="reset" onPress={reset} />
            </View>
          )}
        </View>
      </View>
    </>
  );
}

export default function Game(props: GameProps): React.ReactNode {
  return (
    <GameProvider>
      <ConnectedGame {...props} />
    </GameProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  meta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  text: {
    fontSize: 20,
    color: "white",
    marginLeft: 10,
  },
  footer: {
    paddingTop: 10,
    flexDirection: "row",
  },
  reset: {
    marginHorizontal: 10,
  },
});
