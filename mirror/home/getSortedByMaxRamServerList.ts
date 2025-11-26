import { getServerList } from "./getServerList.ts"

export function getSortedByMaxRamServerList(
  ns: NS,
  serverList: Array<string>,
): Array<string> {
  const itemList = []
  for (let i = 0; i < serverList.length; i++) {
    const host = serverList[i]
    const maxRam = ns.getServerMaxRam(host)
    if (maxRam == 0) {
      continue
    }
    const item = {
      name: host,
      maxRam: maxRam,
    }
    itemList.push(item)
  }
  const sortedItemList = itemList.toSorted((a, b) => {
    if (a.name == "home") {
      return 1
    }
    return a.maxRam - b.maxRam
  })

  const y = []
  for (let i = 0; i < sortedItemList.length; i++) {
    y.push(sortedItemList[i].name)
  }
  return y
}

export async function main(ns: NS): Promise<void> {
  const serverList = getServerList(ns)
  const sortedServerList = getSortedByMaxRamServerList(ns, serverList)
  ns.tprint(`sortedServerList: ${sortedServerList}`)
}