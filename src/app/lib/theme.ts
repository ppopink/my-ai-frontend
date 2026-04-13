export type AppTheme = "light" | "dark";

export function getStoredTheme(): AppTheme {
  return localStorage.getItem("lp_dark_mode") === "true" ? "dark" : "light";
}

export function applyTheme(theme: AppTheme) {
  const isDark = theme === "dark";
  localStorage.setItem("lp_dark_mode", String(isDark));
  document.documentElement.classList.toggle("dark", isDark);
}
