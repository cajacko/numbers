import TileConnected from "@/components/game/tile/TileConnected";
import * as GameTypes from "@/game/Game.types";
import React from "react";
import { StyleSheet, View, ViewProps } from "react-native";
import { GestureDetector, GestureType } from "react-native-gesture-handler";
import { useSharedValue } from "react-native-reanimated";

export interface GridProps {
  rows: number;
  columns: number;
  gesture: GestureType;
  tileIds: GameTypes.TileId[];
}

export default React.memo(function Grid({
  columns,
  rows,
  gesture,
  tileIds,
}: GridProps): React.ReactNode {
  const [ready, setReady] = React.useState(false);

  const size = useSharedValue<number>(100);

  const onLayout = React.useCallback<NonNullable<ViewProps["onLayout"]>>(
    (event) => {
      const { width } = event.nativeEvent.layout;

      const containerWidth = width;
      const blockWidth = containerWidth / columns;
      size.value = blockWidth;

      setReady(true);
    },
    [size, columns]
  );

  const style = React.useMemo(
    () =>
      StyleSheet.flatten([
        styles.container,
        {
          aspectRatio: columns / rows,
        },
      ]),
    [rows, columns]
  );

  const rowIds = React.useMemo(
    () => Array.from({ length: rows }, (_, i) => `row-${i}`),
    [rows]
  );

  const columnIds = React.useMemo(
    () => Array.from({ length: columns }, (_, i) => `column-${i}`),
    [columns]
  );

  return (
    <GestureDetector gesture={gesture}>
      <View style={style} onLayout={onLayout}>
        {rowIds.map((rowId) => (
          <View key={rowId} style={styles.row}>
            {columnIds.map((columnId) => (
              <View key={columnId} style={styles.column}>
                <View style={styles.tile} />
              </View>
            ))}
          </View>
        ))}
        {ready &&
          tileIds.map((tileId) => (
            <TileConnected key={`tile-${tileId}`} id={tileId} size={size} />
          ))}
      </View>
    </GestureDetector>
  );
});

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "#9c8a7a",
    maxWidth: 500,
    maxHeight: 500,
    borderRadius: 10,
  },
  row: {
    flexDirection: "row",
    flex: 1,
  },
  column: {
    flex: 1,
    padding: 8,
  },
  tile: {
    flex: 1,
    borderRadius: 10,
    backgroundColor: "#bead98",
  },
});
