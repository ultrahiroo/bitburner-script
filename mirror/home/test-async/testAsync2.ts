async function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve()
    }, ms)
  })
}

async function thread1(ns: NS) {
  return new Promise<void>(async (resolve) => {
    while (true) {
      console.log("from thread 1")
      // await sleep(1000)
      await ns.asleep(1000)
    }
  })
}

async function thread2(ns: NS) {
  return new Promise<void>(async (resolve) => {
    while (true) {
      console.log("from thread 2")
      // await sleep(1000)
      await ns.asleep(1000)
    }
  })
}

export async function main(ns: NS) {
  console.log("test has started");

  await Promise.all([
    thread1(ns),
    thread2(ns),
  ])
}