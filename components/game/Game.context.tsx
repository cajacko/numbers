import * as GameTypes from "@/game/Game.types";
import { defaultGame } from "@/game/games";
import getGameStateDiffs from "@/game/utils/getGameStateDiffs";
import useVibrate from "@/hooks/useVibrate";
import withRand, { generateSeed } from "@/utils/withRand";
import React from "react";
import {
  runOnJS,
  SharedValue,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const duration = 250;

export type TileState = {
  position: GameTypes.Position;
  value: GameTypes.Value;
  textColor: string;
  backgroundColor: string;
};

export type TileAnimatingState = TileState & {
  collapsing: "x" | "y" | null;
  scalePop: boolean;
};

export type TileSubscriber = (
  currentState: TileState | null,
  nextState: TileAnimatingState | null
) => void;

type GameContext = {
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
  handleAction: (action: GameTypes.Direction) => void;
  reset: () => void;
  columns: number;
  rows: number;
};

const Context = React.createContext<GameContext | null>(null);

export function useAnimationProgress(): SharedValue<number> {
  const fallback = useSharedValue<number>(0);
  const { animationProgress } = React.useContext(Context) ?? {};

  return useDerivedValue<number>(() => {
    return animationProgress ? animationProgress.value : fallback.value;
  });
}

export function useTileInitialState(
  tileId: GameTypes.TileId
): TileState | null {
  const { getTile } = React.useContext(Context) ?? {};

  return React.useMemo(() => {
    return getTile?.(tileId) ?? null;
  }, [tileId, getTile]);
}

export function useSubscribeToTile(
  tileId: GameTypes.TileId,
  callback: TileSubscriber
) {
  const { subscribeToTile } = React.useContext(Context) ?? {};

  React.useEffect(() => {
    const { unsubscribe } = subscribeToTile?.(tileId, callback) ?? {};

    return unsubscribe;
  }, [tileId, callback, subscribeToTile]);
}

export function useActionHandlers() {
  const { handleAction, reset } = React.useContext(Context) ?? {};

  return { handleAction, reset };
}

export function useGridSize() {
  const { columns, rows } = React.useContext(Context) ?? {
    columns: 4,
    rows: 4,
  };

  return React.useMemo(() => ({ columns, rows }), [columns, rows]);
}

export function GameProvider(props: { children: React.ReactNode }) {
  const { vibrate } = useVibrate();
  const [game] = React.useState<GameTypes.GameConfig>(defaultGame);
  const animationProgress = useSharedValue<number>(0);

  const rand = React.useMemo(() => withRand(generateSeed()), []);

  const columns = game.defaultGridSize.columns;
  const rows = game.defaultGridSize.rows;

  const callbacks = React.useRef<Record<GameTypes.TileId, TileSubscriber>>({});

  const currentState = React.useRef(
    game.getInitState({ gridSize: { columns, rows }, rand })
  );

  const getTile = React.useCallback<GameContext["getTile"]>(
    (tileId, state = currentState.current) => {
      const tile = state.tiles.find((tile) => tile.id === tileId);

      if (!tile) return null;

      return {
        mergedFrom: null,
        position: tile.position,
        value: tile.value,
        backgroundColor: tile.backgroundColor,
        textColor: tile.textColor,
      };
    },
    []
  );

  const subscribeToTile = React.useCallback<GameContext["subscribeToTile"]>(
    (tileId, callback) => {
      callbacks.current[tileId] = callback;

      const unsubscribe = () => {
        delete callbacks.current[tileId];
      };

      return { unsubscribe };
    },
    []
  );

  const setAllToCurrentState = React.useCallback(() => {
    Object.entries(callbacks.current).forEach(([tileIdString, callback]) => {
      const tileId = parseInt(tileIdString);

      callback(getTile(tileId), null);
    });

    animationProgress.value = 0;
  }, [animationProgress, getTile]);

  const pendingAction = React.useRef<GameTypes.Direction | null>(null);

  const handleAction = React.useCallback<GameContext["handleAction"]>(
    (direction) => {
      vibrate?.();

      // Prevent action if animation is in progress
      if (animationProgress.value > 0 && animationProgress.value < 1) {
        pendingAction.current = direction;

        return;
      }

      animationProgress.value = 0;

      const nextState = game.applyMove({
        direction,
        gridSize: { columns, rows },
        state: currentState.current,
        rand,
      });

      function postAction() {
        currentState.current = nextState;

        setAllToCurrentState();

        if (pendingAction.current) {
          const action = pendingAction.current;
          pendingAction.current = null;

          handleAction(action);
        }
      }

      const diffs = getGameStateDiffs(currentState.current, nextState);

      const newTileStates: Record<
        GameTypes.TileId,
        TileAnimatingState | undefined
      > = {};

      diffs.forEach((diff) => {
        switch (diff.type) {
          case "move": {
            const { tileId, toPosition } = diff.payload;

            const tile = getTile(tileId, nextState);

            if (!tile) {
              break;
            }

            const newStileState: TileAnimatingState = {
              value: tile.value,
              backgroundColor: tile.backgroundColor,
              textColor: tile.textColor,
              position: toPosition,
              collapsing: null,
              scalePop: false,
            };

            newTileStates[tileId] = newStileState;

            break;
          }
          case "merge": {
            const {
              mergedToTileId,
              mergedFromTileIds,
              newValue,
              mergedToTileBackgroundColor,
              mergedToTileTextColor,
            } = diff.payload;

            const mergedToTile = getTile(mergedToTileId, nextState);

            if (!mergedToTile) {
              break;
            }

            newTileStates[mergedToTileId] = {
              value: newValue,
              backgroundColor: mergedToTileBackgroundColor,
              textColor: mergedToTileTextColor,
              position: mergedToTile.position,
              collapsing: null,
              scalePop: true,
            };

            mergedFromTileIds.forEach((tileId) => {
              if (tileId === mergedToTileId) return;

              const tile = getTile(tileId);

              if (!tile) return;

              newTileStates[tileId] = {
                value: tile.value,
                backgroundColor: tile.backgroundColor,
                textColor: tile.textColor,
                position: mergedToTile.position,
                scalePop: false,
                collapsing:
                  direction === "up" || direction === "down" ? "y" : "x",
              };
            });

            break;
          }
          case "spawn": {
            const { tileId, position, value, backgroundColor, textColor } =
              diff.payload;

            newTileStates[tileId] = {
              position,
              value,
              collapsing: null,
              scalePop: false,
              backgroundColor,
              textColor,
            };

            break;
          }
        }
      });

      Object.entries(newTileStates).forEach(([tileIdString, nextTileState]) => {
        if (!nextTileState) return;

        const tileId = parseInt(tileIdString);

        const callback = callbacks.current[tileId];

        callback(getTile(tileId), nextTileState);
      });

      animationProgress.value = withTiming(1, { duration }, () => {
        runOnJS(postAction)();
      });
    },
    [
      game,
      getTile,
      animationProgress,
      rand,
      setAllToCurrentState,
      rows,
      columns,
      vibrate,
    ]
  );

  const reset = React.useCallback<GameContext["reset"]>(() => {
    currentState.current = game.getInitState({
      gridSize: { columns, rows },
      rand,
    });

    setAllToCurrentState();
  }, [game, rand, setAllToCurrentState, rows, columns]);

  const init = React.useRef(true);

  React.useEffect(() => {
    if (init.current) {
      init.current = false;

      return;
    }

    reset();
  }, [game, reset]);

  const value = React.useMemo<GameContext>(
    () => ({
      game,
      subscribeToTile,
      getTile,
      animationProgress,
      handleAction,
      reset,
      columns,
      rows,
    }),
    [
      game,
      subscribeToTile,
      animationProgress,
      getTile,
      handleAction,
      reset,
      columns,
      rows,
    ]
  );

  return <Context.Provider value={value}>{props.children}</Context.Provider>;
}
