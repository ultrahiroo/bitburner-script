import { getServerList } from "./getServerList.ts"
import { getSortedByAvailableMoneyServerList } from "./getSortedByAvailableMoneyServerList.ts"
import { isPurchasedServer } from "./purchased-server/isPurchasedServer.ts"

export function getTargetServerList(ns: NS, sortedServerList: Array<string>): Array<string> {
  const hackingLevel = ns.getHackingLevel()
  const hackingLevelThreshold = hackingLevel / 2
  const y = []

  for (let i = 0; i < sortedServerList.length; i++) {
    const host = sortedServerList[i]
    if (host == "home") {
      continue
    }
    if (isPurchasedServer(host)) {
      continue
    }
    const requiredHackingLevel = ns.getServerRequiredHackingLevel(host)
    if (requiredHackingLevel > hackingLevelThreshold) {
      continue
    }
    y.push(host)
  }
  return y
}

export async function main(ns: NS): Promise<void> {
  const serverList = getServerList(ns)
  const sortedServerList = getSortedByAvailableMoneyServerList(ns, serverList)
  const targetServerList = getTargetServerList(ns, sortedServerList)
  ns.tprint(`targetServerList: ${targetServerList}`)
}