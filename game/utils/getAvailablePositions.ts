import * as Types from "@/game/Game.types";

export type GetAvailablePositionsProps = {
  gridSize: Types.GridSize;
  state: Types.GameState;
};

export default function getAvailablePositions({
  gridSize,
  state,
}: GetAvailablePositionsProps): Types.Position[] {
  const occupiedPositionsMap: { [row: number]: { [column: number]: true } } =
    {};

  state.tiles.forEach((tile) => {
    const [row, column] = tile.position;

    if (!occupiedPositionsMap[row]) {
      occupiedPositionsMap[row] = {};
    }

    occupiedPositionsMap[row][column] = true;
  });

  const availablePositions: Types.Position[] = [];

  for (let row = 0; row < gridSize.rows; row++) {
    for (let column = 0; column < gridSize.columns; column++) {
      if (!occupiedPositionsMap[row] || !occupiedPositionsMap[row][column]) {
        availablePositions.push([row, column]);
      }
    }
  }

  return availablePositions;
}
