import * as Types from "@/game/Game.types";
import levels from "./levels";
import resolveNewLevel from "./resolveNewLevel";
import { generateExitLocation } from "./generateExitLocations";

export default function getInitState({
  rand,
  seed,
}: {
  rand: Types.Rand;
  seed: string;
}): Types.GameState {
  const levelSettings = levels;

  let nextState: Types.GameState = {
    tiles: [],
    score: 0,
    status: "user-turn",
    levelSettings: levelSettings.map((settings) => ({
      ...settings,
      goals: settings.goals.map((goal) => {
        if (goal.type === "random-exit-location") {
          return generateExitLocation(
            rand,
            settings.gridSize,
            goal.payload.value
          );
        }

        return goal;
      }),
    })),
    level: 1,
    seed,
    turn: 1,
    overlayTiles: [],
  };

  return resolveNewLevel({
    state: nextState,
    rand,
    exitedTiles: [],
    level: 1,
  });
}
