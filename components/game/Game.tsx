import { GameProvider } from "@/components/game/Game.context";
import GridConnected from "@/components/game/grid/GridConnected";
import React from "react";

export interface GameProps {}

export default function Game(props: GameProps): React.ReactNode {
  return (
    <GameProvider>
      <GridConnected />
    </GameProvider>
  );
}
