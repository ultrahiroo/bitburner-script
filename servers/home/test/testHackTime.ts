export async function main(ns: NS) {
  const size = 10
  for (let i = 1; i <= size; ++i) {
    const sleepStartTimestamp = performance.now()
    await ns.hack("n00dles")
    const sleepEndTimestamp = performance.now()
    const actualTime = sleepEndTimestamp - sleepStartTimestamp
    ns.tprint(`actualTime: ${actualTime}`)
  }
}