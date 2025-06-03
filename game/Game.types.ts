export type TileId = number;

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

export type Status = "user-turn" | "ai-turn" | "won" | "lost";

export type Action = "up" | "down" | "left" | "right" | "tap" | "tick";

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
      type: "tile-value";
      payload: number;
    };

export type Settings = {
  gridSize: GridSize;
  permZeroTileCount?: number | null;
  randomFixedTiles?: number | null;
  newTileValue?: number;
  goals: Goal[];
  initTiles?: Tile[] | null;
};

export type GameState = {
  tiles: Tile[];
  score: number;
  status: Status;
  level: number;
  turn: number;
  seed: string;
  levelSettings: Settings[];
};

export type ApplyAction = (
  props:
    | {
        /**
         * null if the game is not initialized yet.
         */
        state: GameState;
        action: Action;
      }
    | { action: null; seed: string }
) => GameState;

export type GameConfig = {
  supportedActions: Action[];
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
