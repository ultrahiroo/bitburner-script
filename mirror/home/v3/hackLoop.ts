import { MIN_SLEEP_TIME } from "../MIN_SLEEP_TIME.ts"
import { JobCreator } from "./JobCreator.ts"
import { JobList } from "./JobList.ts"

export async function main(ns: NS): Promise<void> {
  ns.disableLog("ALL")
  const sequentialLag = 1000 // milisecond
  const maxAdditionalTime = sequentialLag + (1 * 1000) // milisecond
  const verbose = false
  const jobCreator = new JobCreator({
    ns: ns,
    sequentialLag: sequentialLag,
    weakenMaxThreadSize: 64,
    growMaxThreadSize: 64,
    hackMaxThreadSize: 64,
    startAllocationMarginTime: maxAdditionalTime,
    endAllocationMarginTime: 5 * 1000,
    securityThresholdMarginRatio: 0.10,
    moneyThresholdMarginRatio: 0.10,
    startMarginTime: 3 * 1000,
    endMarginTime: 3 * 1000,
  })
  const jobList = new JobList({
    ns: ns,
  })

  // initialzing
  jobCreator.keepSize(jobList.value)
  jobList.updateExecutionTime()
  jobList.updateStartTimestamp()
  jobList.sortByStartTimestamp()
  let nextJob = jobList.value.pop()
  if (nextJob == undefined) {
    return
  }
  let nextTimestamp = nextJob.startTimestamp

  ns.print(`infinite loop has started`)
  while (true) {
    const remainTime = nextTimestamp - Date.now()
    if (verbose) {
      ns.print(`remainTime: ${Math.ceil(remainTime)} milisecond`)
    }

    if (remainTime >= maxAdditionalTime) {
      const sleepTime = MIN_SLEEP_TIME
      const sleepStartShortTimestamp = performance.now()
      await ns.asleep(sleepTime)
      const sleepDelayTime = performance.now() - (sleepStartShortTimestamp + sleepTime)
      if (sleepDelayTime > MIN_SLEEP_TIME) {
        if (verbose) {
          ns.print(`sleepDelayTime: ${Math.ceil(sleepDelayTime)} milisecond`)
        }
      }
      continue
    }

    const executionStartTimestamp = Date.now()
    const delayTime = -remainTime
    if (delayTime > MIN_SLEEP_TIME) {
      ns.print(`delayTime: ${Math.trunc(delayTime)} milisecond`)
    }
    const hasExecuted = nextJob.execute(ns)

    let tagString = ""
    if (!hasExecuted) {
      tagString += "ERROR "
    }
    ns.print(`${tagString}hasExecuted: ${hasExecuted}, action: ${nextJob.action}, threadSize: ${nextJob.threadSize}, host: ${nextJob.host}, target: ${nextJob.target}`)

    // initialzing
    jobCreator.keepSize(jobList.value)
    jobCreator.update()
    jobList.updateExecutionTime()
    jobList.updateStartTimestamp()
    jobList.sortByStartTimestamp()
    nextJob = jobList.value.pop()
    if (nextJob == undefined) {
      break
    }
    nextTimestamp = nextJob.startTimestamp
    const executionEndTimestamp = Date.now()
    const executionTime = executionEndTimestamp - executionStartTimestamp
    if (executionTime > MIN_SLEEP_TIME) {
      ns.print(`WARN executionTime: ${executionTime}`)
    }
  }
}