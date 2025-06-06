import * as Types from "@/game/Game.types";
import spawnExitLocation from "./spawnExitLocation";

export default function editExitLocationAtPosition(
  state: Types.GameState,
  location: Types.ExitLocation
): Types.GameState {
  // Spawn already resolves the exit location in the same location
  return spawnExitLocation(state, location);
}
