export async function sleep(milisecond: number) {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve()
    }, milisecond)
  })
}

export async function main(ns: NS) {
  if ((typeof ns.args[0]) != "number") {
    ns.tprint(`first argument was expected milisecond: ${ns.args[0]}`)
    return
  }
  const milisecond = ns.args[0] as number
  ns.tprint("script has started")
  await sleep(milisecond)
  ns.tprint("script has finished")
}