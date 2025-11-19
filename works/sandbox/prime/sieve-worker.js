// sieve-worker.js
// 責務：割り当てられた範囲の素数計算を並列実行し、結果を自己完結した文字列チャンクとしてストリーミングで返す。

self.onmessage = (e) => {
    const { range, primes_base, sqrtLimit } = e.data;
    const [low, limit] = range;

    // --- このWorker内で使用する計算ロジック ---
    const residues = [1, 7, 11, 13, 17, 19, 23, 29];
    const res_map = {};
    residues.forEach((r, i) => res_map[r] = i);
    const bit_masks = residues.map(r => ~(1 << res_map[r]));

    const PRESIEVE_PRIMES = [7, 11, 13, 17, 19];
    const LCM = 7 * 11 * 13 * 17 * 19; // 323323
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
                    const q = Math.floor(i / 30);
                    pattern[q % p] &= bit_masks[res_idx];
                }
            }
        }
        for (let i = 0; i < LCM; i++) {
            combined_pattern[i] &= pattern[i % p];
        }
    }
    
    const sieving_primes = primes_base.filter(p => p > 19);
    const SEGMENT_RANGE = 16 * 1024 * 30;
    
    let primeCount = 0;
    const CHUNK_SIZE = 1000000;
    let primeChunk = [];
    let isFirstChunk = true;

    let current_low = low;

    while (current_low <= limit) {
        const high = Math.min(current_low + SEGMENT_RANGE - 1, limit);
        if (high < 7) {
            current_low += SEGMENT_RANGE;
            continue;
        }

        const low_q = Math.floor(current_low / 30);
        const high_q = Math.floor(high / 30);
        const segment_len = high_q - low_q + 1;
        const segment = new Uint8Array(segment_len);
        
        let pattern_idx = low_q % LCM;
        for (let i = 0; i < segment_len; i++) {
            segment[i] = combined_pattern[pattern_idx];
            pattern_idx++;
            if (pattern_idx === LCM) pattern_idx = 0;
        }

        for (const p of sieving_primes) {
            const p_res = p % 30;
            for (let i = 0; i < 8; i++) {
                const r = residues[i];
                const pr_mod_30 = (p_res * r) % 30;
                const pr_res_idx = res_map[pr_mod_30];

                let k = Math.floor(current_low / p);
                let diff = r - (k % 30);
                if (diff < 0) diff += 30;
                k += diff;

                let j = p * k;
                if (j < current_low) {
                    j += 30 * p;
                    k += 30;
                }

                if (j > high) continue;

                const q_pr = Math.floor((p * r) / 30);
                let q = p * Math.floor(k / 30) + q_pr;
                let segment_idx = q - low_q;

                for (; segment_idx < segment_len; segment_idx += p) {
                    segment[segment_idx] &= bit_masks[pr_res_idx];
                }
            }
        }

        for (let i = 0; i < segment_len; i++) {
            const q = low_q + i;
            const bits = segment[i];
            if (bits === 0) continue;
            for (let k = 0; k < 8; k++) {
                if ((bits & (1 << k)) !== 0) {
                    const n = 30 * q + residues[k];
                    if (n > sqrtLimit && n <= limit && n >= current_low && n <= high) {
                        primeChunk.push(n);
                        primeCount++;
                        if (primeChunk.length >= CHUNK_SIZE) {
                            let chunkData = primeChunk.join(', ');
                            self.postMessage({ type: 'sieve_chunk', data: chunkData });
                            primeChunk = [];
                            isFirstChunk = false;
                        }
                    }
                }
            }
        }
        current_low += SEGMENT_RANGE;
    }

    if (primeChunk.length > 0) {
        let chunkData = primeChunk.join(', ');
        self.postMessage({ type: 'sieve_chunk', data: chunkData });
    }

    self.postMessage({
        type: 'sieve_done',
        primeCount: primeCount
    });
};
