function _scanRecursive(ns: NS, host: string, parent: string, y: Array<string>): void {
  const scannedList = ns.scan(host)
  for (let i = 0; i < scannedList.length; i++) {
    if (y.includes(scannedList[i])) {
      continue
    }
    y.push(scannedList[i])
  }
  for (let i = 0; i < scannedList.length; i++) {
    const next_host = scannedList[i]
    if (next_host == parent) {
      continue
    }
    _scanRecursive(ns, next_host, host, y)
  }
}

export function getServerNameList(ns: NS): Array<string> {
  const y: Array<string> = ["home"]
  _scanRecursive(ns, "home", "home", y)
  return y
}

export async function main(ns: NS): Promise<void> {
  const serverNameList = getServerNameList(ns)
  ns.tprint(`serverNameList: ${serverNameList}`)
}