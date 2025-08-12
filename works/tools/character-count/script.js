window.onload = function () {
    var textarea = document.getElementById('text');
    var charCount = document.getElementById('char-count');
    var charCountNoSpace = document.getElementById('char-count-no-space');
    var lineCount = document.getElementById('line-count');
    var wordCount = document.getElementById('word-count');
    var utf8ByteCount = document.getElementById('utf-8-byte-count');
    var utf16ByteCount = document.getElementById('utf-16-byte-count');
    var shiftJisByteCount = document.getElementById('shift-jis-byte-count');

    function getUtf8Bytes(str) {
        // TextEncoder未使用のUTF-8バイト数計算
        var bytes = 0,
            i, c;
        for (i = 0; i < str.length; i++) {
            c = str.charCodeAt(i);
            if (c < 0x80) {
                bytes += 1;
            } else if (c < 0x800) {
                bytes += 2;
            } else if (c >= 0xD800 && c <= 0xDBFF) {
                // サロゲートペア
                bytes += 4;
                i++;
            } else {
                bytes += 3;
            }
        }
        return bytes;
    }

    function getUtf16Bytes(str) {
        return str.length * 2;
    }

    function getShiftJisBytes(str) {
        // 簡易Shift_JISバイト数計算
        var bytes = 0,
            i, code;
        for (i = 0; i < str.length; i++) {
            code = str.charCodeAt(i);
            if (
                (code >= 0x0 && code < 0x80) ||
                (code >= 0xFF61 && code <= 0xFF9F)
            ) {
                bytes += 1;
            } else {
                bytes += 2;
            }
        }
        return bytes;
    }

    function countWords(str) {
        // 英単語や日本語の単語をざっくりカウント
        var matches = str.match(/[\w]+|[ぁ-んァ-ン一-龥々ー]+/g);
        return matches ? matches.length : 0;
    }

    function updateCounts() {
        var text = textarea.value;
        charCount.innerHTML = text.length;
        charCountNoSpace.innerHTML = text.replace(/\s/g, '').length;
        lineCount.innerHTML = text === '' ? 0 : text.split(/\r\n|\r|\n/).length;
        wordCount.innerHTML = countWords(text);
        utf8ByteCount.innerHTML = getUtf8Bytes(text);
        utf16ByteCount.innerHTML = getUtf16Bytes(text);
        shiftJisByteCount.innerHTML = getShiftJisBytes(text);
    }

    textarea.oninput = updateCounts;
    updateCounts();
};