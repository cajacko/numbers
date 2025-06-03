import * as Types from "@/game/Game.types";
import generateExitLocations from "./generateExitLocations";

export default function getLevels(rand: Types.Rand): Types.Settings[] {
  return [
    {
      goals: generateExitLocations(rand, { rows: 4, columns: 4 }, 16),
      gridSize: { rows: 4, columns: 4 },
    },
    {
      goals: generateExitLocations(rand, { rows: 4, columns: 4 }, 32),
      gridSize: { rows: 4, columns: 4 },
      permZeroTileCount: 1,
    },
    {
      goals: generateExitLocations(rand, { rows: 4, columns: 4 }, 64),
      gridSize: { rows: 4, columns: 4 },
      permZeroTileCount: 2,
    },
    {
      goals: generateExitLocations(rand, { rows: 4, columns: 4 }, 128),
      gridSize: { rows: 4, columns: 4 },
      randomFixedTiles: 1,
    },
    {
      goals: generateExitLocations(rand, { rows: 4, columns: 4 }, 256),
      gridSize: { rows: 5, columns: 4 },
      randomFixedTiles: 2,
    },
    {
      goals: generateExitLocations(rand, { rows: 4, columns: 4 }, 512),
      gridSize: { rows: 5, columns: 4 },
      permZeroTileCount: 1,
      randomFixedTiles: 1,
    },
    {
      goals: generateExitLocations(rand, { rows: 4, columns: 4 }, 1024),
      gridSize: { rows: 5, columns: 4 },
      permZeroTileCount: 2,
      randomFixedTiles: 1,
    },
    {
      goals: generateExitLocations(rand, { rows: 4, columns: 4 }, 2048),
      gridSize: { rows: 6, columns: 4 },
      permZeroTileCount: 2,
      randomFixedTiles: 2,
    },
  ];
}
