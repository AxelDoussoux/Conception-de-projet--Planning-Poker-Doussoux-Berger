import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import PlanningPoker from './script/PlanningPoker.tsx'
import './index.css'
import { SessionProvider } from './script/SessionManager.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SessionProvider>
      <App />
      <PlanningPoker />
    </SessionProvider>
  </StrictMode>,
)
