let count = 0;

export function v4(): string {
  return `uuid-${count++}`;
}
