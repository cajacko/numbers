import * as GameTypes from "@/game/Game.types";
import { defaultGame } from "@/game/games";
import getGameStateDiffs from "@/game/utils/getGameStateDiffs";
import getTestPropsFromState from "@/game/utils/getTestPropsFromState";
import getLevelSettings from "@/game/utils/getLevelSettings";
import useVibrate from "@/hooks/useVibrate";
import { generateSeed } from "@/utils/withRand";
import React from "react";
import { runOnJS, useSharedValue, withTiming } from "react-native-reanimated";
import Context, {
  GameContext,
  TileAnimatingState,
  TileState,
  TileSubscriber,
} from "./GameContext";
import getCollapsingFromDirection from "./getCollapsingFromDirection";

const duration = 300;
const pendingDuration = duration / 2;

export function GameProvider(props: { children: React.ReactNode }) {
  const { vibrate } = useVibrate();
  const [game] = React.useState<GameTypes.GameConfig>(defaultGame);

  const animationProgress = useSharedValue<number>(0);
  const callbacks = React.useRef<Record<GameTypes.TileId, TileSubscriber>>({});

  const currentStateRef = React.useRef(
    game.applyAction({
      action: null,
      seed: generateSeed(),
    })
  );

  const [settings, setSettings] = React.useState<GameTypes.Settings>(
    getLevelSettings(currentStateRef.current)
  );

  const prevStateRef = React.useRef<GameTypes.GameState | null>(null);
  const nextStateRef = React.useRef<GameTypes.GameState | null>(null);
  const [level, setLevel] = React.useState<number>(currentStateRef.current.level);
  const score = useSharedValue<number | null>(currentStateRef.current.score);
  const [status, setStatus] = React.useState<GameTypes.Status>(
    currentStateRef.current.status
  );

  const getTile = React.useCallback<GameContext["getTile"]>(
    (tileId, state = currentStateRef.current) => {
      const tile = state.tiles.find((t) => t.id === tileId);

      if (!tile) return null;

      return {
        mergedFrom: null,
        position: tile.position,
        value: tile.value,
        backgroundColor: tile.backgroundColor,
        textColor: tile.textColor,
      } as TileState;
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
    setSettings(getLevelSettings(currentStateRef.current));
    setLevel(currentStateRef.current.level);
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

      if (animationProgress.value > 0 && animationProgress.value < 1) {
        pendingActions.current.push(action);
        return;
      }

      animationProgress.value = 0;

      const nextState = game.applyAction({
        action,
        state: currentStateRef.current,
      });

      nextStateRef.current = nextState;

      function postAction() {
        prevStateRef.current = currentStateRef.current;
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

      const newTileStates: Record<GameTypes.TileId, TileAnimatingState | undefined> = {};

      diffs.forEach((diff) => {
        switch (diff.type) {
          case "move": {
            const { tileId, toPosition } = diff.payload;

            const tile = getTile(tileId, nextState);

            if (!tile) {
              break;
            }

            const newTileState: TileAnimatingState = {
              value: tile.value,
              backgroundColor: tile.backgroundColor,
              textColor: tile.textColor,
              position: toPosition,
              collapsing: null,
              scalePop: false,
            };

            newTileStates[tileId] = newTileState;

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
            const { tileId, position, value, backgroundColor, textColor } = diff.payload;

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
    [game, getTile, animationProgress, setAllToCurrentState, vibrate, score]
  );

  const reset = React.useCallback<GameContext["reset"]>(() => {
    prevStateRef.current = currentStateRef.current;

    currentStateRef.current = game.applyAction({
      action: null,
      seed: generateSeed(),
    });

    setLevel(currentStateRef.current.level);
    setSettings(getLevelSettings(currentStateRef.current));
    setStatus(currentStateRef.current.status);
    score.value = currentStateRef.current.score;

    setAllToCurrentState();
  }, [game, setAllToCurrentState, score]);

  const init = React.useRef(true);

  React.useEffect(() => {
    if (init.current) {
      init.current = false;

      return;
    }

    reset();
  }, [game, reset]);

  const getTestProps = React.useCallback<GameContext["getTestProps"]>(() => {
    return {
      current: getTestPropsFromState(currentStateRef.current),
      previous: prevStateRef.current
        ? getTestPropsFromState(prevStateRef.current)
        : null,
    };
  }, []);

  const value = React.useMemo<GameContext>(() => {
    const exitLocations: GameTypes.ExitLocation[] = [];

    settings.goals.forEach((goal) => {
      if (goal.type === "exit-location") {
        exitLocations.push(goal.payload);
      }
    });

    return {
      game,
      subscribeToTile,
      getTile,
      animationProgress,
      handleAction,
      reset,
      score,
      status,
      getTestProps,
      columns: settings.gridSize.columns,
      rows: settings.gridSize.rows,
      exitLocations,
      level,
    };
  }, [
    game,
    subscribeToTile,
    animationProgress,
    getTile,
    handleAction,
    reset,
    score,
    status,
    getTestProps,
    settings,
    level,
  ]);

  return <Context.Provider value={value}>{props.children}</Context.Provider>;
}
