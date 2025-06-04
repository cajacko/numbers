import * as Types from "@/game/Game.types";

/**
 * Sets the next turn in the game state if there was a change.
 */
export default function resolveTurn(
  state: Types.GameState,
  changed: boolean
): Types.GameState {
  if (!changed) return state;

  const nextTurn = state.turn + 1;

  return {
    ...state,
    turn: nextTurn,
  };
}
