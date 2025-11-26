import { CHECK_PORT_NUMBER } from "./CHECK_PORT_NUMBER.ts"
import { CheckData } from "./CheckData.ts"
import { check } from "./check.ts"

export async function main(ns: NS): Promise<void> {
  const sequentialLag = 1000 // milisecond
  ns.disableLog("ALL")
  const portHandler = ns.getPortHandle(CHECK_PORT_NUMBER)
  portHandler.clear()

  ns.print(`infinite loop has started`)
  while (true) {
    await portHandler.nextWrite()
    const value = portHandler.read()
    if (value == "NULL PORT DATA") {
      continue
    }
    const checkData = value as CheckData
    check(ns, checkData, sequentialLag)
  }
}