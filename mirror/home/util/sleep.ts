export async function sleep(milisecond: number): Promise<void> {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve()
    }, milisecond)
  })
}

export async function main(ns: NS): Promise<void> {
  if ((typeof ns.args[0]) != "number") {
    ns.tprint(`first argument was expected milisecond: ${ns.args[0]}`)
    return
  }
  const milisecond = ns.args[0] as number
  ns.tprint("script has started")
  await sleep(milisecond)
  ns.tprint("script has finished")
}