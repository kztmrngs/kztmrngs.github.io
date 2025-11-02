/**
 * 現在の日付と今年の進捗を更新する関数
 */
function updateYearProgress() {
    const now = new Date();
    const year = now.getFullYear();

    // 1. 現在の日付を表示
    const dateOptions = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tokyo', hour12: false};
    const dateElement = document.getElementById('date-time');
    if (dateElement) {
        dateElement.textContent = now.toLocaleString('ja-JP', dateOptions);
    }

    // 2. 年の進捗を計算
    const startOfYear = new Date(year, 0, 1); // 今年の1月1日
    const endOfYear = new Date(year + 1, 0, 1); // 来年の1月1日

    const totalMillisecondsInYear = endOfYear - startOfYear;
    const millisecondsPassed = now - startOfYear;

    const progressPercentage = (millisecondsPassed / totalMillisecondsInYear) * 100;

    // 3. プログレスバーの幅を更新
    const progressBar = document.getElementById('progress-bar');
    if (progressBar) {
        progressBar.style.width = progressPercentage.toFixed(2) + '%'; // 小数点以下2桁まで表示
    }

    // 4. 進捗率のテキストを更新
    const progressTextElement = document.getElementById('progress-text');
    if (progressTextElement) {
        progressTextElement.textContent = `今年の進捗: ${progressPercentage.toFixed(2)}%`;
    }
}

// ページが完全に読み込まれた後に、上記の関数を実行します。
document.addEventListener('DOMContentLoaded', updateYearProgress);

// 必要であれば、定期的に更新することもできます（例: 1秒ごと）。
setInterval(updateYearProgress, 1000);
