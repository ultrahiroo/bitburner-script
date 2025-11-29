import { getServerList } from "../getServerList.ts"
import { isPurchasedServer } from "../purchased-server/isPurchasedServer.ts"

export function getTargetServerNameList(
  ns: NS,
  serverList: Array<string>,
): Array<string> {
  const y: Array<string> = []
  for (let i = 0; i < serverList.length; i++) {
    const severName = serverList[i]
    if (severName == "home") {
      continue
    }
    if (isPurchasedServer(severName)) {
      continue
    }
    const server = ns.getServer(severName)
    if (server.moneyMax == 0) {
      continue
    }
    y.push(severName)
  }
  return y
}

export async function main(ns: NS): Promise<void> {
  const serverList = getServerList(ns)
  const targetServerList = getTargetServerNameList(ns, serverList)
  ns.tprint(`targetServerList: ${targetServerList}`)
}
