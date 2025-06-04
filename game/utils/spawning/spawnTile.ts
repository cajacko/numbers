import * as Types from "@/game/Game.types";
import getFreeTileId from "../getFreeTileId";
import getRandomAvailablePosition, {
  GetRandomAvailablePositionProps,
} from "../positions/getRandomAvailablePosition";
import getPrioritisedSpawnPositions from "./getPrioritisedSpawnPositions";
import getIsAvailablePosition from "@/game/utils/positions/getIsAvailablePosition";

export type SpawnTileProps = GetRandomAvailablePositionProps & {
  tile: Omit<Types.Tile, "position" | "id" | "mergedFrom">;
  position?: Types.Position;
};

function getPosition(
  props: GetRandomAvailablePositionProps
): Types.Position | null {
  const prioritisedSpawnPositions = getPrioritisedSpawnPositions(props.state);

  if (prioritisedSpawnPositions) {
    // find the first available position from prioritised spawn positions
    for (const position of prioritisedSpawnPositions) {
      if (getIsAvailablePosition(props.state, position)) {
        return position;
      }
    }
  }

  return getRandomAvailablePosition(props);
}

export default function spawnTile({
  tile,
  position: _position,
  ...props
}: SpawnTileProps): Types.GameState | null {
  const position = _position ?? getPosition(props);

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
