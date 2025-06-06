import * as Types from "@/game/Game.types";

export default function getColorsFromValue(value: Types.Value): {
  backgroundColor: string;
  textColor: string;
} {
  switch (value) {
    case null:
      return { backgroundColor: "black", textColor: "black" };
    case 0:
      return { backgroundColor: "#eee4da", textColor: "#776e65" };
    case 1:
      return { backgroundColor: "#ede0c8", textColor: "#776e65" };
    case 2:
      return { backgroundColor: "#f2b179", textColor: "#f9f6f2" };
    case 4:
      return { backgroundColor: "#f59563", textColor: "#f9f6f2" };
    case 8:
      return { backgroundColor: "#f67c5f", textColor: "#f9f6f2" };
    case 16:
      return { backgroundColor: "#f65e3b", textColor: "#f9f6f2" };
    case 32:
      return { backgroundColor: "#edcf72", textColor: "#f9f6f2" };
    case 64:
      return { backgroundColor: "#edcc61", textColor: "#f9f6f2" };
    case 128:
      return { backgroundColor: "#edc850", textColor: "#f9f6f2" };
    case 256:
      return { backgroundColor: "#edc53d", textColor: "#f9f6f2" };
    case 512:
      return { backgroundColor: "#edc22e", textColor: "#f9f6f2" };
    case 1024:
      return { backgroundColor: "#edc22e", textColor: "#f9f6f2" };
    case 2048:
      return { backgroundColor: "#edc22e", textColor: "#f9f6f2" };
    default:
      return { backgroundColor: "#cdc1b4", textColor: "#776e65" };
  }
}
