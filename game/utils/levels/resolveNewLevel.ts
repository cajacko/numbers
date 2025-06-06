import * as Types from "@/game/Game.types";
import getLevelSettings from "./getLevelSettings";
import spawnTiles from "../spawning/spawnTiles";
import exitedTileToNewTilePosition from "../exitedTileToNewTilePosition";
import { DEFAULT_NEW_TILE_VALUE } from "../two048Constants";
import resolveSpawnPriorities from "../spawning/resolveSpawnPriorities";
import { generateExitLocation } from "../exits/generateExitLocations";

export default function resolveNewLevel({
  exitedTiles,
  rand,
  state,
  level,
}: {
  state: Types.GameState;
  rand: Types.Rand;
  exitedTiles: Types.Tile[];
  level: number;
}): Types.GameState {
  let nextState: Types.GameState = {
    seed: state.seed,
    tiles: [],
    score: state.score,
    status: "user-turn",
    level,
    levelSettings: state.levelSettings.map((settings, i) => {
      if (level !== i + 1) {
        return settings;
      }

      return {
        ...settings,
        goals: settings.goals.map((goal) => {
          if (goal.type === "random-exit-location") {
            return generateExitLocation(
              rand,
              settings.gridSize,
              goal.payload.value
            );
          }

          return goal;
        }),
      };
    }),
    turn: 1,
    overlayTiles: state.overlayTiles,
  };

  nextState = resolveSpawnPriorities(nextState, rand);

  const settings = getLevelSettings(nextState);

  const tiles = exitedTiles.map((tile) => ({
    ...tile,
    mergedFrom: null,
    position: exitedTileToNewTilePosition(tile, settings.gridSize),
  }));

  nextState.tiles = tiles;

  if (settings.randomFixedTiles) {
    nextState = spawnTiles({
      state: nextState,
      rand,
      count: settings.randomFixedTiles,
      value: null,
    });
  }

  if (settings.permZeroTileCount) {
    nextState = spawnTiles({
      state: nextState,
      rand,
      count: settings.permZeroTileCount,
      value: 0,
    });
  }

  nextState = spawnTiles({
    state: nextState,
    rand,
    count: 2,
    value: settings.newTileValue ?? DEFAULT_NEW_TILE_VALUE,
  });

  return nextState;
}
