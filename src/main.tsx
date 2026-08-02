import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import './index.css'

const container = document.getElementById('root')
if (!container) throw new Error('Root element #root is missing from index.html')

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Offline support: the catalog and shell are cached so the app opens without a
// connection. Registration is best-effort and never blocks first paint. The
// single-file build has nowhere to serve a worker from, so it opts out.
if ('serviceWorker' in navigator && import.meta.env.PROD && !import.meta.env.VITE_SINGLE_FILE) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      /* offline support is optional */
    })
  })
}
