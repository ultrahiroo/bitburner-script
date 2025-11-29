import { Action } from "./Action.ts"

export class Job {
  action: Action
  target: string
  host: string
  endTimestamp: number
  executionTime: number
  startTimestamp: number
  threadSize: number
  requiredRam: number
  expectedMoney: number
  expectedSecurity: number
  script: string
  message: string

  constructor(x: {
    action: Action
    target: string
    host: string
    endTimestamp: number
    executionTime: number
    threadSize: number
    requiredRam: number
    expectedMoney: number
    expectedSecurity: number
    script: string
    message: string
  }) {
    this.action = x.action
    this.target = x.target
    this.host = x.host
    this.endTimestamp = x.endTimestamp
    this.executionTime = x.executionTime
    this.startTimestamp = x.endTimestamp - x.executionTime
    this.threadSize = x.threadSize
    this.requiredRam = x.requiredRam
    this.expectedMoney = x.expectedMoney
    this.expectedSecurity = x.expectedSecurity
    this.script = x.script
    this.message = x.message
  }

  updateStartTimestamp(): void {
    this.startTimestamp = this.endTimestamp - this.executionTime
  }

  execute(ns: NS): boolean {
    if (ns.exec(
      this.script,
      this.host,
      this.threadSize,
      this.target,
      this.startTimestamp,
      this.endTimestamp,
      this.expectedMoney,
      this.expectedSecurity,
    ) == 0) {
      return false
    }
    return true
  }
}

export async function main(ns: NS): Promise<void> {
  return
}