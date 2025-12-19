import { useState, type JSX } from "react"
import { SlUser } from "react-icons/sl"
import { useNavigate } from "react-router-dom"


/**
 * Page d'accueil de l'application Planning Poker
 */
export default function Home(): JSX.Element {
  const [menuOpen, setMenuOpen] = useState<boolean>(false)
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false)
  const [showJoinForm, setShowJoinForm] = useState<boolean>(false)
  let newSession = false

  const toggleMenu = (): void => {
    setMenuOpen(open => !open)
  }

  const handleCreateSession = (): void => {
    setShowCreateForm(true)
  }

  const handleJoinSession = (): void => {
    setShowJoinForm(true)
  }

  const navigate = useNavigate()

  const handleContinue = () => {
    navigate("/session")
  }

  
    return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-start justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl ring-1 ring-gray-100 overflow-hidden">
        <header className="p-6 text-center">
          <h1 className="text-3xl font-extrabold text-gray-800">
            Planning Poker
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Estimez les tâches en équipe rapidement
          </p>

          <div className="mt-5 flex justify-center">
            <button
              onClick={toggleMenu}
              aria-expanded={menuOpen}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              Menu
            </button>
          </div>
        </header>

        {menuOpen && (
          <nav className="px-6 pb-6" aria-label="Panneau de menu principal">
            <div className="bg-gray-50 border border-gray-100 rounded-lg shadow-inner divide-y divide-gray-100 overflow-hidden">
              <div className="p-6">
                <div className="w-full flex items-center gap-3 px-4 py-3 bg-white rounded-md">
                  <SlUser />
                  <div className="flex items-center gap-3">
                    <h2 className="text-sm font-medium text-gray-800">
                      Entrez un pseudo
                    </h2>
                    <input
                      type="text"
                      placeholder="Votre pseudo..."
                      className="text-xs text-gray-500 mt-3 w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div className="p-6">
                <button
                  onClick={handleContinue}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-white rounded-md hover:bg-gray-50 transition text-left"
                >
                  <div>
                    <div className="text-sm font-medium text-gray-800">
                      Créer une session
                    </div>
                    <div className="text-xs text-gray-500">
                      Démarrer une nouvelle réunion
                    </div>
                  </div>
                </button>
              </div>

              <div className="p-6">
                <button
                  onClick={handleJoinSession}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-white rounded-md hover:bg-gray-50 transition text-left"
                >
                  <div>
                    <div className="text-sm font-medium text-gray-800">
                      Rejoindre une session
                    </div>
                    <div className="text-xs text-gray-500">
                      Saisir un code ou lier une réunion
                    </div>
                  </div>
                </button>
              </div>

              {showJoinForm && (
                <div className="p-6 border-t">
                  <div className="flex justify-end">
                    <button
                      onClick={() => setShowJoinForm(false)}
                      className="text-gray-400 hover:text-gray-600 text-xs"
                    >
                      Fermer
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Code de session..."
                    className="text-xs text-gray-500 mt-3 w-full px-3 py-2 border rounded-lg"
                  />
                  <button className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg">
                    Valider
                  </button>
                </div>
              )}

              <div className="p-3 bg-gray-100 text-center text-xs text-gray-500">
                Astuce : utilisez le menu pour créer ou rejoindre rapidement une session.
              </div>
            </div>
          </nav>
        )}

        
      </div>
    </div>
    

  )
 
}
