// ----------------------
// script.js（角度描画バグ修正＆見やすさ向上版）
// ----------------------

// 複素数クラス
class Complex {
    constructor(real, imag) {
        this.real = real;
        this.imag = imag;
    }

    // 加算
    add(other) {
        return new Complex(this.real + other.real, this.imag + other.imag);
    }

    // 減算
    subtract(other) {
        return new Complex(this.real - other.real, this.imag - other.imag);
    }

    // 乗算
    multiply(other) {
        const realPart = this.real * other.real - this.imag * other.imag;
        const imagPart = this.real * other.imag + this.imag * other.real;
        return new Complex(realPart, imagPart);
    }

    // 除算
    divide(other) {
        const denom = other.real * other.real + other.imag * other.imag;
        if (denom === 0) {
            return new Complex(NaN, NaN);
        }
        const realPart = (this.real * other.real + this.imag * other.imag) / denom;
        const imagPart = (this.imag * other.real - this.real * other.imag) / denom;
        return new Complex(realPart, imagPart);
    }

    // 大きさ（絶対値）
    magnitude() {
        return Math.sqrt(this.real * this.real + this.imag * this.imag);
    }

    // 角度（度数法）
    angle() {
        return Math.atan2(this.imag, this.real) * (180 / Math.PI);
    }

    // 文字列表現
    toString() {
        const r = this.real;
        const i = this.imag;
        if (Math.abs(i) < 1e-8) {
            return `${r.toFixed(2)}`;
        }
        if (Math.abs(r) < 1e-8) {
            return `${i.toFixed(2)}i`;
        }
        const imagPart = i >= 0 ? `+ ${i.toFixed(2)}i` : `- ${Math.abs(i).toFixed(2)}i`;
        return `${r.toFixed(2)} ${imagPart}`;
    }
}

// グローバル変数
let canvas, ctx;
let currentOperation = 'add'; // "add", "subtract", "multiply", "divide"
const SCALE = 30; // 1目盛＝30px

// DOMContentLoaded 後に初期化
document.addEventListener('DOMContentLoaded', function () {
    canvas = document.getElementById('complex-plane');
    ctx = canvas.getContext('2d');

    // テーマ切り替え
    const themeToggle = document.getElementById('theme-toggle');
    themeToggle.addEventListener('click', toggleTheme);

    // 演算ボタン
    const opButtons = document.querySelectorAll('.operation-btn');
    opButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            opButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentOperation = this.getAttribute('data-op');
            updateCalculation();
        });
    });

    // 入力欄の変更で再計算
    ['a1', 'b1', 'a2', 'b2'].forEach(id => {
        document.getElementById(id).addEventListener('input', updateCalculation);
    });

    // 初期描画
    updateCalculation();
});

// テーマ切り替え
function toggleTheme() {
    const body = document.body;
    const themeToggle = document.getElementById('theme-toggle');
    if (body.dataset.theme === 'dark') {
        body.removeAttribute('data-theme');
        themeToggle.textContent = '🌙';
    } else {
        body.dataset.theme = 'dark';
        themeToggle.textContent = '☀️';
    }
    setTimeout(updateCalculation, 100);
}

// 計算・結果表示・描画呼び出し
function updateCalculation() {
    const a1 = parseFloat(document.getElementById('a1').value) || 0;
    const b1 = parseFloat(document.getElementById('b1').value) || 0;
    const a2 = parseFloat(document.getElementById('a2').value) || 0;
    const b2 = parseFloat(document.getElementById('b2').value) || 0;

    const complex1 = new Complex(a1, b1);
    const complex2 = new Complex(a2, b2);

    let result, opSymbol = '';
    switch (currentOperation) {
        case 'add':
            result = complex1.add(complex2);
            opSymbol = '+';
            break;
        case 'subtract':
            result = complex1.subtract(complex2);
            opSymbol = '-';
            break;
        case 'multiply':
            result = complex1.multiply(complex2);
            opSymbol = '×';
            break;
        case 'divide':
            result = complex1.divide(complex2);
            opSymbol = '÷';
            break;
        default:
            result = new Complex(0, 0);
    }

    // 結果表示
    const resultDisplay = document.getElementById('result-display');
    const text1 = complex1.toString();
    const text2 = complex2.toString();
    const textRes = result.toString();
    resultDisplay.textContent = `(${text1}) ${opSymbol} (${text2}) = ${textRes}`;

    // 極形式表示
    const polarDisplay = document.getElementById('polar-display');
    const r = result.magnitude();
    const theta = result.angle();
    if (isNaN(r) || isNaN(theta)) {
        polarDisplay.textContent = `極形式: undefined`;
    } else {
        polarDisplay.textContent = `極形式: ${r.toFixed(2)} ∠ ${theta.toFixed(2)}°`;
    }

    // キャンバス描画
    drawVisualization(complex1, complex2, result);
}

