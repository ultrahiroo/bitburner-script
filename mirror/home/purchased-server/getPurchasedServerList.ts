import { isPurchasedServer } from "./isPurchasedServer.ts";

function _onlyPurchasedServer(value: string, index: number, array: Array<string>): boolean {
  return isPurchasedServer(value)
}

export function getPurchasedServerList(ns: NS) {
  const y = ns.scan("home").filter(_onlyPurchasedServer)
  return y
}

export async function main(ns: NS): Promise<void> {
  const purchasedServerList = getPurchasedServerList(ns)
  ns.tprint(`purchasedServerList: ${purchasedServerList}`)
}