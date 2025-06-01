import uuid from "./uuid";

/**
 * Generates a random seed using UUIDs.
 * @returns A new random seed string.
 */
export function generateSeed(): string {
  return uuid();
}

/**
 * Mulberry32 PRNG - Fast and simple pseudo-random number generator.
 * @param seed The seed number.
 * @returns A function that generates a pseudo-random number between 0 and 1.
 */
function mulberry32(seed: number): () => number {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function getSeedNumber(seed: number | string): number {
  if (typeof seed === "string") {
    return [...seed].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  }

  return seed;
}

// Rand is a function that when called with an array, returns a random element from that array. and
// if called with nothing it returns a random number between 0 and 1.
export type Rand = {
  <T extends any[]>(array: T): T[number];
  (): number;
};

export default function withRand(seed: string | number = generateSeed()): Rand {
  const rand = mulberry32(getSeedNumber(seed));

  return <T extends any[]>(arr?: T): T[number] | number => {
    if (!arr) {
      return rand();
    }

    if (arr.length === 0) {
      throw new Error("Array cannot be empty");
    }

    const randomIndex = Math.floor(rand() * arr.length);

    return arr[randomIndex];
  };
}
