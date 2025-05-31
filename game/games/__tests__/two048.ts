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
  value: Types.Value;
  row: number;
  column: number;
};

const standard2048Settings: Types.Settings = {
  newTileValue: 2,
  zeroTiles: false,
  permZeroTileCount: 0,
  randomFixedTiles: null,
};

const descriptions: {
  title: string;
  cases: {
    title: string;
    prevTiles: TilePosition[];
    applyAction: Types.Action;
    randomAvailablePosition: Types.Position | null;
    expectedPositions?: TilePosition[];
    expectedStatus?: Types.GameState["status"];
    seed?: string | number;
    gridSize: Types.GridSize;
    settings: Types.Settings;
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
        settings: standard2048Settings,
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
        settings: standard2048Settings,
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
        settings: standard2048Settings,
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
        settings: standard2048Settings,
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
        settings: standard2048Settings,
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
        settings: standard2048Settings,
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
        settings: standard2048Settings,
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
        settings: standard2048Settings,
      },
    ],
  },
  {
    title: "Merging chains",
    cases: [
      {
        title: "Four tiles merge into two when moved up",
        gridSize: { rows: 4, columns: 4 },
        randomAvailablePosition: [3, 3],
        prevTiles: [
          { tileId: 0, value: 2, row: 0, column: 0 },
          { tileId: 1, value: 2, row: 1, column: 0 },
          { tileId: 2, value: 2, row: 2, column: 0 },
          { tileId: 3, value: 2, row: 3, column: 0 },
        ],
        applyAction: "up",
        expectedPositions: [
          { tileId: 0, value: 4, row: 0, column: 0 },
          { tileId: 2, value: 4, row: 1, column: 0 },
          { tileId: 4, value: 2, row: 3, column: 3 },
        ],
        settings: standard2048Settings,
      },
    ],
  },
  {
    title: "End states",
    cases: [
      {
        title: "Game won when reaching 2048",
        gridSize: { rows: 4, columns: 4 },
        randomAvailablePosition: [3, 3],
        prevTiles: [
          { tileId: 0, value: 1024, row: 1, column: 0 },
          { tileId: 1, value: 1024, row: 2, column: 0 },
        ],
        applyAction: "up",
        expectedPositions: [
          { tileId: 0, value: 2048, row: 0, column: 0 },
          { tileId: 2, value: 2, row: 3, column: 3 },
        ],
        expectedStatus: "won",
        settings: standard2048Settings,
      },
      {
        title: "Game lost when board is full and no moves left",
        gridSize: { rows: 4, columns: 4 },
        randomAvailablePosition: null,
        prevTiles: [
          { tileId: 0, value: 2, row: 0, column: 0 },
          { tileId: 1, value: 4, row: 0, column: 1 },
          { tileId: 2, value: 2, row: 0, column: 2 },
          { tileId: 3, value: 4, row: 0, column: 3 },
          { tileId: 4, value: 4, row: 1, column: 0 },
          { tileId: 5, value: 2, row: 1, column: 1 },
          { tileId: 6, value: 4, row: 1, column: 2 },
          { tileId: 7, value: 2, row: 1, column: 3 },
          { tileId: 8, value: 2, row: 2, column: 0 },
          { tileId: 9, value: 4, row: 2, column: 1 },
          { tileId: 10, value: 2, row: 2, column: 2 },
          { tileId: 11, value: 4, row: 2, column: 3 },
          { tileId: 12, value: 4, row: 3, column: 0 },
          { tileId: 13, value: 2, row: 3, column: 1 },
          { tileId: 14, value: 4, row: 3, column: 2 },
          { tileId: 15, value: 2, row: 3, column: 3 },
        ],
        applyAction: "up",
        expectedPositions: [
          { tileId: 0, value: 2, row: 0, column: 0 },
          { tileId: 1, value: 4, row: 0, column: 1 },
          { tileId: 2, value: 2, row: 0, column: 2 },
          { tileId: 3, value: 4, row: 0, column: 3 },
          { tileId: 4, value: 4, row: 1, column: 0 },
          { tileId: 5, value: 2, row: 1, column: 1 },
          { tileId: 6, value: 4, row: 1, column: 2 },
          { tileId: 7, value: 2, row: 1, column: 3 },
          { tileId: 8, value: 2, row: 2, column: 0 },
          { tileId: 9, value: 4, row: 2, column: 1 },
          { tileId: 10, value: 2, row: 2, column: 2 },
          { tileId: 11, value: 4, row: 2, column: 3 },
          { tileId: 12, value: 4, row: 3, column: 0 },
          { tileId: 13, value: 2, row: 3, column: 1 },
          { tileId: 14, value: 4, row: 3, column: 2 },
          { tileId: 15, value: 2, row: 3, column: 3 },
        ],
        expectedStatus: "lost",
        settings: standard2048Settings,
      },
      {
        title: "Board full but moves left keeps playing",
        gridSize: { rows: 4, columns: 4 },
        randomAvailablePosition: [0, 3],
        prevTiles: [
          { tileId: 0, value: 2, row: 0, column: 0 },
          { tileId: 1, value: 2, row: 0, column: 1 },
          { tileId: 2, value: 4, row: 0, column: 2 },
          { tileId: 3, value: 8, row: 0, column: 3 },
          { tileId: 4, value: 16, row: 1, column: 0 },
          { tileId: 5, value: 32, row: 1, column: 1 },
          { tileId: 6, value: 64, row: 1, column: 2 },
          { tileId: 7, value: 128, row: 1, column: 3 },
          { tileId: 8, value: 2, row: 2, column: 0 },
          { tileId: 9, value: 4, row: 2, column: 1 },
          { tileId: 10, value: 8, row: 2, column: 2 },
          { tileId: 11, value: 16, row: 2, column: 3 },
          { tileId: 12, value: 32, row: 3, column: 0 },
          { tileId: 13, value: 64, row: 3, column: 1 },
          { tileId: 14, value: 128, row: 3, column: 2 },
          { tileId: 15, value: 256, row: 3, column: 3 },
        ],
        applyAction: "left",
        expectedPositions: [
          { tileId: 0, value: 4, row: 0, column: 0 },
          { tileId: 2, value: 4, row: 0, column: 1 },
          { tileId: 3, value: 8, row: 0, column: 2 },
          { tileId: 4, value: 16, row: 1, column: 0 },
          { tileId: 5, value: 32, row: 1, column: 1 },
          { tileId: 6, value: 64, row: 1, column: 2 },
          { tileId: 7, value: 128, row: 1, column: 3 },
          { tileId: 8, value: 2, row: 2, column: 0 },
          { tileId: 9, value: 4, row: 2, column: 1 },
          { tileId: 10, value: 8, row: 2, column: 2 },
          { tileId: 11, value: 16, row: 2, column: 3 },
          { tileId: 12, value: 32, row: 3, column: 0 },
          { tileId: 13, value: 64, row: 3, column: 1 },
          { tileId: 14, value: 128, row: 3, column: 2 },
          { tileId: 15, value: 256, row: 3, column: 3 },
          { tileId: 16, value: 2, row: 0, column: 3 },
        ],
        expectedStatus: "user-turn",
        settings: standard2048Settings,
      },
    ],
  },
  {
    title: "Small grid",
    cases: [
      {
        title: "2x2 grid wins at 16",
        gridSize: { rows: 2, columns: 2 },
        randomAvailablePosition: [1, 1],
        prevTiles: [
          { tileId: 0, value: 8, row: 1, column: 0 },
          { tileId: 1, value: 8, row: 0, column: 0 },
          { tileId: 2, value: 2, row: 0, column: 1 },
        ],
        applyAction: "up",
        expectedPositions: [
          { tileId: 1, value: 16, row: 0, column: 0 },
          { tileId: 2, value: 2, row: 0, column: 1 },
          { tileId: 3, value: 2, row: 1, column: 1 },
        ],
        expectedStatus: "won",
        settings: standard2048Settings,
      },
    ],
  },
];

function stateFromTilePositions(
  positions: TilePosition[],
  settings: Types.Settings
): Types.GameState {
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
    status: "user-turn",
    settings,
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
          expectedStatus,
          prevTiles,
          expectedPositions,
          randomAvailablePosition,
          seed,
          gridSize,
          settings,
        }) => {
          test(title, () => {
            (getRandomAvailablePosition as jest.Mock).mockImplementation(
              () => randomAvailablePosition
            );

            const rand = withRand(seed ?? "test");

            const prevState = stateFromTilePositions(prevTiles, settings);

            const nextState = two048.applyAction({
              state: prevState,
              action: applyAction,
              gridSize,
              rand,
            });

            if (expectedStatus) {
              expect(nextState.status).toBe(expectedStatus);
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
