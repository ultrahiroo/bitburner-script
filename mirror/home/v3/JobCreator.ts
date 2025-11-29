import { Action } from "./Action.ts"
import { AllocationData } from "../virtual-host-server/AllocationData.ts"
import { Job } from "./Job.ts"
import { ScriptInfo } from "./ScriptInfo.ts"
import { VirtualHostServerList } from "../virtual-host-server/VirtualHostServerList.ts"
import { VirtualTargetServer } from "../virtual-target-server/VirtualTargetServer.ts"
import { VirtualTargetServerList } from "../virtual-target-server/VirtualTargetServerList.ts"
import { getRootAccess } from "../util/getRootAccess.ts"


export class JobCreator {
  ns: NS
  virtualHostServerList: VirtualHostServerList
  virtualTargetServerList: VirtualTargetServerList
  scriptInfo: ScriptInfo
  sequentialLag: number
  weakenMaxThreadSize: number
  growMaxThreadSize: number
  hackMaxThreadSize: number
  startAllocationMarginTime: number
  endAllocationMarginTime: number
  securityThresholdRatio: number
  moneyThresholdRatio: number
  startMarginTime: number
  endMarginTime: number

  constructor(x: {
    ns: NS
    sequentialLag: number
    weakenMaxThreadSize: number
    growMaxThreadSize: number
    hackMaxThreadSize: number
    startAllocationMarginTime: number
    endAllocationMarginTime: number
    securityThresholdMarginRatio: number
    moneyThresholdMarginRatio: number
    startMarginTime: number
    endMarginTime: number
  }) {
    if (!(x.startAllocationMarginTime > 0)) {
      throw new Error(`invalid value, startAllocationMarginTime: ${x.startAllocationMarginTime}`)
    }
    if (!(x.endAllocationMarginTime > 0)) {
      throw new Error(`invalid value, endAllocationMarginTime: ${x.endAllocationMarginTime}`)
    }
    if (!((0 <= x.securityThresholdMarginRatio) && (x.securityThresholdMarginRatio < 1))) {
      throw new Error(`invalid value, securityThresholdMarginRatio: ${x.securityThresholdMarginRatio}`)
    }
    if (!((0 <= x.moneyThresholdMarginRatio) && (x.moneyThresholdMarginRatio < 1))) {
      throw new Error(`invalid value, moneyThresholdMarginRatio: ${x.moneyThresholdMarginRatio}`)
    }
    if (!(x.startMarginTime > 0)) {
      throw new Error(`invalid value, startMarginTime: ${x.startMarginTime}`)
    }
    if (!(x.endMarginTime > 0)) {
      throw new Error(`invalid value, endMarginTime: ${x.endMarginTime}`)
    }
    if (!(x.endMarginTime > x.startMarginTime)) {
      throw new Error(`invalid value, endMarginTime: ${x.endMarginTime}, startMarginTime: ${x.startMarginTime}`)
    }

    this.ns = x.ns
    this.virtualHostServerList = new VirtualHostServerList({ ns: x.ns })
    this.virtualTargetServerList = new VirtualTargetServerList({ ns: x.ns })
    this.scriptInfo = new ScriptInfo({ ns: x.ns })
    this.sequentialLag = x.sequentialLag
    this.weakenMaxThreadSize = x.weakenMaxThreadSize
    this.growMaxThreadSize = x.growMaxThreadSize
    this.hackMaxThreadSize = x.hackMaxThreadSize
    this.startAllocationMarginTime = x.startAllocationMarginTime
    this.endAllocationMarginTime = x.endAllocationMarginTime
    this.moneyThresholdRatio = x.moneyThresholdMarginRatio
    this.securityThresholdRatio = x.moneyThresholdMarginRatio
    this.startMarginTime = x.startMarginTime
    this.endMarginTime = x.endMarginTime

    // initialize
    this.updateVirtualHostServerActive()
  }

