import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

/* --- Design System (order matters) --- */
import './Styles/Variables.css'        /* 1. Tokens */
import './css/base.css'                /* 2. Reset + global */
import './css/design-system.css'       /* 3. Component classes */

/* --- Feature CSS --- */
import './css/common-theme.css'
import './css/index.css'
import './css/hamburger-menu.css'
import './css/weather.css'
import './css/weather-search.css'
import './css/forecast.css'
import './css/forecast-v2.css'
import './css/alerts.css'
import './css/about.css'
import './css/contact.css'
import './css/login.css'
import './css/register.css'
import './css/forgot.css'
import './css/premium.css'
import './css/premium-signup.css'
import './css/checkout.css'
import './css/profile.css'
import './css/settings.css'
import './css/privacy.css'
import './css/auth.css'
import './css/social-auth.css'
import './css/light-theme.css'
import './css/world-cities.css'
import './css/forecast-inline.css'

/* --- Responsive (last, so it overrides) --- */
import './css/responsive-system.css'

/* --- Component CSS --- */
import './Styles/index.css'

import App from './App'
import { ThemeProvider, UnitsProvider } from './Components/Providers'
import { AuthProvider } from './contexts/AuthContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <UnitsProvider>
            <App />
          </UnitsProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
