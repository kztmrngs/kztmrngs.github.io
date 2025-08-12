function isPrime(num) {
    if (num <= 1) return false;
    if (num <= 3) return true;
    if (num % 2 === 0 || num % 3 === 0) return false;
    for (let i = 5; i * i <= num; i = i + 6) {
        if (num % i === 0 || num % (i + 2) === 0) return false;
    }
    return true;
}

function primeFactorization() {
    const numberInput = document.getElementById('numberInput');
    const resultElement = document.getElementById('result');
    const number = parseInt(numberInput.value);

    if (isNaN(number) || number <= 1) {
        resultElement.textContent = '2以上の自然数を入力してください。';
        return;
    }

    if (isPrime(number)) {
        resultElement.textContent = `${number} は素数です。`;
        return;
    }

    let factors = [];
    let divisor = 2;
    let n = number;

    while (n >= 2) {
        if (n % divisor === 0) {
            factors.push(divisor);
            n = n / divisor;
        } else {
            divisor++;
        }
    }

    // 各素因数の出現回数をカウント
    const factorCounts = {};
    factors.forEach(factor => {
        factorCounts[factor] = (factorCounts[factor] || 0) + 1;
    });

    // 結果文字列を生成
    let resultString = `${number} = `;
    const primeFactors = Object.keys(factorCounts).sort((a, b) => a - b);

    if (primeFactors.length === 0) {
        resultString += number; // 素数自身の場合
    } else {
        resultString += primeFactors.map(factor => {
            const count = factorCounts[factor];
            return count > 1 ? `${factor}^${count}` : factor;
        }).join(' × ');
    }

    resultElement.textContent = resultString;
}