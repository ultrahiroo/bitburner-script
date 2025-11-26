import { Action } from "./Action.ts"
import { Job } from "./Job.ts"
import { ScriptInfo } from "./ScriptInfo.ts"
import { VirtualServer } from "./VirtualServer.ts"
import { AllocationData, VirtualHostServerList } from "../virtual-host-server/index"
import { getRootAccess } from "../getRootAccess.ts"
import { getServerList } from "../getServerList.ts"
import { getSortedByAvailableMoneyServerList } from "../getSortedByAvailableMoneyServerList.ts"
import { getTargetServerList } from "../getTargetServerList.ts"

const DEFAULT_TARGET = "n00dles"

export class JobCreator {
  ns: NS
  serverList: Array<string>
  sortedServerList: Array<string>
  virtualHostServerList: VirtualHostServerList
  virtualServer: VirtualServer
  scriptInfo: ScriptInfo
  securityThreshold: number
  moneyThreshold: number
  sequentialLag: number
  initialMarginTime: number
  endTimestamp: number
  weakenMaxThreadSize: number
  growMaxThreadSize: number
  hackMaxThreadSize: number
  startAllocationMarginTime: number
  endAllocationMarginTime: number

  constructor(x: {
    ns: NS
    sequentialLag: number
    initialMarginTime: number
    weakenMaxThreadSize: number
    growMaxThreadSize: number
    hackMaxThreadSize: number
    startAllocationMarginTime: number
    endAllocationMarginTime: number
  }) {
    const serverList = getServerList(x.ns)

    this.ns = x.ns
    this.serverList = serverList
    this.sortedServerList = getSortedByAvailableMoneyServerList(x.ns, serverList)
    this.virtualHostServerList = new VirtualHostServerList({ ns: x.ns })
    this.virtualServer = new VirtualServer({ ns: x.ns, target: DEFAULT_TARGET })
    this.scriptInfo = new ScriptInfo({ ns: x.ns })
    this.moneyThreshold = NaN
    this.securityThreshold = NaN
    this.sequentialLag = x.sequentialLag
    this.initialMarginTime = x.initialMarginTime
    this.endTimestamp = NaN
    this.weakenMaxThreadSize = x.weakenMaxThreadSize
    this.growMaxThreadSize = x.growMaxThreadSize
    this.hackMaxThreadSize = x.hackMaxThreadSize
    this.startAllocationMarginTime = x.startAllocationMarginTime
    this.endAllocationMarginTime = x.endAllocationMarginTime

    // initialize
    const newTargetServerName = this.getNewTargetServerName()
    this.setTargetServer(newTargetServerName)
    this.updateVirtualHostServerList()
  }

  getNewTargetServerName(): string {
    const targetServerList = getTargetServerList(this.ns, this.sortedServerList)
    let y = DEFAULT_TARGET
    for (let i = 0; i < targetServerList.length; i++) {
      const target = targetServerList[i]
      if (!this.ns.hasRootAccess(target)) {
        if (!getRootAccess(this.ns, target)) {
          continue
        }
      }
      y = target
      break
    }
    return y
  }

  setTargetServer(name: string): void {
    this.virtualServer = new VirtualServer({
      ns: this.ns,
      target: name,
    })

    this.moneyThreshold = this.ns.getServerMaxMoney(name)
    this.securityThreshold = this.ns.getServerMinSecurityLevel(name)

    const hackTime = this.ns.getHackTime(name)
    const growTime = this.ns.getGrowTime(name)
    const weakenTime = this.ns.getWeakenTime(name)
    const minLag = Math.max(hackTime, growTime, weakenTime)
    this.endTimestamp = Date.now() + minLag + this.initialMarginTime

    if (true) { // TODO
      this.ns.print(`name: ${name}`)
      this.ns.print(`this.initialMarginTime: ${this.initialMarginTime}`)
      this.ns.print(`minLag: ${minLag}`)
    }
  }

