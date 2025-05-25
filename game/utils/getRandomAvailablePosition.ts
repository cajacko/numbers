import * as Types from "@/game/Game.types";
import getAvailablePositions, {
  GetAvailablePositionsProps,
} from "./getAvailablePositions";

export type GetRandomAvailablePositionProps = GetAvailablePositionsProps & {
  rand: Types.Rand;
};

export default function getRandomAvailablePosition({
  rand,
  ...props
}: GetRandomAvailablePositionProps): Types.Position | null {
  const availablePositions = getAvailablePositions(props);

  if (availablePositions.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(rand() * availablePositions.length);

  return availablePositions[randomIndex];
}
