window.onload = function () {
    var text1 = document.getElementById('text1');
    var text2 = document.getElementById('text2');
    var compareBtn = document.getElementById('compare');
    var diffOutput = document.getElementById('diff-output');
    var diffModeRadios = document.getElementsByName('mode');

    // 文字単位のLCSアルゴリズムによるdiff
    function diffChars(a, b) {
        var aLen = a.length;
        var bLen = b.length;
        var matrix = [];

        for (var i = 0; i <= aLen; i++) {
            matrix[i] = new Array(bLen + 1).fill(0);
        }

        for (var i = 1; i <= aLen; i++) {
            for (var j = 1; j <= bLen; j++) {
                if (a[i - 1] === b[j - 1]) {
                    matrix[i][j] = matrix[i - 1][j - 1] + 1;
                } else {
                    matrix[i][j] = Math.max(matrix[i - 1][j], matrix[i][j - 1]);
                }
            }
        }

        var result = [];
        var i = aLen, j = bLen;
        while (i > 0 || j > 0) {
            if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
                result.unshift({ type: 'common', char: a[i - 1] });
                i--;
                j--;
            } else if (j > 0 && (i === 0 || matrix[i][j - 1] >= matrix[i - 1][j])) {
                result.unshift({ type: 'added', char: b[j - 1] });
                j--;
            } else if (i > 0 && (j === 0 || matrix[i][j - 1] < matrix[i - 1][j])) {
                result.unshift({ type: 'removed', char: a[i - 1] });
                i--;
            } else {
                break;
            }
        }
        return result;
    }

    // 行単位のLCSアルゴリズムによるdiff
    function diffLines(a, b) {
        var aLines = a.split(/\r\n|\r|\n/);
        var bLines = b.split(/\r\n|\r|\n/);
        // 末尾の空行を無視する
        if (aLines.length > 0 && aLines[aLines.length - 1] === '') aLines.pop();
        if (bLines.length > 0 && bLines[bLines.length - 1] === '') bLines.pop();

        var aLen = aLines.length;
        var bLen = bLines.length;
        var matrix = [];

        for (var i = 0; i <= aLen; i++) {
            matrix[i] = new Array(bLen + 1).fill(0);
        }

        for (var i = 1; i <= aLen; i++) {
            for (var j = 1; j <= bLen; j++) {
                if (aLines[i - 1] === bLines[j - 1]) {
                    matrix[i][j] = matrix[i - 1][j - 1] + 1;
                } else {
                    matrix[i][j] = Math.max(matrix[i - 1][j], matrix[i][j - 1]);
                }
            }
        }

        var result = [];
        var i = aLen, j = bLen;
        while (i > 0 || j > 0) {
            if (i > 0 && j > 0 && aLines[i - 1] === bLines[j - 1]) {
                result.unshift({ type: 'common', line: aLines[i - 1] });
                i--;
                j--;
            } else if (j > 0 && (i === 0 || matrix[i][j - 1] >= matrix[i - 1][j])) {
                result.unshift({ type: 'added', line: bLines[j - 1] });
                j--;
            } else if (i > 0 && (j === 0 || matrix[i][j - 1] < matrix[i - 1][j])) {
                result.unshift({ type: 'removed', line: aLines[i - 1] });
                i--;
            } else {
                break;
            }
        }
        return result;
    }

    function displayDiff() {
        var textA = text1.value;
        var textB = text2.value;
        var mode = 'line';
        for (var i = 0; i < diffModeRadios.length; i++) {
            if (diffModeRadios[i].checked) {
                mode = diffModeRadios[i].value;
                break;
            }
        }

        diffOutput.innerHTML = ''; // 前回の結果をクリア

        if (textA === textB) {
            diffOutput.innerText = 'テキストは同一です。';
            return;
        }

        if (mode === 'line') {
            var lineDiffResult = diffLines(textA, textB);
            lineDiffResult.forEach(function(part) {
                var span = document.createElement('span');
                span.textContent = part.line + '\n';
                if (part.type === 'added') {
                    span.className = 'added';
                    span.textContent = '+ ' + span.textContent;
                } else if (part.type === 'removed') {
                    span.className = 'removed';
                    span.textContent = '- ' + span.textContent;
                } else {
                    span.textContent = '  ' + span.textContent;
                }
                diffOutput.appendChild(span);
            });
        } else { // char mode
            var charDiffResult = diffChars(textA, textB);
            charDiffResult.forEach(function(part) {
                var span = document.createElement('span');
                span.textContent = part.char;
                if (part.type === 'added') {
                    span.className = 'added';
                } else if (part.type === 'removed') {
                    span.className = 'removed';
                }
                diffOutput.appendChild(span);
            });
        }
    }

    compareBtn.onclick = displayDiff;
};