  pushWeakJob(yList: Array<Job>): boolean {
    const target = this.virtualServer.target
    const singleCoreWeakenThreadSize = Math.min(
      this.weakenMaxThreadSize,
      Math.ceil((this.virtualServer.security - this.securityThreshold) / this.ns.weakenAnalyze(1, 1)),
    )
    const singleCoreRequiredRam = this.scriptInfo.weakenScriptRam * singleCoreWeakenThreadSize
    const executionTime = this.ns.getWeakenTime(target)

    const allocationStartTimestamp = this.endTimestamp - executionTime - this.startAllocationMarginTime
    const allocationEndTimestamp = this.endTimestamp + this.endAllocationMarginTime

    const singleCoreAllocationData = new AllocationData({
      usedRam: singleCoreRequiredRam,
      startTimestamp: allocationStartTimestamp,
      endTimestamp: allocationEndTimestamp,
    })
    const virtualHostServer = this.virtualHostServerList.allocate(singleCoreAllocationData, true)
    if (virtualHostServer == undefined) {
      this.ns.print(`allocation has failed, singleCoreRequiredRam: ${singleCoreRequiredRam}`)
      return false
    }

    const coreSize = virtualHostServer.coreSize
    const weakenThreadSize = Math.min(
      this.weakenMaxThreadSize,
      Math.ceil((this.virtualServer.security - this.securityThreshold) / this.ns.weakenAnalyze(1, coreSize)),
    )
    const requiredRam = this.scriptInfo.weakenScriptRam * weakenThreadSize
    const allocationData = new AllocationData({
      usedRam: requiredRam,
      startTimestamp: allocationStartTimestamp,
      endTimestamp: allocationEndTimestamp,
    })
    if (!virtualHostServer.allocate(allocationData, false)) {
      this.ns.print(`allocation has failed, requiredRam: ${requiredRam}`)
      this.ns.print(`singleCoreWeakenThreadSize: ${singleCoreWeakenThreadSize}`)
      this.ns.print(`weakenThreadSize: ${weakenThreadSize}`)
      return false
    }

    this.virtualServer.weaken(weakenThreadSize, coreSize)
    yList.push(new Job({
      action: Action.WEAKEN,
      target: target,
      host: virtualHostServer.name,
      endTimestamp: this.endTimestamp,
      executionTime: executionTime,
      threadSize: weakenThreadSize,
      requiredRam: requiredRam,
      expectedMoney: this.virtualServer.money,
      expectedSecurity: this.virtualServer.security,
      script: this.scriptInfo.weakenScript,
      message: "",
    }))
    return true
  }

  pushGrowJob(yList: Array<Job>): boolean {
    const target = this.virtualServer.target
    const multiplier = this.moneyThreshold / this.virtualServer.money
    const singleCoreGrowThreadSize = Math.min(
      this.growMaxThreadSize,
      Math.ceil(this.ns.growthAnalyze(target, multiplier, 1)),
    )
    const singleCoreRequiredRam = this.scriptInfo.growScriptRam * singleCoreGrowThreadSize
    const executionTime = this.ns.getGrowTime(target)

    const allocationStartTimestamp = this.endTimestamp - executionTime - this.startAllocationMarginTime
    const allocationEndTimestamp = this.endTimestamp + this.endAllocationMarginTime

    const singleCoreAllocationData = new AllocationData({
      usedRam: singleCoreRequiredRam,
      startTimestamp: allocationStartTimestamp,
      endTimestamp: allocationEndTimestamp,
    })
    const virtualHostServer = this.virtualHostServerList.allocate(singleCoreAllocationData, true)
    if (virtualHostServer == undefined) {
      this.ns.print(`allocation has failed, singleCoreRequiredRam: ${singleCoreRequiredRam}`)
      return false
    }
    const coreSize = virtualHostServer.coreSize
    const growThreadSize = Math.min(
      this.growMaxThreadSize,
      Math.ceil(this.ns.growthAnalyze(target, multiplier, coreSize)),
    )

    const requiredRam = this.scriptInfo.growScriptRam * growThreadSize
    const allocationData = new AllocationData({
      usedRam: requiredRam,
      startTimestamp: allocationStartTimestamp,
      endTimestamp: allocationEndTimestamp,
    })
    if (!virtualHostServer.allocate(allocationData, false)) {
      this.ns.print(`allocation has failed, requiredRam: ${requiredRam}`)
      return false
    }

    this.virtualServer.grow(growThreadSize, coreSize)
    yList.push(new Job({
      action: Action.GROW,
      target: target,
      host: virtualHostServer.name,
      endTimestamp: this.endTimestamp,
      executionTime: executionTime,
      threadSize: growThreadSize,
      requiredRam: requiredRam,
      expectedMoney: this.virtualServer.money,
      expectedSecurity: this.virtualServer.security,
      script: this.scriptInfo.growScript,
      message: "",
    }))
    return true
  }

