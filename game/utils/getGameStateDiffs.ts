import * as Types from "@/game/Game.types";
import createTileMap from "@/game/utils/createTileMap";
import isEqual from "lodash/isEqual";

export default function getGameStateDiffs(
  prevState: Types.GameState,
  nextState: Types.GameState
): Types.Diff[] {
  const diffs: Types.Diff[] = [];

  const prevTilesMap = createTileMap(prevState.tiles);

  // Check for moved tiles
  for (const nextTile of nextState.tiles) {
    const prevTile = prevTilesMap[nextTile.id];

    if (prevTile && !isEqual(prevTile.position, nextTile.position)) {
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

    if (nextTile.mergedFrom && nextTile.mergedFrom.length > 0) {
      diffs.push({
        type: "merge",
        payload: {
          mergedToTileId: nextTile.id,
          mergedFromTileIds: nextTile.mergedFrom,
          newValue: nextTile.value,
          prevValue: prevTile.value,
          mergedToTileBackgroundColor: nextTile.backgroundColor,
          mergedToTileTextColor: nextTile.textColor,
        },
      });
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
          backgroundColor: nextTile.backgroundColor,
          textColor: nextTile.textColor,
        },
      });
    }
  }

  return diffs;
}
