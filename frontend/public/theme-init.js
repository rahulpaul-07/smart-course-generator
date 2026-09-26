// First-paint theme, before React mounts (see src/lib/theme.ts). Loaded as a
// blocking external script so the Content-Security-Policy needs no inline
// allowance.
(function () {
  try {
    var pref = localStorage.getItem('theme') || 'system';
    var dark = pref === 'dark' || (pref === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.add(dark ? 'dark' : 'light');
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
  } catch (err) {
    // Storage or matchMedia unavailable (private mode, old browser): keep the
    // default theme; React applies the saved preference once it mounts.
    void err;
  }
})();