  pushHackJob(yList: Array<Job>): boolean {
    const target = this.virtualServer.target
    const hackThreadSize = Math.min(
      this.hackMaxThreadSize,
      Math.trunc(this.ns.weakenAnalyze(1, 1) / this.ns.hackAnalyzeSecurity(1))
    )
    const requiredRam = this.scriptInfo.hackScriptRam * hackThreadSize
    const executionTime = this.ns.getHackTime(target)

    const allocationStartTimestamp = this.endTimestamp - executionTime - this.startAllocationMarginTime
    const allocationEndTimestamp = this.endTimestamp + this.endAllocationMarginTime

    const allocationData = new AllocationData({
      usedRam: requiredRam,
      startTimestamp: allocationStartTimestamp,
      endTimestamp: allocationEndTimestamp,
    })
    const virtualHostServer = this.virtualHostServerList.allocate(allocationData, false)
    if (virtualHostServer == undefined) {
      this.ns.print(`allocation has failed, requiredRam: ${requiredRam}`)
      return false
    }

    this.virtualServer.hack(hackThreadSize)
    yList.push(new Job({
      action: Action.HACK,
      target: target,
      host: virtualHostServer.name,
      endTimestamp: this.endTimestamp,
      executionTime: executionTime,
      threadSize: hackThreadSize,
      requiredRam: requiredRam,
      expectedMoney: this.virtualServer.money,
      expectedSecurity: this.virtualServer.security,
      script: this.scriptInfo.hackScript,
      message: "",
    }))
    return true
  }

  pushNoneJob(yList: Array<Job>): boolean {
    yList.push(new Job({
      action: Action.NONE,
      target: this.virtualServer.target,
      host: "",
      endTimestamp: this.endTimestamp,
      executionTime: 0,
      threadSize: 0,
      requiredRam: 0,
      expectedMoney: this.virtualServer.money,
      expectedSecurity: this.virtualServer.security,
      script: "",
      message: "",
    }))
    return true
  }

  pushJob(yList: Array<Job>): void {
    if (this.virtualServer.security > this.securityThreshold) {
      if (!this.pushWeakJob(yList)) {
        this.pushNoneJob(yList)
      }
      this.endTimestamp += this.sequentialLag
    } else if (this.virtualServer.money < this.moneyThreshold) {
      if (!this.pushGrowJob(yList)) {
        this.pushNoneJob(yList)
      }
      this.endTimestamp += this.sequentialLag
    } else {
      if (!this.pushHackJob(yList)) {
        this.pushNoneJob(yList)
      }
      this.endTimestamp += this.sequentialLag
      if (!this.pushGrowJob(yList)) {
        this.pushNoneJob(yList)
      }
      this.endTimestamp += this.sequentialLag
      this.endTimestamp += this.sequentialLag
      if (!this.pushWeakJob(yList)) {
        this.pushNoneJob(yList)
      }
      this.endTimestamp += this.sequentialLag
      this.endTimestamp += this.sequentialLag
      this.endTimestamp += this.sequentialLag
    }
  }

  keepSize(minSize: number, jobListValue: Array<Job>): void {
    for (let i = 0; i < minSize; i++) {
      if (jobListValue.length >= minSize) {
        break
      }
      this.pushJob(jobListValue)
    }
    if (jobListValue.length < minSize) {
      throw new Error(`ERROR expected minimum size: ${minSize}, actual size: ${jobListValue.length}`)
    }
  }

  updateVirtualHostServerList(): void {
    for (let i = 0; i < this.virtualHostServerList.value.length; i++) {
      const virtualHostServer = this.virtualHostServerList.value[i]
      if (virtualHostServer.isActive) {
        continue
      }

      const serverName = virtualHostServer.name
      if (!this.ns.hasRootAccess(serverName)) {
        if (!getRootAccess(this.ns, serverName)) {
          continue
        }
      }
      this.scriptInfo.install(serverName)
      virtualHostServer.setActive()
    }
  }

  update(): void {
    const currentTimestamp = Date.now()
    this.virtualHostServerList.update(currentTimestamp)

    const newTargetServerName = this.getNewTargetServerName()
    if (newTargetServerName != this.virtualServer.target) {
      this.setTargetServer(newTargetServerName)
    }

    this.updateVirtualHostServerList()
  }
}

export async function main(ns: NS): Promise<void> {
  return
}