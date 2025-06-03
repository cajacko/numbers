import * as Types from "@/game/Game.types";

export default function requirementsMet(
  value: Types.Value,
  requirements: Types.ExitLocation["requirements"]
): boolean {
  if (value === null) return false;
  switch (requirements.type) {
    case "greater-than-equal-to":
      return value >= requirements.value;
    case "equal-to":
      return value === requirements.value;
    default:
      return false;
  }
}
