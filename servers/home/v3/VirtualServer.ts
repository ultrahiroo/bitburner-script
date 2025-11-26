import { calculateServerGrowth } from "../calculateServerGrowth.ts"

export class VirtualServer {
  ns: NS
  target: string
  money: number
  maxMoney: number
  security: number
  minSecurity: number

  constructor(x: {
    ns: NS
    target: string
  }) {
    this.ns = x.ns
    this.target = x.target
    this.money = x.ns.getServerMoneyAvailable(x.target)
    this.maxMoney = x.ns.getServerMaxMoney(x.target)
    this.security = x.ns.getServerSecurityLevel(x.target)
    this.minSecurity = x.ns.getServerMinSecurityLevel(x.target)
  }

  setMoney(newMoney: number): void {
    this.money = newMoney
    if (this.money > this.maxMoney) {
      this.money = this.maxMoney
    }
  }

  setSecurity(newSecurity: number): void {
    this.security = newSecurity
    if (this.security < this.minSecurity) {
      this.security = this.minSecurity
    }
  }

  weaken(threadSize: number, coreSize?: number | undefined): void {
    const newSecurity = this.security - this.ns.weakenAnalyze(threadSize, coreSize)
    this.setSecurity(newSecurity)
  }

  grow(threadSize: number, coreSize?: number | undefined): void {
    const newMoney = (this.money + threadSize) * calculateServerGrowth(this.ns, this.target, threadSize, coreSize)
    const newSecurity = this.security + this.ns.growthAnalyzeSecurity(threadSize, undefined, coreSize)
    this.setMoney(newMoney)
    this.setSecurity(newSecurity)
  }

  hack(threadSize: number): void {
    const newMoney = this.money * (1 - this.ns.hackAnalyze(this.target) * threadSize)
    const newSecurity = this.security + this.ns.hackAnalyzeSecurity(threadSize)
    this.setMoney(newMoney)
    this.setSecurity(newSecurity)
  }
}

export async function main(ns: NS): Promise<void> {
  if ((ns.args[0] != undefined) && ((typeof ns.args[0]) != "string")) {
    ns.tprint(`first argument was expected target: ${ns.args[0]}`)
    return
  }
  const target = (ns.args[0] != undefined) ? ns.args[0] as string : "n00dles"
  const threadSize = 2
  const coreSize = ns.getServer().cpuCores
  ns.tprint(`coreSize: ${coreSize}`)

  let virtualServer = new VirtualServer({ ns: ns, target: target })
  virtualServer.grow(threadSize, coreSize)
  await ns.grow(target, { threads: threadSize })
  let actualMoney = ns.getServerMoneyAvailable(target)
  let actualSecurity = ns.getServerSecurityLevel(target)
  ns.tprint(`grow test`)
  ns.tprint(`virtualServer.money: ${virtualServer.money}`)
  ns.tprint(`actualMoney: ${actualMoney}`)
  ns.tprint(`virtualServer.money == actualMoney: ${virtualServer.money == actualMoney}`)
  ns.tprint(`virtualServer.security == actualSecurity: ${virtualServer.security == actualSecurity}`)

  virtualServer = new VirtualServer({ ns: ns, target: target })
  virtualServer.weaken(threadSize, coreSize)
  await ns.weaken(target, { threads: threadSize })
  actualMoney = ns.getServerMoneyAvailable(target)
  actualSecurity = ns.getServerSecurityLevel(target)
  ns.tprint(`weaken test`)
  ns.tprint(`actualSecurity: ${actualSecurity}`)
  ns.tprint(`virtualServer.security: ${virtualServer.security}`)
  ns.tprint(`virtualServer.money == actualMoney: ${virtualServer.money == actualMoney}`)
  ns.tprint(`virtualServer.security == actualSecurity: ${virtualServer.security == actualSecurity}`)

  virtualServer = new VirtualServer({ ns: ns, target: target })
  virtualServer.hack(threadSize)
  await ns.hack(target, { threads: threadSize })
  actualMoney = ns.getServerMoneyAvailable(target)
  actualSecurity = ns.getServerSecurityLevel(target)
  ns.tprint(`hack test`)
  ns.tprint(`virtualServer.money: ${virtualServer.money}`)
  ns.tprint(`actualMoney: ${actualMoney}`)
  ns.tprint(`virtualServer.money == actualMoney: ${virtualServer.money == actualMoney}`)
  ns.tprint(`virtualServer.security == actualSecurity: ${virtualServer.security == actualSecurity}`)
}