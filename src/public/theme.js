// public/theme.js
(function(){
    const KEY = 'theme'; // 'light' or 'dark'
    function applyTheme(theme) {
        if (theme === 'dark') document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
        const btn = document.getElementById('theme-toggle');
        if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
        if (btn) btn.setAttribute('aria-pressed', theme === 'dark');
    }

    function toggleTheme() {
        const current = localStorage.getItem(KEY) || 'light';
        const next = current === 'dark' ? 'light' : 'dark';
        localStorage.setItem(KEY, next);
        applyTheme(next);
    }

    document.addEventListener('DOMContentLoaded', () => {
        const saved = localStorage.getItem(KEY) || 'light';
        applyTheme(saved);

        const btn = document.getElementById('theme-toggle');
        if (btn) btn.addEventListener('click', toggleTheme);
    });
})();
