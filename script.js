document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('theme-toggle');
    const icon = document.querySelector('.toggle-switch .toggle-icon');
    if (!toggle) return;

    // テーマの保存・取得
    const setTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        toggle.checked = (theme === 'dark');
        if (icon) icon.textContent = theme === 'dark' ? 'dark' : 'light';
    };

    // 初期状態
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
});