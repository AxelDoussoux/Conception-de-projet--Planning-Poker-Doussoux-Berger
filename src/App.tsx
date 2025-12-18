import { useState, type JSX } from 'react';
import { useSession } from './context/SessionContext.tsx';
import { createSession, joinSession, disableSession } from './services/sessions';
import { createParticipant } from './services/participants';
import { fetchTasks, createTask, updateTask, deleteTask } from './services/tasks';
import { fetchVotes, submitVote, resetVotes, deleteVote } from './services/votes';

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
  const { currentParticipant, currentSession, setCurrentSession, setCurrentParticipant } = useSession();

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
    void createSession(sessionName, pseudo, setCurrentSession, setCurrentParticipant);
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
    void joinSession(sessionCode, pseudo, setCurrentSession, setCurrentParticipant);
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
    // createParticipant returns the created participant; set it in context
    createParticipant(pseudo).then((participant) => {
      if (participant) {
        setCurrentParticipant(participant);
        alert(`Participant connecté : Pseudo = ${participant.name}`);
      }
    });
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
    console.log('Désactivation de la session avec ID :', currentSession.id);
    void disableSession(currentSession.id, setCurrentSession);
  };

  // Handlers de test pour Tasks
  const handleTestFetchTasks = async (): Promise<void> => {
    if (!currentSession) return alert('Aucune session active.');
    const tasks = await fetchTasks(currentSession.id);
    alert(`Tâches trouvées : ${tasks.length}`);
    console.log('fetchTasks result:', tasks);
  };

  const handleTestCreateTask = async (): Promise<void> => {
    if (!currentSession) return alert('Aucune session active.');
    const title = `Tâche test ${new Date().toLocaleTimeString()}`;
    const t = await createTask(currentSession.id, title, 'Créée pour test');
    if (t) {
      alert('Tâche créée');
      console.log('createTask result:', t);
    } else {
      alert('Erreur création tâche');
    }
  };

  const handleTestUpdateTask = async (): Promise<void> => {
    if (!currentSession) return alert('Aucune session active.');
    const tasks = await fetchTasks(currentSession.id);
    if (!tasks || tasks.length === 0) return alert('Aucune tâche à modifier.');
    const first = tasks[0];
    const updated = await updateTask(first.id, { title: first.title + ' (modifié)' });
    if (updated) {
      alert('Tâche modifiée');
      console.log('updateTask result:', updated);
    } else {
      alert('Erreur modification tâche');
    }
  };

  const handleTestDeleteTask = async (): Promise<void> => {
    if (!currentSession) return alert('Aucune session active.');
    const tasks = await fetchTasks(currentSession.id);
    if (!tasks || tasks.length === 0) return alert('Aucune tâche à supprimer.');
    const last = tasks[tasks.length - 1];
    const ok = await deleteTask(last.id);
    if (ok) {
      alert('Tâche supprimée');
      console.log('deleteTask deleted id:', last.id);
    } else {
      alert('Erreur suppression tâche');
    }
  };

  // Handlers de test pour Votes
  const handleTestFetchVotes = async (): Promise<void> => {
    if (!currentSession) return alert('Aucune session active.');
    const tasks = await fetchTasks(currentSession.id);
    if (!tasks || tasks.length === 0) return alert('Aucune tâche disponible pour voir les votes.');
    const firstTask = tasks[0];
    const votes = await fetchVotes(firstTask.id);
    alert(`Votes trouvés pour '${firstTask.title}' : ${votes.length}`);
    console.log('fetchVotes result:', votes);
  };

  const handleTestSubmitVote = async (): Promise<void> => {
    if (!currentSession) return alert('Aucune session active.');
    if (!currentParticipant) return alert('Veuillez vous connecter.');
    const tasks = await fetchTasks(currentSession.id);
    if (!tasks || tasks.length === 0) return alert('Aucune tâche disponible pour voter.');
    const firstTask = tasks[0];
    const value = 13; // Valeur aléatoire pour le test
    const v = await submitVote(firstTask.id, currentParticipant.id, value);
    if (v) {
      alert(`Vote de ${value} soumis pour '${firstTask.title}'`);
      console.log('submitVote result:', v);
    } else {
      alert('Erreur soumission vote');
    }
  };

  const handleTestResetVotes = async (): Promise<void> => {
    if (!currentSession) return alert('Aucune session active.');
    const tasks = await fetchTasks(currentSession.id);
    if (!tasks || tasks.length === 0) return alert('Aucune tâche disponible.');
    const firstTask = tasks[0];
    const ok = await resetVotes(firstTask.id);
    if (ok) {
      alert(`Votes réinitialisés pour '${firstTask.title}'`);
    } else {
      alert('Erreur réinitialisation votes');
    }
  };

  const handleTestDeleteVote = async (): Promise<void> => {
    if (!currentSession) return alert('Aucune session active.');
    if (!currentParticipant) return alert('Veuillez vous connecter.');
    const tasks = await fetchTasks(currentSession.id);
    if (!tasks || tasks.length === 0) return alert('Aucune tâche disponible.');
    const firstTask = tasks[0];
    const ok = await deleteVote(firstTask.id, currentParticipant.id);
    if (ok) {
      alert(`Votre vote a été supprimé pour '${firstTask.title}'`);
    } else {
      alert('Erreur suppression vote');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-start justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl ring-1 ring-gray-100 overflow-hidden">
        <header className="p-6 text-center">
          <h1 className="text-3xl font-extrabold text-gray-800">Planning Poker</h1>
          <p className="mt-2 mb-4 text-sm text-gray-500">Estimez les tâches en équipe rapidement</p>

          {/* menu / actions existants */}
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
              {currentParticipant && (
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
              )}

              {/* Rejoindre une session */}
              {currentParticipant && (
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
              )}

              {/* Désactiver une session */}
              {currentSession && (
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
              )}

              {/* Section de test Tasks */}
              <div className="p-4">
                <div className="bg-white rounded-md p-4 space-y-3">
                  <div className="text-sm font-medium text-gray-800">Tests Tasks (dev)</div>
                  <div className="flex flex-col gap-2">
                    <button onClick={handleTestFetchTasks} className="w-full px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm">Fetch tasks</button>
                    <button onClick={handleTestCreateTask} className="w-full px-3 py-2 bg-green-100 rounded hover:bg-green-200 text-sm">Create test task</button>
                    <button onClick={handleTestUpdateTask} className="w-full px-3 py-2 bg-yellow-100 rounded hover:bg-yellow-200 text-sm">Update first task</button>
                    <button onClick={handleTestDeleteTask} className="w-full px-3 py-2 bg-red-100 rounded hover:bg-red-200 text-sm">Delete last task</button>
                  </div>
                </div>
              </div>

              {/* Section de test Votes */}
              <div className="p-4">
                <div className="bg-white rounded-md p-4 space-y-3">
                  <div className="text-sm font-medium text-gray-800">Tests Votes (dev)</div>
                  <div className="flex flex-col gap-2">
                    <button onClick={handleTestFetchVotes} className="w-full px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm">Fetch votes (1st task)</button>
                    <button onClick={handleTestSubmitVote} className="w-full px-3 py-2 bg-indigo-100 rounded hover:bg-indigo-200 text-sm">Submit random vote (1st task)</button>
                    <button onClick={handleTestDeleteVote} className="w-full px-3 py-2 bg-pink-100 rounded hover:bg-pink-200 text-sm">Delete my vote (1st task)</button>
                    <button onClick={handleTestResetVotes} className="w-full px-3 py-2 bg-red-100 rounded hover:bg-red-200 text-sm">Reset all votes (1st task)</button>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-gray-100 text-center text-xs text-gray-500">
                Tests (dev)
              </div>
            </div>
          </nav>
        </header>
      </div>
    </div>
  )
}

export default App;