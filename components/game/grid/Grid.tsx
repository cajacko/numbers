import ExitLocation, {
  EXIT_LOCATION_OFFSET,
} from "@/components/game/ExitLocation";
import TileConnected from "@/components/game/tile/TileConnected";
import OverlayTileConnected from "@/components/game/overlayTile/OverlayTileConnected";
import * as GameTypes from "@/game/Game.types";
import React from "react";
import { StyleSheet, View } from "react-native";
import {
  ComposedGesture,
  GestureDetector,
  GestureType,
} from "react-native-gesture-handler";
import { SharedValue, useSharedValue } from "react-native-reanimated";

export interface GridProps {
  rows: number;
  columns: number;
  gesture: GestureType | ComposedGesture;
  tileIds: GameTypes.TileId[];
  overlayTileIds: GameTypes.TileId[];
  availableHeight: number;
  availableWidth: number;
  exitLocations?: GameTypes.ExitLocation[];
  tileSize?: number;
  tileSizeSharedValue?: SharedValue<number>;
  gridPadding?: number;
}

const maxTileSize = 250;

export function useGridDimensions(
  props: Pick<
    GridProps,
    | "rows"
    | "columns"
    | "availableHeight"
    | "availableWidth"
    | "tileSize"
    | "tileSizeSharedValue"
    | "gridPadding"
  >
) {
  const gridPadding = EXIT_LOCATION_OFFSET;

  const tileSize = React.useMemo((): number => {
    const spacing = gridPadding * 2;

    const size = Math.min(
      (props.availableHeight - spacing) / props.rows,
      (props.availableWidth - spacing) / props.columns,
      maxTileSize
    );

    return Math.floor(size);
  }, [
    props.availableHeight,
    props.availableWidth,
    props.columns,
    props.rows,
    gridPadding,
  ]);

  const tileSizeSharedValue = useSharedValue<number>(tileSize);

  React.useEffect(() => {
    tileSizeSharedValue.value = tileSize;
  }, [tileSize, tileSizeSharedValue]);

  return {
    tileSize: props.tileSize ?? tileSize,
    tileSizeSharedValue: props.tileSizeSharedValue ?? tileSizeSharedValue,
    gridPadding: props.gridPadding ?? gridPadding,
  };
}

export default React.memo(function Grid(props: GridProps): React.ReactNode {
  const { rows, columns, tileIds, overlayTileIds, gesture, exitLocations } =
    props;

  const { tileSize, tileSizeSharedValue, gridPadding } =
    useGridDimensions(props);

  const innerStyle = React.useMemo(
    () =>
      StyleSheet.flatten([
        styles.inner,
        {
          width: tileSize * columns,
          height: tileSize * rows,
          maxWidth: tileSize * columns,
          maxHeight: tileSize * rows,
        },
      ]),
    [tileSize, rows, columns]
  );

  const containerStyle = React.useMemo(
    () => StyleSheet.flatten([styles.container, { padding: gridPadding }]),
    [gridPadding]
  );

  const rowStyle = React.useMemo(
    () =>
      StyleSheet.flatten([
        styles.row,
        {
          height: tileSize,
          maxHeight: tileSize,
        },
      ]),
    [tileSize]
  );

  const cellStyle = React.useMemo(
    () =>
      StyleSheet.flatten([
        styles.cell,
        {
          height: tileSize,
          width: tileSize,
          maxWidth: tileSize,
          maxHeight: tileSize,
        },
      ]),
    [tileSize]
  );

  const rowIds = React.useMemo(
    () => Array.from({ length: rows }, (_, i) => `row-${i}`),
    [rows]
  );

  const columnIds = React.useMemo(
    () => Array.from({ length: columns }, (_, i) => `column-${i}`),
    [columns]
  );

  const tiles = React.useMemo(
    () =>
      tileIds.map((tileId, i) => (
        <TileConnected
          key={`tile-${tileId}`}
          id={tileId}
          size={tileSizeSharedValue}
          style={{ zIndex: tileIds.length - i }}
        />
      )),
    [tileIds, tileSizeSharedValue]
  );

  const overlayTiles = React.useMemo(
    () =>
      overlayTileIds.map((tileId, i) => (
        <OverlayTileConnected
          key={`overlay-tile-${tileId}`}
          id={tileId}
          size={tileSizeSharedValue}
          style={{ zIndex: overlayTileIds.length - i }}
        />
      )),
    [overlayTileIds, tileSizeSharedValue]
  );

  return (
    <GestureDetector gesture={gesture}>
      <View style={containerStyle}>
        <View style={innerStyle}>
          {rowIds.map((rowId) => (
            <View key={rowId} style={rowStyle}>
              {columnIds.map((columnId) => (
                <View key={columnId} style={cellStyle}>
                  <View style={styles.tile} />
                </View>
              ))}
            </View>
          ))}
          <View style={styles.tilesContainer}>{tiles}</View>
          <View style={styles.overlayTilesContainer}>{overlayTiles}</View>
        </View>
        {exitLocations?.map(({ index, requirements, side }, i) => (
          <ExitLocation
            key={i}
            index={index}
            side={side}
            type={requirements.type}
            value={requirements.value}
            tileSize={tileSizeSharedValue}
            columns={columns}
            rows={rows}
          />
        ))}
      </View>
    </GestureDetector>
  );
});

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  inner: {
    backgroundColor: "#9c8a7a",
    borderRadius: 10,
    overflow: "hidden",
    flex: 1,
    zIndex: 1,
  },
  row: {
    flexDirection: "row",
    flex: 1,
    overflow: "hidden",
  },
  cell: {
    padding: 8,
    overflow: "hidden",
  },
  tile: {
    flex: 1,
    borderRadius: 10,
    backgroundColor: "#bead98",
    overflow: "hidden",
  },
  tilesContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
  },
  overlayTilesContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 3,
  },
});
