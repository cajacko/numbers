import * as Types from "@/game/Game.types";
import getLevelSettings from "@/game/utils/getLevelSettings";

export default function resolveEditLevelSettings(
  action: Types.EditLevelSettings
): Types.GameState {
  const levelSettings = getLevelSettings(action.state);

  const newSettings = {
    ...levelSettings,
    ...action.settings,
  };

  return {
    ...action.state,
    levelSettings: action.state.levelSettings.map(
      (settings, index): Types.Settings =>
        index + 1 === action.level ? newSettings : settings
    ),
  };
}
