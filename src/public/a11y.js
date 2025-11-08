// public/a11y.js
(function(){
  const KEY = 'a11y-prefs';
  const defaults = { font: 'medium', contrast: false, reduceMotion: false };

  function load() {
    try { return Object.assign({}, defaults, JSON.parse(localStorage.getItem(KEY) || '{}')); }
    catch(e) { return defaults; }
  }
  function save(prefs) { localStorage.setItem(KEY, JSON.stringify(prefs)); }

  function apply(prefs) {
  // Remove font classes then add the chosen (supports small, medium, large, xlarge)
  document.documentElement.classList.remove('a11y-font-small','a11y-font-medium','a11y-font-large','a11y-font-xlarge');
  document.documentElement.classList.add(`a11y-font-${prefs.font}`);

    // contrast and reduce motion
    if (prefs.contrast) document.documentElement.classList.add('a11y-contrast'); else document.documentElement.classList.remove('a11y-contrast');
    if (prefs.reduceMotion) document.documentElement.classList.add('reduce-motion'); else document.documentElement.classList.remove('reduce-motion');

    // update aria-pressed
    const contrastBtn = document.getElementById('a11y-contrast');
    if (contrastBtn) contrastBtn.setAttribute('aria-pressed', prefs.contrast);
    const reduceBtn = document.getElementById('a11y-reduce-motion');
    if (reduceBtn) reduceBtn.setAttribute('aria-pressed', prefs.reduceMotion);
  }

  document.addEventListener('DOMContentLoaded', () => {
    const prefs = load();
    apply(prefs);

    // wire buttons
    document.getElementById('a11y-font-increase')?.addEventListener('click', () => {
      // cycle: small -> medium -> large -> xlarge
      if (prefs.font === 'small') prefs.font = 'medium';
      else if (prefs.font === 'medium') prefs.font = 'large';
      else if (prefs.font === 'large') prefs.font = 'xlarge';
      else prefs.font = 'xlarge';
      apply(prefs); save(prefs);
    });
    document.getElementById('a11y-font-decrease')?.addEventListener('click', () => {
      // reverse cycle: xlarge -> large -> medium -> small
      if (prefs.font === 'xlarge') prefs.font = 'large';
      else if (prefs.font === 'large') prefs.font = 'medium';
      else if (prefs.font === 'medium') prefs.font = 'small';
      else prefs.font = 'small';
      apply(prefs); save(prefs);
    });
    document.getElementById('a11y-font-reset')?.addEventListener('click', () => {
      prefs.font = 'medium'; apply(prefs); save(prefs);
    });
    document.getElementById('a11y-contrast')?.addEventListener('click', () => {
      prefs.contrast = !prefs.contrast; apply(prefs); save(prefs);
    });
    document.getElementById('a11y-reduce-motion')?.addEventListener('click', () => {
      prefs.reduceMotion = !prefs.reduceMotion; apply(prefs); save(prefs);
    });

    // allow keyboard activation (Enter/Space) on toolbar buttons
    document.querySelectorAll('.a11y-toolbar button').forEach(btn => {
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); btn.click(); }
      });
    });
  });
})();
