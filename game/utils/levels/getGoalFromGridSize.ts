import * as Types from "@/game/Game.types";

export default function getGoalFromGridSize(gridSize: Types.GridSize): number {
  const { rows, columns } = gridSize;

  const tiles = rows * columns;

  switch (tiles) {
    case 4: // 2x2
      return 16; // Goal for 2x2 grid
    default:
    case 16: // 4x4
      return 2048;
  }
}
