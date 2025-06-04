import getRightToLeftPriorityArr, {
  positionToIndex,
} from "@/game/utils/spawning/getRightToLeftPriorityArr";

describe("positionToIndex", () => {
  test("should return correct index for position [0, 0]", () => {
    expect(positionToIndex([0, 0], { rows: 2, columns: 2 })).toBe(0);
  });

  test("should return correct index for position [0, 1]", () => {
    expect(positionToIndex([0, 1], { rows: 2, columns: 2 })).toBe(1);
  });

  test("should return correct index for position [1, 0]", () => {
    expect(positionToIndex([1, 0], { rows: 2, columns: 2 })).toBe(2);
  });

  test("should return correct index for position [1, 1]", () => {
    expect(positionToIndex([1, 1], { rows: 2, columns: 2 })).toBe(3);
  });
});

describe("getRightToLeftPriorityArr", () => {
  test("should return correct priority array for 2x2 grid with initPosition [0, 0]", () => {
    const gridSize = { rows: 2, columns: 2 };
    const initPosition: [number, number] = [0, 0];
    const expected = [1, 2, 3, 4];
    const result = getRightToLeftPriorityArr(gridSize, initPosition);
    expect(result).toEqual(expected);
  });

  test("should return correct priority array for 2x2 grid with initPosition [0, 1]", () => {
    const gridSize = { rows: 2, columns: 2 };
    const initPosition: [number, number] = [0, 1];
    const expected = [4, 1, 2, 3];
    const result = getRightToLeftPriorityArr(gridSize, initPosition);
    expect(result).toEqual(expected);
  });

  test("should return correct priority array for 2x2 grid with initPosition [1, 0]", () => {
    const gridSize = { rows: 2, columns: 2 };
    const initPosition: [number, number] = [1, 0];
    const expected = [3, 4, 1, 2];
    const result = getRightToLeftPriorityArr(gridSize, initPosition);
    expect(result).toEqual(expected);
  });

  test("should return correct priority array for 2x2 grid with initPosition [1, 1]", () => {
    const gridSize = { rows: 2, columns: 2 };
    const initPosition: [number, number] = [1, 1];
    const expected = [2, 3, 4, 1];
    const result = getRightToLeftPriorityArr(gridSize, initPosition);
    expect(result).toEqual(expected);
  });
});
