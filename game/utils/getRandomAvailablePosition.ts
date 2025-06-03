import * as Types from "@/game/Game.types";
import getAvailablePositions from "./getAvailablePositions";

export type GetRandomAvailablePositionProps = {
  state: Types.GameState;
  rand: Types.Rand;
};

export default function getRandomAvailablePosition({
  rand,
  state,
}: GetRandomAvailablePositionProps): Types.Position | null {
  const availablePositions = getAvailablePositions(state);

  if (availablePositions.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(rand() * availablePositions.length);

  return availablePositions[randomIndex];
}
