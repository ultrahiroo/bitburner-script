function _scanRecursive(ns: NS, host: string, parent: string): Map<string, any> {
  // const y = new Map<string, any>()
  const y = {}
  const host_list = ns.scan(host)
  for (let i = 0; i < host_list.length; i++) {
    const next_host = host_list[i]
    if (next_host == parent) {
      continue
    }
    // y.set(next_host, _scanRecursive(ns, next_host, host)) 
    y[next_host] = _scanRecursive(ns, next_host, host)
  }
  return y
}

export function scanTree(ns: NS): Map<string, any> {
  const y = _scanRecursive(ns, "home", "home")
  return y
}

export async function main(ns: NS): Promise<void> {
  const tree = scanTree(ns)
  ns.tprint(`home: ${JSON.stringify(tree, null, 2)}`)
}