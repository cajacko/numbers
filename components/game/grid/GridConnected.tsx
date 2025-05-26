import Grid, { GridProps } from "@/components/game/grid/Grid";
import * as GameTypes from "@/game/Game.types";
import React from "react";
import { useGridSize } from "../Game.context";

export interface GridConnectedProps extends Pick<GridProps, "gesture"> {}

// Multiplier for the number of tiles to create, to account for merges and animations where we have
// more tiles available spaces
const tileBufferMultiplier = 4;

export default React.memo(function GridConnected(
  props: GridConnectedProps
): React.ReactNode {
  const { rows, columns } = useGridSize();

  const tileIds = React.useMemo<GameTypes.TileId[]>(() => {
    return Array.from(
      { length: rows * columns * tileBufferMultiplier },
      (_, i): GameTypes.TileId => i
    );
  }, [rows, columns]);

  return <Grid columns={columns} rows={rows} tileIds={tileIds} {...props} />;
});
