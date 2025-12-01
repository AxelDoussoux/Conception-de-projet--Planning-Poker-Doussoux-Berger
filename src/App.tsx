import { useState, type JSX } from 'react';
import { SlUser } from "react-icons/sl";
/**
 * Composant principal de l'application "Planning Poker".
 *
 * Affiche le titre, une description et un bouton "Menu" qui ouvre/ferme
 * un panneau contenant des actions (créer/rejoindre une session).
 *
 * @returns {JSX.Element} L'élément React rendu pour l'application.
 */
function App(): JSX.Element {
  /**
   * Indique si le menu est ouvert.
   * @type {boolean}
   */
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  /**
   * Bascule l'état d'ouverture du menu.
   * @returns {void}
   */
  const toggleMenu = (): void => {
    setMenuOpen(open => !open);
  };

  /**
   * Handler appelé lorsque l'utilisateur clique sur "Créer une session".
   * Pour l'instant il affiche simplement une alerte.
   *
   * @returns {void}
   */
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const handleCreateSession = (): void => {
      setShowCreateForm(true);
  };

  /**
   * Handler appelé lorsque l'utilisateur clique sur "Rejoindre une session".
   * Pour l'instant il affiche simplement une alerte.
   *
   * @returns {void}
   */
  const [showJoinForm, setShowJoinForm] = useState(false);
  const handleJoinSession = (): void => {
      setShowJoinForm(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-start justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl ring-1 ring-gray-100 overflow-hidden">
        <header className="p-6 text-center">
          <h1 className="text-3xl font-extrabold text-gray-800">Planning Poker</h1>
          <p className="mt-2 text-sm text-gray-500">Estimez les tâches en équipe rapidement</p>

          <div className="mt-5 flex justify-center">
            <button
              onClick={toggleMenu}
              aria-expanded={menuOpen}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
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
                <h2 className="text-sm font-medium text-gray-800">Entrez un pseudo</h2>
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
                  onClick={handleCreateSession}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-white rounded-md hover:bg-gray-50 transition text-left"
                >
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m2 0a2 2 0 100-4H7a2 2 0 100 4m0 0v6" />
                  </svg>
                  <div>
                    <div className="text-sm font-medium text-gray-800">Créer une session</div>
                    <div className="text-xs text-gray-500">Démarrer une nouvelle réunion</div>
                  </div>
                </button>
              </div>
              {showCreateForm && (
              <div className="p-6 border-t">
                <div className="flex justify-end">
                <button
                  onClick={() => setShowCreateForm(false)}
                  aria-label="Fermer le formulaire"
                  className="text-gray-400 hover:text-gray-600 text-xs leading-none">Fermer</button>
                </div>
                <input 
                  type="text"
                  placeholder="Nom de la session..."
                  className="text-xs text-gray-500 mt-3 w-full px-3 py-2 border rounded-lg"
                />
                <button className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg">
                  Valider
                </button>

            </div>
            )}

              <div className="p-6">
                <button
                  onClick={handleJoinSession}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-white rounded-md hover:bg-gray-50 transition text-left"
                >
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A2 2 0 0122 9.618V14a2 2 0 01-1.447 1.934L15 18v-8zM3 8v8a2 2 0 002 2h8" />
                  </svg>
                  <div>
                    <div className="text-sm font-medium text-gray-800">Rejoindre une session</div>
                    <div className="text-xs text-gray-500">Saisir un code ou lier une réunion</div>
                  </div>
                </button>
              </div>
              {showJoinForm && (
              <div className="p-6 border-t">
                <div className="flex justify-end">
                <button
                  onClick={() => setShowJoinForm(false)}
                  aria-label="Fermer le formulaire"
                  className="text-gray-400 hover:text-gray-600 text-xs leading-none">Fermer</button>
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
  );
}

export default App;