self.addEventListener("message", (e) => {
  // メッセージを受け取ったときに動かすコード
  console.log("worker received a message", e);
});

self.postMessage("hello");