export async function main(ns: NS) {
  function countdownWithInterval(seconds) {
    let remainingTime = seconds;
    let timestamp = Date.now()

    // 表示を更新
    console.log(`残り時間: ${remainingTime}秒`);

    const timerId = setInterval(function () {
      const currentTimestamp = Date.now()
      const spendTime = currentTimestamp - timestamp
      timestamp = currentTimestamp
      console.log(`spendTime: ${spendTime}`);

      // 1秒減らす
      remainingTime--;

      // 表示を更新
      console.log(`残り時間: ${remainingTime}秒`);

      // 終了条件
      if (remainingTime <= 0) {
        clearInterval(timerId);  // 繰り返しを停止
        console.log("カウントダウン終了！");
      }
    }, 1);
  }

  // 10秒からカウントダウン開始
  countdownWithInterval(100);
}