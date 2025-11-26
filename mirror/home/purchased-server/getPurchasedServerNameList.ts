import { getPurchasedServerName } from "./getPurchasedServerName.ts"

export function getPurchasedServerNameList(ns: NS): Array<string> {
  const y = []
  const serverLimit = ns.getPurchasedServerLimit()
  for (let i = 0; i < serverLimit; i++) {
    const serverName = getPurchasedServerName(i)
    y.push(serverName)
  }
  return y
}

export async function main(ns: NS): Promise<void> {
  return
}