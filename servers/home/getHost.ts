import { getServerAvailableRam } from "./getServerAvailableRam.ts"
import { getServerList } from "./getServerList.ts"
import { getSortedByMaxRamServerList } from "./getSortedByMaxRamServerList.ts"

export function getHost(
  ns: NS,
  ram: number,
  sortedServerList: Array<string>,
): string {
  if (ram <= 0) {
    return ""
  }
  let y = ""
  for (let i = 0; i < sortedServerList.length; i++) {
    const host = sortedServerList[i]
    if (!ns.hasRootAccess(host)) {
      continue
    }
    const availableRam = getServerAvailableRam(ns, host)
    if (availableRam < ram) {
      continue
    }
    y = host
    break
  }
  return y
}

export async function main(ns: NS): Promise<void> {
  if ((typeof ns.args[0]) != "number") {
    ns.tprint(`first argument was expected ram (GiB): ${ns.args[0]}`)
    return
  }
  const ram = ns.args[0] as number
  const serverList = getServerList(ns)
  const sortedServerList = getSortedByMaxRamServerList(ns, serverList)
  const host = getHost(ns, ram, sortedServerList)
  ns.tprint(`host: ${host}, ram: ${ns.formatRam(ram)}`)
}