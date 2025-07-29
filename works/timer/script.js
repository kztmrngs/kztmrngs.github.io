document.addEventListener('DOMContentLoaded', () => {
    const minInput = document.getElementById('minutes-input');
    const secInput = document.getElementById('seconds-input');
    const startBtn = document.getElementById('start-btn');
    const stopBtn = document.getElementById('stop-btn');
    const resetBtn = document.getElementById('reset-btn');
    const display = document.getElementById('timer-display');

    let timer = null;
    let remaining = 60; // 秒
    let initial = 60;

    function updateDisplay(sec) {
        const m = String(Math.floor(sec / 60)).padStart(2, '0');
        const s = String(sec % 60).padStart(2, '0');
        display.textContent = `${m}:${s}`;
    }

    function setInitialFromInput() {
        const m = parseInt(minInput.value, 10) || 0;
        const s = parseInt(secInput.value, 10) || 0;
        initial = m * 60 + s;
        remaining = initial;
        updateDisplay(remaining);
    }

    minInput.addEventListener('change', setInitialFromInput);
    secInput.addEventListener('change', setInitialFromInput);

    // 1000Hz矩形波アラーム音を鳴らす関数
    function playAlarm() {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.value = 1000;
        gain.gain.value = 0.2;
        osc.connect(gain).connect(ctx.destination);
        osc.start();
        setTimeout(() => {
            osc.stop();
            ctx.close();
        }, 700); // 0.7秒鳴らす
    }

    startBtn.addEventListener('click', () => {
        if (timer || remaining <= 0) return;
        timer = setInterval(() => {
            remaining--;
            updateDisplay(remaining);
            if (remaining <= 0) {
                clearInterval(timer);
                timer = null;
                startBtn.disabled = false;
                stopBtn.disabled = true;
                playAlarm(); // アラーム音を鳴らす
            }
        }, 1000);
        startBtn.disabled = true;
        stopBtn.disabled = false;
        minInput.disabled = true;
        secInput.disabled = true;
    });

    stopBtn.addEventListener('click', () => {
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
        startBtn.disabled = false;
        stopBtn.disabled = true;
        minInput.disabled = false;
        secInput.disabled = false;
    });

    resetBtn.addEventListener('click', () => {
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
        setInitialFromInput();
        startBtn.disabled = false;
        stopBtn.disabled = true;
        minInput.disabled = false;
        secInput.disabled = false;
    });

    // 初期表示
    setInitialFromInput();
    stopBtn.disabled = true;
});