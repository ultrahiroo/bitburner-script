export async function main(ns: NS): Promise<void> {
  if ((typeof ns.args[0]) != "string") {
    ns.tprint(`first argument was expected host: ${ns.args[0]}`)
    return
  }
  const host = ns.args[0] as string
  ns.tprintRaw(`host: ${host}`)

  const server = ns.getServer(host)
  const maxMoney = ns.getServerMaxMoney(host)
  const money = ns.getServerMoneyAvailable(host)
  ns.tprintRaw(`money: ${ns.formatNumber(money)}/${ns.formatNumber(maxMoney)}`)

  const baseSecurityLevel = ns.getServerBaseSecurityLevel(host)
  const minSecurityLevel = ns.getServerMinSecurityLevel(host)
  const securityLevel = ns.getServerSecurityLevel(host)
  ns.tprintRaw(`base security level: ${baseSecurityLevel}`)
  ns.tprintRaw(`minimum security level: ${minSecurityLevel}`)
  ns.tprintRaw(`security level: ${securityLevel}`)

  const requiredHackingLevel = ns.getServerRequiredHackingLevel(host)
  const hackingLevel = ns.getHackingLevel()
  ns.tprintRaw(`required hacking level: ${requiredHackingLevel}`)
  ns.tprintRaw(`hacking level: ${hackingLevel}`)

  const growth = ns.getServerGrowth(host)
  ns.tprintRaw(`growth: ${growth}`)

  const hackTime = ns.getHackTime(host)
  const growTime = ns.getGrowTime(host)
  const weakenTime = ns.getWeakenTime(host)
  ns.tprintRaw(`hack time: ${ns.tFormat(hackTime)}`)
  ns.tprintRaw(`grow time: ${ns.tFormat(growTime)}`)
  ns.tprintRaw(`weaken time: ${ns.tFormat(weakenTime)}`)

  const hackChance = ns.hackAnalyzeChance(host)
  ns.tprintRaw(`hack chance: ${ns.formatPercent(hackChance)}`)

  const coreSize = server.cpuCores
  const maxRam = server.maxRam
  ns.tprintRaw(`core size: ${coreSize}`)
  ns.tprintRaw(`max ram: ${ns.formatRam(maxRam)}`)
}