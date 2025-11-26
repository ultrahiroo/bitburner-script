export async function main(ns: NS) {
  console.log(`test has started`)
  const endTimestamp = Date.now() + 200

  const time1 = endTimestamp - Date.now()
  console.log(`${time1}`)
  setTimeout(() => {
    console.log("1")
  }, time1)

  await ns.asleep(0)

  const startTime1 = Date.now()
  while (Date.now() - startTime1 < 200) {}
  
  await ns.asleep(0)

  const time2 = endTimestamp - Date.now() + 8
  console.log(`${time2}`)
  setTimeout(() => {
    console.log("2")
  }, time2)

  await ns.asleep(0)

  const startTime2 = Date.now()
  while (Date.now() - startTime2 < 200) {}

  await ns.asleep(0)

  const time3 = endTimestamp - Date.now() + 8
  console.log(`${time3}`)
  setTimeout(() => {
    console.log("3")
  }, time3)

  await ns.asleep(0)
}