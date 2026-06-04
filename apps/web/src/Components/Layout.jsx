import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import MobileMenu from './MobileMenu'
import AnimatedBackground from './AnimatedBackground'
import Footer from './Footer'

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <>
      <AnimatedBackground />
      <Navbar onMobileMenuOpen={() => setMenuOpen(true)} />
      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <main className="main-content"><Outlet /></main>
      <Footer />
    </>
  )
}
