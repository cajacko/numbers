import * as Types from "@/game/Game.types";

export default function getLevelSettings(
  state: Types.GameState
): Types.Settings {
  const settings = state.levelSettings[state.level - 1];

  if (!settings) {
    throw new Error(`No settings found for level ${state.level}`);
  }

  return settings;
}
