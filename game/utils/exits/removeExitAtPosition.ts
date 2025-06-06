import * as Types from "@/game/Game.types";
import getLevelSettings from "@/game/utils/levels/getLevelSettings";

export default function removeExitAtPosition(
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
