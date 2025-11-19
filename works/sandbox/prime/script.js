document.addEventListener('DOMContentLoaded', () => {
  const DISPLAY_LIMIT = 1000000;
  const limitInput = document.getElementById('limit-input');
  const genBtn = document.getElementById('generate-button');
  const timeP = document.getElementById('time');
  const countP = document.getElementById('count');
  const resultsPre = document.getElementById('results');
  const downloadBtn = document.getElementById('download-button');

  let activeWorkers = [];

  genBtn.addEventListener('click', () => {
    activeWorkers.forEach(w => w.terminate());
    activeWorkers = [];
    
    const limit = Number(limitInput.value) || 0;
    if (limit < 2) return;

    const t0 = performance.now();
    timeP.textContent = '準備中... (ベース素数生成)';
    countP.textContent = '';
    resultsPre.textContent = limit > DISPLAY_LIMIT ? '（一覧は表示されません。計算後にダウンロードボタンから結果を取得できます）' : '';
    genBtn.disabled = true;
    downloadBtn.disabled = true;

    const sqrtLimit = Math.floor(Math.sqrt(limit));
    const setupWorker = new Worker('setup-worker.js');
    activeWorkers.push(setupWorker);

    setupWorker.onmessage = (e) => {
      const { primes_base } = e.data;
      setupWorker.terminate();
      
      timeP.textContent = `計算中... (並列処理: ${navigator.hardwareConcurrency || 'N/A'} コア)`;

      const numWorkers = navigator.hardwareConcurrency || 4;
      const rangeStart = sqrtLimit + 1;
      const rangeSize = Math.ceil((limit - rangeStart + 1) / numWorkers);
      
      let workersFinished = 0;
      let totalPrimeCount = primes_base.length;
      const basePrimesBlobPart = primes_base.length > 0 ? [primes_base.join(', ')] : [];
      const workerBlobParts = new Array(numWorkers).fill(null).map(() => []);

      if (rangeStart > limit) {
          allWorkersDone();
          return;
      }

      for (let i = 0; i < numWorkers; i++) {
        const workerId = i;
        const workerStart = rangeStart + i * rangeSize;
        const workerEnd = Math.min(workerStart + rangeSize - 1, limit);

        if (workerStart > limit) {
            workersFinished++;
            if (workersFinished === numWorkers) allWorkersDone();
            continue;
        };

        const sieveWorker = new Worker('sieve-worker.js');
        activeWorkers.push(sieveWorker);

        sieveWorker.onmessage = (event) => {
          const { type, data, primeCount } = event.data;

          if (type === 'sieve_chunk') {
            if(data) workerBlobParts[workerId].push(data);
          } else if (type === 'sieve_done') {
            totalPrimeCount += (primeCount || 0);
            workersFinished++;
            sieveWorker.terminate();
            
            if (workersFinished === numWorkers) {
              allWorkersDone();
            }
          }
        };

        sieveWorker.postMessage({
          workerId: workerId,
          range: [workerStart, workerEnd],
          primes_base: primes_base,
          sqrtLimit: sqrtLimit
        });
      }

      function allWorkersDone() {
        const t1 = performance.now();
        timeP.textContent = `計算時間: ${(t1 - t0).toFixed(2)} ms`;
        countP.textContent = `素数の数: ${totalPrimeCount.toLocaleString()}`;
        
        const blobParts = [];
        let isFirstPart = true;

        // ベース素数を追加
        if (basePrimesBlobPart.length > 0 && basePrimesBlobPart[0].length > 0) {
            blobParts.push(basePrimesBlobPart[0]);
            isFirstPart = false;
        }

        // 各ワーカーからのチャンクを追加
        workerBlobParts.forEach(workerChunks => {
            if (workerChunks && workerChunks.length > 0) {
                workerChunks.forEach(chunk => {
                    if (chunk && chunk.length > 0) {
                        if (!isFirstPart) {
                            blobParts.push(', ');
                        }
                        blobParts.push(chunk);
                        isFirstPart = false;
                    }
                });
            }
        });

        downloadBtn.disabled = false;
        downloadBtn.onclick = () => {
          const header = `count: ${totalPrimeCount}\n`;
          const finalBlob = new Blob([header, ...blobParts], { type: 'text/plain' });
          const url = URL.createObjectURL(finalBlob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `primes_up_to_${limit}.txt`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
        };

        if (limit <= DISPLAY_LIMIT) {
            // 表示用の文字列もBlobから生成するが、巨大な場合に備える
            const displayBlob = new Blob(blobParts, { type: 'text/plain' });
            if (displayBlob.size > DISPLAY_LIMIT * 10) { // サイズが大きすぎる場合
                 resultsPre.textContent = '（結果が大きすぎるため、一部のみ表示します）\n';
                 const reader = new FileReader();
                 reader.onload = (e) => {
                     resultsPre.textContent += e.target.result;
                 };
                 // Blobの先頭1MBだけ読み込む
                 reader.readAsText(displayBlob.slice(0, 1024 * 1024));
            } else {
                // Blob全体を読み込んで表示
                displayBlob.text().then(text => {
                    resultsPre.textContent = text;
                });
            }
        }

        genBtn.disabled = false;
        activeWorkers = [];
      }
    };

    setupWorker.postMessage({ sqrtLimit });
  });
});
