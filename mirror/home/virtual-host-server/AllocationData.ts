export class AllocationData {
  usedRam: number
  startTimestamp: number
  endTimestamp: number

  constructor(x: {
    usedRam: number
    startTimestamp: number
    endTimestamp: number
  }) {
    if (x.usedRam <= 0) {
      throw new Error("invalid value")
    }
    if (x.startTimestamp >= x.endTimestamp) {
      throw new Error("invalid value")
    }
    this.usedRam = x.usedRam
    this.startTimestamp = x.startTimestamp
    this.endTimestamp = x.endTimestamp
  }
}

export async function main(ns: NS): Promise<void> {
  return
}