  pushWeakJob(
    virtualTargetServer: VirtualTargetServer,
    securityThreshold: number,
    yList: Array<Job>,
  ): boolean {
    const target = virtualTargetServer.name
    const singleCoreWeakenThreadSize = Math.min(
      this.weakenMaxThreadSize,
      Math.ceil((virtualTargetServer.security - securityThreshold) / this.ns.weakenAnalyze(1, 1)),
    )
    if (singleCoreWeakenThreadSize == 0) {
      throw new Error(`singleCoreWeakenThreadSize: ${singleCoreWeakenThreadSize}`)
    }
    const singleCoreRequiredRam = this.scriptInfo.weakenScriptRam * singleCoreWeakenThreadSize
    const executionTime = this.ns.getWeakenTime(target)

    const endTimestamp = virtualTargetServer.timestamp
    const allocationStartTimestamp = endTimestamp - executionTime - this.startAllocationMarginTime
    const allocationEndTimestamp = endTimestamp + this.endAllocationMarginTime

    if (allocationStartTimestamp < Date.now() + this.startMarginTime) {
      this.ns.print(`DEBUG allocation has failed, target: ${target}, allocationStartTimestamp: ${allocationStartTimestamp}`)
      return false
    }

    const singleCoreAllocationData = new AllocationData({
      usedRam: singleCoreRequiredRam,
      startTimestamp: allocationStartTimestamp,
      endTimestamp: allocationEndTimestamp,
    })
    const virtualHostServer = this.virtualHostServerList.allocate(singleCoreAllocationData, true)
    if (virtualHostServer == undefined) {
      this.ns.print(`DEBUG allocation has failed, target: ${target}, singleCoreRequiredRam: ${singleCoreRequiredRam}`)
      return false
    }

    const coreSize = virtualHostServer.coreSize
    const weakenThreadSize = Math.min(
      this.weakenMaxThreadSize,
      Math.ceil((virtualTargetServer.security - securityThreshold) / this.ns.weakenAnalyze(1, coreSize)),
    )
    if (weakenThreadSize == 0) {
      throw new Error(`weakenThreadSize: ${weakenThreadSize}`)
    }
    const requiredRam = this.scriptInfo.weakenScriptRam * weakenThreadSize
    const allocationData = new AllocationData({
      usedRam: requiredRam,
      startTimestamp: allocationStartTimestamp,
      endTimestamp: allocationEndTimestamp,
    })
    if (!virtualHostServer.allocate(allocationData, false)) {
      this.ns.print(`DEBUG allocation has failed, target: ${target}, requiredRam: ${requiredRam}`)
      this.ns.print(`DEBUG singleCoreWeakenThreadSize: ${singleCoreWeakenThreadSize}`)
      this.ns.print(`DEBUG weakenThreadSize: ${weakenThreadSize}`)
      return false
    }

    virtualTargetServer.weaken(weakenThreadSize, coreSize)
    yList.push(new Job({
      action: Action.WEAKEN,
      target: target,
      host: virtualHostServer.name,
      endTimestamp: endTimestamp,
      executionTime: executionTime,
      threadSize: weakenThreadSize,
      requiredRam: requiredRam,
      expectedMoney: virtualTargetServer.money,
      expectedSecurity: virtualTargetServer.security,
      script: this.scriptInfo.weakenScript,
      message: "",
    }))
    return true
  }

