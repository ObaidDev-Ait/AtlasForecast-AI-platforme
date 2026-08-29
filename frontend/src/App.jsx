import React, { lazy, Suspense, useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import './Styles/App.css'
import Layout from './Components/Layout'
import LoadingScreen from './Components/LoadingScreen'
import useRouteTransition from './Components/useRouteTransition'
import ProtectedRoute from './Components/ProtectedRoute'
import AdminRoute from './Components/AdminRoute'

// Lazy Pages
const HomePage = lazy(() => import('./Components/HomePage'))
const WeatherPage = lazy(() => import('./Components/WeatherPage'))
const ForecastPage = lazy(() => import('./Components/ForecastPage'))
const AlertsPage = lazy(() => import('./Components/AlertsPage'))
const AboutPage = lazy(() => import('./Components/AboutPage'))
const ContactPage = lazy(() => import('./Components/ContactPage'))
const LoginPage = lazy(() => import('./Components/LoginPage'))
const RegisterPage = lazy(() => import('./Components/RegisterPage'))
const ForgotPage = lazy(() => import('./Components/ForgotPage'))
const ResetPasswordPage = lazy(() => import('./Components/ResetPasswordPage'))
const PremiumPage = lazy(() => import('./Components/PremiumPage'))
const ProfilePage = lazy(() => import('./Components/ProfilePage'))
const SettingsPage = lazy(() => import('./Components/SettingsPage'))
const PremiumSignupPage = lazy(() => import('./Components/PremiumSignupPage'))
const CheckoutPage = lazy(() => import('./Components/CheckoutPage'))
const PrivacyPage = lazy(() => import('./Components/PrivacyPage'))
const AuthGooglePage = lazy(() => import('./Components/AuthGooglePage'))
const AuthFacebookPage = lazy(() => import('./Components/AuthFacebookPage'))
const AuthXPage = lazy(() => import('./Components/AuthXPage'))
const DashboardPage = lazy(() => import('./Components/DashboardPage'))
const AiAssistantPage = lazy(() => import('./Components/AiAssistantPage'))
const AdminPage = lazy(() => import('./Components/AdminPage'))

function App() {
  /* ---- Startup splash (shown once on cold start) ---- */
  const [startupDone, setStartupDone] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setStartupDone(true)
      // Remove the pre-React inline splash if it still exists
      const preSplash = document.getElementById('pre-react-splash')
      if (preSplash) preSplash.remove()
    }, 2600)
    return () => clearTimeout(timer)
  }, [])

  /* ---- Route transition overlay ---- */
  const isRouteTransitioning = useRouteTransition(800)

  return (
    <>
      {/* Loading overlays with smooth exit animations */}
      <AnimatePresence mode="wait">
        {!startupDone && <LoadingScreen type="startup" key="startup-loader" />}
        {startupDone && isRouteTransitioning && (
          <LoadingScreen type="route" key="route-loader" />
        )}
      </AnimatePresence>

      {/* Main app — Suspense fallback uses the same LoadingScreen for lazy chunks */}
      <Suspense fallback={<LoadingScreen type="route" />}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="weather" element={<WeatherPage />} />
            <Route path="forecast" element={<ForecastPage />} />
            <Route path="alerts" element={<AlertsPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="forgot" element={<ForgotPage />} />
            <Route path="reset-password" element={<ResetPasswordPage />} />
            <Route path="premium" element={<PremiumPage />} />
            <Route path="profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="dashboard" element={<AdminRoute><DashboardPage /></AdminRoute>} />
            <Route path="assistant" element={<AiAssistantPage />} />
            <Route path="premium-signup" element={<PremiumSignupPage />} />
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="privacy" element={<PrivacyPage />} />
            <Route path="auth-google" element={<AuthGooglePage />} />
            <Route path="auth-facebook" element={<AuthFacebookPage />} />
            <Route path="auth-x" element={<AuthXPage />} />
            <Route
              path="admin"
              element={
                <AdminRoute>
                  <AdminPage />
                </AdminRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  )
}

export default App
