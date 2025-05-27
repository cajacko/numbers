import {
  GameProvider,
  useScore,
  useGameState,
  useGridSize,
  useSetGridSize,
} from "@/components/game/Game.context";
import GridConnected from "@/components/game/grid/GridConnected";
import React from "react";
import { Button, Dimensions, StyleSheet, Text, View } from "react-native";
import { Picker } from "@react-native-picker/picker";
import useGameController from "./hooks/useGameController";
import Number from "@/components/game/Number";
import { useSharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export interface GameProps {}

function ConnectedGame(props: GameProps): React.ReactNode {
  const score = useScore();
  const scoreColor = useSharedValue<string | null>("white");
  const gameState = useGameState();
  const { panGesture, reset } = useGameController();
  const { setRows, setColumns } = useSetGridSize();
  const { rows, columns } = useGridSize();
  const insets = useSafeAreaInsets();

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
        styles.reset,
        {
          height: footerHeight,
        },
      ]),
    [footerHeight]
  );

  const onRowsChange = React.useCallback(
    (value: number) => {
      setRows?.(value);
      reset?.();
    },
    [setRows, reset]
  );

  const onColumnsChange = React.useCallback(
    (value: number) => {
      setColumns?.(value);
      reset?.();
    },
    [setColumns, reset]
  );

  const pickerValues = React.useMemo(() => {
    return Array.from({ length: 19 }, (_, i) => i + 2);
  }, []);

  return (
    <View style={styles.container} onLayout={onLayout}>
      <View style={headerStyle}>
        <Number color={scoreColor} value={score} fontSize={20} maxDigits={10} />
        {gameState !== "playing" && (
          <Text style={styles.text}>
            {gameState === "won" ? "You Won!" : "You Lost!"}
          </Text>
        )}
      </View>

      <GridConnected
        gesture={panGesture}
        availableHeight={availableSize.height}
        availableWidth={availableSize.width}
      />
      {reset && (
        <View style={footerStyle}>
          <View style={styles.pickers}>
            <Picker
              style={styles.picker}
              selectedValue={rows}
              onValueChange={onRowsChange}
            >
              {pickerValues.map((v) => (
                <Picker.Item key={`row-${v}`} label={String(v)} value={v} />
              ))}
            </Picker>
            <Picker
              style={styles.picker}
              selectedValue={columns}
              onValueChange={onColumnsChange}
            >
              {pickerValues.map((v) => (
                <Picker.Item key={`col-${v}`} label={String(v)} value={v} />
              ))}
            </Picker>
          </View>
          <Button title="reset" onPress={reset} />
        </View>
      )}
    </View>
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
  reset: {
    paddingTop: 10,
  },
  pickers: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  picker: {
    flex: 1,
  },
});
