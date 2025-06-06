import * as Types from "@/game/Game.types";
import { SIDES } from "../two048Constants";

export function generateExitLocation(
  rand: Types.Rand,
  gridSize: Types.GridSize,
  value: number
): Types.Goal {
  const side = rand(SIDES);
  const maxIndex =
    side === "top" || side === "bottom"
      ? gridSize.columns - 1
      : gridSize.rows - 1;
  const index = Math.floor(rand() * maxIndex);

  return {
    type: "exit-location",
    payload: {
      side,
      index,
      requirements: {
        type: "greater-than-equal-to",
        value,
      },
    },
  };
}

export default function generateExitLocations(
  rand: Types.Rand,
  gridSize: Types.GridSize,
  value: number
): Types.Goal[] {
  return [generateExitLocation(rand, gridSize, value)];
}
