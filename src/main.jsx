import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Initialize theme early to avoid flash
try{
  const stored = localStorage.getItem('theme')
  if(stored === 'dark') document.documentElement.classList.add('dark')
  else if(stored === 'light') document.documentElement.classList.remove('dark')
  else if(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) document.documentElement.classList.add('dark')
}catch(e){ /* ignore */ }

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
