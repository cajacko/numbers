import * as Types from "@/game/Game.types";
import getLevelSettings from "@/game/utils/levels/getLevelSettings";

export default function spawnExitLocation(
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
