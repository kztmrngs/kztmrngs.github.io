//  --- DOMContentLoadedイベントでヘッダーとフッターの読み込みとテーマ初期化を実行 ---
document.addEventListener('DOMContentLoaded', () => {
    // ヘッダーとフッターの読み込み
    loadHeaderFooter().then(() => {
        // テーマ切り替えの初期化
        initTheme();
    }).catch(error => {
        console.error('Error loading components:', error);
    });
});

// ヘッダーとフッターを非同期で読み込む関数
function loadHeaderFooter() {
    const loadComponent = (url, targetId) => {
        return fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .then(data => {
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    targetElement.innerHTML = data;
                }
            });
    };
    return Promise.all([
        loadComponent('/header.html', 'header-placeholder'),
        loadComponent('/footer.html', 'footer-placeholder')
    ]);
}

// --- テーマ（ダークモード/ライトモード）切り替え初期化関数 ---
function initTheme() {
    const toggle = document.getElementById('theme-toggle');
    const icon = document.querySelector('.toggle-switch .toggle-icon');
    if (toggle) {
        const setTheme = (theme) => {
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
            toggle.checked = (theme === 'dark');
            if (icon) icon.textContent = theme === 'dark' ? 'dark' : 'light';
        };

        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            setTheme(savedTheme);
        } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setTheme('dark');
        } else {
            setTheme('light');
        }

        toggle.addEventListener('change', () => {
            setTheme(toggle.checked ? 'dark' : 'light');
        });
    }
}

// --- コードブロックのインデント調整処理 ---
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('pre.code-block').forEach(element => {
        const text = element.textContent;
        let lines = text.split('\n');

        // 先頭の空行（または空白のみの行）を削除
        while (lines.length > 0 && lines[0].trim().length === 0) {
            lines.shift();
        }

        // 末尾の空行（または空白のみの行）を削除
        while (lines.length > 0 && lines[lines.length - 1].trim().length === 0) {
            lines.pop();
        }

        // すべての行が空になった場合は、コンテンツを空にして終了
        if (lines.length === 0) {
            element.textContent = '';
            return;
        }

        // 最初のコード行のインデントを共通のインデントとして特定
        // これにより、HTML構造に起因する全体のインデントを削除できる
        let commonIndent = 0;
        const firstLine = lines[0];
        const leadingWhitespaceMatch = firstLine.match(/^\s*/);
        if (leadingWhitespaceMatch) {
            commonIndent = leadingWhitespaceMatch[0].length;
        }

        // 各行から共通のインデントを削除
        const dedentedLines = lines.map(line => {
            if (line.length >= commonIndent) {
                return line.substring(commonIndent);
            }
            return line; // 共通のインデントよりも短い行はそのままにする
        });

        element.textContent = dedentedLines.join('\n');
    });
});

// インライン暗号化コードのエンコーダーとデコーダー
const LZW = {
    compress: function (uncompressed) {
        let dictionary = {};
        for (let i = 0; i < 256; i++) {
            dictionary[String.fromCharCode(i)] = i;
        }

        let word = "";
        let result = [];
        let dictSize = 256;

        for (let i = 0, len = uncompressed.length; i < len; i++) {
            let currentChar = uncompressed[i];
            let wordAndChar = word + currentChar;

            if (dictionary.hasOwnProperty(wordAndChar)) {
                word = wordAndChar;
            } else {
                result.push(dictionary[word]);
                dictionary[wordAndChar] = dictSize++;
                word = currentChar;
            }
        }

        if (word !== "") {
            result.push(dictionary[word]);
        }
        return result;
    },

    decompress: function (compressed) {
        let dictionary = {};
        for (let i = 0; i < 256; i++) {
            dictionary[i] = String.fromCharCode(i);
        }

        let word = String.fromCharCode(compressed[0]);
        let result = word;
        let entry = "";
        let dictSize = 256;

        for (let i = 1, len = compressed.length; i < len; i++) {
            let k = compressed[i];
            if (dictionary[k]) {
                entry = dictionary[k];
            } else {
                if (k === dictSize) {
                    entry = word + word[0];
                } else {
                    return null; // Error
                }
            }

            result += entry;
            dictionary[dictSize++] = word + entry[0];
            word = entry;
        }
        return result;
    }
};

// --- エンコーダー関数 ---
function lzwEncode(inputString) {
    // 1. 文字列を2進数文字列に変換
    let binaryString = '';
    for (let i = 0; i < inputString.length; i++) {
        let bin = inputString[i].charCodeAt(0).toString(2);
        binaryString += '0'.repeat(8 - bin.length) + bin; // 8ビットにパディング
    }

    // 2. LZWで圧縮
    const compressed = LZW.compress(binaryString);

    // 3. 圧縮データを16ビットの2進数文字列に変換
    let compressedBinary = '';
    for (const code of compressed) {
        let bin = code.toString(2);
        compressedBinary += '0'.repeat(16 - bin.length) + bin; // 16ビットにパディング
    }

    // 4. 0をスペース、1をタブに変換
    return compressedBinary.replace(/0/g, ' ').replace(/1/g, '\t');
}

// --- デコーダー関数 ---
function lzwDecode(encodedString) {
    // 1. スペースとタブを0と1に戻す
    const compressedBinary = encodedString.replace(/ /g, '0').replace(/\t/g, '1');

    // 2. 16ビットごとに区切り、数値の配列に変換
    let compressed = [];
    for (let i = 0; i < compressedBinary.length; i += 16) {
        const chunk = compressedBinary.substring(i, i + 16);
        if(chunk.length === 16) {
            compressed.push(parseInt(chunk, 2));
        }
    }

    // 3. LZWで解凍
    const decompressedBinary = LZW.decompress(compressed);
    if (decompressedBinary === null) return "デコードに失敗しました。";


    // 4. 2進数文字列を元の文字列に変換
    let outputString = '';
    for (let i = 0; i < decompressedBinary.length; i += 8) {
        const byte = decompressedBinary.substring(i, i + 8);
        if (byte.length === 8) {
            outputString += String.fromCharCode(parseInt(byte, 2));
        }
    }

    return outputString;
}



// --- 隠しコード ---
// クワイン関数
function quine(insert = "Hello!") {
  const code = `function quine(insert = ${JSON.stringify(insert)}) {
  const code = \${JSON.stringify(code)};
  console.log(code.replace(/\$\{JSON\.stringify\(code\)\}/, JSON.stringify(code)));
}
quine(${JSON.stringify(insert)});`;
  console.log(code.replace(/\$\{JSON\.stringify\(code\)\}/, JSON.stringify(code)));
}
// quine("任意文字列をここに入れられるよ！");
// じゃんけん関数
function janken(userChoice) {
  const choices = ['グー', 'チョキ', 'パー'];
  const computerChoice = choices[Math.floor(Math.random() * choices.length)];
  let result = '';
  if (userChoice === computerChoice) {
    result = '引き分け！';
  } else if (
    (userChoice === 'グー' && computerChoice === 'チョキ') ||
    (userChoice === 'チョキ' && computerChoice === 'パー') ||
    (userChoice === 'パー' && computerChoice === 'グー')
  ) {
    result = 'あなたの勝ち！';
  } else {
    result = 'コンピュータの勝ち！';
  }
  console.log(`あなたの選択: ${userChoice}, コンピュータの選択: ${computerChoice} → ${result}`);
}
// janken('グー'); // 'グー', 'チョキ', 'パー'のいずれかを引数にして実行
// --- ここまで隠しコード ---
