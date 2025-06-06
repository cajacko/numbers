import * as GameTypes from "@/game/Game.types";

export default function getCollapsingFromDirection(
  action: GameTypes.Action["type"]
): "top" | "bottom" | "left" | "right" | null {
  switch (action) {
    case "up":
      return "top";
    case "down":
      return "bottom";
    case "left":
      return "left";
    case "right":
      return "right";
    default:
      return null;
  }
}
