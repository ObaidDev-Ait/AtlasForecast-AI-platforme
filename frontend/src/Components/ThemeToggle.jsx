import { useTheme } from './Providers'
import '../Styles/ThemeToggle.css'
export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  return (
    <button className={`af-theme-toggle ${theme}`} onClick={toggleTheme} type="button" title="Basculer le thème">
      <span className="af-theme-track"><span className="af-theme-knob"><i className={`fas fa-sun af-theme-sun`}></i><i className={`fas fa-moon af-theme-moon`}></i></span></span>
    </button>
  )
}
