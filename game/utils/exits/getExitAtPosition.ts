import * as Types from "@/game/Game.types";

export default function getExitAtPosition(
  goals: Types.Goal[],
  position: Omit<Types.ExitLocation, "requirements">
): Types.ExitLocation | null {
  let exitLocation: Types.ExitLocation | null = null;

  goals.forEach((goal) => {
    if (goal.type === "exit-location") {
      if (
        goal.payload.side === position.side &&
        goal.payload.index === position.index
      ) {
        exitLocation = goal.payload;
      }
    }
  });

  return exitLocation;
}
