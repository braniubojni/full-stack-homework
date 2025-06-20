// This script is used to prevent flash of wrong theme
// It should be added as a script in the head of the document

// Script to be inlined in the document head
export const themeInitScript = `
  (function() {
    // Try to get theme from localStorage
    const darkMode = localStorage.getItem('darkMode');
    
    if (darkMode === 'true') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else if (darkMode === 'false') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      // If no theme is saved, use the system preference
      const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', prefersDarkMode ? 'dark' : 'light');
    }
  })()
`;
