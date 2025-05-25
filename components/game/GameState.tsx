import React from "react";
import Controls from "./Controls";
import Grid from "./Grid";
import useActions from "./hooks/useActions";
import useGameState from "./hooks/useGameState";

export interface GameStateProps {}

export default function GameState(props: GameStateProps): React.ReactNode {
  const state = useGameState();
  const { handleAction, panGesture, reset } = useActions(state);

  return (
    <>
      <Grid
        columns={state.columns}
        rows={state.rows}
        prevState={state.prevState}
        nextState={state.nextState}
        progress={state.progress}
        blockIds={state.blockIds}
        gesture={panGesture}
      />
      <Controls
        handleAction={handleAction}
        reset={reset}
        // progress={state.progress}
      />
    </>
  );
}
