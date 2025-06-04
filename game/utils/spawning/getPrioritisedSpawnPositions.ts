import * as Types from "@/game/Game.types";
import getLevelSettings from "@/game/utils/getLevelSettings";

export default function getPrioritisedSpawnPositions(
  state: Types.GameState
): Types.Position[] | null {
  const settings = getLevelSettings(state);

  if (
    !settings.spawnTilesMethod?.type ||
    settings.spawnTilesMethod?.type === "random"
  ) {
    return null;
  }

  const spawnPosition: {
    position: Types.Position;
    priority: number;
  }[] = [];

  state.overlayTiles.forEach((tile) => {
    tile.icons.forEach((icon) => {
      if (icon.type === "spawn-priority") {
        spawnPosition.push({
          position: tile.position,
          priority: icon.value,
        });
      }
    });
  });

  // Sort the spawn positions by priority (lower priority first)
  spawnPosition.sort((a, b) => a.priority - b.priority);

  return spawnPosition.map((item) => item.position);
}
