import two048 from "../two048";
import getColorsFromValue from "../../utils/getColorsFromValue";
import * as Types from "@/game/Game.types";
import getTestPropsFromState, {
  TilePosition,
} from "@/game/utils/getTestPropsFromState";

jest.mock("../../utils/getRandomAvailablePosition", () => ({
  __esModule: true,
  default: jest.fn(),
}));

// eslint-disable-next-line import/first
import getRandomAvailablePosition from "../../utils/getRandomAvailablePosition";

const standard2048Settings: Types.Settings = {
  newTileValue: 2,
  permZeroTileCount: 0,
  randomFixedTiles: null,
  gridSize: { rows: 4, columns: 4 },
  goals: [
    {
      type: "tile-value",
      payload: 2048,
    },
  ],
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
    gridSize: Types.GridSize;
    settings: Types.Settings;
    exitLocations?: Types.ExitLocation[];
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
    title: "Fixed tiles",
    cases: [
      {
        title: "Tile stops before fixed tile when moving up",
        gridSize: { rows: 4, columns: 4 },
        randomAvailablePosition: [3, 3],
        prevTiles: [
          { tileId: 0, value: null, row: 1, column: 0 },
          { tileId: 1, value: 2, row: 3, column: 0 },
        ],
        applyAction: "up",
        expectedPositions: [
          { tileId: 0, value: null, row: 1, column: 0 },
          { tileId: 1, value: 2, row: 2, column: 0 },
          { tileId: 2, value: 2, row: 3, column: 3 },
        ],
        settings: standard2048Settings,
      },
      {
        title: "Tiles separated by fixed tile do not merge",
        gridSize: { rows: 4, columns: 4 },
        randomAvailablePosition: [1, 2],
        prevTiles: [
          { tileId: 0, value: 2, row: 0, column: 0 },
          { tileId: 1, value: null, row: 0, column: 1 },
          { tileId: 2, value: 2, row: 0, column: 3 },
        ],
        applyAction: "left",
        expectedPositions: [
          { tileId: 0, value: 2, row: 0, column: 0 },
          { tileId: 1, value: null, row: 0, column: 1 },
          { tileId: 2, value: 2, row: 0, column: 2 },
          { tileId: 3, value: 2, row: 1, column: 2 },
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
  {
    title: "Exit locations",
    cases: [
      {
        title: "Tile exits when reaching top exit location",
        gridSize: { rows: 4, columns: 4 },
        randomAvailablePosition: [3, 3],
        prevTiles: [{ tileId: 0, value: 16, row: 1, column: 2 }],
        applyAction: "up",
        expectedPositions: [
          { tileId: 0, value: 16, row: -1, column: 2 },
          { tileId: 1, value: 2, row: 3, column: 3 },
        ],
        expectedStatus: "won",
        settings: standard2048Settings,
        exitLocations: [
          {
            side: "top",
            index: 2,
            requirements: { type: "greater-than-equal-to", value: 16 },
          },
        ],
      },
      {
        title: "Tile does not exit when value is too low",
        gridSize: { rows: 4, columns: 4 },
        randomAvailablePosition: [3, 3],
        prevTiles: [{ tileId: 0, value: 8, row: 1, column: 2 }],
        applyAction: "up",
        expectedPositions: [
          { tileId: 0, value: 8, row: 0, column: 2 },
          { tileId: 1, value: 2, row: 3, column: 3 },
        ],
        settings: standard2048Settings,
        exitLocations: [
          {
            side: "top",
            index: 2,
            requirements: { type: "greater-than-equal-to", value: 16 },
          },
        ],
      },
      {
        title: "Merged tile does not exit",
        gridSize: { rows: 4, columns: 4 },
        randomAvailablePosition: [3, 3],
        prevTiles: [
          { tileId: 0, value: 8, row: 0, column: 2 },
          { tileId: 1, value: 8, row: 1, column: 2 },
        ],
        applyAction: "up",
        expectedPositions: [
          { tileId: 0, value: 16, row: 0, column: 2 },
          { tileId: 2, value: 2, row: 3, column: 3 },
        ],
        settings: standard2048Settings,
        exitLocations: [
          {
            side: "top",
            index: 2,
            requirements: { type: "greater-than-equal-to", value: 16 },
          },
        ],
      },
      {
        title: "Tile exits bottom with equal requirement",
        gridSize: { rows: 4, columns: 4 },
        randomAvailablePosition: [0, 0],
        prevTiles: [{ tileId: 0, value: 4, row: 2, column: 0 }],
        applyAction: "down",
        expectedPositions: [
          { tileId: 0, value: 4, row: 4, column: 0 },
          { tileId: 1, value: 2, row: 0, column: 0 },
        ],
        expectedStatus: "won",
        settings: standard2048Settings,
        exitLocations: [
          {
            side: "bottom",
            index: 0,
            requirements: { type: "equal-to", value: 4 },
          },
        ],
      },
      {
        title:
          "Tile does not exit when a valid tile ends up next to the exit location but the action does not move it out",
        gridSize: { rows: 4, columns: 4 },
        randomAvailablePosition: [3, 3],
        prevTiles: [
          { tileId: 0, value: 8, row: 0, column: 2 },
          { tileId: 1, value: 8, row: 0, column: 3 },
        ],
        applyAction: "left",
        expectedPositions: [
          { tileId: 0, value: 16, row: 0, column: 0 },
          { tileId: 2, value: 2, row: 3, column: 3 },
        ],
        settings: standard2048Settings,
        exitLocations: [
          {
            side: "top",
            index: 0,
            requirements: { type: "greater-than-equal-to", value: 16 },
          },
        ],
      },
      {
        title:
          "A valid exit tile sliding next to an exit location does not leave if the direction does not move it out",
        gridSize: { rows: 4, columns: 4 },
        randomAvailablePosition: [1, 2],
        prevTiles: [
          {
            tileId: 0,
            value: 2,
            row: 3,
            column: 0,
          },
          {
            tileId: 1,
            value: 1,
            row: 3,
            column: 1,
          },
        ],
        applyAction: "right",
        expectedPositions: [
          {
            tileId: 0,
            value: 2,
            row: 3,
            column: 2,
          },
          {
            tileId: 1,
            value: 1,
            row: 3,
            column: 3,
          },
          {
            tileId: 2,
            value: 2,
            row: 1,
            column: 2,
          },
        ],
        settings: standard2048Settings,
        exitLocations: [
          {
            requirements: {
              type: "greater-than-equal-to",
              value: 2,
            },
            side: "bottom",
            index: 2,
          },
        ],
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
    level: 1,
    turn: 1,
    seed: "123",
    levelSettings: [settings],
  };
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
          gridSize,
          settings,
          exitLocations,
        }) => {
          test(title, () => {
            (getRandomAvailablePosition as jest.Mock).mockImplementation(
              () => randomAvailablePosition
            );

            const prevState = stateFromTilePositions(prevTiles, {
              ...settings,
              gridSize,
              goals: [
                ...settings.goals,
                ...(exitLocations || []).map(
                  (payload): Types.Goal => ({
                    type: "exit-location",
                    payload,
                  })
                ),
              ],
            });

            const nextState = two048.applyAction({
              state: prevState,
              action: applyAction,
            });

            if (expectedStatus) {
              expect(nextState.status).toBe(expectedStatus);
            }

            if (expectedPositions) {
              const nextGrid = getTestPropsFromState(nextState).tiles;

              expect(nextGrid).toEqual(expectedPositions);
            }
          });
        }
      );
    });
  });
});
