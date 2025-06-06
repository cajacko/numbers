import * as Types from "@/game/Game.types";
import spawnTile from "@/game/utils/spawning/spawnTile";
import getColorsFromValue from "@/game/utils/getColorsFromValue";
import getLevelSettings from "@/game/utils/getLevelSettings";

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

function getExitAtPosition(
  goals: Types.Goal[],
  position: Omit<Types.ExitLocation, "requirements">
): Types.ExitLocation | null {
  let exitLocation: Types.ExitLocation | null = null;

  goals.forEach((goal) => {
    if (goal.type === "exit-location") {
      if (
        goal.payload.side === position.side &&
        goal.payload.index === position.index
      ) {
        exitLocation = goal.payload;
      }
    }
  });

  return exitLocation;
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
  const newTiles = state.tiles.filter(
    (t) => t.position[0] !== position[0] || t.position[1] !== position[1]
  );

  return {
    ...state,
    tiles: newTiles,
  };
}

const rand = () => 0;

function resolveEditTile(
  action: Types.EditAction<Types.EditTileLocation>
): Types.GameState {
  if (action.type === "edit-hold") {
    return removeTileAtPosition(action.state, action.location.position);
  }

  const tile = getTileAtPosition(action.state.tiles, action.location.position);

  if (tile) {
    let tileValue: Types.Value;

    if (tile.value === null) {
      tileValue = 0;
    } else if (tile.value === 0) {
      tileValue = 1;
    } else {
      tileValue = tile.value * 2;
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

function removeExitAtPosition(
  state: Types.GameState,
  exitPosition: Omit<Types.EditExitLocation, "type">
): Types.GameState {
  const settings = getLevelSettings(state);

  const newGoals = settings.goals.filter((goal) => {
    if (goal.type === "exit-location") {
      return (
        goal.payload.side !== exitPosition.side ||
        goal.payload.index !== exitPosition.index
      );
    }

    return true;
  });

  return {
    ...state,
    levelSettings: state.levelSettings.map((levelSettings, i) =>
      state.level !== i + 1
        ? levelSettings
        : {
            ...levelSettings,
            goals: newGoals,
          }
    ),
  };
}

function spawnExitLocation(
  state: Types.GameState,
  location: Types.ExitLocation
): Types.GameState {
  const settings = getLevelSettings(state);

  // Check if the exit location already exists in this location, if so set it as the new exit

  let hasUpdatedExistingExit = false;

  let newGoals = settings.goals.map((goal) => {
    if (
      goal.type === "exit-location" &&
      goal.payload.side === location.side &&
      goal.payload.index === location.index
    ) {
      hasUpdatedExistingExit = true;
      return { ...goal, payload: location };
    }
    return goal;
  });

  if (!hasUpdatedExistingExit) {
    newGoals = [
      ...settings.goals,
      { type: "exit-location", payload: location },
    ];
  }

  return {
    ...state,
    levelSettings: state.levelSettings.map(
      (levelSettings, i): Types.Settings =>
        state.level !== i + 1
          ? levelSettings
          : {
              ...levelSettings,
              goals: newGoals,
            }
    ),
  };
}

function editExitLocationAtPosition(
  state: Types.GameState,
  location: Types.ExitLocation
): Types.GameState {
  // Spawn already resolves the exit location in the same location
  return spawnExitLocation(state, location);
}

function resolveEditExit(
  action: Types.EditAction<Types.EditExitLocation>
): Types.GameState {
  if (action.type === "edit-hold") {
    return removeExitAtPosition(action.state, action.location);
  }

  const settings = getLevelSettings(action.state);

  const exitLocation = getExitAtPosition(settings.goals, action.location);

  if (!exitLocation) {
    return spawnExitLocation(action.state, {
      side: action.location.side,
      index: action.location.index,
      requirements: {
        type: "greater-than-equal-to",
        value: 0, // Default value, can be adjusted as needed
      },
    });
  }

  return editExitLocationAtPosition(action.state, {
    ...exitLocation,
    requirements: {
      type: "greater-than-equal-to",
      value:
        exitLocation.requirements.value === 0
          ? 1
          : exitLocation.requirements.value * 2,
    },
  });
}

export default function resolveEdit(action: Types.EditAction): Types.GameState {
  const location = action.location;

  if (location.type === "exit-location") {
    return resolveEditExit({ ...action, location });
  }

  return resolveEditTile({ ...action, location });
}
