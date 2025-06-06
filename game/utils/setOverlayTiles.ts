import * as Types from "../Game.types";
import getLevelSettings from "@/game/utils/levels/getLevelSettings";

/**
 * For the grid size at this level, it will loop over every position and call the callback function.
 * The callback function should return a new overlay tile or null if there shouldn't be an overlay
 * tile at that position.
 *
 * We return the final state with the updated overlay tiles.
 */
export default function setOverlayTiles(
  state: Types.GameState,
  callback: (
    position: Types.Position,
    overlayTile: Types.OverlayTile,
    i: number
  ) => Types.OverlayTile | null
): Types.GameState {
  const levelSettings = getLevelSettings(state);
  const { columns, rows } = levelSettings.gridSize;

  const newOverlayTiles: Types.OverlayTile[] = [];
  let overlayTileId = 0;
  let i = 0;

  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      const position: Types.Position = [row, column];

      const existingOverlayTile = state.overlayTiles.find(
        (tile) => tile.position[0] === row && tile.position[1] === column
      ) || {
        position,
        id: overlayTileId,
        icons: [],
      };

      const newOverlayTile = callback(position, existingOverlayTile, i);

      if (newOverlayTile && newOverlayTile.icons.length > 0) {
        newOverlayTiles.push(newOverlayTile);
      }

      i++;
      overlayTileId += 1;
    }
  }

  return {
    ...state,
    overlayTiles: newOverlayTiles,
  };
}
