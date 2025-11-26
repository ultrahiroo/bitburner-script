export async function main(ns: NS): Promise<void> {
  ns.exec("purchased-server/purchaseLoop.ts", "home", 1)
  ns.exec("v3/checkLoop.ts", "home", 1)
  ns.exec("v3/hackLoop.ts", "home", 1)
}