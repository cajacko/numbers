import {
  GameProvider,
  useScore,
  useGameState,
  useGridSize,
  useSetGridSize,
  useSetGame,
} from "@/components/game/Game.context";
import games from "@/game/games";
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
  const { gesture, reset } = useGameController();
  const { setRows, setColumns } = useSetGridSize();
  const { rows, columns } = useGridSize();
  const insets = useSafeAreaInsets();
  const { game, setGame } = useSetGame();
  const selectedGame = game?.name;

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

  const [settingsVisible, setSettingsVisible] = React.useState(false);
  const openSettings = React.useCallback(() => {
    setSettingsVisible(true);
  }, []);

  const closeSettings = React.useCallback(() => {
    setSettingsVisible(false);
  }, []);

  return (
    <>
      <View style={styles.container} onLayout={onLayout}>
        <View style={headerStyle}>
          <Number
            color={scoreColor}
            value={score}
            fontSize={20}
            maxDigits={10}
          />
          {gameState !== "playing" && (
            <Text style={styles.text}>
              {gameState === "won" ? "You Won!" : "You Lost!"}
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
            <Button title="Settings" onPress={openSettings} />
          </View>
          {reset && (
            <View style={styles.reset}>
              <Button title="reset" onPress={reset} />
            </View>
          )}
        </View>
      </View>
      {settingsVisible && (
        <View style={styles.modal}>
          <Button title="Close" onPress={closeSettings} />
          <View style={styles.pickers}>
            <Text style={styles.text}>Grid Size</Text>
            <View style={styles.pickerContainer}>
              <Text style={styles.text}>Rows</Text>
              <Picker
                style={styles.picker}
                selectedValue={rows}
                onValueChange={onRowsChange}
              >
                {pickerValues.map((v) => (
                  <Picker.Item key={`row-${v}`} label={String(v)} value={v} />
                ))}
              </Picker>
            </View>
            <View style={styles.pickerContainer}>
              <Text style={styles.text}>Columns</Text>
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
          </View>
          <View style={styles.pickers}>
            <Text style={styles.text}>Game</Text>
            <View style={styles.pickerContainer}>
              <Picker
                style={styles.picker}
                selectedValue={selectedGame}
                onValueChange={(newSelectedGame: string) =>
                  setGame(games.find((g) => g.name === newSelectedGame)!)
                }
              >
                {games.map((game) => (
                  <Picker.Item
                    key={game.name}
                    label={game.name}
                    value={game.name}
                  />
                ))}
              </Picker>
            </View>
          </View>
        </View>
      )}
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
  pickers: {},
  pickerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  picker: {
    width: 200,
    backgroundColor: "white",
  },
  modal: {
    backgroundColor: "black",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
});
