import * as FileSystem from "expo-file-system";
import * as GameTypes from "@/game/Game.types";

const FILE_PATH = FileSystem.documentDirectory + "game-state.json";

export async function loadGameState(): Promise<GameTypes.GameState | null> {
  try {
    const info = await FileSystem.getInfoAsync(FILE_PATH);
    if (!info.exists) return null;
    const contents = await FileSystem.readAsStringAsync(FILE_PATH);
    return JSON.parse(contents) as GameTypes.GameState;
  } catch {
    return null;
  }
}

export async function saveGameState(state: GameTypes.GameState): Promise<void> {
  try {
    await FileSystem.writeAsStringAsync(FILE_PATH, JSON.stringify(state));
  } catch {
    // ignore write errors
  }
}
