export async function main(ns: NS): Promise<void> {
  const scriptNameList = [
    "purchased-server/purchaseLoop.ts",
    "v3/checkLoop.ts",
    "v3/hackLoop.ts",
  ]
  for (let i = 0; i < scriptNameList.length; i++) {
    const scriptName = scriptNameList[i]
    ns.scriptKill(scriptName, "home")
  }
}
