import React from 'react'
import ReactDOM from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import App from './App'
import ErrorBoundary from './components/ErrorBoundary'
import './index.css'

// Flip the async font stylesheet from media="print" to all.
// The <link> in index.html loads non-render-blocking this way, but CSP forbids
// the usual inline onload="this.media='all'" handler — so the swap happens
// here, in our own CSP-allowed module bundle.
document
 .querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"][media="print"]')
 .forEach(link => { link.media = 'all' })

ReactDOM.createRoot(document.getElementById('root')!).render(
 <React.StrictMode>
  <ErrorBoundary>
   <App />
   <Analytics />
  </ErrorBoundary>
 </React.StrictMode>,
)
