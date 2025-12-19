import { useState } from "react"
import { HomeBlock } from "./pages/Home"
import { SessionBlock } from "./pages/Session"
import { GameBlock } from "./pages/Game"

export default function App() {
  const [view, setView] = useState<'home'|'session'|'game'>('home')
  const navigate = (p: 'home'|'session'|'game') => setView(p)

  return (
    <div>
      <main>
        {view === 'home' && <HomeBlock onNavigate={navigate} />}
        {view === 'session' && <SessionBlock onNavigate={navigate} />}
        {view === 'game' && <GameBlock onNavigate={navigate} />}
      </main>
    </div>
  )
}
