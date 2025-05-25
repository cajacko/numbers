import * as Crypto from "expo-crypto";
import { v4 } from "uuid";

export default function uuid() {
  try {
    if (!Crypto?.randomUUID) {
      return v4();
    }

    return Crypto.randomUUID();
  } catch {
    return v4();
  }
}
