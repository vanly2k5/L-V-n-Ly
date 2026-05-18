export interface AppTheme {
  primary: string;
  background: string;
  text: string;
  secondary: string;
}

export const DEFAULT_THEME: AppTheme = {
  primary: "#5B50D6",
  background: "#F5F6FF",
  text: "#0D1340",
  secondary: "#EEEDFD"
};

export const applyTheme = (theme: AppTheme) => {
  const root = document.documentElement;
  root.style.setProperty('--app-primary', theme.primary);
  root.style.setProperty('--app-bg', theme.background);
  root.style.setProperty('--app-text', theme.text);
  root.style.setProperty('--app-secondary', theme.secondary);
};

// Helper to generate secondary color based on primary (lighter version)
export const getSecondaryFromPrimary = (primary: string): string => {
  // Simple check for hex
  if (!primary.startsWith('#')) return "#EEEDFD";
  
  // Convert hex to opacity version for background if possible
  // For simplicity, we just return a light version or let user pick.
  // Here we'll just use the primary with 10% opacity if we were in CSS,
  // but for a variable we can use a hardcoded light version or 
  // just return a light violet as default if they pick something else.
  return `${primary}1A`; // 1A is ~10% opacity in hex
};
