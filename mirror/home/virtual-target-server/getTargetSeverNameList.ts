import { getServerList } from "../getServerList.ts"
import { getSortedByAvailableMoneyServerList } from "../getSortedByAvailableMoneyServerList.ts"
import { isPurchasedServer } from "../purchased-server/isPurchasedServer.ts"

export function getTargetServerNameList(
  sortedServerList: Array<string>,
): Array<string> {
  const y: Array<string> = []
  for (let i = 0; i < sortedServerList.length; i++) {
    const severName = sortedServerList[i]
    if (severName == "home") {
      continue
    }
    if (isPurchasedServer(severName)) {
      continue
    }
    y.push(severName)
  }
  return y
}

export async function main(ns: NS): Promise<void> {
  const serverList = getServerList(ns)
  const sortedServerList = getSortedByAvailableMoneyServerList(ns, serverList)
  const targetServerList = getTargetServerNameList(sortedServerList)
  ns.tprint(`targetServerList: ${targetServerList}`)
}
