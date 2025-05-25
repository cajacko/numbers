import * as Types from "@/game/Game.types";

function createTileMap(tiles: Types.Tile[]): Record<Types.TileId, Types.Tile> {
  const map: Record<Types.TileId, Types.Tile> = {};

  for (const tile of tiles) {
    map[tile.id] = tile;
  }

  return map;
}

export default function getGameStateDiffs(
  prevState: Types.GameState,
  nextState: Types.GameState
): Types.Diff[] {
  const diffs: Types.Diff[] = [];

  const prevTilesMap = createTileMap(prevState.tiles);
  const nextTilesMap = createTileMap(nextState.tiles);

  // Check for moved tiles
  for (const nextTile of nextState.tiles) {
    const prevTile = prevTilesMap[nextTile.id];

    if (prevTile && prevTile.position !== nextTile.position) {
      diffs.push({
        type: "move",
        payload: {
          tileId: nextTile.id,
          fromPosition: prevTile.position,
          toPosition: nextTile.position,
        },
      });
    }
  }

  // Check for merged tiles
  for (const nextTile of nextState.tiles) {
    const prevTile = prevTilesMap[nextTile.id];

    if (prevTile && prevTile.value !== nextTile.value) {
      const mergedFromTileIds = Object.keys(prevTilesMap)
        .filter((id) => prevTilesMap[parseInt(id)].value === nextTile.value / 2)
        .map((id) => parseInt(id));

      if (mergedFromTileIds.length > 0) {
        diffs.push({
          type: "merge",
          payload: {
            mergedToTileId: nextTile.id,
            mergedFromTileIds,
            newValue: nextTile.value,
            prevValue: prevTile.value,
          },
        });
      }
    }
  }

  // Check for spawned tiles
  for (const nextTile of nextState.tiles) {
    if (!prevTilesMap[nextTile.id]) {
      diffs.push({
        type: "spawn",
        payload: {
          tileId: nextTile.id,
          position: nextTile.position,
          value: nextTile.value,
        },
      });
    }
  }

  return diffs;
}
