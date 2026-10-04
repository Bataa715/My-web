'use client'

import './styles.css'
import App from './App.jsx'
import { StoreProvider } from './state/store.jsx'

// Full-screen overlay: the course UI is a self-contained app shell
// (fixed top bar + bottom nav), so it sits above the site chrome.
export default function FullStackApp() {
  return (
    <div className="fs-root fixed inset-0 z-[200] overflow-y-auto">
      <StoreProvider>
        <App />
      </StoreProvider>
    </div>
  )
}
