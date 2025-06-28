if (window.matchMedia) {
  const toggleDarkMode = (e: MediaQueryListEvent | MediaQueryList) => {
    if (e.matches) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  toggleDarkMode(mediaQuery);
  mediaQuery.addEventListener('change', toggleDarkMode);
}