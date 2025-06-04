import * as Types from "../../Game.types";

/**
 * Converts a position in the grid to a linear index.
 *
 * position: [0,0] gridSize { rows: 2, columns: 2 } = 0
 * position: [0,1] gridSize { rows: 2, columns: 2 } = 1
 * position: [1,0] gridSize { rows: 2, columns: 2 } = 2
 * position: [1,1] gridSize { rows: 2, columns: 2 } = 3
 */
export function positionToIndex(
  position: Types.Position,
  gridSize: Types.GridSize
): number {
  const { columns } = gridSize;
  const [row, column] = position;

  return row * columns + column;
}

/**
 * Returns an array of priorities with 1 being the highest priority and larger numbers being lower.
 * We always return the numbers 1 - rows * columns. With number 1 being placed at the initPosition.
 * in the array.
 *
 * Given a grid size of 2 x 2
 * initPosition of [0, 0] = [1, 2, 3, 4]
 * initPosition of [0, 1] = [4, 1, 2, 3]
 * initPosition of [1, 0] = [3, 4, 1, 2]
 * initPosition of [1, 1] = [2, 3, 4, 1]
 */
export default function getRightToLeftPriorityArr(
  gridSize: Types.GridSize,
  initPosition: Types.Position
): number[] {
  const { rows, columns } = gridSize;

  const linear: number[] = Array.from(
    { length: rows * columns },
    (_, index) => index + 1
  );

  // Find the value at initPosition in the linear array
  const idx = positionToIndex(initPosition, gridSize);

  // Rotate so that valueAtInit is first
  return linear.map((priority, index) => {
    const offset = (index - idx + linear.length) % linear.length;

    return linear[offset];
  });
}
