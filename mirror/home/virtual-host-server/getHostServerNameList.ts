import { getPurchasedServerNameList } from "../purchased-server/getPurchasedServerNameList.ts"
import { getServerNameList } from "../util/getServerNameList.ts"

export function getHostServerNameList(
  ns: NS,
  serverNameList: Array<string>,
): Array<string> {
  const y: Array<string> = []

  for (let i = 0; i < serverNameList.length; i++) {
    const severName = serverNameList[i]
    const server = ns.getServer(severName)
    if (server.maxRam == 0) {
      continue
    }
    y.push(severName)
  }

  const purchasedServerNameList = getPurchasedServerNameList(ns)
  for (let i = 0; i < purchasedServerNameList.length; i++) {
    const purchasedServerName = purchasedServerNameList[i]
    if (!y.includes(purchasedServerName)) {
      y.push(purchasedServerName)
    }
  }
  return y
}

export async function main(ns: NS): Promise<void> {
  const serverNameList = getServerNameList(ns)
  const hostServerNameList = getHostServerNameList(ns, serverNameList)
  ns.tprint(`hostServerNameList: ${hostServerNameList}`)
}
