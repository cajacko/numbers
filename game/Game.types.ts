export type TileId = number;

export type Position = [row: number, column: number];

export type Value = number;

export type Tile = {
  id: TileId;
  position: Position;
  value: Value;
  mergedFrom: number[] | null;
  backgroundColor: string;
  textColor: string;
};

export type Status = "playing" | "won" | "lost";

export type GameState = {
  tiles: Tile[];
  score: number;
  status: Status;
  // turn: "player" | "computer";
};

export type Action = "up" | "down" | "left" | "right" | "tap" | "tick";

export type GridSize = {
  rows: number;
  columns: number;
};

export type GetInitState = (props: {
  gridSize: GridSize;
  rand: Rand;
}) => GameState;

export type ApplyAction = (props: {
  state: GameState;
  action: Action;
  gridSize: GridSize;
  rand: Rand;
}) => GameState;

export type GameConfig = {
  supportedActions: Action[];
  name: string;
  getInitState: GetInitState;
  applyAction: ApplyAction;
  defaultGridSize: GridSize;
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

export type Rand = () => number;
