document.addEventListener('DOMContentLoaded', () => {
    const settingsButton = document.getElementById('settings-button');
    const settingsDropdown = document.getElementById('settings-dropdown');
    const colorOptions = document.querySelectorAll('.color-option');
    const darkModeSwitch = document.getElementById('dark-mode-switch');
    const darkModeTypeRadios = document.querySelectorAll('input[name="dark-mode-type"]');
    const darkModeTypeContainer = document.getElementById('dark-mode-type-container');

    // --- 設定メニューの表示切り替え ---
    settingsButton.addEventListener('click', (event) => {
        event.stopPropagation();
        settingsDropdown.classList.toggle('show');
    });

    document.addEventListener('click', (event) => {
        if (!settingsDropdown.contains(event.target) && !settingsButton.contains(event.target)) {
            settingsDropdown.classList.remove('show');
        }
    });

    // --- テーマとモードの適用ロジック ---
    const applyTheme = (theme) => {
        document.body.classList.remove('theme-white', 'theme-red', 'theme-yellow', 'theme-green', 'theme-blue', 'theme-purple');
        document.body.classList.add(`theme-${theme}`);
        localStorage.setItem('colorTheme', theme);
        updateActiveColorOption(theme);
    };

    const applyDarkMode = (isDark, type) => {
        document.body.classList.remove('dark-accent', 'dark-full');
        if (isDark) {
            document.body.classList.add(type === 'full' ? 'dark-full' : 'dark-accent');
            darkModeTypeContainer.style.display = 'flex';
        } else {
            darkModeTypeContainer.style.display = 'none';
        }
        localStorage.setItem('darkMode', isDark);
        localStorage.setItem('darkModeType', type);
    };
    
    const updateActiveColorOption = (theme) => {
        colorOptions.forEach(opt => {
            opt.classList.toggle('active', opt.dataset.color === theme);
        });
    };

    // --- イベントリスナーの設定 ---
    colorOptions.forEach(option => {
        option.addEventListener('click', () => {
            applyTheme(option.dataset.color);
        });
    });

    darkModeSwitch.addEventListener('change', () => {
        const type = document.querySelector('input[name="dark-mode-type"]:checked').value;
        applyDarkMode(darkModeSwitch.checked, type);
    });

    darkModeTypeRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (darkModeSwitch.checked) {
                applyDarkMode(true, radio.value);
            }
        });
    });

    // --- 初期読み込み ---
    const savedTheme = localStorage.getItem('colorTheme') || 'blue';
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    const savedDarkModeType = localStorage.getItem('darkModeType') || 'accent';

    applyTheme(savedTheme);
    applyDarkMode(savedDarkMode, savedDarkModeType);

    darkModeSwitch.checked = savedDarkMode;
    document.querySelector(`input[name="dark-mode-type"][value="${savedDarkModeType}"]`).checked = true;
});