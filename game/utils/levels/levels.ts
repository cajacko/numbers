import * as Types from "@/game/Game.types";

const spawnTilesMethod: Types.SpawnTilesMethod = {
  type: "random",
};

const settings: Types.Settings[] = [
  {
    goals: [
      {
        type: "random-exit-location",
        payload: {
          type: "greater-than-equal-to",
          value: 16,
        },
      },
    ],
    gridSize: { rows: 4, columns: 4 },
    spawnTilesMethod,
  },
  {
    goals: [
      {
        type: "random-exit-location",
        payload: {
          type: "greater-than-equal-to",
          value: 32,
        },
      },
    ],
    gridSize: { rows: 4, columns: 4 },
    permZeroTileCount: 1,
    spawnTilesMethod,
  },
  {
    goals: [
      {
        type: "random-exit-location",
        payload: {
          type: "greater-than-equal-to",
          value: 64,
        },
      },
    ],
    gridSize: { rows: 4, columns: 4 },
    permZeroTileCount: 2,
    spawnTilesMethod,
  },
  {
    goals: [
      {
        type: "random-exit-location",
        payload: {
          type: "greater-than-equal-to",
          value: 128,
        },
      },
    ],
    gridSize: { rows: 4, columns: 4 },
    randomFixedTiles: 1,
    spawnTilesMethod,
  },
  {
    goals: [
      {
        type: "random-exit-location",
        payload: {
          type: "greater-than-equal-to",
          value: 256,
        },
      },
    ],
    gridSize: { rows: 5, columns: 4 },
    randomFixedTiles: 2,
    spawnTilesMethod,
  },
  {
    goals: [
      {
        type: "random-exit-location",
        payload: {
          type: "greater-than-equal-to",
          value: 512,
        },
      },
    ],
    gridSize: { rows: 5, columns: 4 },
    permZeroTileCount: 1,
    randomFixedTiles: 1,
    spawnTilesMethod,
  },
  {
    goals: [
      {
        type: "random-exit-location",
        payload: {
          type: "greater-than-equal-to",
          value: 1024,
        },
      },
    ],
    gridSize: { rows: 5, columns: 4 },
    permZeroTileCount: 2,
    randomFixedTiles: 1,
    spawnTilesMethod,
  },
  {
    goals: [
      {
        type: "random-exit-location",
        payload: {
          type: "greater-than-equal-to",
          value: 2048,
        },
      },
    ],
    gridSize: { rows: 6, columns: 4 },
    permZeroTileCount: 2,
    randomFixedTiles: 2,
    spawnTilesMethod,
  },
];

export default settings;
