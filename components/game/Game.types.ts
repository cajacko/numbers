export interface GameProps {
  blockIds: string[];
  rows: number;
  columns: number;
}

export interface InternalGameProps extends GameProps {
  gameState: GameState;
}

export interface BlockLocation {
  rowIndex: number;
  columnIndex: number;
}

export interface GameBlock {
  blockId: string;
  getValue: () => number | null;
  getNextFilledBlock: (direction: Action) => GameBlock | null;
  mergeInto: (block: GameBlock) => Result;
  getLocation: () => BlockLocation | null;
  setValue: (value: number) => Result;
  setLocation: (props: BlockLocation) => Result;
}

interface GameBlocks {
  forEach(callback: (block: GameBlock | null) => void): void;
}

export type Result<P = {}, T = "success" | "noop"> = {
  type: T;
} & P;

export interface GameColumnOrRow {
  getBlocks: (props?: { reverse?: boolean }) => GameBlocks;
  moveAllFilledBlocks: (props: {
    direction: Action;
    distance: "max" | number;
  }) => Result;
}

export interface GameStateProps extends GameProps {
  gameState: GameState;
  addBlockToRandomAvailableSpace: (props: {
    count?: number;
    value: number;
  }) => Result;
  getColumns: () => GameColumnOrRow[];
  getRows: () => GameColumnOrRow[];
}

export type GameBlockId = string;

export type Animating =
  | "merging"
  | "adding"
  | "removing"
  | "updating"
  | "moving";

/**
 * The indexes are javascript indexes, so the first row is 0 and the last row is rows - 1, so it
 * matches up with the array of block ids in GameStateRow
 */
export type GameStateBlock = BlockLocation & {
  /**
   * merging - we are merging this block into another and it will disappear
   * adding - adding a new block into an empty space
   * removing - removing a block from the game
   * updating - updating the value of a block
   * null - no animation is happening
   */
  animating: Animating[] | null;
  value: number;
  blockId: GameBlockId;
  props?: Record<string, any>;
};

export type GameState = {
  state: "playing" | "won" | "lost";
  blocks: Record<GameBlockId, GameStateBlock | undefined>;
};

export type Action = "up" | "down" | "left" | "right";