// 背景・グリッド・軸を描画する共通関数
function drawBackground(cx, cy, isDark) {
    const w = canvas.width;
    const h = canvas.height;
    // 背景色
    ctx.fillStyle = isDark ? '#2d2d2d' : '#ffffff';
    ctx.fillRect(0, 0, w, h);

    // グリッド
    const gridColor = isDark ? '#444444' : '#e0e0e0';
    const textColor = isDark ? '#ffffff' : '#333333';
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    ctx.font = '12px Arial';
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 縦線
    for (let x = cx; x <= w; x += SCALE) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
        const realNum = ((x - cx) / SCALE).toFixed(0);
        if (x !== cx && Math.abs((x - cx) % SCALE) < 0.1) {
            ctx.fillText(realNum, x, cy + 12);
        }
    }
    for (let x = cx; x >= 0; x -= SCALE) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
        const realNum = ((x - cx) / SCALE).toFixed(0);
        if (x !== cx && Math.abs((x - cx) % SCALE) < 0.1) {
            ctx.fillText(realNum, x, cy + 12);
        }
    }
    // 横線
    for (let y = cy; y <= h; y += SCALE) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
        const imagNum = ((cy - y) / SCALE).toFixed(0);
        if (y !== cy && Math.abs((y - cy) % SCALE) < 0.1) {
            ctx.fillText(imagNum, cx - 12, y);
        }
    }
    for (let y = cy; y >= 0; y -= SCALE) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
        const imagNum = ((cy - y) / SCALE).toFixed(0);
        if (y !== cy && Math.abs((y - cy) % SCALE) < 0.1) {
            ctx.fillText(imagNum, cx - 12, y);
        }
    }

    // 軸（太線）
    ctx.strokeStyle = isDark ? '#cccccc' : '#666666';
    ctx.lineWidth = 2;
    // X軸
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(w, cy);
    ctx.stroke();
    // Y軸
    ctx.beginPath();
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, h);
    ctx.stroke();
}

// ベクトルを矢印で描画する共通関数
function drawArrow(complex, cx, cy, color, label, textColor) {
    const x = cx + complex.real * SCALE;
    const y = cy - complex.imag * SCALE;
    // 直線（ベクトル本体）
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(x, y);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    ctx.stroke();

    // 矢羽根
    const headLen = 10;
    const angle = Math.atan2(cy - y, x - cx);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(
        x - headLen * Math.cos(angle - Math.PI / 6),
        y + headLen * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
        x - headLen * Math.cos(angle + Math.PI / 6),
        y + headLen * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();

    // ラベル（文字色を線色と同じに）
    ctx.fillStyle = color;
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillText(label, x + 5, y - 5);
}

// 角度を示す扇形の弧を描画するヘルパー関数
// mathStart: 数学的角度（ラジアン、x軸正方向＝0, 上向きが正）
// mathEnd: 数学的角度（ラジアン）
// dashPattern:  null または [dashLen, gapLen]
function drawAngleArc(cx, cy, radius, mathStart, mathEnd, color, lineWidth, dashPattern = null) {
    // ステップ数
    const steps = sixtySteps; // 60ステップほどあれば見た目滑らか
    // 小刻みに角度を補間
    const delta = (mathEnd - mathStart) / steps;

    if (dashPattern) {
        ctx.setLineDash(dashPattern);
    } else {
        ctx.setLineDash([]);
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
        const t = mathStart + delta * i;
        const x = cx + radius * Math.cos(t);
        const y = cy - radius * Math.sin(t);
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.stroke();
    ctx.setLineDash([]); // リセット
}

// 加減算の視覚化（変更なし）
function drawAddVisualization(c1, c2, res, cx, cy, isDark) {
    drawBackground(cx, cy, isDark);

    const color1 = '#3498db';
    const color2 = '#e74c3c';
    const colorRes = '#2ecc71';
    const textColor = isDark ? '#ffffff' : '#333333';

    // z₁, z₂ を原点から描く
    drawArrow(c1, cx, cy, color1, `z₁ = ${c1.toString()}`, textColor);
    drawArrow(c2, cx, cy, color2, `z₂ = ${c2.toString()}`, textColor);

    if (currentOperation === 'add') {
        // 並行四辺形を示す破線
        const x1 = cx + c1.real * SCALE;
        const y1 = cy - c1.imag * SCALE;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x1 + c2.real * SCALE, y1 - c2.imag * SCALE);
        ctx.strokeStyle = isDark ? '#aaaaaa' : '#888888';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.stroke();

        const x2 = cx + c2.real * SCALE;
        const y2 = cy - c2.imag * SCALE;
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 + c1.real * SCALE, y2 - c1.imag * SCALE);
        ctx.stroke();

        drawArrow(res, cx, cy, colorRes, `z₁+z₂ = ${res.toString()}`, textColor);

    } else if (currentOperation === 'subtract') {
        // z₂ の反転ベクトル
        const minusZ2 = new Complex(-c2.real, -c2.imag);
        const x1 = cx + c1.real * SCALE;
        const y1 = cy - c1.imag * SCALE;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x1 + minusZ2.real * SCALE, y1 - minusZ2.imag * SCALE);
        ctx.strokeStyle = isDark ? '#aaaaaa' : '#888888';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.stroke();

        drawArrow(res, cx, cy, colorRes, `z₁−z₂ = ${res.toString()}`, textColor);
    }
}

