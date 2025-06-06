import * as Types from "@/game/Game.types";
import spawnTile from "./spawnTile";
import getLevelSettings from "../levels/getLevelSettings";
import getColorsFromValue from "../tiles/getColorsFromValue";
import { DEFAULT_NEW_TILE_VALUE } from "../two048Constants";

export default function spawnRandomTile(
  state: Types.GameState,
  rand: Types.Rand,
  changed: boolean
): Types.GameState {
  if (!changed) return state;

  let nextState = state;

  const zeroCount = state.tiles.filter((t) => t.value === 0).length;

  const settings = getLevelSettings(state);

  let value: number | null;

  if (settings.permZeroTileCount && zeroCount < settings.permZeroTileCount) {
    value = 0;
  } else {
    value = settings.newTileValue ?? DEFAULT_NEW_TILE_VALUE;
  }

  nextState =
    spawnTile({
      state,
      rand,
      tile: { value, ...getColorsFromValue(value) },
    }) ?? nextState;

  return nextState;
}
