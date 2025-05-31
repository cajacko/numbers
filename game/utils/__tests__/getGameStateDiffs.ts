import getGameStateDiffs from "../getGameStateDiffs";
import * as Types from "@/game/Game.types";

const settings: Types.Settings = {
  newTileValue: 2,
  zeroTiles: false,
  permZeroTileCount: 0,
  randomFixedTiles: null,
};

function createTile(
  id: number,
  row: number,
  column: number,
  value = 2
): Types.Tile {
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
    const prev: Types.GameState = {
      tiles: [],
      score: 0,
      status: "user-turn",
      settings,
      exitLocations: [],
    };
    const tile = createTile(0, 0, 0, 2);
    const next: Types.GameState = {
      tiles: [tile],
      score: 0,
      status: "user-turn",
      settings,
      exitLocations: [],
    };

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
    const prev: Types.GameState = {
      tiles: [prevTile],
      score: 0,
      status: "user-turn",
      settings,
      exitLocations: [],
    };
    const movedTile = { ...prevTile, position: [0, 1] as Types.Position };
    const next: Types.GameState = {
      tiles: [movedTile],
      score: 0,
      status: "user-turn",
      settings,
      exitLocations: [],
    };

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
      status: "user-turn",
      settings,
      exitLocations: [],
    };
    const mergedTile: Types.Tile = {
      ...tileA,
      position: [0, 1],
      value: 4,
      mergedFrom: [tileA.id, tileB.id],
      backgroundColor: "bg-4",
      textColor: "text-4",
    };
    const next: Types.GameState = {
      tiles: [mergedTile],
      score: 0,
      status: "user-turn",
      settings,
      exitLocations: [],
    };

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

  test("detects removed tile (not merged)", () => {
    const tileA = createTile(0, 0, 0, 2);
    const tileB = createTile(1, 0, 1, 2);
    const prev: Types.GameState = {
      tiles: [tileA, tileB],
      score: 0,
      status: "user-turn",
      settings,
      exitLocations: [],
    };
    // tileB is removed, tileA remains unchanged
    const next: Types.GameState = {
      tiles: [tileA],
      score: 0,
      status: "user-turn",
      settings,
      exitLocations: [],
    };

    const diffs = getGameStateDiffs(prev, next);

    expect(diffs).toContainEqual({
      type: "remove",
      payload: {
        tileId: tileB.id,
      },
    });
    // Should not contain a merge diff
    expect(diffs.find((d) => d.type === "merge")).toBeUndefined();
  });

  test("does not return remove diff for merged tiles (only merge diff)", () => {
    const tileA = createTile(0, 0, 0, 2);
    const tileB = createTile(1, 0, 1, 2);
    const prev: Types.GameState = {
      tiles: [tileA, tileB],
      score: 0,
      status: "user-turn",
      settings,
      exitLocations: [],
    };
    const mergedTile: Types.Tile = {
      ...tileA,
      position: [0, 1],
      value: 4,
      mergedFrom: [tileA.id, tileB.id],
      backgroundColor: "bg-4",
      textColor: "text-4",
    };
    const next: Types.GameState = {
      tiles: [mergedTile],
      score: 0,
      status: "user-turn",
      settings,
      exitLocations: [],
    };

    const diffs = getGameStateDiffs(prev, next);

    // Should contain only move and merge, not remove
    expect(diffs.find((d) => d.type === "remove")).toBeUndefined();
    expect(diffs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "move" }),
        expect.objectContaining({ type: "merge" }),
      ])
    );
  });

  test("detects value change (no move, no merge)", () => {
    const prevTile = createTile(0, 0, 0, 2);
    const prev: Types.GameState = {
      tiles: [prevTile],
      score: 0,
      status: "user-turn",
      settings,
      exitLocations: [],
    };
    // Only the value changes, position and id stay the same, no merge
    const changedTile = { ...prevTile, value: 4 };
    const next: Types.GameState = {
      tiles: [changedTile],
      score: 0,
      status: "user-turn",
      settings,
      exitLocations: [],
    };

    const diffs = getGameStateDiffs(prev, next);

    expect(diffs).toContainEqual({
      type: "value-change",
      payload: {
        tileId: changedTile.id,
        prevValue: prevTile.value,
        newValue: changedTile.value,
      },
    });
    // Should not contain move or merge
    expect(diffs.find((d) => d.type === "move")).toBeUndefined();
    expect(diffs.find((d) => d.type === "merge")).toBeUndefined();
  });

  test("does not return value-change if value changed due to merge", () => {
    const tileA = createTile(0, 0, 0, 2);
    const tileB = createTile(1, 0, 1, 2);
    const prev: Types.GameState = {
      tiles: [tileA, tileB],
      score: 0,
      status: "user-turn",
      settings,
      exitLocations: [],
    };
    const mergedTile: Types.Tile = {
      ...tileA,
      position: [0, 1],
      value: 4,
      mergedFrom: [tileA.id, tileB.id],
      backgroundColor: "bg-4",
      textColor: "text-4",
    };
    const next: Types.GameState = {
      tiles: [mergedTile],
      score: 0,
      status: "user-turn",
      settings,
      exitLocations: [],
    };

    const diffs = getGameStateDiffs(prev, next);

    // Should not contain value-change, only move and merge
    expect(diffs.find((d) => d.type === "value-change")).toBeUndefined();
    expect(diffs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "move" }),
        expect.objectContaining({ type: "merge" }),
      ])
    );
  });

  test("does not return merge diff if mergedFrom did not change (should only return move)", () => {
    // Simulate a tile that already had mergedFrom in prev, and in next it just moves but mergedFrom is unchanged
    const prevTile: Types.Tile = {
      id: 0,
      position: [0, 0],
      value: 4,
      mergedFrom: [1, 2],
      backgroundColor: "bg-4",
      textColor: "text-4",
    };
    const nextTile: Types.Tile = {
      ...prevTile,
      position: [0, 1], // moved
      // mergedFrom is the same as before
    };
    const prev: Types.GameState = {
      tiles: [prevTile],
      score: 0,
      status: "user-turn",
      settings,
      exitLocations: [],
    };
    const next: Types.GameState = {
      tiles: [nextTile],
      score: 0,
      status: "user-turn",
      settings,
      exitLocations: [],
    };

    const diffs = getGameStateDiffs(prev, next);

    // Should only return move, not merge
    expect(diffs).toEqual([
      {
        type: "move",
        payload: {
          tileId: nextTile.id,
          fromPosition: prevTile.position,
          toPosition: nextTile.position,
        },
      },
    ]);
    expect(diffs.find((d) => d.type === "merge")).toBeUndefined();
  });
});
