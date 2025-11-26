import { Action } from "./Action.ts"
import { getServerList } from "../getServerList.ts";

export class ScriptInfo {
  ns: NS
  hackScript: string
  hackScriptRam: number
  weakenScript: string
  weakenScriptRam: number
  growScript: string
  growScriptRam: number
  libraryScriptList: Array<string>

  constructor(x: {
    ns: NS
  }) {
    const hackScript = "v3/hackScript.ts"
    const weakenScript = "v3/weakenScript.ts"
    const growScript = "v3/growScript.ts"

    this.ns = x.ns
    this.hackScript = hackScript
    this.hackScriptRam = x.ns.getScriptRam(hackScript, "home")
    this.weakenScript = weakenScript
    this.weakenScriptRam = x.ns.getScriptRam(weakenScript, "home")
    this.growScript = growScript
    this.growScriptRam = x.ns.getScriptRam(growScript, "home")
    this.libraryScriptList = [
      "v3/Action.ts",
      "v3/CheckData.ts",
      "v3/checkCallback.ts",
      "v3/CHECK_PORT_NUMBER.ts",
      "v3/CheckData.ts",
    ]
  }

  scpList(
    fileList: Array<string>,
    destinationServer: string,
  ): boolean {
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i]
      if (!this.ns.scp(file, destinationServer, "home")) {
        return false
      }
    }
    return true
  }

  install(server: string): boolean {
    if (server == "home") {
      return true
    }
    if (!this.scpList([
      this.weakenScript,
      this.growScript,
      this.hackScript,
      ...this.libraryScriptList,
    ], server)) {
      return false
    }
    return true
  }

  installList(serverList: Array<string>): boolean {
    for (let i = 0; i < serverList.length; i++) {
      const server = serverList[i]
      if (!this.ns.hasRootAccess(server)) {
        continue
      }
      if (!this.install(server)) {
        return false
      }
    }
    return true
  }

  getScript(action: Action): string {
    if (action == Action.WEAKEN) {
      return this.weakenScript
    } else if (action == Action.GROW) {
      return this.growScript
    } else if (action == Action.HACK) {
      return this.hackScript
    }
    return ""
  }
}

export async function main(ns: NS): Promise<void> {
  const scriptInfo = new ScriptInfo({ ns: ns })
  const serverList = getServerList(ns)
  scriptInfo.installList(serverList)
}