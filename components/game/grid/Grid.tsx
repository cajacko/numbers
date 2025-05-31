import ExitLocation, {
  ExitLocationProps,
} from "@/components/game/ExitLocation";
import TileConnected from "@/components/game/tile/TileConnected";
import * as GameTypes from "@/game/Game.types";
import React from "react";
import { StyleSheet, View } from "react-native";
import {
  ComposedGesture,
  GestureDetector,
  GestureType,
} from "react-native-gesture-handler";
import { useSharedValue } from "react-native-reanimated";

export interface GridProps {
  rows: number;
  columns: number;
  gesture: GestureType | ComposedGesture;
  tileIds: GameTypes.TileId[];
  availableHeight: number;
  availableWidth: number;
  exitLocations?: GameTypes.ExitLocation[];
}

const maxTileSize = 250;

export default React.memo(function Grid({
  columns,
  rows,
  gesture,
  tileIds,
  availableHeight,
  availableWidth,
  exitLocations,
}: GridProps): React.ReactNode {
  const tileSize = React.useMemo((): number => {
    const size = Math.min(
      availableHeight / rows,
      availableWidth / columns,
      maxTileSize
    );

    return Math.floor(size);
  }, [availableHeight, availableWidth, columns, rows]);

  const sizeSharedValue = useSharedValue<number>(tileSize);

  React.useEffect(() => {
    sizeSharedValue.value = tileSize;
  }, [tileSize, sizeSharedValue]);

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
          size={sizeSharedValue}
          style={{ zIndex: tileIds.length - i }}
        />
      )),
    [tileIds, sizeSharedValue]
  );

  return (
    <GestureDetector gesture={gesture}>
      <View style={styles.container}>
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
          {tiles}
        </View>
        {exitLocations?.map(({ index, requirements, side }, i) => (
          <ExitLocation
            key={i}
            index={index}
            side={side}
            type={requirements.type}
            value={requirements.value}
            tileSize={sizeSharedValue}
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
});
