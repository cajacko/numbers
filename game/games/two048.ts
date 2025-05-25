import * as Types from "@/game/Game.types";
import spawnTile from "@/game/utils/spawnTile";

const getInitState: Types.GetInitState = ({ rand, gridSize }) => {
  let state: Types.GameState | null = {
    tiles: [],
    score: 0,
    state: "playing",
  };

  state = spawnTile({
    gridSize,
    rand,
    state,
    tile: {
      value: 2,
    },
  });

  if (!state) {
    throw new Error("No available position to place a new tile.");
  }

  state = spawnTile({
    gridSize,
    rand,
    state,
    tile: {
      value: 2,
    },
  });

  if (!state) {
    throw new Error("No available position to place a new tile.");
  }

  return state;
};

const applyMove: Types.ApplyMove = ({ state, direction, gridSize, rand }) => {
  let nextState: Types.GameState | null = {
    tiles: state.tiles.map((tile): Types.Tile => {
      switch (direction) {
        case "up":
          return {
            ...tile,
            position: [Math.max(tile.position[0] - 1, 0), tile.position[1]],
          };
        case "down":
          return {
            ...tile,
            position: [
              Math.min(tile.position[0] + 1, gridSize.rows - 1),
              tile.position[1],
            ],
          };
        case "left":
          return {
            ...tile,
            position: [tile.position[0], Math.max(tile.position[1] - 1, 0)],
          };
        case "right":
          return {
            ...tile,
            position: [
              tile.position[0],
              Math.min(tile.position[1] + 1, gridSize.columns - 1),
            ],
          };
      }
    }),
    score: 0,
    state: "playing",
  };

  nextState = spawnTile({
    gridSize,
    rand,
    state: nextState,
    tile: {
      value: 2,
    },
  });

  if (!nextState) {
    return {
      ...state,
      state: "lost",
    };
  }

  return nextState;
};

const gameConfig: Types.GameConfig = {
  name: "2048",
  getInitState,
  applyMove,
  defaultGridSize: {
    rows: 4,
    columns: 4,
  },
};

export default gameConfig;
