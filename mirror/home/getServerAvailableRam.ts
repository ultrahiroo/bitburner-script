export function getServerAvailableRam(ns: NS, host: string): number {
  const y = ns.getServerMaxRam(host) - ns.getServerUsedRam(host)
  return y
}

export async function main(ns: NS): Promise<void> {
  if ((typeof ns.args[0]) != "string") {
    ns.tprint(`first argument was expected host: ${ns.args[0]}`)
    return
  }
  const host = ns.args[0] as string
  const availableRam = getServerAvailableRam(ns, host)
  ns.tprint(`host: ${host}, availableRam: ${ns.formatRam(availableRam)}`)
}