import { PURCHASED_SERVER_PREFIX } from "./PURCHASED_SERVER_PREFIX.ts";

export function isPurchasedServer(host: string): boolean {
  return host.startsWith(PURCHASED_SERVER_PREFIX)
}

export async function main(ns: NS): Promise<void> {
  return
}