type Theme = 'system' | 'light' | 'dark'

const THEMES: Theme[] = ['system', 'light', 'dark']
const THEME_STORAGE_KEY = 'theme'

const isTheme = (value: unknown): value is Theme => THEMES.includes(value as Theme)

function readStoredTheme(): Theme {
    try {
        const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
        return isTheme(stored) ? stored : 'system'
    } catch {
        return 'system'
    }
}

/** 'system' removes the override so Bulma follows prefers-color-scheme. */
function applyTheme(theme: Theme): void {
    const root = document.documentElement
    if (theme === 'system') delete root.dataset.theme
    else root.dataset.theme = theme
    try {
        window.localStorage.setItem(THEME_STORAGE_KEY, theme)
    } catch {
        // storage unavailable (private mode, blocked): theme still applies for this page view
    }
}

/** Inlined in _document so the saved theme is applied before first paint (no flash). */
const themeInitScript = `(function(){try{var t=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}})()`

export type { Theme }
export { THEMES, isTheme, readStoredTheme, applyTheme, themeInitScript }
