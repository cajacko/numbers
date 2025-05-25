import Grid from "@/components/game/grid/Grid";
import * as GameTypes from "@/game/Game.types";
import React from "react";
import { Button, View } from "react-native";
import { useGridSize } from "../Game.context";
import useGameController from "../hooks/useGameController";

export interface GridConnectedProps {}

// Multiplier for the number of tiles to create, to account for merges and animations where we have
// more tiles available spaces
const tileBufferMultiplier = 4;

export default React.memo(function GridConnected(
  props: GridConnectedProps
): React.ReactNode {
  const { rows, columns } = useGridSize();

  const { panGesture, reset } = useGameController();

  const tileIds = React.useMemo<GameTypes.TileId[]>(() => {
    return Array.from(
      { length: rows * columns * tileBufferMultiplier },
      (_, i): GameTypes.TileId => i
    );
  }, [rows, columns]);

  return (
    <>
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
