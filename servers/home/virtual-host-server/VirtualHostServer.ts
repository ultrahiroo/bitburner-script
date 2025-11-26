import { AllocationData } from "./AllocationData.ts"
import { AllocationTimestamp } from "./AllocationTimestamp.ts"

export class VirtualHostServer {
  name: string
  isActive: boolean
  initialUsedRam: number
  maxRam: number
  coreSize: number
  allocationDataList: Array<AllocationData>

  constructor(x: {
    ns: NS
    name: string
  }) {
    this.name = x.name
    this.isActive = false
    const server = x.ns.getServer(x.name)
    this.initialUsedRam = server.ramUsed
    this.maxRam = server.maxRam
    this.coreSize = server.cpuCores
    this.allocationDataList = []
  }

  setActive(): void {
    this.isActive = true
  }

  _getAvailableRam(): number {
    const y = this.maxRam - this.initialUsedRam
    return y
  }

  allocate(
    data: AllocationData,
    dryRun: boolean = false,
  ): boolean {
    if (!this.isActive) {
      return false
    }

    const newAllocationDataList = Array.from(this.allocationDataList)
    newAllocationDataList.push(data)

    const allocationTimestampList = []
    for (let i = 0; i < newAllocationDataList.length; i++) {
      const allocationData = newAllocationDataList[i]

      const startAllocationTimestamp = new AllocationTimestamp({
        ramDiff: allocationData.usedRam,
        timestamp: allocationData.startTimestamp,
      })
      const endAllocationTimestamp = new AllocationTimestamp({
        ramDiff: -allocationData.usedRam,
        timestamp: allocationData.endTimestamp,
      })

      allocationTimestampList.push(startAllocationTimestamp)
      allocationTimestampList.push(endAllocationTimestamp)
    }
    allocationTimestampList.sort((a, b) => {
      if (a.timestamp == b.timestamp) {
        return a.ramDiff - b.ramDiff
      }
      return a.timestamp - b.timestamp
    })

    const availableRam = this._getAvailableRam()
    let currentRam = 0
    for (let i = 0; i < allocationTimestampList.length; i++) {
      const allocationTimestamp = allocationTimestampList[i]
      currentRam += allocationTimestamp.ramDiff

      if (currentRam > availableRam) {
        return false
      }
    }

    if (!dryRun) {
      this.allocationDataList = newAllocationDataList
    }
    return true
  }

  update(currentTimestamp: number): void {
    if (!this.isActive) {
      return
    }

    const newList = []
    for (let i = 0; i < this.allocationDataList.length; i++) {
      const allocationData = this.allocationDataList[i]
      if (allocationData.endTimestamp < currentTimestamp) {
        continue
      }
      newList.push(allocationData)
    }
    this.allocationDataList = newList
  }
}

export async function main(ns: NS): Promise<void> {
  ns.tprint(`test has started`)
  const size = 4
  const virtualHostServer = new VirtualHostServer({
    ns: ns,
    name: "foodnstuff",
  })
  virtualHostServer.setActive()

  for (let i = 0; i < size; i++) {
    const currentTimestamp = Date.now()
    const allocationData = new AllocationData({
      usedRam: 5,
      startTimestamp: currentTimestamp,
      endTimestamp: currentTimestamp + 10000,
    })
    const hasSuccessed = virtualHostServer.allocate(allocationData)
    ns.tprint(`hasSuccessed: ${hasSuccessed}`)

    await ns.asleep(100)
    virtualHostServer.update(Date.now())
  }
}