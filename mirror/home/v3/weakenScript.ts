import { Action } from "./Action.ts"
import { CheckData } from "./CheckData.ts"
import { checkCallback } from "./checkCallback.ts"

export async function main(ns: NS): Promise<void> {
  if ((typeof ns.args[0]) != "string") {
    ns.tprint(`first argument was expected target: ${ns.args[0]}`)
    return
  }
  if ((typeof ns.args[1]) != "number") {
    ns.tprint(`second argument was expected expectStartTimestamp: ${ns.args[1]}`)
    return
  }
  if ((typeof ns.args[2]) != "number") {
    ns.tprint(`third argument was expected expectEndTimestamp: ${ns.args[2]}`)
    return
  }
  if ((typeof ns.args[3]) != "number") {
    ns.tprint(`fourth argument was expected expectMoney: ${ns.args[3]}`)
    return
  }
  if ((typeof ns.args[4]) != "number") {
    ns.tprint(`fifth argument was expected expectSecurity: ${ns.args[4]}`)
    return
  }
  const target = ns.args[0] as string
  const expectStartTimestamp = ns.args[1] as number
  const expectEndTimestamp = ns.args[2] as number
  const expectMoney = ns.args[3] as number
  const expectSecurity = ns.args[4] as number

  const actualStartTimestamp = Date.now()
  const additionalTime = Math.max(0, expectStartTimestamp - actualStartTimestamp)
  await ns.weaken(target, { additionalMsec: additionalTime })
  const actualEndTimestamp = Date.now()
  const checkData = new CheckData({
    action: Action.WEAKEN,
    target: target,
    actualStartTimestamp: actualStartTimestamp,
    expectStartTimestamp: expectStartTimestamp,
    actualEndTimestamp: actualEndTimestamp,
    expectEndTimestamp: expectEndTimestamp,
    expectMoney: expectMoney,
    expectSecurity: expectSecurity,
  })
  checkCallback(ns, checkData)
}