  pushGrowJob(
    virtualTargetServer: VirtualTargetServer,
    moneyThreshold: number,
    yList: Array<Job>,
  ): boolean {
    const target = virtualTargetServer.name
    const multiplier = moneyThreshold / virtualTargetServer.money
    const singleCoreGrowThreadSize = Math.min(
      this.growMaxThreadSize,
      Math.ceil(this.ns.growthAnalyze(target, multiplier, 1)),
    )
    if (singleCoreGrowThreadSize == 0) {
      throw new Error(`singleCoreGrowThreadSize: ${singleCoreGrowThreadSize}`)
    }
    const singleCoreRequiredRam = this.scriptInfo.growScriptRam * singleCoreGrowThreadSize
    const executionTime = this.ns.getGrowTime(target)

    const endTimestamp = virtualTargetServer.timestamp
    const allocationStartTimestamp = endTimestamp - executionTime - this.startAllocationMarginTime
    const allocationEndTimestamp = endTimestamp + this.endAllocationMarginTime

    if (allocationStartTimestamp < Date.now() + this.startMarginTime) {
      this.ns.print(`DEBUG allocation has failed, target: ${target}, allocationStartTimestamp: ${allocationStartTimestamp}`)
      return false
    }

    const singleCoreAllocationData = new AllocationData({
      usedRam: singleCoreRequiredRam,
      startTimestamp: allocationStartTimestamp,
      endTimestamp: allocationEndTimestamp,
    })
    const virtualHostServer = this.virtualHostServerList.allocate(singleCoreAllocationData, true)
    if (virtualHostServer == undefined) {
      this.ns.print(`DEBUG allocation has failed, target: ${target}, singleCoreRequiredRam: ${singleCoreRequiredRam}`)
      return false
    }
    const coreSize = virtualHostServer.coreSize
    const growThreadSize = Math.min(
      this.growMaxThreadSize,
      Math.ceil(this.ns.growthAnalyze(target, multiplier, coreSize)),
    )
    if (growThreadSize == 0) {
      throw new Error(`growThreadSize: ${growThreadSize}`)
    }

    const requiredRam = this.scriptInfo.growScriptRam * growThreadSize
    const allocationData = new AllocationData({
      usedRam: requiredRam,
      startTimestamp: allocationStartTimestamp,
      endTimestamp: allocationEndTimestamp,
    })
    if (!virtualHostServer.allocate(allocationData, false)) {
      this.ns.print(`DEBUG allocation has failed, target: ${target}, requiredRam: ${requiredRam}`)
      return false
    }

    virtualTargetServer.grow(growThreadSize, coreSize)
    yList.push(new Job({
      action: Action.GROW,
      target: target,
      host: virtualHostServer.name,
      endTimestamp: endTimestamp,
      executionTime: executionTime,
      threadSize: growThreadSize,
      requiredRam: requiredRam,
      expectedMoney: virtualTargetServer.money,
      expectedSecurity: virtualTargetServer.security,
      script: this.scriptInfo.growScript,
      message: "",
    }))
    return true
  }

  pushHackJob(
    virtualTargetServer: VirtualTargetServer,
    yList: Array<Job>,
  ): boolean {
    const target = virtualTargetServer.name
    const hackThreadSize = Math.min(
      this.hackMaxThreadSize,
      Math.max(
        Math.trunc(this.ns.weakenAnalyze(1, 1) / this.ns.hackAnalyzeSecurity(1)),
        1,
      )
    )
    if (hackThreadSize == 0) {
      throw new Error(`hackThreadSize: ${hackThreadSize}`)
    }
    const requiredRam = this.scriptInfo.hackScriptRam * hackThreadSize
    const executionTime = this.ns.getHackTime(target)

    const endTimestamp = virtualTargetServer.timestamp
    const allocationStartTimestamp = endTimestamp - executionTime - this.startAllocationMarginTime
    const allocationEndTimestamp = endTimestamp + this.endAllocationMarginTime

    if (allocationStartTimestamp < Date.now() + this.startMarginTime) {
      this.ns.print(`DEBUG allocation has failed, target: ${target}, allocationStartTimestamp: ${allocationStartTimestamp}`)
      return false
    }

    const allocationData = new AllocationData({
      usedRam: requiredRam,
      startTimestamp: allocationStartTimestamp,
      endTimestamp: allocationEndTimestamp,
    })
    const virtualHostServer = this.virtualHostServerList.allocate(allocationData, false)
    if (virtualHostServer == undefined) {
      this.ns.print(`DEBUG allocation has failed, target: ${target}, requiredRam: ${requiredRam}`)
      return false
    }

    virtualTargetServer.hack(hackThreadSize)
    yList.push(new Job({
      action: Action.HACK,
      target: target,
      host: virtualHostServer.name,
      endTimestamp: endTimestamp,
      executionTime: executionTime,
      threadSize: hackThreadSize,
      requiredRam: requiredRam,
      expectedMoney: virtualTargetServer.money,
      expectedSecurity: virtualTargetServer.security,
      script: this.scriptInfo.hackScript,
      message: "",
    }))
    return true
  }

