import * as GameTypes from "@/game/Game.types";
import getGameStateDiffs from "@/game/utils/getGameStateDiffs";
import getLevelSettings from "@/game/utils/getLevelSettings";
import { runOnJS, withTiming } from "react-native-reanimated";
import React from "react";
import getCollapsingFromDirection from "../getCollapsingFromDirection";
import { GameContext, TileAnimatingState } from "../GameContext";
import useVibrate from "@/hooks/useVibrate";
import { generateSeed } from "@/utils/withRand";
import useGameState from "./useGameState";

export default function useGameActions(state: ReturnType<typeof useGameState>) {
  const { vibrate } = useVibrate();
  const pendingActions = React.useRef<GameTypes.Action[]>([]);

  const handleAction = React.useCallback<GameContext["handleAction"]>(
    (action, options) => {
      const {
        game,
        animationProgress,
        currentStateRef,
        nextStateRef,
        prevStateRef,
        setAllToCurrentState,
        getTile,
        callbacks,
        score,
      } = state as any;

      if (nextStateRef.current) {
        if (nextStateRef.current.status !== "user-turn" && action !== "tick")
          return;
      } else if (
        currentStateRef.current.status !== "user-turn" &&
        action !== "tick"
      ) {
        return;
      }

      const duration = 300;
      const pendingDuration = duration / 2;
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
    [state]
  );

  const reset = React.useCallback<GameContext["reset"]>(() => {
    const {
      game,
      currentStateRef,
      setLevel,
      setSettings,
      setStatus,
      score,
      setAllToCurrentState,
    } = state as any;

    state.prevStateRef.current = currentStateRef.current;

    currentStateRef.current = game.applyAction({
      action: null,
      seed: generateSeed(),
    });

    setLevel(currentStateRef.current.level);
    setSettings(getLevelSettings(currentStateRef.current));
    setStatus(currentStateRef.current.status);
    score.value = currentStateRef.current.score;

    setAllToCurrentState();
  }, [state]);

  return { handleAction, reset } as const;
}

