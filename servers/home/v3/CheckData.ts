import { Action } from "./Action.ts"

export class CheckData {
  action: Action
  target: string
  actualStartTimestamp: number
  expectStartTimestamp: number
  actualEndTimestamp: number
  expectEndTimestamp: number
  expectMoney: number
  expectSecurity: number

  constructor(x: {
    action: Action
    target: string
    actualStartTimestamp: number
    expectStartTimestamp: number
    actualEndTimestamp: number
    expectEndTimestamp: number
    expectMoney: number
    expectSecurity: number
  }) {
    this.action = x.action
    this.target = x.target
    this.actualStartTimestamp = x.actualStartTimestamp
    this.expectStartTimestamp = x.expectStartTimestamp
    this.actualEndTimestamp = x.actualEndTimestamp
    this.expectEndTimestamp = x.expectEndTimestamp
    this.expectMoney = x.expectMoney
    this.expectSecurity = x.expectSecurity
  }
}

export async function main(ns: NS): Promise<void> {
  return
}