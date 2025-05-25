export type TileId = number;

export type Position = [row: number, column: number];

export type Value = number;

export type Tile = {
  id: TileId;
  position: Position;
  value: Value;
  mergedFrom: number[] | null;
};

export type GameState = {
  tiles: Tile[];
  score: number;
  state: "playing" | "won" | "lost";
};

export type Direction = "up" | "down" | "left" | "right";

export type GridSize = {
  rows: number;
  columns: number;
};

export type GetInitState = (props: {
  gridSize: GridSize;
  rand: Rand;
}) => GameState;

export type ApplyMove = (props: {
  state: GameState;
  direction: Direction;
  gridSize: GridSize;
  rand: Rand;
}) => GameState;

export type GameConfig = {
  name: string;
  getInitState: GetInitState;
  applyMove: ApplyMove;
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
  }
>;

export type DiffSpawn = CreateDiffType<
  "spawn",
  { tileId: TileId; position: Position; value: Value }
>;

export type Diff = DiffMove | DiffMerge | DiffSpawn;

export type Rand = () => number;
