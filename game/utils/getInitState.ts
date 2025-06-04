import * as Types from "@/game/Game.types";
import getLevels from "./getLevels";
import resolveNewLevel from "./resolveNewLevel";

export default function getInitState({
  rand,
  seed,
}: {
  rand: Types.Rand;
  seed: string;
}): Types.GameState {
  const levelSettings = getLevels(rand);

  let nextState: Types.GameState = {
    tiles: [],
    score: 0,
    status: "user-turn",
    levelSettings,
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
