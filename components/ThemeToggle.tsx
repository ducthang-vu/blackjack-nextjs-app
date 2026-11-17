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
        <div className="navbar-item">
            <div className="select is-small">
                <select aria-label="Colour theme" value={theme} onChange={onChange}>
                    {THEMES.map(t => <option key={t} value={t}>{labels[t]}</option>)}
                </select>
            </div>
        </div>
    )
}

export default ThemeToggle
