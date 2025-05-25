import withRand from "@/utils/withRand";
import two048, { getColorsFromValue } from "../two048";
import * as Types from "@/game/Game.types";

jest.mock("../../utils/getRandomAvailablePosition", () => ({
  __esModule: true,
  default: jest.fn(),
}));

// eslint-disable-next-line import/first
import getRandomAvailablePosition from "../../utils/getRandomAvailablePosition";

type TilePosition = {
  tileId: number;
  value: number;
  row: number;
  column: number;
};

const descriptions: {
  title: string;
  cases: {
    title: string;
    prevTiles: TilePosition[];
    applyAction: Types.Direction;
    randomAvailablePosition: Types.Position | null;
    expectedPositions?: TilePosition[];
    expectedState?: Types.GameState["state"];
    gridSize: Types.GridSize;
  }[];
}[] = [
  {
    title: "Up",
    cases: [
      {
        title: "A single tile in row 1 moves to row 0",
        gridSize: { rows: 4, columns: 4 },
        randomAvailablePosition: [3, 3],
        prevTiles: [
          {
            tileId: 0,
            value: 2,
            row: 1,
            column: 0,
          },
        ],
        applyAction: "up",
        expectedPositions: [
          {
            tileId: 0,
            value: 2,
            row: 0,
            column: 0,
          },
          {
            tileId: 1,
            value: 2,
            row: 3,
            column: 3,
          },
        ],
      },
      {
        title: "A single tile in row 2 moves to row 0",
        gridSize: { rows: 4, columns: 4 },
        randomAvailablePosition: [3, 3],
        prevTiles: [
          {
            tileId: 0,
            value: 2,
            row: 2,
            column: 0,
          },
        ],
        applyAction: "up",
        expectedPositions: [
          {
            tileId: 0,
            value: 2,
            row: 0,
            column: 0,
          },
          {
            tileId: 1,
            value: 2,
            row: 3,
            column: 3,
          },
        ],
      },
      {
        title: "Merging 2 tiles next to each other works",
        gridSize: { rows: 4, columns: 4 },
        randomAvailablePosition: [3, 3],
        prevTiles: [
          {
            tileId: 0,
            value: 2,
            row: 0,
            column: 0,
          },
          {
            tileId: 1,
            value: 2,
            row: 1,
            column: 0,
          },
        ],
        applyAction: "up",
        expectedPositions: [
          {
            tileId: 0,
            value: 4,
            row: 0,
            column: 0,
          },
          {
            tileId: 2,
            value: 2,
            row: 3,
            column: 3,
          },
        ],
      },
      {
        title: "Merging 2 tiles with a gap inbetween works",
        gridSize: { rows: 4, columns: 4 },
        randomAvailablePosition: [3, 3],
        prevTiles: [
          {
            tileId: 0,
            value: 2,
            row: 0,
            column: 0,
          },
          {
            tileId: 1,
            value: 2,
            row: 2,
            column: 0,
          },
        ],
        applyAction: "up",
        expectedPositions: [
          {
            tileId: 0,
            value: 4,
            row: 0,
            column: 0,
          },
          {
            tileId: 2,
            value: 2,
            row: 3,
            column: 3,
          },
        ],
      },
      {
        title: "3 same tiles merges the first 2 only",
        gridSize: { rows: 4, columns: 4 },
        randomAvailablePosition: [3, 3],
        prevTiles: [
          {
            tileId: 0,
            value: 2,
            row: 0,
            column: 0,
          },
          {
            tileId: 1,
            value: 2,
            row: 1,
            column: 0,
          },
          {
            tileId: 2,
            value: 2,
            row: 2,
            column: 0,
          },
        ],
        applyAction: "up",
        expectedPositions: [
          {
            tileId: 0,
            value: 4,
            row: 0,
            column: 0,
          },
          {
            tileId: 2,
            value: 2,
            row: 1,
            column: 0,
          },
          {
            tileId: 3,
            value: 2,
            row: 3,
            column: 3,
          },
        ],
      },
    ],
  },
  {
    title: "Down",
    cases: [
      {
        title: "A single tile in row 0 moves to row 3",
        gridSize: { rows: 4, columns: 4 },
        randomAvailablePosition: [0, 0],
        prevTiles: [
          {
            tileId: 0,
            value: 2,
            row: 0,
            column: 1,
          },
        ],
        applyAction: "down",
        expectedPositions: [
          {
            tileId: 0,
            value: 2,
            row: 3,
            column: 1,
          },
          {
            tileId: 1,
            value: 2,
            row: 0,
            column: 0,
          },
        ],
      },
    ],
  },
  {
    title: "Left",
    cases: [
      {
        title: "Two tiles merge when moved left",
        gridSize: { rows: 4, columns: 4 },
        randomAvailablePosition: [1, 3],
        prevTiles: [
          { tileId: 0, value: 2, row: 0, column: 2 },
          { tileId: 1, value: 2, row: 0, column: 3 },
        ],
        applyAction: "left",
        expectedPositions: [
          { tileId: 0, value: 4, row: 0, column: 0 },
          { tileId: 2, value: 2, row: 1, column: 3 },
        ],
      },
    ],
  },
  {
    title: "Right",
    cases: [
      {
        title: "No new tile spawns when no tiles move",
        gridSize: { rows: 4, columns: 4 },
        randomAvailablePosition: [0, 0],
        prevTiles: [
          { tileId: 0, value: 2, row: 0, column: 3 },
          { tileId: 1, value: 4, row: 1, column: 3 },
        ],
        applyAction: "right",
        expectedPositions: [
          { tileId: 0, value: 2, row: 0, column: 3 },
          { tileId: 1, value: 4, row: 1, column: 3 },
        ],
      },
    ],
  },
];

function stateFromTilePositions(positions: TilePosition[]): Types.GameState {
  const tiles: Types.Tile[] = [];

  positions.forEach(({ column, tileId, row, value }) => {
    tiles.push({
      id: tileId,
      value,
      position: [row, column],
      mergedFrom: null,
      ...getColorsFromValue(value),
    });
  });

  return {
    tiles: tiles.sort((a, b) => a.id - b.id),
    score: 0,
    state: "playing",
  };
}

function tilePositionsFromState(state: Types.GameState): TilePosition[] {
  const positions: TilePosition[] = [];

  state.tiles.forEach((tile) => {
    const [row, column] = tile.position;

    positions.push({
      tileId: tile.id,
      value: tile.value,
      row,
      column,
    });
  });

  return positions.sort((a, b) => a.tileId - b.tileId);
}

describe("two048 game", () => {
  descriptions.forEach(({ title, cases }) => {
    describe(title, () => {
      cases.forEach(
        ({
          title,
          applyAction,
          expectedState,
          prevTiles,
          expectedPositions,
          randomAvailablePosition,
        }) => {
          test(title, () => {
            (getRandomAvailablePosition as jest.Mock).mockImplementation(
              () => randomAvailablePosition
            );

            const rand = withRand("test");

            const prevState = stateFromTilePositions(prevTiles);

            const nextState = two048.applyMove({
              state: prevState,
              direction: applyAction,
              gridSize: { rows: 4, columns: 4 },
              rand,
            });

            if (expectedState) {
              expect(nextState.state).toBe(expectedState);
            }

            if (expectedPositions) {
              const nextGrid = tilePositionsFromState(nextState);

              expect(nextGrid).toEqual(expectedPositions);
            }
          });
        }
      );
    });
  });
});
