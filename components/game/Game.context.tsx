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

const duration = 300;
const pendingDuration = duration / 2;

export type TileState = {
  position: GameTypes.Position;
  value: GameTypes.Value;
  textColor: string;
  backgroundColor: string;
};

export type TileAnimatingState = TileState & {
  collapsing: "top" | "bottom" | "left" | "right" | "center" | null;
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
  handleAction: (
    action: GameTypes.Action,
    options?: {
      animationDuration?: number;
    }
  ) => void;
  reset: () => void;
  setRows: (rows: number) => void;
  setColumns: (columns: number) => void;
  setGame: (game: GameTypes.GameConfig) => void;
  columns: number;
  rows: number;
  score: SharedValue<number>;
  status: GameTypes.Status;
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

export function useSetGridSize() {
  const { setRows, setColumns } = React.useContext(Context) ?? {};

  return { setRows, setColumns };
}

export function useGridSize() {
  const { columns, rows } = React.useContext(Context) ?? {
    columns: 4,
    rows: 4,
  };

  return React.useMemo(() => ({ columns, rows }), [columns, rows]);
}

export function useScore() {
  const fallback = useSharedValue<number>(0);
  const { score } = React.useContext(Context) ?? {};

  return useDerivedValue<number | null>(() => {
    return score ? score.value : fallback.value;
  });
}

export function useGameState(): GameTypes.Status {
  const fallback = "user-turn";
  const { status } = React.useContext(Context) ?? {};

  return status ?? fallback;
}

export function useSetGame() {
  const { setGame, game } = React.useContext(Context) ?? {};

  return {
    setGame: React.useCallback(
      (game: GameTypes.GameConfig) => {
        setGame?.(game);
      },
      [setGame]
    ),
    game,
  };
}

function getCollapsingFromDirection(action: GameTypes.Action) {
  switch (action) {
    case "up":
      return "top";
    case "down":
      return "bottom";
    case "left":
      return "left";
    case "right":
      return "right";
    default:
      return null;
  }
}

export function GameProvider(props: { children: React.ReactNode }) {
  const { vibrate } = useVibrate();
  const [game, setGame] = React.useState<GameTypes.GameConfig>(defaultGame);

  const animationProgress = useSharedValue<number>(0);

  const rand = React.useMemo(() => withRand(generateSeed()), []);

  const [columns, setColumns] = React.useState<number>(
    game.defaultGridSize.columns
  );
  const [rows, setRows] = React.useState<number>(game.defaultGridSize.rows);

  const callbacks = React.useRef<Record<GameTypes.TileId, TileSubscriber>>({});

  const currentStateRef = React.useRef(
    game.getInitState({
      gridSize: { columns, rows },
      rand,
      settings: game.defaultSettings,
    })
  );

  const nextStateRef = React.useRef<GameTypes.GameState | null>(null);

  const score = useSharedValue<number>(currentStateRef.current.score);
  const [status, setStatus] = React.useState<GameTypes.Status>(
    currentStateRef.current.status
  );

  const getTile = React.useCallback<GameContext["getTile"]>(
    (tileId, state = currentStateRef.current) => {
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
    setStatus(currentStateRef.current.status);
    score.value = currentStateRef.current.score;

    Object.entries(callbacks.current).forEach(([tileIdString, callback]) => {
      const tileId = parseInt(tileIdString);

      callback(getTile(tileId), null);
    });

    animationProgress.value = 0;
  }, [animationProgress, getTile, score]);

  const pendingActions = React.useRef<GameTypes.Action[]>([]);

  const handleAction = React.useCallback<GameContext["handleAction"]>(
    (action, options) => {
      // If there's a next state we're processing and it's not a user turn, we don't want to process
      // the action, or if the current state is not a user turn.
      if (nextStateRef.current) {
        if (nextStateRef.current.status !== "user-turn" && action !== "tick")
          return;
      } else if (
        currentStateRef.current.status !== "user-turn" &&
        action !== "tick"
      ) {
        return;
      }

      const animationDuration = options?.animationDuration ?? duration;

      vibrate?.();

      // Prevent action if animation is in progress
      if (animationProgress.value > 0 && animationProgress.value < 1) {
        pendingActions.current.push(action);

        return;
      }

      animationProgress.value = 0;

      const nextState = game.applyAction({
        action,
        gridSize: { columns, rows },
        state: currentStateRef.current,
        rand,
      });

      nextStateRef.current = nextState;

      function postAction() {
        currentStateRef.current = nextState;
        nextStateRef.current = null;

        setAllToCurrentState();

        if (currentStateRef.current.status === "ai-turn") {
          pendingActions.current = [];

          handleAction("tick");

          return;
        }

        if (pendingActions.current.length > 0) {
          const nextAction = pendingActions.current.shift();

          if (!nextAction) return;

          handleAction(nextAction, {
            animationDuration: pendingDuration,
          });
        }
      }

      const diffs = getGameStateDiffs(currentStateRef.current, nextState);

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
                collapsing: getCollapsingFromDirection(action) ?? "center",
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
          case "remove": {
            const { tileId } = diff.payload;

            const tile = getTile(tileId, currentStateRef.current);

            if (!tile) {
              break;
            }

            newTileStates[tileId] = {
              ...tile,
              collapsing: "center",
              scalePop: false,
            };

            break;
          }
          case "value-change": {
            const { tileId } = diff.payload;

            const tile = getTile(tileId, nextState);

            if (!tile) {
              break;
            }

            newTileStates[tileId] = {
              ...tile,
              collapsing: null,
              scalePop: true,
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

      score.value = withTiming(nextState.score, {
        duration: animationDuration,
      });

      animationProgress.value = withTiming(
        1,
        { duration: animationDuration },
        () => {
          runOnJS(postAction)();
        }
      );
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
      score,
    ]
  );

  const reset = React.useCallback<GameContext["reset"]>(() => {
    currentStateRef.current = game.getInitState({
      gridSize: { columns, rows },
      rand,
      settings: game.defaultSettings,
    });

    setStatus(currentStateRef.current.status);
    score.value = currentStateRef.current.score;

    setAllToCurrentState();
  }, [game, rand, setAllToCurrentState, rows, columns, score]);

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
      setRows,
      setColumns,
      columns,
      rows,
      score,
      status,
      setGame,
    }),
    [
      game,
      subscribeToTile,
      animationProgress,
      getTile,
      handleAction,
      reset,
      setRows,
      setColumns,
      columns,
      rows,
      score,
      status,
    ]
  );

  return <Context.Provider value={value}>{props.children}</Context.Provider>;
}
