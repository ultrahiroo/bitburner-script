import { sleep } from "../sleep.ts"

export async function main(ns: NS) {
  const size = 1000
  const sleepTime = 1
  for (let i = 1; i <= size; ++i) {
    const sleepStartTimestamp = performance.now()
    // await sleep(sleepTime)
    // await ns.sleep(sleepTime)
    await ns.asleep(sleepTime)
    const sleepEndTimestamp = performance.now()
    const actualSleepTime = sleepEndTimestamp - sleepStartTimestamp
    const sleepDelayTime = actualSleepTime - sleepTime
    ns.tprint(`sleepDelayTime: ${sleepDelayTime}`)
  }
}