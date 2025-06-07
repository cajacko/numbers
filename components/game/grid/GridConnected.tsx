import Grid, {
  GridProps,
  useGridDimensions,
} from "@/components/game/grid/Grid";
import * as GameTypes from "@/game/Game.types";
import React from "react";
import { useGameContext } from "../Game.context";
import useGameController from "@/components/game/hooks/useGameController";

export interface GridConnectedProps
  extends Pick<GridProps, "availableHeight" | "availableWidth"> {
  editMode?: boolean;
}

// Multiplier for the number of tiles to create, to account for merges and animations where we have
// more tiles available spaces
const tileBufferMultiplier = 4;

export default React.memo(function GridConnected({
  editMode,
  ...props
}: GridConnectedProps): React.ReactNode {
  const {
    levelSettings: {
      gridSize: { columns, rows },
    },
    exitLocations,
  } = useGameContext();

  const gridDimensions = useGridDimensions({
    ...props,
    columns,
    rows,
  });

  const { gesture } = useGameController({
    editMode: !!editMode,
    gridPadding: gridDimensions.gridPadding,
    tileSize: gridDimensions.tileSizeSharedValue,
  });

  const tileIds = React.useMemo<GameTypes.TileId[]>(() => {
    return Array.from(
      { length: rows * columns * tileBufferMultiplier },
      (_, i): GameTypes.TileId => i
    );
  }, [rows, columns]);

  const overlayTileIds = tileIds;

  return (
    <Grid
      columns={columns}
      rows={rows}
      tileIds={tileIds}
      overlayTileIds={overlayTileIds}
      exitLocations={exitLocations}
      gesture={gesture}
      {...gridDimensions}
      {...props}
    />
  );
});
