import { useState } from "react"
import { HomeBlock } from "./pages/Home"
import { SessionBlock } from "./pages/Session"
import { GameBlock } from "./pages/Game"

export default function App() {
  const [showHome, setShowHome] = useState(true)
  const [showSession, setShowSession] = useState(false)
  const [showGame, setShowGame] = useState(false)

  const openHome = () => { setShowHome(true); setShowSession(false); setShowGame(false) }
  const openSession = () => { setShowHome(false); setShowSession(true); setShowGame(false) }
  const openGame = () => { setShowHome(false); setShowSession(false); setShowGame(true) }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header + Navbar */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-indigo-600">Planning Poker</h1>
          <nav className="flex gap-2">
            <button onClick={openHome} className={`px-3 py-1 rounded ${showHome?'bg-indigo-600 text-white':'bg-gray-100'}`}>Home</button>
            <button onClick={openSession} className={`px-3 py-1 rounded ${showSession?'bg-indigo-600 text-white':'bg-gray-100'}`}>Session</button>
            <button onClick={openGame} className={`px-3 py-1 rounded ${showGame?'bg-indigo-600 text-white':'bg-gray-100'}`}>Game</button>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 flex flex-col gap-6">
        {showHome && <HomeBlock onOpenSession={openSession} onOpenGame={openGame} />}
        {showSession && <SessionBlock onOpenGame={openGame} />}
        {showGame && <GameBlock />}
      </main>
    </div>
  )
}
