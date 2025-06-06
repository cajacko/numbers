import * as Types from "@/game/Game.types";
import spawnTile from "@/game/utils/spawning/spawnTile";
import getColorsFromValue from "@/game/utils/getColorsFromValue";

function getTileAtPosition(
  tiles: Types.Tile[],
  position: Types.Position
): Types.Tile | null {
  return (
    tiles.find(
      (tile) =>
        tile.position[0] === position[0] && tile.position[1] === position[1]
    ) || null
  );
}

function editTile(
  tileId: Types.TileId,
  tile: Types.Tile,
  state: Types.GameState
): Types.GameState {
  const newTiles = state.tiles.map((t) =>
    t.id === tileId ? { ...t, ...tile } : t
  );

  return {
    ...state,
    tiles: newTiles,
  };
}

function removeTileAtPosition(
  state: Types.GameState,
  position: Types.Position
): Types.GameState {
  const tile = getTileAtPosition(state.tiles, position);

  if (!tile) {
    return state;
  }

  const newTiles = state.tiles.filter((t) => t.id !== tile.id);

  return {
    ...state,
    tiles: newTiles,
  };
}

const rand = () => 0;

export default function resolveEdit(action: Types.EditAction): Types.GameState {
  if (action.location.type === "exit-location") return action.state;

  const tile = getTileAtPosition(action.state.tiles, action.location.position);

  if (action.type === "edit-hold") {
    return removeTileAtPosition(action.state, action.location.position);
  }

  if (tile) {
    let tileValue: Types.Value;

    if (tile.value === null) {
      tileValue = 0;
    } else if (tile.value === 0) {
      tileValue = 1;
    } else {
      tileValue = tile.value + tile.value;
    }

    return editTile(
      tile.id,
      {
        ...tile,
        value: tileValue,
        ...getColorsFromValue(tileValue),
      },
      action.state
    );
  }

  const nextState = spawnTile({
    tile: {
      value: null,
      ...getColorsFromValue(null),
    },
    position: action.location.position,
    state: action.state,
    rand,
  });

  if (!nextState) {
    throw new Error("Failed to spawn tile at the specified position.");
  }

  return nextState;
}
