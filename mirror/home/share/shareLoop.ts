export async function main(ns: NS): Promise<void> {
  ns.tprint(`infinite loop has started`)
  while (true) {
    await ns.share()
  }
}