export async function main(ns: NS): Promise<void> {
  ns.exec("purchased-server/purchaseLoop.ts", "home")
  ns.exec("v3/checkLoop.ts", "home")
  ns.exec("v3/hackLoop.ts", "home")
}