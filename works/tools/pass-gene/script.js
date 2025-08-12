const form = document.getElementById('password-form');
const lengthInput = document.getElementById('length');
const uppercaseCheckbox = document.getElementById('include-uppercase');
const lowercaseCheckbox = document.getElementById('include-lowercase');
const numbersCheckbox = document.getElementById('include-numbers');
const specialCheckbox = document.getElementById('include-special');
const resultContainer = document.getElementById('result-container');
const passwordOutput = document.getElementById('password-output');
const copyButton = document.getElementById('copy-button');

const CHARSETS = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    special: `!"#$%&'()*+,-./:;<=>?@[\]^_
`};

form.addEventListener('submit', e => {
    e.preventDefault();

    const length = Number(lengthInput.value);
    const charset = buildCharset();

    if (!charset) {
        alert('少なくとも1つの文字種を選択してください。');
        return;
    }

    const password = generatePassword(length, charset);
    passwordOutput.textContent = password;
    resultContainer.style.display = 'block'; 
});

copyButton.addEventListener('click', () => {
    copyToClipboard(passwordOutput.textContent);
});

function buildCharset() {
    let charset = '';
    if (uppercaseCheckbox.checked) charset += CHARSETS.uppercase;
    if (lowercaseCheckbox.checked) charset += CHARSETS.lowercase;
    if (numbersCheckbox.checked) charset += CHARSETS.numbers;
    if (specialCheckbox.checked) charset += CHARSETS.special;
    return charset;
}

function generatePassword(length, charset) {
    const charsetLength = charset.length;
    const randomValues = new Uint32Array(length);
    window.crypto.getRandomValues(randomValues);

    let password = '';
    for (let i = 0; i < length; i++) {
        password += charset[randomValues[i] % charsetLength];
    }
    return password;
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
        .then(() => {
            alert('パスワードをクリップボードにコピーしました。');
        })
        .catch(err => {
            console.error('クリップボードへのコピーに失敗しました:', err);
            alert('コピーに失敗しました。');
        });
}