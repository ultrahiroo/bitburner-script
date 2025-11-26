export class AllocationTimestamp {
  ramDiff: number
  timestamp: number

  constructor(x: {
    ramDiff: number
    timestamp: number
  }) {
    this.ramDiff = x.ramDiff
    this.timestamp = x.timestamp
  }
}

export async function main(ns: NS): Promise<void> {
  return
}