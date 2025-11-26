export async function main(ns: NS): Promise<void> {
  console.log(`test has started`)
  const workerScript = ns.read("./worker.ts")
  // const myWorker = new Worker("./worker.ts")
  // const myWorker = new Worker("/home/one/temp/worker.ts")
  const myWorker = new Worker("worker.ts")
  myWorker.postMessage("hey");

  myWorker.addEventListener("message", (e) => {
    console.log("parent received message:", e.data);
  });
}