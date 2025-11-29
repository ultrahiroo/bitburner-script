import { calculateServerGrowth } from "../calculateServerGrowth.ts"

export class VirtualTargetServer {
  ns: NS
  name: string
  timestamp: number
  money: number
  maxMoney: number
  security: number
  minSecurity: number
  requiredHackingLevel: number
  isActive: boolean

  constructor(x: {
    ns: NS
    name: string
  }) {
    this.ns = x.ns
    this.name = x.name
    this.timestamp = Date.now()
    const server = x.ns.getServer(x.name)
    if (server.moneyAvailable == undefined) {
      throw new Error("invalid value")
    }
    if (server.moneyMax == undefined) {
      throw new Error("invalid value")
    }
    if (server.moneyMax == 0) {
      throw new Error("invalid value")
    }
    if (server.hackDifficulty == undefined) {
      throw new Error("invalid value")
    }
    if (server.minDifficulty == undefined) {
      throw new Error("invalid value")
    }
    if (server.requiredHackingSkill == undefined) {
      throw new Error("invalid value")
    }
    this.money = server.moneyAvailable
    this.maxMoney = server.moneyMax
    this.security = server.hackDifficulty
    this.minSecurity = server.minDifficulty
    this.requiredHackingLevel = server.requiredHackingSkill
    this.isActive = false
  }

  setActive(): void {
    this.isActive = true
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

  weaken(threadSize: number, coreSize: number): void {
    if (!this.isActive) {
      throw new Error("virtual target server was not activated")
    }
    const newSecurity = this.security - this.ns.weakenAnalyze(threadSize, coreSize)
    this.setSecurity(newSecurity)
  }

  grow(threadSize: number, coreSize: number): void {
    if (!this.isActive) {
      throw new Error("virtual target server was not activated")
    }
    const newMoney = (this.money + threadSize) * calculateServerGrowth(this.ns, this.name, threadSize, coreSize)
    const newSecurity = this.security + this.ns.growthAnalyzeSecurity(threadSize, undefined, coreSize)
    this.setMoney(newMoney)
    this.setSecurity(newSecurity)
  }

  hack(threadSize: number): void {
    if (!this.isActive) {
      throw new Error("virtual target server was not activated")
    }
    const newMoney = this.money * (1 - this.ns.hackAnalyze(this.name) * threadSize)
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

  let virtualServer = new VirtualTargetServer({ ns: ns, name: target })
  virtualServer.grow(threadSize, coreSize)
  await ns.grow(target, { threads: threadSize })
  let actualMoney = ns.getServerMoneyAvailable(target)
  let actualSecurity = ns.getServerSecurityLevel(target)
  ns.tprint(`grow test`)
  ns.tprint(`virtualServer.money: ${virtualServer.money}`)
  ns.tprint(`actualMoney: ${actualMoney}`)
  ns.tprint(`virtualServer.money == actualMoney: ${virtualServer.money == actualMoney}`)
  ns.tprint(`virtualServer.security == actualSecurity: ${virtualServer.security == actualSecurity}`)

  virtualServer = new VirtualTargetServer({ ns: ns, name: target })
  virtualServer.weaken(threadSize, coreSize)
  await ns.weaken(target, { threads: threadSize })
  actualMoney = ns.getServerMoneyAvailable(target)
  actualSecurity = ns.getServerSecurityLevel(target)
  ns.tprint(`weaken test`)
  ns.tprint(`actualSecurity: ${actualSecurity}`)
  ns.tprint(`virtualServer.security: ${virtualServer.security}`)
  ns.tprint(`virtualServer.money == actualMoney: ${virtualServer.money == actualMoney}`)
  ns.tprint(`virtualServer.security == actualSecurity: ${virtualServer.security == actualSecurity}`)

  virtualServer = new VirtualTargetServer({ ns: ns, name: target })
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