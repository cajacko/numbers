import * as Types from "@/game/Game.types";
import getFreeTileId from "./getFreeTileId";
import getRandomAvailablePosition, {
  GetRandomAvailablePositionProps,
} from "./getRandomAvailablePosition";

export type SpawnTileProps = GetRandomAvailablePositionProps & {
  tile: Omit<Types.Tile, "position" | "id" | "mergedFrom">;
  position?: Types.Position;
};

export default function spawnTile({
  tile,
  position: _position,
  ...props
}: SpawnTileProps): Types.GameState | null {
  const position = _position ?? getRandomAvailablePosition(props);

  if (!position) {
    return null;
  }

  const newTile: Types.Tile = {
    position,
    id: getFreeTileId(props.state),
    mergedFrom: null,
    ...tile,
  };

  const newTiles = [...props.state.tiles, newTile];

  return {
    ...props.state,
    tiles: newTiles,
  };
}
