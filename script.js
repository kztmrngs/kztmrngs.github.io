document.addEventListener('DOMContentLoaded', () => {
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

    Promise.all([
        loadComponent('/header.html', 'header-placeholder'),
        loadComponent('/footer.html', 'footer-placeholder')
    ]).then(() => {
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
    }).catch(error => {
        console.error('Error loading components:', error);
    });
});
