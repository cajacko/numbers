import React from "react";
import { useSharedValue } from "react-native-reanimated";
import * as Types from "../Game.types";
// import two048 from "../logic/two048";

export default function useGameState() {
  const columns = 4;
  const rows = 4;
  const progress = useSharedValue<number>(0);
  const isAnimating = useSharedValue<boolean>(false);

  const blockIds: string[] = React.useMemo(
    () =>
      Array.from(
        // Lets have twice as many blocks as we need, as we may show more than the max on animations
        { length: rows * columns * 2 },
        (_, i): string => `block-${i}`
      ),
    [rows, columns]
  );

  // const initPrevState = React.useMemo(
  //   () =>
  //     two048.getInitialGameState({
  //       blockIds,
  //       rows,
  //       columns,
  //     }),
  //   [blockIds, rows, columns]
  // );

  const prevState = useSharedValue<Types.GameState>({
    blocks: {},
    state: "playing",
  });
  const nextState = useSharedValue<Types.GameState | null>(null);

  return {
    isAnimating,
    columns,
    rows,
    progress,
    prevState,
    nextState,
    blockIds,
  };
}
