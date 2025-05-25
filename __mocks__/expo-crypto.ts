let count = 0;

export function randomUUID(): string {
  return `uuid-${count++}`;
}
