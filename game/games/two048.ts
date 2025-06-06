import * as Types from "@/game/Game.types";
import withRand from "@/utils/withRand";
import getLevelSettings from "@/game/utils/levels/getLevelSettings";
import getInitState from "@/game/utils/levels/getInitState";
import slideTiles from "@/game/utils/movement/slideTiles";
import applyExitLocations from "@/game/utils/exits/applyExitLocations";
import spawnRandomTile from "@/game/utils/spawning/spawnRandomTile";
import resolveEndState from "@/game/utils/resolveEndState";
import resolveTurn from "@/game/utils/resolveTurn";
import getColorsFromValue from "@/game/utils/tiles/getColorsFromValue";
import resolveSpawnPriorities from "@/game/utils/spawning/resolveSpawnPriorities";
import resolveEdit from "@/game/utils/resolveEdit";

const supportedActions: Types.RegularActionType[] = [
  "up",
  "down",
  "left",
  "right",
];

const applyAction: Types.ApplyAction = (action) => {
  switch (action.type) {
    case "init":
    case "reset": {
      const rand = withRand(action.seed);

      return getInitState({
        rand,
        seed: action.seed,
      });
    }
    case "edit-hold":
    case "edit-tap": {
      return resolveEdit(action);
    }
    default:
      break;
  }

  const { type, state } = action;

  if (!supportedActions.includes(type)) {
    return state;
  }

  const settings = getLevelSettings(state);

  const rand = withRand(`${state.seed}-${state.level}-${state.turn}`);

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
