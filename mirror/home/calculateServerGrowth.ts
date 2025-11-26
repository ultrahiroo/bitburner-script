function calculateServerGrowthLog(
  ns: NS,
  host: string,
  threadSize: number,
  coreSize?: number | undefined,
): number {
  // https://github.com/bitburner-official/bitburner-src/blob/dev/src/Server/formulas/grow.ts#L7
  // https://github.com/bitburner-official/bitburner-src/blob/dev/src/Server/ServerHelpers.ts#L63
  const multiplier = 2
  const y_single_thread = Math.log(multiplier) / ns.growthAnalyze(host, multiplier, coreSize)
  const y = y_single_thread * Math.max(threadSize, 0);
  return y
}

export function calculateServerGrowth(
  ns: NS,
  host: string,
  threadSize: number,
  coreSize?: number | undefined,
): number {
  const y = Math.exp(calculateServerGrowthLog(ns, host, threadSize, coreSize))
  return y
}

export async function main(ns: NS): Promise<void> {
  if ((typeof ns.args[0]) != "string") {
    ns.tprint(`first argument was expected host: ${ns.args[0]}`)
    return
  }
  const host = ns.args[0] as string
  const threadSize = 1
  const growth = calculateServerGrowth(ns, host, threadSize)
  ns.tprint(`growth: ${growth}`)

  const expectMoney = ns.getServerMoneyAvailable(host) * growth
  await ns.grow(host)
  const actualMoney = ns.getServerMoneyAvailable(host)
  ns.tprint(`expectMoney: ${expectMoney}`)
  ns.tprint(`actualMoney: ${actualMoney}`)
  ns.tprint(`test ok: ${actualMoney > expectMoney}`)
}