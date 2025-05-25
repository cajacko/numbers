import * as Types from "@/game/Game.types";
import withRand from "@/utils/withRand";

export type GetRandomPositionProps = {
  gridSize: Types.GridSize;
  seed: string;
};

export default function getRandomPosition({
  gridSize,
  seed,
}: GetRandomPositionProps): Types.Position {
  const rand = withRand(seed);

  const row = Math.floor(rand() * gridSize.rows);
  const column = Math.floor(rand() * gridSize.columns);

  return [row, column];
}
