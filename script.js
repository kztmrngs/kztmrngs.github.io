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
