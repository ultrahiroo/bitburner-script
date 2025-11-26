import { getPurchasedServerNameList } from "./getPurchasedServerNameList.ts"

export async function main(ns: NS): Promise<void> {
  const sleepTime = 1000 * 10 // milisecond
  const availableRatio = 1e-3

  ns.disableLog("ALL")
  const INITIAL_RAM_SIZE = 2
  const requestedServerList = getPurchasedServerNameList(ns)
  ns.print(`infinite loop has started`)
  
  while (true) {
    for (let i = 0; i < requestedServerList.length; i++) {
      const host = requestedServerList[i]
      if (!ns.serverExists(host)) {
        const cost = ns.getPurchasedServerCost(INITIAL_RAM_SIZE)
        const available = ns.getServerMoneyAvailable("home") * availableRatio
        if (available < cost) {
          continue
        }
        const purchasedHost = ns.purchaseServer(host, INITIAL_RAM_SIZE)
        if (purchasedHost == "") {
          ns.print(`ERROR failed to purchase a server, returned empty string`)
          continue
        }
        ns.print(`successed to purchase a server, host: ${host}, initialRamSize: ${ns.formatRam(INITIAL_RAM_SIZE)}, cost: ${ns.formatNumber(cost)}`)
      } else {
        const currentRamSize = ns.getServerMaxRam(host)
        const ramSize = currentRamSize * 2
        const cost = ns.getPurchasedServerUpgradeCost(host, ramSize)
        if (cost == -1) {
          ns.print(`ERROR invalid cost, cost: ${cost}`)
          continue
        }
        const available = ns.getServerMoneyAvailable("home") * availableRatio
        if (available < cost) {
          continue
        }
        if (!ns.upgradePurchasedServer(host, ramSize)) {
          ns.print(`ERROR failed to upgrade a server, host: ${host}, ramSize: ${ns.formatRam(ramSize)}`)
        }
        ns.print(`successed to upgrade a server, host: ${host}, ramSize: ${ns.formatRam(ramSize)}, cost: ${ns.formatNumber(cost)}`)
      }
    }
    await ns.asleep(sleepTime)
  }
}