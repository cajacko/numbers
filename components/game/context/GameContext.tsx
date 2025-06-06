import * as GameTypes from "@/game/Game.types";
import { TestProps } from "@/game/utils/getTestPropsFromState";
import React from "react";
import { SharedValue } from "react-native-reanimated";

export type TileState = {
  position: GameTypes.Position;
  value: GameTypes.Value;
  textColor: string;
  backgroundColor: string;
};

export type OverlayTileState = {
  position: GameTypes.Position;
  icons: GameTypes.OverlayIcon[];
};

export type TileAnimatingState = TileState & {
  collapsing: "top" | "bottom" | "left" | "right" | "center" | null;
  scalePop: boolean;
};

export type TileSubscriber = (
  currentState: TileState | null,
  nextState: TileAnimatingState | null
) => void;

export type OverlayTileSubscriber = (
  currentState: OverlayTileState | null,
  nextState: OverlayTileState | null
) => void;

export type GameContext = {
  animationProgress: SharedValue<number>;
  game: GameTypes.GameConfig;
  getTile: (
    tileId: GameTypes.TileId,
    state?: GameTypes.GameState
  ) => TileState | null;
  subscribeToTile: (
    tileId: GameTypes.TileId,
    callback: TileSubscriber
  ) => { unsubscribe: () => void };
  getOverlayTile: (
    tileId: GameTypes.TileId,
    state?: GameTypes.GameState
  ) => OverlayTileState | null;
  subscribeToOverlayTile: (
    tileId: GameTypes.TileId,
    callback: OverlayTileSubscriber
  ) => { unsubscribe: () => void };
  handleAction: (
    action:
      | Omit<GameTypes.RegularAction, "state">
      | Omit<GameTypes.EditAction, "state">,
    options?: {
      animationDuration?: number;
    }
  ) => void;
  reset: () => void;
  columns: number;
  rows: number;
  score: SharedValue<number | null>;
  status: GameTypes.Status;
  level: number;
  exitLocations: GameTypes.ExitLocation[];
  getTestProps: () => { current: TestProps; previous: TestProps | null };
};

const Context = React.createContext<GameContext | null>(null);

export function useGameContext(): GameContext {
  const context = React.useContext(Context);

  if (!context) {
    throw new Error("useGameContext must be used within a GameProvider");
  }

  return context;
}

export default Context;
