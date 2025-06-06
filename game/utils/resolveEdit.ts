import * as Types from "@/game/Game.types";
import spawnTile from "@/game/utils/spawning/spawnTile";
import getColorsFromValue from "@/game/utils/tiles/getColorsFromValue";
import getLevelSettings from "@/game/utils/levels/getLevelSettings";
import getTileAtPosition from "@/game/utils/tiles/getTileAtPosition";
import editTile from "@/game/utils/tiles/editTile";
import removeTileAtPosition from "@/game/utils/tiles/removeTileAtPosition";
import getExitAtPosition from "@/game/utils/exits/getExitAtPosition";
import removeExitAtPosition from "@/game/utils/exits/removeExitAtPosition";
import spawnExitLocation from "@/game/utils/exits/spawnExitLocation";
import editExitLocationAtPosition from "@/game/utils/exits/editExitLocationAtPosition";

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
        value: 0,
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
