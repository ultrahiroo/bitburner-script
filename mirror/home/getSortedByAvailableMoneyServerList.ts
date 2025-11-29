import { getServerList } from "./getServerList.ts"

export function getSortedByAvailableMoneyServerList(
  ns: NS,
  serverList: Array<string>,
): Array<string> {
  const itemList: Array<{ name: string, money: number }> = []
  for (let i = 0; i < serverList.length; i++) {
    const host = serverList[i]
    const money = ns.getServerMoneyAvailable(host)
    if (money == 0) {
      continue
    }
    const item = {
      name: host,
      money: money,
    }
    itemList.push(item)
  }
  const sorted = itemList.toSorted((a, b) => b.money - a.money)

  const y: Array<string> = []
  for (let i = 0; i < sorted.length; i++) {
    y.push(sorted[i].name)
  }
  return y
}

export async function main(ns: NS): Promise<void> {
  const serverList = getServerList(ns)
  const sortedServerList = getSortedByAvailableMoneyServerList(ns, serverList)
  ns.tprint(`sortedServerList: ${sortedServerList}`)
}