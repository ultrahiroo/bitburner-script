import { Action } from "./Action.ts"
import { Job } from "./Job.ts"

export class JobList {
  ns: NS
  value: Array<Job>

  constructor(x: {
    ns: NS
  }) {
    this.ns = x.ns
    this.value = []
  }

  updateExecutionTime(): void {
    for (let i = 0; i < this.value.length; i++) {
      const job = this.value[i]
      const target = job.target
      if (job.action == Action.WEAKEN) {
        const weakenTime = this.ns.getWeakenTime(target)
        job.executionTime = weakenTime
      } else if (job.action == Action.GROW) {
        const growTime = this.ns.getGrowTime(target)
        job.executionTime = growTime
      } else if (job.action == Action.HACK) {
        const hackTime = this.ns.getHackTime(target)
        job.executionTime = hackTime
      }
    }
  }

  updateStartTimestamp(): void {
    for (let i = 0; i < this.value.length; i++) {
      const job = this.value[i]
      job.updateStartTimestamp()
    }
  }

  sortByStartTimestamp(): void {
    this.value.sort((a, b) => { return b.startTimestamp - a.startTimestamp })
  }
}

export async function main(ns: NS): Promise<void> {
  return
}