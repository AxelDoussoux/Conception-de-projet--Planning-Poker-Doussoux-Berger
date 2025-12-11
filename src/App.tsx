import { useState, type JSX } from 'react';
import { CreateSession } from './script/CreateSession';
import { JoinSession } from './script/JoinSession';
import { DisableSession } from './script/DisableSession';
import { Login } from './script/Login';
import { useSession } from './context/SessionContext';

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
   * Pseudo saisi par l'utilisateur.
   * @type {string}
   */
  const [pseudo, setPseudo] = useState<string>('');

  /**
   * Nom de la session à créer.
   * @type {string}
   */
  const [sessionName, setSessionName] = useState<string>('');

  /**
   * Code de session à rejoindre.
   * @type {string}
   */
  const [sessionCode, setSessionCode] = useState<string>('');

  // Récupérer les fonctions et données du contexte de session
  const { currentSession, setCurrentSession, setCurrentParticipant } = useSession();

  /**
   * Bascule l'état d'ouverture du menu.
   * @returns {void}
   */
  const toggleMenu = (): void => {
    setMenuOpen(open => !open);
  };

  /**
   * Handler appelé lorsque l'utilisateur clique sur "Créer une session".
   *
   * @returns {void}
   */
  const handleCreateSession = (): void => {
    if (!pseudo.trim()) {
      alert('Veuillez saisir votre pseudo.');
      return;
    }
    if (!sessionName.trim()) {
      alert('Veuillez saisir un nom de session.');
      return;
    }
    CreateSession(sessionName, pseudo);
  };

  /**
   * Handler appelé lorsque l'utilisateur clique sur "Rejoindre une session".
   *
   * @returns {void}
   */
  const handleJoinSession = (): void => {
    if (!pseudo.trim()) {
      alert('Veuillez saisir votre pseudo.');
      return;
    }
    if (!sessionCode.trim()) {
      alert('Veuillez saisir le code de session.');
      return;
    }
    JoinSession(sessionCode, pseudo);
  };

  /**
   * Handler appelé lorsque l'utilisateur clique sur "Se connecter".
   *
   * @returns {void}
   */
  const handleLogin = (): void => {
    if (!pseudo.trim()) {
      alert('Veuillez saisir votre pseudo.');
      return;
    }
    Login(pseudo);
  };

  /**
   * Handler appelé lorsque l'utilisateur clique sur "Désactiver une session".
   *
   * @returns {void}
   */
  const handleDisableSession = (): void => {
    if (!currentSession) {
      alert('Aucune session active à désactiver.');
      return;
    }
    DisableSession(currentSession.id);
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
              
              {/* Se connecter */}
              <div className="p-4">
                <div className="bg-white rounded-md p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-800">Se connecter</div>
                      <div className="text-xs text-gray-500">Créer un compte participant</div>
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder="Votre pseudo"
                    value={pseudo}
                    onChange={(e) => setPseudo(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <button
                    onClick={handleLogin}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm font-medium"
                  >
                    Connexion
                  </button>
                </div>
              </div>

              {/* Créer une session */}
              <div className="p-4">
                <div className="bg-white rounded-md p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-800">Créer une session</div>
                      <div className="text-xs text-gray-500">Démarrer une nouvelle réunion</div>
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder="Votre pseudo"
                    value={pseudo}
                    onChange={(e) => setPseudo(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Nom de la session"
                    value={sessionName}
                    onChange={(e) => setSessionName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                  <button
                    onClick={handleCreateSession}
                    className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition text-sm font-medium"
                  >
                    Créer
                  </button>
                </div>
              </div>

              {/* Rejoindre une session */}
              <div className="p-4">
                <div className="bg-white rounded-md p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-800">Rejoindre une session</div>
                      <div className="text-xs text-gray-500">Saisir un code de session</div>
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder="Votre pseudo"
                    value={pseudo}
                    onChange={(e) => setPseudo(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Code de session (6 chiffres)"
                    value={sessionCode}
                    onChange={(e) => setSessionCode(e.target.value)}
                    maxLength={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  />
                  <button
                    onClick={handleJoinSession}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition text-sm font-medium"
                  >
                    Rejoindre
                  </button>
                </div>
              </div>

              {/* Désactiver une session */}
              <div className="p-4">
                <button
                  onClick={handleDisableSession}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-white rounded-md hover:bg-gray-50 transition text-left"
                >
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <div>
                    <div className="text-sm font-medium text-gray-800">Désactiver une session</div>
                    <div className="text-xs text-gray-500">Terminer la session en cours</div>
                  </div>
                </button>
              </div>

              <div className="p-3 bg-gray-100 text-center text-xs text-gray-500">
                Astuce : utilisez le menu pour tester toutes les fonctionnalités.
              </div>
            </div>
          </nav>
        )}
      </div>
    </div>
  );
}

export default App;