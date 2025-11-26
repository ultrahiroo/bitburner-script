import { PURCHASED_SERVER_PREFIX } from "./PURCHASED_SERVER_PREFIX.ts";

export function getPurchasedServerName(index: number): string {
  const n = String(index + 1).padStart(2, '0')
  const y = PURCHASED_SERVER_PREFIX + n
  return y
}

export async function main(ns: NS): Promise<void> {
  return
}