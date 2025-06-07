import * as Types from "@/game/Game.types";
import withRand from "@/utils/withRand";
import getLevelSettings from "@/game/utils/getLevelSettings";
import getInitState from "@/game/utils/getInitState";
import slideTiles from "@/game/utils/slideTiles";
import applyExitLocations from "@/game/utils/applyExitLocations";
import spawnRandomTile from "@/game/utils/spawning/spawnRandomTile";
import resolveEndState from "@/game/utils/resolveEndState";
import resolveTurn from "@/game/utils/resolveTurn";
import getColorsFromValue from "@/game/utils/getColorsFromValue";
import resolveSpawnPriorities from "@/game/utils/spawning/resolveSpawnPriorities";
import resolveEdit from "@/game/utils/resolveEdit";
import resolveEditLevelSettings from "@/game/utils/resolveEditLevelSettings";
import resolveNewLevel from "@/game/utils/resolveNewLevel";

const supportedActions: Types.RegularActionType[] = [
  "up",
  "down",
  "left",
  "right",
];

function createLevelTurnSeed(state: {
  seed: string;
  level: number;
  turn: number;
}): string {
  return `${state.seed}-${state.level}-${state.turn}`;
}

const applyAction: Types.ApplyAction = (action) => {
  // console.log("applyAction", action);

  switch (action.type) {
    case "init": {
      const rand = withRand(
        createLevelTurnSeed({
          seed: action.seed,
          level: 0,
          turn: 0,
        })
      );

      return getInitState({
        rand,
        seed: action.seed,
      });
    }
    case "reset-game":
    case "regenerate-level":
    case "reset-level": {
      const level = action.type === "reset-game" ? 1 : action.state.level;
      const seed =
        action.type === "regenerate-level" ? action.seed : action.state.seed;

      const rand = withRand(createLevelTurnSeed({ level, turn: 1, seed }));

      return resolveNewLevel({
        // TODO: How to get previously exited tiles for reset?
        exitedTiles: [],
        rand,
        state: action.state,
        level,
        seed,
      });
    }

    case "edit-hold":
    case "edit-tap": {
      return resolveEdit(action);
    }
    case "edit-level-settings":
      return resolveEditLevelSettings(action);
    default:
      break;
  }

  const { type, state } = action;

  if (!supportedActions.includes(type)) {
    return state;
  }

  const settings = getLevelSettings(state);

  const rand = withRand(createLevelTurnSeed(state));

  let nextState: Types.GameState = {
    ...state,
  };

  const gridSize: Types.GridSize = settings.gridSize;

  const { tiles, scoreIncrease, changed } = slideTiles(
    nextState.tiles,
    type,
    gridSize
  );

  nextState = {
    ...nextState,
    tiles,
    score: state.score + scoreIncrease,
  };

  const exitResult = applyExitLocations(nextState, gridSize, type);
  const overallChanged = changed || exitResult.changed;

  nextState = spawnRandomTile(nextState, rand, overallChanged);
  nextState = resolveSpawnPriorities(nextState, rand);
  nextState = resolveEndState(nextState, rand);
  nextState = resolveTurn(nextState, overallChanged);

  return nextState;
};

const gameConfig: Types.GameConfig = {
  supportedActions,
  name: "2048",
  applyAction,
};

export { getColorsFromValue };
export default gameConfig;
