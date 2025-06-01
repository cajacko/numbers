import * as Types from "@/game/Game.types";

export type TilePosition = {
  tileId: number;
  value: Types.Value;
  row: number;
  column: number;
};

export type TestProps = {
  tiles: TilePosition[];
};

export default function getTestPropsFromState(
  state: Types.GameState
): TestProps {
  const positions: TilePosition[] = [];

  state.tiles.forEach((tile) => {
    const [row, column] = tile.position;

    positions.push({
      tileId: tile.id,
      value: tile.value,
      row,
      column,
    });
  });

  return { tiles: positions.sort((a, b) => a.tileId - b.tileId) };
}
