<div align="center">

  <h1>🌦️ AtlasForecast</h1>
  <p><strong>A Next-Generation Weather Forecasting Platform</strong></p>

  <p>
    <a href="https://github.com/ObaidDev-Ait/AtlasForecast/blob/main/LICENSE">
      <img src="https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge" alt="License: MIT" />
    </a>
    <a href="https://nextjs.org">
      <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
    </a>
    <a href="https://www.typescriptlang.org/">
      <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    </a>
    <a href="https://react.dev">
      <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
    </a>
    <a href="https://tailwindcss.com">
      <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    </a>
    <a href="https://vercel.com">
      <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
    </a>
  </p>

  <p>
    <a href="#-getting-started">Getting Started</a> •
    <a href="#-features">Features</a> •
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#-screenshots">Screenshots</a> •
    <a href="#-author">Author</a>
  </p>

</div>

---

## 📖 Overview

**AtlasForecast** is a modern, responsive weather forecasting web application engineered for speed, accuracy, and intuitive visual data delivery. Built with **Next.js** and **TypeScript**, AtlasForecast connects to multi-source meteorological APIs to aggregate real-time weather metrics, interactive satellite/radar maps, hourly predictions, and comprehensive 7-day weather insights.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Environment Variables](#-environment-variables)
- [Screenshots](#-screenshots)
- [Performance & Optimization](#-performance--optimization)
- [Future Roadmap](#-future-roadmap)
- [Author](#-author)
- [License](#-license)

---

## ✨ Features

| Category | Highlights |
| :--- | :--- |
| 🌍 **Real-Time Weather** | Instant live temperature, feels-like readings, humidity, wind velocity/direction, pressure, and cloud coverage. |
| 📍 **Smart City Search** | Instant location autocomplete & search with geolocation support. |
| 📅 **Multi-Day Forecast** | Detailed 7-day extended forecasts with high/low temperature trends and precipitation likelihood. |
| 🕒 **Hourly Insights** | Dynamic hourly breakdown for precise daily planning. |
| 🌅 **Solar Metrics** | Astronomical data including exact sunrise & sunset timing. |
| 🗺️ **Interactive Maps** | Dynamic weather layers including satellite imagery, precipitation, and cloud overlays powered by NASA GIBS & Leaflet. |
| 📈 **Analytical Charts** | Visual chart visualizations for temperature fluctuations and rain trends powered by Chart.js. |
| 🌓 **Adaptive Theme** | Seamless Dark and Light mode options for optimal visibility. |
| 📱 **Responsive Design** | Pixel-perfect layout tailored for desktop, tablet, and mobile displays. |
| ⚡ **Performance First** | Optimized server side rendering and lazy-loaded components. |

---

## 🛠 Tech Stack

### Core Architecture
- ![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=next.js&logoColor=white) **Next.js**: React Framework for hybrid static & server rendering
- ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white) **TypeScript**: Type-safe code base and reliable API interfaces
- ![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black) **React**: Component-driven UI architecture
- ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white) **Tailwind CSS**: Utility-first responsive styling
- ![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=flat-square&logo=framer&logoColor=white) **Framer Motion**: Smooth animations & micro-interactions

### Data & Weather APIs
- **OpenWeather API**: Current weather conditions, geocoding, and core forecasts
- **Meteoblue API**: High-precision meteorological dataset aggregation
- **NASA GIBS**: Global imagery satellite overlays & atmospheric maps

### Mapping & Data Visualization
- **Leaflet**: Lightweight interactive mapping framework
- **Chart.js**: Flexible charts for temperature and precipitation trends

### Infrastructure & Deployment
- ![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white) **Vercel**: Edge network hosting and continuous deployment pipeline

---

## 📂 Project Structure

```text
AtlasForecast/
├── app/                  # Next.js App Router pages, layouts, and route handlers
├── components/           # Reusable UI components (Weather Cards, Charts, Map, Navbar)
├── hooks/                # Custom React hooks (Geolocation, Fetching, Theme state)
├── lib/                  # Utility functions, API clients, and constants
├── public/               # Static assets, icons, and branding images
└── styles/               # Global CSS styles and Tailwind overrides
```

---

## 🚀 Getting Started

Follow these steps to set up and run AtlasForecast locally on your machine.

### Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (`v18.x` or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ObaidDev-Ait/AtlasForecast.git
   ```

2. **Navigate to the project directory**
   ```bash
   cd AtlasForecast
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Set up Environment Variables** (See [Environment Variables](#-environment-variables) section below)

5. **Start the local development server**
   ```bash
   npm run dev
   ```

6. **Open in Browser**  
   Navigate to [http://localhost:3000](http://localhost:3000) to view the application in action.

---

## ⚙ Environment Variables

Create a `.env.local` file in the root of your project directory and add your credentials:

```env
# OpenWeather API Key
NEXT_PUBLIC_OPENWEATHER_API_KEY=your_openweather_api_key_here

# Meteoblue API Key
NEXT_PUBLIC_METEOBLUE_API_KEY=your_meteoblue_api_key_here

# Application Base URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> 💡 **Note**: You can obtain free API keys directly from [OpenWeather](https://openweathermap.org/api) and [Meteoblue](https://www.meteoblue.com/en/weather-api).

---

## 📸 Screenshots

| View | Screenshot |
| :--- | :--- |
| **Home Page** | ![Home Page Placeholder](https://via.placeholder.com/800x450?text=AtlasForecast+-+Home+Page+Preview) |
| **Weather Search** | ![Weather Search Placeholder](https://via.placeholder.com/800x450?text=AtlasForecast+-+Weather+Search+Preview) |
| **Forecast View** | ![Forecast Placeholder](https://via.placeholder.com/800x450?text=AtlasForecast+-+Forecast+Charts+Preview) |
| **Interactive Weather Maps** | ![Weather Maps Placeholder](https://via.placeholder.com/800x450?text=AtlasForecast+-+Interactive+Maps+Preview) |
| **Mobile View** | ![Mobile View Placeholder](https://via.placeholder.com/400x700?text=AtlasForecast+-+Mobile+View+Preview) |

---

## 📈 Performance & Architecture

AtlasForecast is built with performance and UX as core priorities:

- ⚡ **Server Components**: Leverages Next.js React Server Components to reduce client-side JavaScript bundle size.
- 🖼️ **Image Optimization**: Automated format conversion, lazy loading, and dimension optimization via `next/image`.
- 📦 **Code Splitting & Lazy Loading**: Dynamic imports for heavy libraries like Leaflet and Chart.js to accelerate initial load time.
- 🔍 **SEO Optimized**: Standardized OpenGraph tags, dynamic meta descriptions, and structured metadata for search engine indexing.
- 🎨 **Responsive UI Architecture**: Fluid grid layouts built with Tailwind CSS for mobile, tablet, and ultra-wide screens.

---

## 🌍 Future Roadmap

- [ ] 🚨 **Weather Alerts & Warnings**: Real-time severe weather notification banners.
- [ ] 🍃 **Air Quality Index (AQI)**: Detailed atmospheric particle levels (PM2.5, PM10, CO, NO2).
- [ ] 🌸 **Pollen Forecast**: Seasonal allergy tracking and pollen density reports.
- [ ] 🌊 **Marine Forecast**: Wave height, sea temperature, and ocean current trends.
- [ ] 📜 **Historical Weather Data**: Archive queries to compare weather over past years.
- [ ] 🛰️ **Radar Animations**: Animated temporal satellite overlay sequence.
- [ ] ⭐ **User Favorites & Saved Cities**: LocalStorage & Cloud synchronization for preferred locations.
- [ ] 🌐 **Multi-language Support (i18n)**: Localization for international users.

---

## 👨‍💻 Author

**Obaid Ait Mattou**

- 🐙 **GitHub**: [@ObaidDev-Ait](https://github.com/ObaidDev-Ait)
- 🌐 **Portfolio**: [obaid-portfolio.vercel.app](https://obaid-portfolio.vercel.app)
- ✉️ **Email**: [rebelestoobaid@gmail.com](mailto:rebelestoobaid@gmail.com)

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

<div align="center">
  <p>Crafted with ❤️ by Obaid Ait Mattou</p>
</div>
