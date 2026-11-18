import React, { useEffect, useState } from 'react'
import { THEMES, Theme, isTheme, readStoredTheme, applyTheme } from '../utils/theme'

const labels: Record<Theme, string> = {
    system: 'System',
    light: 'Light',
    dark: 'Dark',
}

const ThemeToggle = (): React.JSX.Element => {
    // Start with 'system' so server and first client render match; sync from storage after mount.
    const [theme, setTheme] = useState<Theme>('system')

    useEffect(() => {
        setTheme(readStoredTheme())
    }, [])

    const onChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        const value = e.target.value
        if (!isTheme(value)) return
        setTheme(value)
        applyTheme(value)
    }

    return (
        <>
            <select className="theme" aria-label="Colour theme" value={theme} onChange={onChange}>
                {THEMES.map(t => <option key={t} value={t}>{labels[t]}</option>)}
            </select>
            <style jsx>{`
                .theme {
                    margin-left: var(--space-1);
                    min-height: 32px;
                    padding: 0 var(--space-2);
                    border-radius: var(--radius-small);
                    border: 1px solid var(--border);
                    background: var(--surface);
                    color: var(--text-muted);
                    font: inherit;
                    font-size: 14px;
                    cursor: pointer;
                }
            `}</style>
        </>
    )
}

export default ThemeToggle
