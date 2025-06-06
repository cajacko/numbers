export type TileId = number;

/**
 * Represents a position on the grid as a zero indexed tuple of row and column.
 * For example, [0, 0] is the top-left corner of the grid, [1, 2] is the second row and third column.
 */
export type Position = [row: number, column: number];

export type Value = number | null;

export type Tile = {
  id: TileId;
  position: Position;
  value: Value;
  mergedFrom: number[] | null;
  backgroundColor: string;
  textColor: string;
};

export type OverlayIcon = {
  type: "spawn-priority";
  value: number;
};

export type OverlayTile = {
  id: TileId;
  position: Position;
  icons: OverlayIcon[];
};

export type Status = "user-turn" | "ai-turn" | "won" | "lost";

export type RegularActionType =
  | "up"
  | "down"
  | "left"
  | "right"
  | "tap"
  | "tick";

export type Action =
  | {
      type: RegularActionType;
      state: GameState;
    }
  | { type: "reset" | "init"; seed: string }
  | {
      type: "edit-tap";
      state: GameState;
      location:
        | {
            type: "tile";
            position: Position;
          }
        | {
            type: "exit-location";
            side: "top" | "bottom" | "left" | "right";
            index: number;
          };
    };

/**
 * The size of the grid, it is not 0 indexed, so a grid of size 2 x 2 will have
 * rows: 2 and columns: 2.
 */
export type GridSize = {
  rows: number;
  columns: number;
};

export type ExitLocationRequirement = {
  type: "greater-than-equal-to" | "equal-to";
  value: number;
};

export type ExitLocation = {
  side: "top" | "bottom" | "left" | "right";
  index: number;
  requirements: ExitLocationRequirement;
};

export type Goal =
  | {
      type: "exit-location";
      payload: ExitLocation;
    }
  | {
      type: "random-exit-location";
      payload: ExitLocationRequirement;
    }
  | {
      type: "tile-value";
      payload: number;
    };

/**
 * Spawns tiles randomly but is not shown to the user.
 */
type SpawnTilesMethodRandom = {
  type: "random";
};

/**
 * Will define the priority of each location in a right-to-left sequence. And then shift that sequence
 * each turn
 */
type SpawnTilesMethodRTLSequence = {
  type: "rtl-sequence";
  shiftBy: number;
  levelInitPosition?: Position | null;
};

/**
 * Will define a random sequence of priorities for each location and that sequence will remain fixed
 * during the level
 */
type SpawnTilesMethodFixedRandom = {
  type: "fixed-random";
};

/**
 * Spawns tiles randomly but only known tiles, meaning that the user can see the tiles that will be
 * spawned.
 */
type SpawnTilesMethodRandomKnown = {
  type: "random-known";
};

export type SpawnTilesMethod =
  | SpawnTilesMethodRandom
  | SpawnTilesMethodRTLSequence
  | SpawnTilesMethodFixedRandom
  | SpawnTilesMethodRandomKnown;

export type Settings = {
  gridSize: GridSize;
  permZeroTileCount?: number | null;
  randomFixedTiles?: number | null;
  newTileValue?: number;
  goals: Goal[];
  initTiles?: Tile[] | null;
  spawnTilesMethod?: SpawnTilesMethod | null;
};

export type GameState = {
  tiles: Tile[];
  overlayTiles: OverlayTile[];
  score: number;
  status: Status;
  level: number;
  turn: number;
  seed: string;
  levelSettings: Settings[];
};

export type ApplyAction = (action: Action) => GameState;

export type GameConfig = {
  supportedActions: RegularActionType[];
  name: string;
  applyAction: ApplyAction;
};

type CreateDiffType<T extends string, P> = {
  type: T;
  payload: P;
};

export type DiffMove = CreateDiffType<
  "move",
  { tileId: TileId; fromPosition: Position; toPosition: Position }
>;

export type DiffMerge = CreateDiffType<
  "merge",
  {
    mergedToTileId: TileId;
    mergedFromTileIds: TileId[];
    prevValue: Value;
    newValue: Value;
    mergedToTileBackgroundColor: string;
    mergedToTileTextColor: string;
  }
>;

export type DiffSpawn = CreateDiffType<
  "spawn",
  {
    tileId: TileId;
    position: Position;
    value: Value;
    backgroundColor: string;
    textColor: string;
  }
>;

export type DiffRemove = CreateDiffType<
  "remove",
  {
    tileId: TileId;
  }
>;

export type DiffValueChange = CreateDiffType<
  "value-change",
  {
    tileId: TileId;
    prevValue: Value;
    newValue: Value;
  }
>;

export type Diff =
  | DiffMove
  | DiffMerge
  | DiffSpawn
  | DiffRemove
  | DiffValueChange;

// Rand is a function that when called with an array, returns a random element from that array. and
// if called with nothing it returns a random number between 0 and 1.
export type Rand = {
  <T extends any[]>(array: T): T[number];
  (): number;
};
