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
    const textarea = e.target;
    const value = textarea.value;
    const selectionStart = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;
    const key = e.key;

    const pairs = {
        '"': '"', "'": "'", '(': ')', '[': ']', '{': '}', '`': '`'
    };
    const closing = {
        ')': '(', ']': '[', '}': '{', '"': '"', "'": "'", '`': '`'
    };

    // 手動で閉じ括弧を入力した場合、直後が同じ括弧ならカーソルを1つ進める
    if (closing[key] && value[selectionStart] === key) {
        textarea.selectionStart = textarea.selectionEnd = selectionStart + 1;
        e.preventDefault();
        return;
    }

    // 開き括弧入力時の自動補完
    if (pairs[key]) {
        e.preventDefault();
        textarea.setRangeText(key + pairs[key], selectionStart, selectionEnd, 'end');
        textarea.selectionStart = textarea.selectionEnd = selectionStart + 1;
    }
}

// 自動補完で挿入された閉じ括弧の直後でBackspaceを押した場合、両方削除
function handleBackspace(e) {
    const textarea = e.target;
    const value = textarea.value;
    const pos = textarea.selectionStart;

    // 選択範囲がない場合のみ
    if (textarea.selectionStart !== textarea.selectionEnd) return;

    if (pos > 0 && pos < value.length) {
        const prev = value[pos - 1];
        const next = value[pos];
        const pairs = {
            '(': ')', '[': ']', '{': '}', '"': '"', "'": "'", '`': '`'
        };
        if (pairs[prev] === next) {
            e.preventDefault();
            textarea.setRangeText('', pos - 1, pos + 1, 'end');
        }
    }
}

// --------------------------------
// インデント保持
// --------------------------------
function handleIndent(e) {
	if (e.key !== 'Enter') return;
	const textarea = e.target;
	const value = textarea.value;
	const selectionStart = textarea.selectionStart;
	// 直前の行を取得
	const before = value.slice(0, selectionStart);
	const lastLineBreak = before.lastIndexOf('\n');
	const prevLine = before.slice(lastLineBreak + 1);
	// 行頭の空白・タブを取得
	const indent = prevLine.match(/^[ \t]*/)[0];

	// 追加処理: 直前が '{' で直後が '}' の場合、ブロックを挿入してカーソルを中に置く
	const after = value.slice(selectionStart);
	const prevChar = before[before.length - 1];
	const nextChar = after[0];
	if (prevChar === '{' && nextChar === '}') {
		e.preventDefault();
		const innerIndent = indent + '    '; // スペース4つ
		const insert = '\n' + innerIndent + '\n' + indent;
		textarea.setRangeText(insert, selectionStart, selectionStart, 'end');
		textarea.selectionStart = textarea.selectionEnd = selectionStart + 1 + innerIndent.length;
		return;
	}

	// デフォルトの改行をキャンセルし、インデント付きで挿入
	e.preventDefault();
	const insert = '\n' + indent;
	textarea.setRangeText(insert, selectionStart, selectionStart, 'end');
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
    // updateLineNumbersはinputイベントで発火するため、ここでは不要
}

window.addEventListener('DOMContentLoaded', function () {
    const textarea = document.getElementById('text-editor');
    textarea.addEventListener('input', updateLineNumbers);
    textarea.addEventListener('scroll', function () {
        document.getElementById('line-numbers').scrollTop = textarea.scrollTop;
    });
    updateLineNumbers();

    textarea.addEventListener('keydown', function (e) {
        const key = e.key;
        const allBrackets = ['(', '[', '{', '"', "'", '`', ')', ']', '}'];

        if (allBrackets.includes(key)) {
            handleAutocomplete(e);
        } else if (key === 'Backspace') {
            handleBackspace(e);
        } else if (key === 'Enter') {
            handleIndent(e);
            // handleIndentがDOMを変更した直後にupdateLineNumbersを呼び出す
            // setTimeoutで、DOM更新後の再描画サイクルで実行させる
            setTimeout(updateLineNumbers, 0);
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