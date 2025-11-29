import { CheckData } from "./CheckData.ts"

export function check(
  ns: NS,
  checkData: CheckData,
  thresholdDelayTime: number, // milisecond
): void {
  ns.print(`target: ${checkData.target}, action: ${checkData.action}`)
  const server = ns.getServer(checkData.target)

  const startDelayTime = checkData.actualStartTimestamp - checkData.expectStartTimestamp
  const passStartTimestamp = startDelayTime < thresholdDelayTime
  if (!passStartTimestamp) {
    ns.print(`ERROR test of StartTimestamp has failed, delayed ${startDelayTime} milisecond, expectStartTimestamp: ${checkData.expectStartTimestamp}, actualStartTimestamp: ${checkData.actualStartTimestamp}`)
  }

  const endDelayTime = checkData.actualEndTimestamp - checkData.expectEndTimestamp
  const passEndTimestamp = endDelayTime < thresholdDelayTime
  if (!passEndTimestamp) {
    ns.print(`ERROR test of EndTimestamp has failed, delayed ${endDelayTime} milisecond, expectEndTimestamp: ${checkData.expectEndTimestamp}, actualEndTimestamp: ${checkData.actualEndTimestamp}`)
  }

  const actualMoney = server.moneyAvailable ?? NaN
  const passMoney = (actualMoney == checkData.expectMoney)
  if (!passMoney) {
    ns.print(`ERROR: test of Money has failed, expectedMoney: ${checkData.expectMoney}, actualMoney: ${actualMoney}`)
  }

  const actualSecurity = server.hackDifficulty ?? NaN
  const passSecurity = (checkData.expectSecurity == actualSecurity)
  if (!passSecurity) {
    ns.print(`ERROR: test of Security has failed, expectedSecurity: ${checkData.expectSecurity}, actualSecurity: ${actualSecurity}`)
  }
}

export async function main(ns: NS): Promise<void> {
  return
}