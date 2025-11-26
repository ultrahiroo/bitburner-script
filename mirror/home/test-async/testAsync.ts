async function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve()
    }, ms)
  })
}

async function setDelayedTime(fn: any, ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      fn()
      resolve()
    }, ms)
  });
}

async function doNothing() {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve()
    }, 0)
  })
}

export async function main(ns: NS) {
  console.log("test has started");
  // setTimeout(() => console.log("hi!"), 0);
  // setTimeout(() => ns.tprint('hello 0'), 1000);
  for (let i = 0; i < 10; i++) {
    setTimeout(async () => ns.tprint('hello 0'), 1000);
    setTimeout(async () => { await sleep(10) }, 1000);
    setTimeout(() => { ns.exec("printInfo.ts", "home", 1, "home") }, 1000);
    await ns.asleep(1000)
  }

  //console.log(new Date());
  //await wait(5000); // 5秒待つ
  //console.log(new Date());
  //await doNothing()
  await setDelayedTime(() => { ns.tprint('hello 1') }, 2000)
  ns.tprint('hello 2')

  // await ns.sleep(40000)
}