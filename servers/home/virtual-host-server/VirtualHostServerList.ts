import { AllocationData } from "./AllocationData.ts"
import { VirtualHostServer } from "./VirtualHostServer.ts"
import { getServerList } from "../getServerList.ts"

export class VirtualHostServerList {
  value: Array<VirtualHostServer>

  constructor(x: {
    ns: NS
  }) {
    this.value = []
    const serverList = getServerList(x.ns)
    for (let i = 0; i < serverList.length; i++) {
      const host = serverList[i]
      const virtualHostServer = new VirtualHostServer({
        ns: x.ns,
        name: host,
      })
      this.value.push(virtualHostServer)
    }
    this.value.sort((a, b) => {
      if (a.name == "home") {
        return 1
      }
      return a.maxRam - b.maxRam
    })
  }

  allocate(
    data: AllocationData,
    dryRun: boolean = false,
  ): VirtualHostServer | undefined {
    let y = undefined
    for (let i = 0; i < this.value.length; i++) {
      const virtualHostServer = this.value[i]
      if (!virtualHostServer.allocate(data, dryRun)) {
        continue
      }
      y = virtualHostServer
      break
    }
    return y
  }

  update(currentTimestamp: number): void {
    for (let i = 0; i < this.value.length; i++) {
      const virtualHostServer = this.value[i]
      virtualHostServer.update(currentTimestamp)
    }
  }
}

export async function main(ns: NS): Promise<void> {
  const requestedRamList = [8, 8, 8, 16, 32, 64, 128, 256]
  const virtualHostServerList = new VirtualHostServerList({ ns: ns })

  for (let i = 0; i < virtualHostServerList.value.length; i++) {
    const virtualHostServer = virtualHostServerList.value[i]
    if (!ns.hasRootAccess(virtualHostServer.name)) {
      continue
    }
    virtualHostServer.setActive()
  }

  for (let i = 0; i < requestedRamList.length; i++) {
    const requestedRam = requestedRamList[i]
    const currentTimestamp = Date.now()
    const allocationData = new AllocationData({
      usedRam: requestedRam,
      startTimestamp: currentTimestamp,
      endTimestamp: currentTimestamp + 1000,
    })
    const virtualHostServer = virtualHostServerList.allocate(allocationData)
    if (virtualHostServer == undefined) {
      continue
    }
    const host = virtualHostServer.name
    ns.tprint(`host: ${host}, requestedRam: ${ns.formatRam(requestedRam)}`)

    await ns.asleep(100)
    virtualHostServerList.update(Date.now())
  }
}