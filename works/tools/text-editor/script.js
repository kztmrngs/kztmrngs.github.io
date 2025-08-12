// --------------------------------
// ファイル保存
// --------------------------------
function saveFile() {
    const text = document.getElementById('text-editor').value;
    const filename = document.getElementById('filename').value || 'document.txt';
    const blob = new Blob([text], {
        type: 'text/plain'
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
// --------------------------------
// ファイル読み込み
// --------------------------------
function loadFile() {
    const fileInput = document.getElementById('load-file');
    let text = document.getElementById('text-editor');
    if (fileInput.files.length === 0) {
        alert('ファイルを選択してください。');
        return;
    }
    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = function (e) {
        text.value = e.target.result;
    };
    reader.readAsText(file);
}
// --------------------------------
// 括弧/引用符の自動補完
// --------------------------------
function handleAutocomplete(e) {
    const textarea = document.getElementById('text-editor');
    const value = textarea.value;
    const selectionStart = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;
    const pairs = {
        '"': '"',
        "'": "'",
        '(': ')',
        '[': ']',
        '{': '}'
    };
    // 手動で閉じ括弧を入力した場合、直後が同じ括弧ならスキップ
    const closing = {
        ')': '(',
        ']': '[',
        '}': '{',
        '"': '"',
        "'": "'"
    };
    if (e && closing[e.key]) {
        if (value[selectionStart] === e.key) {
            textarea.selectionStart = textarea.selectionEnd = selectionStart + 1;
            e.preventDefault();
            return;
        }
    }
    // 開き括弧入力時の自動補完
    if (e && pairs[e.key]) {
        const before = value.slice(0, selectionStart);
        const after = value.slice(selectionEnd);
        textarea.value = before + e.key + pairs[e.key] + after;
        textarea.selectionStart = textarea.selectionEnd = selectionStart + 1;
        e.preventDefault();
    }
}

// 自動補完で挿入された閉じ括弧の直後でBackspaceを押した場合、両方削除
function handleBackspace(e) {
    const textarea = document.getElementById('text-editor');
    const value = textarea.value;
    const pos = textarea.selectionStart;
    if (pos > 0 && pos < value.length) {
        const prev = value[pos - 1];
        const next = value[pos];
        const pairs = {
            '(': ')',
            '[': ']',
            '{': '}',
            '"': '"',
            "'": "'"
        };
        if (pairs[prev] && pairs[prev] === next) {
            textarea.value = value.slice(0, pos - 1) + value.slice(pos + 1);
            textarea.selectionStart = textarea.selectionEnd = pos - 1;
            e.preventDefault();
        }
    }
}

// --------------------------------
// インデント保持
// --------------------------------
function handleIndent(e) {
    if (e.key !== 'Enter') return;
    const textarea = document.getElementById('text-editor');
    const value = textarea.value;
    const selectionStart = textarea.selectionStart;
    // 直前の行を取得
    const before = value.slice(0, selectionStart);
    const lastLineBreak = before.lastIndexOf('\n');
    const prevLine = before.slice(lastLineBreak + 1);
    // 行頭の空白・タブを取得
    const indent = prevLine.match(/^[ \t]*/)[0];
    // デフォルトの改行をキャンセルし、インデント付きで挿入
    e.preventDefault();
    const after = value.slice(selectionStart);
    const insert = '\n' + indent;
    textarea.value = before + insert + after;
    textarea.selectionStart = textarea.selectionEnd = selectionStart + insert.length;
}

// 行番号の更新
function updateLineNumbers() {
    const textarea = document.getElementById('text-editor');
    const lineNumbers = document.getElementById('line-numbers');
    const lines = textarea.value.split('\n').length || 1;
    let html = '';
    for (let i = 1; i <= lines; i++) {
        html += i + '<br>';
    }
    lineNumbers.innerHTML = html;
    // 行番号の高さをテキストエリアに合わせる
    lineNumbers.scrollTop = textarea.scrollTop;
}

// 検索機能
function searchText() {
    const textarea = document.getElementById('text-editor');
    const search = document.getElementById('search-text').value;
    if (!search) return;
    const value = textarea.value;
    const start = textarea.selectionEnd;
    const index = value.indexOf(search, start);
    if (index !== -1) {
        textarea.focus();
        textarea.selectionStart = index;
        textarea.selectionEnd = index + search.length;
    } else {
        // 先頭から再検索
        const index2 = value.indexOf(search, 0);
        if (index2 !== -1) {
            textarea.focus();
            textarea.selectionStart = index2;
            textarea.selectionEnd = index2 + search.length;
        } else {
            alert('見つかりませんでした。');
        }
    }
}

// 置換機能（選択範囲のみ）
function replaceText() {
    const textarea = document.getElementById('text-editor');
    const search = document.getElementById('search-text').value;
    const replace = document.getElementById('replace-text').value;
    const value = textarea.value;
    const selStart = textarea.selectionStart;
    const selEnd = textarea.selectionEnd;
    if (selStart !== selEnd && value.substring(selStart, selEnd) === search) {
        textarea.value = value.substring(0, selStart) + replace + value.substring(selEnd);
        textarea.selectionStart = textarea.selectionEnd = selStart + replace.length;
    } else {
        searchText();
    }
}

// すべて置換
function replaceAllText() {
    const textarea = document.getElementById('text-editor');
    const search = document.getElementById('search-text').value;
    const replace = document.getElementById('replace-text').value;
    if (!search) return;
    const value = textarea.value;
    const newValue = value.split(search).join(replace);
    textarea.value = newValue;
    updateLineNumbers();
}

window.addEventListener('DOMContentLoaded', function () {
    const textarea = document.getElementById('text-editor');
    textarea.addEventListener('input', updateLineNumbers);
    textarea.addEventListener('scroll', function () {
        document.getElementById('line-numbers').scrollTop = textarea.scrollTop;
    });
    updateLineNumbers();
    textarea.addEventListener('keydown', function (e) {
        // 括弧/引用符の自動補完とスキップ
        const allBrackets = ['(', '[', '{', '"', "'", ')', ']', '}'];
        if (allBrackets.includes(e.key)) {
            handleAutocomplete(e);
        }
        // Backspaceで自動補完括弧を同時削除
        if (e.key === 'Backspace') {
            handleBackspace(e);
        }
        // インデント保持
        if (e.key === 'Enter') {
            handleIndent(e);
            updateLineNumbers();
        }
    });
    // ファイル名表示
    const fileInput = document.getElementById('load-file');
    const fileNameDisplay = document.getElementById('file-name-display');
    fileInput.addEventListener('change', function () {
        if (fileInput.files.length > 0) {
            fileNameDisplay.textContent = fileInput.files[0].name;
        } else {
            fileNameDisplay.textContent = 'ファイルが選択されていません。';
        }
    });
});