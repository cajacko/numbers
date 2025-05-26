import getGameStateDiffs from "../getGameStateDiffs";
import * as Types from "@/game/Game.types";

function createTile(id: number, row: number, column: number, value = 2): Types.Tile {
  return {
    id,
    position: [row, column],
    value,
    mergedFrom: null,
    backgroundColor: `bg-${value}`,
    textColor: `text-${value}`,
  };
}

describe("getGameStateDiffs", () => {
  test("detects spawned tile", () => {
    const prev: Types.GameState = { tiles: [], score: 0, state: "playing" };
    const tile = createTile(0, 0, 0, 2);
    const next: Types.GameState = { tiles: [tile], score: 0, state: "playing" };

    const diffs = getGameStateDiffs(prev, next);

    expect(diffs).toEqual([
      {
        type: "spawn",
        payload: {
          tileId: tile.id,
          position: tile.position,
          value: tile.value,
          backgroundColor: tile.backgroundColor,
          textColor: tile.textColor,
        },
      },
    ]);
  });

  test("detects moved tile", () => {
    const prevTile = createTile(0, 0, 0, 2);
    const prev: Types.GameState = { tiles: [prevTile], score: 0, state: "playing" };
    const movedTile = { ...prevTile, position: [0, 1] as Types.Position };
    const next: Types.GameState = { tiles: [movedTile], score: 0, state: "playing" };

    const diffs = getGameStateDiffs(prev, next);

    expect(diffs).toEqual([
      {
        type: "move",
        payload: {
          tileId: movedTile.id,
          fromPosition: prevTile.position,
          toPosition: movedTile.position,
        },
      },
    ]);
  });

  test("detects merged tile", () => {
    const tileA = createTile(0, 0, 0, 2);
    const tileB = createTile(1, 0, 1, 2);
    const prev: Types.GameState = {
      tiles: [tileA, tileB],
      score: 0,
      state: "playing",
    };
    const mergedTile: Types.Tile = {
      ...tileA,
      position: [0, 1],
      value: 4,
      mergedFrom: [tileA.id, tileB.id],
      backgroundColor: "bg-4",
      textColor: "text-4",
    };
    const next: Types.GameState = { tiles: [mergedTile], score: 0, state: "playing" };

    const diffs = getGameStateDiffs(prev, next);

    expect(diffs).toEqual([
      {
        type: "move",
        payload: {
          tileId: mergedTile.id,
          fromPosition: tileA.position,
          toPosition: mergedTile.position,
        },
      },
      {
        type: "merge",
        payload: {
          mergedToTileId: mergedTile.id,
          mergedFromTileIds: mergedTile.mergedFrom,
          newValue: mergedTile.value,
          prevValue: tileA.value,
          mergedToTileBackgroundColor: mergedTile.backgroundColor,
          mergedToTileTextColor: mergedTile.textColor,
        },
      },
    ]);
  });
});
