// setup-worker.js
//責務：sqrt(limit)までの素数（primes_base）を計算し、メインスレッドに返す。

self.onmessage = (e) => {
    const { sqrtLimit } = e.data;

    // このWorker内だけで使用する、素数生成ロジック
    const residues = [1, 7, 11, 13, 17, 19, 23, 29];
    const res_map = {};
    residues.forEach((r, i) => res_map[r] = i);
    const bit_masks = residues.map(r => ~(1 << res_map[r]));

    const primes_base = [];
    if (sqrtLimit >= 2) primes_base.push(2);
    if (sqrtLimit >= 3) primes_base.push(3);
    if (sqrtLimit >= 5) primes_base.push(5);
    
    if (sqrtLimit >= 7) {
        const ssqrtLimit = Math.floor(Math.sqrt(sqrtLimit));

        const ssqrtSieve = new Uint8Array(ssqrtLimit + 1);
        ssqrtSieve.fill(1);
        ssqrtSieve[0] = ssqrtSieve[1] = 0;
        for (let p = 2; p * p <= ssqrtLimit; p++) {
            if (ssqrtSieve[p]) {
                for (let i = p * p; i <= ssqrtLimit; i += p) ssqrtSieve[i] = 0;
            }
        }
        
        const sievingPrimesForBase = [];
        for (let p = 7; p <= ssqrtLimit; p++) {
            if (ssqrtSieve[p]) {
                sievingPrimesForBase.push(p);
            }
        }

        const baseWheelSieveSize = Math.floor(sqrtLimit / 30) + 1;
        const baseWheelSieve = new Uint8Array(baseWheelSieveSize);
        baseWheelSieve.fill(255);

        for (const p of sievingPrimesForBase) {
            const p_res = p % 30;
            for (const r of residues) {
                const start_num = p * r;
                if (start_num > sqrtLimit) break;
                const pr_mod_30 = (p_res * r) % 30;
                const res_idx = res_map[pr_mod_30];
                if (res_idx === undefined) continue;
                let q = Math.floor(start_num / 30);
                for (; q < baseWheelSieveSize; q += p) {
                    baseWheelSieve[q] &= bit_masks[res_idx];
                }
            }
        }

        primes_base.push(...sievingPrimesForBase);
        
        const start_q = (ssqrtLimit > 0) ? Math.floor(ssqrtLimit / 30) : 0;
        for (let q = start_q; q < baseWheelSieveSize; q++) {
            const bits = baseWheelSieve[q];
            if (bits === 0) continue;
            for (let k = 0; k < 8; k++) {
                if ((bits & (1 << k)) !== 0) {
                    const n = 30 * q + residues[k];
                    if (n > ssqrtLimit && n <= sqrtLimit) {
                         primes_base.push(n);
                    }
                }
            }
        }
    }
    
    // メインスレッドにprimes_baseを返す
    self.postMessage({ type: 'primes_base_done', primes_base: primes_base });
};
