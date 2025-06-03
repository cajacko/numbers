import * as GameTypes from "@/game/Game.types";
import getTestPropsFromState from "@/game/utils/getTestPropsFromState";
import React from "react";
import Context, { GameContext } from "./GameContext";
import useGameState from "./hooks/useGameState";
import useGameActions from "./hooks/useGameActions";

export function GameProvider(props: { children: React.ReactNode }) {
  const state = useGameState();
  const { handleAction, reset } = useGameActions(state);

  const init = React.useRef(true);

  React.useEffect(() => {
    if (init.current) {
      init.current = false;

      return;
    }

    reset();
  }, [state.game, reset]);

  const getTestProps = React.useCallback<GameContext["getTestProps"]>(() => {
    return {
      current: getTestPropsFromState(state.currentStateRef.current),
      previous: state.prevStateRef.current
        ? getTestPropsFromState(state.prevStateRef.current)
        : null,
    };
  }, [state]);

  const value = React.useMemo<GameContext>(() => {
    const exitLocations: GameTypes.ExitLocation[] = [];

    state.settings.goals.forEach((goal) => {
      if (goal.type === "exit-location") {
        exitLocations.push(goal.payload);
      }
    });

    return {
      game: state.game,
      subscribeToTile: state.subscribeToTile,
      getTile: state.getTile,
      animationProgress: state.animationProgress,
      handleAction,
      reset,
      score: state.score,
      status: state.status,
      getTestProps,
      columns: state.settings.gridSize.columns,
      rows: state.settings.gridSize.rows,
      exitLocations,
      level: state.level,
    };
  }, [state, handleAction, reset, getTestProps]);

  return <Context.Provider value={value}>{props.children}</Context.Provider>;
}

