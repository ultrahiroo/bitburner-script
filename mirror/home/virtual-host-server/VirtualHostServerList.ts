import { AllocationData } from "./AllocationData.ts"
import { VirtualHostServer } from "./VirtualHostServer.ts"
import { getHostServerNameList } from "./getHostServerNameList.ts"
import { getServerNameList } from "../util/getServerNameList.ts"
import { isPurchasedServer } from "../purchased-server/isPurchasedServer.ts"

export class VirtualHostServerList {
  ns: NS
  value: Array<VirtualHostServer>

  constructor(x: {
    ns: NS
  }) {
    this.ns = x.ns
    this.value = []
    const serverList = getServerNameList(x.ns)
    const hostServerNameList = getHostServerNameList(x.ns, serverList)
    for (let i = 0; i < hostServerNameList.length; i++) {
      const hostServerName = hostServerNameList[i]
      const virtualHostServer = new VirtualHostServer({
        ns: x.ns,
        name: hostServerName,
      })
      this.value.push(virtualHostServer)
    }
    this._sort()
  }

  _sort(): void {
    this.value.sort((a, b) => {
      if (a.name == "home") {
        return 1
      }
      if (isPurchasedServer(a.name)) {
        if (b.name == "home") {
          return -1
        }
        return 1
      }
      return a.maxRam - b.maxRam
    })
  }

  allocate(
    data: AllocationData,
    dryRun: boolean = false,
  ): VirtualHostServer | undefined {
    let y: VirtualHostServer | undefined = undefined
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

  updateSpec(): void {
    for (let i = 0; i < this.value.length; i++) {
      const virtualHostServer = this.value[i]
      virtualHostServer.updateSpec(this.ns)
    }
  }
}

export async function main(ns: NS): Promise<void> {
  const requestedRamList = [8, 8, 8, 16, 32, 64, 128, 256]
  const virtualHostServerList = new VirtualHostServerList({ ns: ns })

  for (let i = 0; i < virtualHostServerList.value.length; i++) {
    const virtualHostServer = virtualHostServerList.value[i]
    const severName = virtualHostServer.name
    const server = ns.getServer(severName)
    if (!server.hasAdminRights) {
      continue
    }
    virtualHostServer.setActive()
  }

  for (let i = 0; i < virtualHostServerList.value.length; i++) {
    const virtualHostServer = virtualHostServerList.value[i]
    ns.tprint(`name: ${virtualHostServer.name}, isActive: ${virtualHostServer.isActive}, maxRam: ${ns.formatRam(virtualHostServer.maxRam)}`)
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