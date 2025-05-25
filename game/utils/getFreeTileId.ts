import * as Types from "@/game/Game.types";

export default function getFreeTileId(state: Types.GameState): Types.TileId {
  const usedIds: Types.TileId[] = [];

  state.tiles.forEach(({ id, mergedFrom }) => {
    usedIds.push(id);

    if (mergedFrom) {
      usedIds.push(...mergedFrom);
    }
  });

  let newId = 1;

  while (usedIds.includes(newId)) {
    newId++;
  }

  return newId;
}