// 乗除算の視覚化（角度バグ修正＆文字色・見やすさ向上）
function drawMulDivVisualization(c1, c2, res, cx, cy, isDark) {
    drawBackground(cx, cy, isDark);

    const circleColor = isDark ? '#666666' : '#bbbbbb';
    const arcColor1 = '#3498db'; // z₁ の角度
    const arcColor2 = '#e74c3c'; // z₂ の角度
    const vecColor1 = 'rgba(52, 152, 219, 0.6)'; // z₁
    const vecColor2 = 'rgba(231, 76, 60, 0.6)'; // z₂
    const vecColorRes = '#2ecc71'; // 結果
    const textAlpha = 'ff'; // 不透明

    // 1) z₁, z₂ を透過色で下敷きに描画
    drawArrow(c1, cx, cy, vecColor1, `|z₁| = ${c1.magnitude().toFixed(2)}, ∠${c1.angle().toFixed(2)}°`, arcColor1);
    drawArrow(c2, cx, cy, vecColor2, `|z₂| = ${c2.magnitude().toFixed(2)}, ∠${c2.angle().toFixed(2)}°`, arcColor2);

    // 2) |z₁| の円
    ctx.beginPath();
    ctx.arc(cx, cy, c1.magnitude() * SCALE, 0, 2 * Math.PI);
    ctx.strokeStyle = circleColor;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.stroke();

    // 3) |z₂| の円
    ctx.beginPath();
    ctx.arc(cx, cy, c2.magnitude() * SCALE, 0, 2 * Math.PI);
    ctx.stroke();

    // 4) z₁ の角度を示す弧（自作）
    const theta1Rad = (c1.angle() * Math.PI) / 180; // 数学的なラジアン
    const arcRadius1 = Math.min(80, c1.magnitude() * SCALE);
    drawAngleArc(cx, cy, arcRadius1, 0, theta1Rad, arcColor1, 2, [4, 4]);

    // θ₁ ラベル（線色と同じに）
    ctx.fillStyle = arcColor1;
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    // ラベル位置を向きベクトルの外側に
    let lx1 = cx + arcRadius1 * Math.cos(theta1Rad) * 1.1;
    let ly1 = cy - arcRadius1 * Math.sin(theta1Rad) * 1.1;
    ctx.fillText(`θ₁ = ${c1.angle().toFixed(2)}°`, lx1, ly1);

    // 5) z₂ の角度を示す弧
    const theta2Rad = (c2.angle() * Math.PI) / 180;
    const arcRadius2 = Math.min(60, c2.magnitude() * SCALE);
    drawAngleArc(cx, cy, arcRadius2, 0, theta2Rad, arcColor2, 2, [4, 4]);

    ctx.fillStyle = arcColor2;
    ctx.font = '14px Arial';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    let lx2 = cx + arcRadius2 * Math.cos(theta2Rad) * 1.1;
    let ly2 = cy - arcRadius2 * Math.sin(theta2Rad) * 1.1;
    ctx.fillText(`θ₂ = ${c2.angle().toFixed(2)}°`, lx2, ly2);

    // 6) 結果ベクトルを描画（色は緑のまま）
    drawArrow(res, cx, cy, vecColorRes, `結果: |z| = ${res.magnitude().toFixed(2)}, ∠${res.angle().toFixed(2)}°`, vecColorRes);

    // 7) 結果の円（乗算：|z₁|×|z₂|、除算：|z₁|/|z₂|）
    const resRadius = res.magnitude() * SCALE;
    ctx.beginPath();
    ctx.arc(cx, cy, resRadius, 0, 2 * Math.PI);
    ctx.strokeStyle = vecColorRes;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([]);
    ctx.stroke();

    // 8) 結果の角度を示す弧
    const thetaResRad = (res.angle() * Math.PI) / 180;
    const arcRadiusRes = Math.min(40, resRadius);
    drawAngleArc(cx, cy, arcRadiusRes, 0, thetaResRad, vecColorRes, 2, [4, 4]);

    ctx.fillStyle = vecColorRes;
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    let lxr = cx + arcRadiusRes * Math.cos(thetaResRad) * 1.1;
    let lyr = cy - arcRadiusRes * Math.sin(thetaResRad) * 1.1;
    ctx.fillText(`θᵣ = ${res.angle().toFixed(2)}°`, lxr, lyr);
}

// メインの描画関数（加減算／乗除算を分岐）
function drawVisualization(c1, c2, res) {
    if (!ctx) return;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const isDark = document.body.dataset.theme === 'dark';

    if (currentOperation === 'add' || currentOperation === 'subtract') {
        drawAddVisualization(c1, c2, res, cx, cy, isDark);
    } else if (currentOperation === 'multiply' || currentOperation === 'divide') {
        drawMulDivVisualization(c1, c2, res, cx, cy, isDark);
    } else {
        drawBackground(cx, cy, isDark);
    }
}

// ウィンドウリサイズで再描画
window.addEventListener('resize', function () {
    setTimeout(updateCalculation, 100);
});