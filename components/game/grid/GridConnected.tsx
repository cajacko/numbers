import Grid from "@/components/game/grid/Grid";
import * as GameTypes from "@/game/Game.types";
import React from "react";
import { Button, View } from "react-native";
import { useGridSize, useScore } from "../Game.context";
import useGameController from "../hooks/useGameController";
import Number from "@/components/game/Number";
import { useSharedValue } from "react-native-reanimated";

export interface GridConnectedProps {}

// Multiplier for the number of tiles to create, to account for merges and animations where we have
// more tiles available spaces
const tileBufferMultiplier = 4;

export default React.memo(function GridConnected(
  props: GridConnectedProps
): React.ReactNode {
  const { rows, columns } = useGridSize();
  const score = useScore();
  const scoreColor = useSharedValue<string | null>("white");

  const { panGesture, reset } = useGameController();

  const tileIds = React.useMemo<GameTypes.TileId[]>(() => {
    return Array.from(
      { length: rows * columns * tileBufferMultiplier },
      (_, i): GameTypes.TileId => i
    );
  }, [rows, columns]);

  return (
    <>
      <Number
        color={scoreColor}
        value={score}
        fontSize={20}
        style={{ marginBottom: 10 }}
        maxDigits={10}
      />
      <Grid
        columns={columns}
        rows={rows}
        gesture={panGesture}
        tileIds={tileIds}
      />
      {reset && (
        <View style={{ marginTop: 10 }}>
          <Button title="reset" onPress={reset} />
        </View>
      )}
    </>
  );
});
