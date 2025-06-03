import * as Types from "@/game/Game.types";
import withRand from "@/utils/withRand";
import getLevelSettings from "@/game/utils/getLevelSettings";
import getInitState from "@/game/utils/getInitState";
import slideTiles from "@/game/utils/slideTiles";
import applyExitLocations from "@/game/utils/applyExitLocations";
import spawnRandomTile from "@/game/utils/spawnRandomTile";
import resolveEndState from "@/game/utils/resolveEndState";
import resolveTurn from "@/game/utils/resolveTurn";
import getColorsFromValue from "@/game/utils/getColorsFromValue";

const supportedActions: Types.Action[] = ["up", "down", "left", "right"];

const applyAction: Types.ApplyAction = (props) => {
  if (!props.action) {
    const rand = withRand(props.seed);

    return getInitState({
      rand,
      seed: props.seed,
    });
  }

  const { state, action } = props;

  if (!supportedActions.includes(action)) {
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
    action,
    gridSize
  );

  nextState = {
    ...nextState,
    tiles,
    score: state.score + scoreIncrease,
  };

  const exitResult = applyExitLocations(nextState, gridSize, action);
  const overallChanged = changed || exitResult.changed;

  nextState = spawnRandomTile(nextState, rand, overallChanged);
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
