import { GameProvider, useGameContext } from "@/components/game/Game.context";
import GridConnected from "@/components/game/grid/GridConnected";
import React from "react";
import { Button, Dimensions, StyleSheet, Text, View } from "react-native";
import Number from "@/components/game/Number";
import { useSharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SettingsModal from "@/components/game/settings/SettingsModal";
import { loadGameState } from "@/utils/gameStateStorage";
import * as GameTypes from "@/game/Game.types";

function ConnectedGame(): React.ReactNode {
  const [editMode, setEditMode] = React.useState(false);
  const { score, status, level } = useGameContext();
  const scoreColor = useSharedValue<string | null>("white");
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
        styles.footer,
        {
          height: footerHeight,
        },
      ]),
    [footerHeight]
  );

  const [settingsModalVisible, setSettingsModalVisible] = React.useState(false);
  const openSettings = React.useCallback(() => {
    setSettingsModalVisible(true);
  }, []);

  const closeSettings = React.useCallback(() => {
    setSettingsModalVisible(false);
  }, []);

  return (
    <>
      <SettingsModal
        visible={settingsModalVisible}
        onRequestClose={closeSettings}
      />
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
          availableHeight={availableSize.height}
          availableWidth={availableSize.width}
          editMode={editMode}
        />

        <View style={footerStyle}>
          <View style={styles.reset}>
            <Button
              title={editMode ? "Switch to Play" : "Switch to Edit"}
              onPress={() => setEditMode(!editMode)}
            />
          </View>
          <View style={styles.reset}>
            <Button title="Settings" onPress={openSettings} />
          </View>
        </View>
      </View>
    </>
  );
}

export default function Game(): React.ReactNode {
  const [initialState, setInitialState] = React.useState<
    GameTypes.GameState | null | undefined
  >(undefined);

  React.useEffect(() => {
    loadGameState().then((state) => {
      setInitialState(state);
    });
  }, []);

  if (initialState === undefined) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Loading...</Text>
      </View>
    );
  }

  return (
    <GameProvider initialState={initialState ?? undefined}>
      <ConnectedGame />
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
    flexWrap: "wrap",
  },
  reset: {
    marginHorizontal: 10,
  },
});
