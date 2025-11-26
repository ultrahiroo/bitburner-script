import { CHECK_PORT_NUMBER } from "./CHECK_PORT_NUMBER.ts"
import { CheckData } from "./CheckData.ts"

export function checkCallback(
  ns: NS,
  checkData: CheckData,
): void {
  const portHandler = ns.getPortHandle(CHECK_PORT_NUMBER)
  const writeStatus = portHandler.tryWrite(checkData)
  if (!writeStatus) {
    ns.tprint(`ERROR writeStatus: ${writeStatus}, target: ${checkData.target}`)
  }
}

export async function main(ns: NS): Promise<void> {
  return
}