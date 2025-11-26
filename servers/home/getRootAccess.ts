import { isPurchasedServer } from "./purchased-server/isPurchasedServer.ts";

export function getRootAccess(ns: NS, host: string): boolean {
  if (host == "home") {
    return true
  }
  if (isPurchasedServer(host)) {
    return true
  }
  const requiredPortSize = ns.getServerNumPortsRequired(host)
  if (requiredPortSize >= 1) {
    const hasBrutessh = ns.fileExists("BruteSSH.exe", "home")
    if (!hasBrutessh) {
      return false
    }
    const brutesshFlag = ns.brutessh(host)
    if (!brutesshFlag) {
      return false
    }
  }
  if (requiredPortSize >= 2) {
    const hasFtpcrack = ns.fileExists("FTPCrack.exe", "home")
    if (!hasFtpcrack) {
      return false
    }
    const ftpcrackFlag = ns.ftpcrack(host)
    if (!ftpcrackFlag) {
      return false
    }
  }
  if (requiredPortSize >= 3) {
    const hasRelaysmtp = ns.fileExists("relaySMTP.exe", "home")
    if (!hasRelaysmtp) {
      return false
    }
    const relaysmtpFlag = ns.relaysmtp(host)
    if (!relaysmtpFlag) {
      return false
    }
  }
  if (requiredPortSize >= 4) {
    if (!ns.fileExists("HTTPWorm.exe", "home")) {
      return false
    }
    if (!ns.httpworm(host)) {
      return false
    }
  }
  if (requiredPortSize >= 5) {
    if (!ns.fileExists("SQLInject.exe", "home")) {
      return false
    }
    if (!ns.sqlinject(host)) {
      return false
    }
  }
  if (requiredPortSize >= 6) {
    ns.tprint(`ERROR required_port_size: ${requiredPortSize}`)
    return false
  }
  const nukeFlag = ns.nuke(host)
  if (!nukeFlag) {
    return false
  }
  return true
}

export async function main(ns: NS): Promise<void> {
  if ((typeof ns.args[0]) != "string") {
    ns.tprint(`first argument was expected host: ${ns.args[0]}`)
    return
  }
  const host = ns.args[0] as string
  if (!getRootAccess(ns, host)) {
    ns.tprint(`host: ${host}, host is failed to get root access`)
  } else {
    ns.tprint(`host: ${host}, host is successed to get root access`)
  }
}