import { VirtualTargetServer } from "./VirtualTargetServer.ts"
import { getRootAccess } from "../getRootAccess.ts"
import { getServerList } from "../getServerList.ts"
import { getTargetServerNameList } from "./getTargetSeverNameList.ts"

export class VirtualTargetServerList {
  ns: NS
  value: Array<VirtualTargetServer>

  constructor(x: {
    ns: NS
  }) {
    this.ns = x.ns
    this.value = []
    const serverList = getServerList(x.ns)
    const targetServerNameList = getTargetServerNameList(serverList)
    for (let i = 0; i < targetServerNameList.length; i++) {
      const targetServerName = targetServerNameList[i]
      const virtualTargetServer = new VirtualTargetServer({
        ns: x.ns,
        name: targetServerName,
      })
      this.value.push(virtualTargetServer)
    }
    this._sort()
    this.updateActive()
  }

  _sort(): void {
    this.value.sort((a, b) => {
      return b.maxMoney - a.maxMoney
    })
  }

  updateActive(): void {
    const hackingLevel = this.ns.getHackingLevel()
    const hackingLevelThreshold = hackingLevel / 2

    for (let i = 0; i < this.value.length; i++) {
      const virtualTargetServer = this.value[i]
      if (virtualTargetServer.isActive) {
        continue
      }
      if (virtualTargetServer.requiredHackingLevel > hackingLevelThreshold) {
        continue
      }
      const serverName = virtualTargetServer.name
      if (!this.ns.hasRootAccess(serverName)) {
        if (!getRootAccess(this.ns, serverName)) {
          continue
        }
      }
      virtualTargetServer.setActive()
    }
  }
}

export async function main(ns: NS): Promise<void> {
  const virtualTargetServerList = new VirtualTargetServerList({ ns: ns })
  for (let i = 0; i < virtualTargetServerList.value.length; i++) {
    const virtualTargetServer = virtualTargetServerList.value[i]
    ns.tprint(`name: ${virtualTargetServer.name}, isActive: ${virtualTargetServer.isActive}`)
  }
}
