import { createContext, useContext, useState, useEffect } from 'react'
const ThemeCtx = createContext()
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark')
  useEffect(() => { document.documentElement.setAttribute('data-theme', theme); localStorage.setItem('theme', theme) }, [theme])
  const toggleTheme = () => setTheme(p => p === 'light' ? 'dark' : 'light')
  return <ThemeCtx.Provider value={{ theme, toggleTheme }}>{children}</ThemeCtx.Provider>
}
export function useTheme() { return useContext(ThemeCtx) }

const UnitsCtx = createContext()
export function UnitsProvider({ children }) {
  const [units, setUnits] = useState(() => localStorage.getItem('units') || 'metric')
  const toggleUnits = () => setUnits(p => { const n = p === 'metric' ? 'imperial' : 'metric'; localStorage.setItem('units', n); return n })
  const unitLabel = units === 'imperial' ? '°F' : '°C'
  const windUnit = units === 'imperial' ? 'mph' : 'km/h'
  return <UnitsCtx.Provider value={{ units, toggleUnits, unitLabel, windUnit }}>{children}</UnitsCtx.Provider>
}
export function useUnits() { return useContext(UnitsCtx) }
