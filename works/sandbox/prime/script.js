document.addEventListener('DOMContentLoaded', () => {
  const DISPLAY_LIMIT = 1000000; // この数を超える場合は一覧を表示しない（ダウンロードのみ）
  const limitInput = document.getElementById('limit-input');
  const genBtn = document.getElementById('generate-button');
  const timeP = document.getElementById('time');
  const countP = document.getElementById('count');
  const resultsPre = document.getElementById('results');
  const downloadBtn = document.getElementById('download-button');

  function segmentedSieveWithWheel(limit) {
    if (limit < 2) return [];

    const primes = [];
    if (limit >= 2) primes.push(2);
    if (limit >= 3) primes.push(3);
    if (limit >= 5) primes.push(5);
    if (limit < 7) return primes;

    const sqrtLimit = (Math.sqrt(limit)) | 0;
    const SEGMENT_RANGE = 16 * 1024 * 30;

    const residues = [1, 7, 11, 13, 17, 19, 23, 29];
    const res_map = {};
    residues.forEach((r, i) => res_map[r] = i);
    const bit_masks = residues.map(r => ~(1 << res_map[r]));

    // --- 複合プリシーブパターンの事前計算 ---
    const PRESIEVE_PRIMES = [7, 11, 13];
    const LCM = 7 * 11 * 13; // 1001
    const combined_pattern = new Uint8Array(LCM);
    combined_pattern.fill(255);

    for (const p of PRESIEVE_PRIMES) {
        const pattern = new Uint8Array(p);
        pattern.fill(255);
        for (let i = 0; i < p * 30; i++) {
            if (i % p === 0) {
                const mod30 = i % 30;
                const res_idx = res_map[mod30];
                if (res_idx !== undefined) {
                    const q = (i / 30) | 0;
                    pattern[q % p] &= bit_masks[res_idx];
                }
            }
        }
        // 複合パターンにマージ
        for (let i = 0; i < LCM; i++) {
            combined_pattern[i] &= pattern[i % p];
        }
    }

    // Step 1: sqrt(limit)までの素数を生成
    const baseSieve = new Uint8Array(sqrtLimit + 1);
    baseSieve.fill(1);
    for (let p = 2; p * p <= sqrtLimit; p++) {
        if (baseSieve[p]) {
            for (let i = p * p; i <= sqrtLimit; i += p) baseSieve[i] = 0;
        }
    }
    const primes_base = [];
    for (let p = 7; p <= sqrtLimit; p++) {
        if (baseSieve[p]) primes_base.push(p);
    }
    for (const p of primes_base) {
        primes.push(p);
    }

    // Step 2: セグメントごとに篩う
    let low = 0;
    const sieving_primes = primes_base.filter(p => p > 13);

    while (low <= limit) {
        const high = Math.min(low + SEGMENT_RANGE - 1, limit);
        if (high < 7) {
            low += SEGMENT_RANGE;
            continue;
        }

        const low_q = (low / 30) | 0;
        const high_q = (high / 30) | 0;
        const segment_len = high_q - low_q + 1;
        const segment = new Uint8Array(segment_len);
        
        // 複合プリシーブパターンを適用
        let pattern_idx = low_q % LCM;
        for (let i = 0; i < segment_len; i++) {
            segment[i] = combined_pattern[pattern_idx];
            pattern_idx++;
            if (pattern_idx === LCM) pattern_idx = 0;
        }

        // 残りの素数で篩う (13より大きい素数)
        for (const p of sieving_primes) {
            const p_res = p % 30;
            for (let i = 0; i < 8; i++) {
                const r = residues[i];
                const pr_mod_30 = (p_res * r) % 30;
                const pr_res_idx = res_map[pr_mod_30];

                let k = (low / p) | 0;
                let diff = r - (k % 30);
                if (diff < 0) diff += 30;
                k += diff;

                let j = p * k;
                if (j < low) {
                    j += 30 * p;
                    k += 30;
                }

                if (j > high) continue;

                const q_pr = ((p * r) / 30) | 0;
                let q = p * ((k / 30) | 0) + q_pr;
                let segment_idx = q - low_q;

                for (; segment_idx < segment_len; segment_idx += p) {
                    segment[segment_idx] &= bit_masks[pr_res_idx];
                }
            }
        }

        // セグメントから素数を収集
        for (let i = 0; i < segment_len; i++) {
            const q = low_q + i;
            const bits = segment[i];
            if (bits === 0) continue;

            for (let k = 0; k < 8; k++) {
                if ((bits & (1 << k)) !== 0) {
                    const n = 30 * q + residues[k];
                    if (n > sqrtLimit && n <= limit) {
                        primes.push(n);
                    }
                }
            }
        }
        low += SEGMENT_RANGE;
    }

    return primes;
  }

  genBtn.addEventListener('click', () => {
    const requested = (Number(limitInput.value) || 0) | 0;
    const limit = Math.max(2, requested);

    const hideList = limit > DISPLAY_LIMIT;

    if (hideList) {
      timeP.textContent = `計算中...（一覧は ${DISPLAY_LIMIT.toLocaleString()} を超えるため表示しません。計算後にダウンロードできます）`;
    } else {
      timeP.textContent = '計算中...';
    }

    resultsPre.textContent = '';
    countP.textContent = '';
    downloadBtn.disabled = true;

    setTimeout(() => {
      const t0 = performance.now();
      const primes = segmentedSieveWithWheel(limit);
      const t1 = performance.now();
      const ms = (t1 - t0).toFixed(2);

      timeP.textContent = `計算時間: ${ms} ms`;
      countP.textContent = `素数の数: ${primes.length}`;

      if (hideList) {
        resultsPre.textContent = `（一覧は表示されません。ダウンロードボタンから結果を取得してください）`;
      } else {
        resultsPre.textContent = primes.join(', ');
      }

      downloadBtn.disabled = false;
      downloadBtn.onclick = () => {
        const content = `count: ${primes.length}\n` + primes.join(', ');
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `primes_up_to_${limit}.txt`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      };
    }, 50);
  });
});