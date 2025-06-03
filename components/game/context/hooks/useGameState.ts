import * as GameTypes from "@/game/Game.types";
import { defaultGame } from "@/game/games";
import getLevelSettings from "@/game/utils/getLevelSettings";
import { generateSeed } from "@/utils/withRand";
import React from "react";
import { useSharedValue } from "react-native-reanimated";
import { GameContext, TileState, TileSubscriber } from "../GameContext";

export type GameStateRefs = {
  currentStateRef: React.MutableRefObject<GameTypes.GameState>;
  prevStateRef: React.MutableRefObject<GameTypes.GameState | null>;
  nextStateRef: React.MutableRefObject<GameTypes.GameState | null>;
};

export default function useGameState() {
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

  return {
    game,
    animationProgress,
    callbacks,
    currentStateRef,
    prevStateRef,
    nextStateRef,
    level,
    setLevel,
    score,
    status,
    setStatus,
    settings,
    setSettings,
    getTile,
    subscribeToTile,
    setAllToCurrentState,
  } as const;
}

