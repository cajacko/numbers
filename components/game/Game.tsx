import {
  GameProvider,
  useScore,
  useGameState,
} from "@/components/game/Game.context";
import GridConnected from "@/components/game/grid/GridConnected";
import React from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import useGameController from "./hooks/useGameController";
import Number from "@/components/game/Number";
import { useSharedValue } from "react-native-reanimated";

export interface GameProps {}

function ConnectedGame(props: GameProps): React.ReactNode {
  const score = useScore();
  const scoreColor = useSharedValue<string | null>("white");
  const gameState = useGameState();
  const { panGesture, reset } = useGameController();

  return (
    <>
      <View style={styles.meta}>
        <Number color={scoreColor} value={score} fontSize={20} maxDigits={10} />
        {gameState !== "playing" && (
          <Text style={styles.text}>
            {gameState === "won" ? "You Won!" : "You Lost!"}
          </Text>
        )}
      </View>
      <GridConnected gesture={panGesture} />
      {reset && (
        <View style={styles.reset}>
          <Button title="reset" onPress={reset} />
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
  meta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  text: {
    fontSize: 20,
    color: "white",
    marginLeft: 10,
  },
  reset: {
    marginTop: 10,
  },
});