  pushJobLoop(
    virtualTargetServer: VirtualTargetServer,
    yList: Array<Job>,
  ): void {
    const moneyThreshold = virtualTargetServer.maxMoney * (1 - this.moneyThresholdRatio)
    const securityThreshold = virtualTargetServer.minSecurity * (1 + this.securityThresholdRatio)
    const severName = virtualTargetServer.name
    const hackTime = this.ns.getHackTime(severName)
    const growTime = this.ns.getGrowTime(severName)
    const weakenTime = this.ns.getWeakenTime(severName)
    const minLag = Math.max(hackTime, growTime, weakenTime) + this.endMarginTime
    const minTimestamp = Date.now() + minLag
    const maxSize = Math.ceil(minLag / this.sequentialLag)

    for (let i = 0; i < maxSize; i++) {
      if (virtualTargetServer.timestamp >= minTimestamp) {
        break
      }
      if (virtualTargetServer.security > securityThreshold) {
        this.pushWeakJob(virtualTargetServer, securityThreshold, yList)
        virtualTargetServer.timestamp += this.sequentialLag

      } else if (virtualTargetServer.money < moneyThreshold) {
        this.pushGrowJob(virtualTargetServer, moneyThreshold, yList)
        virtualTargetServer.timestamp += this.sequentialLag

      } else {
        if (!this.pushHackJob(virtualTargetServer, yList)) {
          virtualTargetServer.timestamp += this.sequentialLag
          continue
        }
        virtualTargetServer.timestamp += this.sequentialLag

        if (virtualTargetServer.money < moneyThreshold) {
          if (!this.pushGrowJob(virtualTargetServer, moneyThreshold, yList)) {
            virtualTargetServer.timestamp += this.sequentialLag
            continue
          }
          virtualTargetServer.timestamp += this.sequentialLag
          virtualTargetServer.timestamp += this.sequentialLag
        }

        if (virtualTargetServer.security > securityThreshold) {
          if (!this.pushWeakJob(virtualTargetServer, securityThreshold, yList)) {
            virtualTargetServer.timestamp += this.sequentialLag
            continue
          }
          virtualTargetServer.timestamp += this.sequentialLag
          virtualTargetServer.timestamp += this.sequentialLag
          virtualTargetServer.timestamp += this.sequentialLag
        }
      }
    }
  }

  keepSize(jobListValue: Array<Job>): void {
    for (let i = 0; i < this.virtualTargetServerList.value.length; i++) {
      const virtualTargetServer = this.virtualTargetServerList.value[i]
      if (!virtualTargetServer.isActive) {
        continue
      }
      this.pushJobLoop(virtualTargetServer, jobListValue)
    }
  }

  updateVirtualHostServerActive(): void {
    for (let i = 0; i < this.virtualHostServerList.value.length; i++) {
      const virtualHostServer = this.virtualHostServerList.value[i]
      if (virtualHostServer.isActive) {
        continue
      }
      if (virtualHostServer.maxRam == 0) {
        continue
      }
      const serverName = virtualHostServer.name
      const server = this.ns.getServer(serverName)
      if (!server.hasAdminRights) {
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
    this.virtualHostServerList.updateSpec()
    this.updateVirtualHostServerActive()
    this.virtualTargetServerList.updateActive()
  }
}

export async function main(ns: NS): Promise<void> {
  return
}