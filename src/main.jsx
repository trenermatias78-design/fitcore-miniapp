import React from 'react'
import ReactDOM from 'react-dom/client'
import FitCoreApp from './FitCoreApp.jsx'

// Telegram WebApp init
if (window.Telegram?.WebApp) {
  const tg = window.Telegram.WebApp
  tg.ready()
  tg.expand()
  tg.setHeaderColor('#0d1209')
  tg.setBackgroundColor('#0d1209')
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <FitCoreApp />
  </React.StrictMode>
)
