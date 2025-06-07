import React from "react";
import {
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
  Button,
  Text,
  ScrollView,
} from "react-native";
import { useGameContext } from "@/components/game/context";
import * as GameTypes from "@/game/Game.types";
import * as Clipboard from "expo-clipboard";

export interface SettingsModalProps {
  style?: StyleProp<ViewStyle>;
  visible?: boolean;
  onRequestClose?: () => void;
}

function NumberControlField({
  label,
  value,
  onIncrement,
  onDecrement,
}: {
  label: string;
  value: string | number;
  onIncrement: () => void;
  onDecrement: () => void;
}) {
  return (
    <View style={styles.gridSizeItem}>
      <Text style={styles.text}>{label}</Text>
      <View style={styles.gridSizeControl}>
        <Button title="-" onPress={onDecrement} />
        <Text style={styles.text}>{value}</Text>
        <Button title="+" onPress={onIncrement} />
      </View>
    </View>
  );
}

export default function SettingsModal(
  props: SettingsModalProps
): React.ReactNode {
  const style = React.useMemo(
    () => [styles.container, props.style],
    [props.style]
  );

  const { levelSettings, handleAction, level, reset, getTestProps } =
    useGameContext();

  const withUpdateSettings = React.useCallback(
    (settings: Partial<GameTypes.Settings>) => {
      return () => {
        handleAction({
          type: "edit-level-settings",
          level,
          settings,
        });
      };
    },
    [handleAction, level]
  );

  const copyTestProps = React.useCallback(async () => {
    const testProps = getTestProps();

    const string = JSON.stringify(testProps, null, 2);

    console.log("Test Props:", string);

    await Clipboard.setStringAsync(string);
  }, [getTestProps]);

  if (!props.visible) {
    return null;
  }

  return (
    <ScrollView style={style} contentContainerStyle={styles.containerStyle}>
      <View style={styles.content}>
        <View style={styles.close}>
          <Button title="Close" onPress={props.onRequestClose} />
        </View>
        <NumberControlField
          label="Rows"
          value={levelSettings.gridSize.rows}
          onIncrement={withUpdateSettings({
            gridSize: {
              ...levelSettings.gridSize,
              rows: levelSettings.gridSize.rows + 1,
            },
          })}
          onDecrement={withUpdateSettings({
            gridSize: {
              ...levelSettings.gridSize,
              rows: Math.max(1, levelSettings.gridSize.rows - 1),
            },
          })}
        />
        <NumberControlField
          label="Columns"
          value={levelSettings.gridSize.columns}
          onIncrement={withUpdateSettings({
            gridSize: {
              ...levelSettings.gridSize,
              columns: levelSettings.gridSize.columns + 1,
            },
          })}
          onDecrement={withUpdateSettings({
            gridSize: {
              ...levelSettings.gridSize,
              columns: Math.max(1, levelSettings.gridSize.columns - 1),
            },
          })}
        />
        <NumberControlField
          label="Perm Zero Tile Count"
          value={String(levelSettings.permZeroTileCount)}
          onIncrement={withUpdateSettings({
            permZeroTileCount:
              typeof levelSettings.permZeroTileCount !== "number"
                ? 1
                : levelSettings.permZeroTileCount + 1,
          })}
          onDecrement={withUpdateSettings({
            permZeroTileCount:
              typeof levelSettings.permZeroTileCount !== "number"
                ? 0
                : levelSettings.permZeroTileCount === 0
                ? null
                : Math.max(0, levelSettings.permZeroTileCount - 1),
          })}
        />
        <NumberControlField
          label="Random Fixed Tiles"
          value={String(levelSettings.randomFixedTiles)}
          onIncrement={withUpdateSettings({
            randomFixedTiles:
              typeof levelSettings.randomFixedTiles !== "number"
                ? 1
                : levelSettings.randomFixedTiles + 1,
          })}
          onDecrement={withUpdateSettings({
            randomFixedTiles:
              typeof levelSettings.randomFixedTiles !== "number"
                ? 0
                : levelSettings.randomFixedTiles === 0
                ? null
                : Math.max(0, levelSettings.randomFixedTiles - 1),
          })}
        />
        <NumberControlField
          label="New Tile Value"
          value={String(levelSettings.newTileValue)}
          onIncrement={withUpdateSettings({
            newTileValue:
              typeof levelSettings.newTileValue !== "number"
                ? 1
                : levelSettings.newTileValue * 2,
          })}
          onDecrement={withUpdateSettings({
            newTileValue:
              typeof levelSettings.newTileValue !== "number"
                ? 0
                : levelSettings.newTileValue === 0
                ? undefined
                : Math.max(0, levelSettings.newTileValue / 2),
          })}
        />
        <NumberControlField
          label="Tile Value Goal"
          value="null"
          onIncrement={() => {}}
          onDecrement={() => {}}
        />
        <NumberControlField
          label="Exit Location Goal"
          value={16}
          onIncrement={() => {}}
          onDecrement={() => {}}
        />
        <NumberControlField
          label="Spawn Tiles Method"
          value={String(levelSettings.spawnTilesMethod?.type ?? null)}
          onIncrement={() => {}}
          onDecrement={() => {}}
        />
        <View style={styles.button}>
          <Button title="Regenerate Game" onPress={() => reset("init")} />
        </View>
        <View style={styles.button}>
          <Button title="Reset Game" onPress={() => reset("reset-game")} />
        </View>
        <View style={styles.button}>
          <Button
            title="Regenerate Level"
            onPress={() => reset("regenerate-level")}
          />
        </View>
        <View style={styles.button}>
          <Button title="Reset Level" onPress={() => reset("reset-level")} />
        </View>
        <View style={styles.button}>
          <Button title="Copy Test Props" onPress={copyTestProps} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
  },
  containerStyle: {
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100%",
  },
  content: {
    maxWidth: 500,
    width: "100%",
    padding: 20,
  },
  text: {
    color: "white",
    fontSize: 16,
    marginBottom: 10,
  },
  gridSizeItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  gridSizeControl: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: 200,
  },
  close: {
    alignItems: "flex-end",
    marginBottom: 20,
  },
  button: {
    marginTop: 10,
  },
});
