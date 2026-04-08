import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ThemeProvider } from './components/theme-provider.tsx'

function hideBootScreen() {
  const bootScreen = document.getElementById('boot-screen')
  if (!bootScreen) return

  requestAnimationFrame(() => {
    bootScreen.classList.add('boot-screen--hidden')
    window.setTimeout(() => bootScreen.remove(), 240)
  })
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)

hideBootScreen()

// Use contextBridge
window.ipcRenderer.on('main-process-message', (_event, message) => {
  console.log(message)
})
