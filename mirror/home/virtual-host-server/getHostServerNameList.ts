import { getPurchasedServerNameList } from "../purchased-server/getPurchasedServerNameList.ts"
import { getServerList } from "../getServerList.ts"

export function getHostServerNameList(ns: NS): Array<string> {
  const y = getServerList(ns)
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
  const allServerList = getHostServerNameList(ns)
  ns.tprint(`allServerList: ${allServerList}`)
}
