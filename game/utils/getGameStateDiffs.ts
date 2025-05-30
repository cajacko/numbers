import * as Types from "@/game/Game.types";
import createTileMap from "@/game/utils/createTileMap";
import isEqual from "lodash/isEqual";

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

  // Check for merged tiles (only if mergedFrom changed from prev to next)
  for (const nextTile of nextState.tiles) {
    const prevTile = prevTilesMap[nextTile.id];

    const prevMergedFrom = prevTile?.mergedFrom ?? [];
    const nextMergedFrom = nextTile.mergedFrom ?? [];

    // Only emit a merge diff if mergedFrom is non-empty and has changed from prev to next
    if (nextMergedFrom.length > 0 && !isEqual(prevMergedFrom, nextMergedFrom)) {
      diffs.push({
        type: "merge",
        payload: {
          mergedToTileId: nextTile.id,
          mergedFromTileIds: nextTile.mergedFrom!,
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

  // Check for removed tiles (not merged)
  // A tile is removed if it was in prev but not in next, and it is NOT part of a merge (i.e., not in any mergedFrom array)
  const mergedFromTileIds = new Set<number>();
  for (const nextTile of nextState.tiles) {
    if (nextTile.mergedFrom && nextTile.mergedFrom.length > 0) {
      for (const id of nextTile.mergedFrom) {
        mergedFromTileIds.add(id);
      }
    }
  }
  for (const prevTile of prevState.tiles) {
    if (!nextTilesMap[prevTile.id] && !mergedFromTileIds.has(prevTile.id)) {
      diffs.push({
        type: "remove",
        payload: {
          tileId: prevTile.id,
        },
      });
    }
  }

  // Check for value changes (not due to merge or move)
  for (const nextTile of nextState.tiles) {
    const prevTile = prevTilesMap[nextTile.id];
    if (
      prevTile &&
      prevTile.value !== nextTile.value &&
      isEqual(prevTile.position, nextTile.position) &&
      (!nextTile.mergedFrom || nextTile.mergedFrom.length === 0)
    ) {
      diffs.push({
        type: "value-change",
        payload: {
          tileId: nextTile.id,
          prevValue: prevTile.value,
          newValue: nextTile.value,
        },
      });
    }
  }

  return diffs;
}
