import * as Types from "@/game/Game.types";
import spawnTile from "./spawnTile";
import getColorsFromValue from "../getColorsFromValue";

export default function spawnTiles({
  state,
  rand,
  count,
  value,
}: {
  state: Types.GameState;
  rand: Types.Rand;
  count: number;
  value: Types.Value;
}): Types.GameState {
  let nextState: Types.GameState | null = state;

  for (let i = 0; i < count; i++) {
    nextState = spawnTile({
      rand,
      state: nextState,
      tile: {
        value: value,
        ...getColorsFromValue(value),
      },
    });

    if (!nextState) {
      throw new Error("No available position to place a new tile.");
    }
  }

  return nextState;
}
