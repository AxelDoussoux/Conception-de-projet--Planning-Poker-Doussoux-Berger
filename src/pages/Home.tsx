import { type JSX } from "react"


/**
 * Page d'accueil de l'application Planning Poker
 */
export function HomeBlock({ onNavigate }: { onNavigate: (page: 'home'|'session'|'game') => void }): JSX.Element {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-start justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl ring-1 ring-gray-100 overflow-hidden">
        <header className="p-6 text-center">
          <h1 className="text-3xl font-extrabold text-gray-800">Planning Poker</h1>
          <p className="mt-2 text-sm text-gray-500">Estimez les tâches en équipe rapidement</p>
        </header>

        <div className="p-6 flex flex-col gap-4">
          <button onClick={() => onNavigate('session')} className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg">Créer / Gérer une session</button>
          <button onClick={() => onNavigate('game')} className="w-full px-4 py-3 bg-gray-100 rounded-lg">Aller au jeu</button>
        </div>
      </div>
    </div>
  )
}
