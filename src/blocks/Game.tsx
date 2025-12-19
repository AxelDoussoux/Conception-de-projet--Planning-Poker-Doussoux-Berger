import { useState, useEffect } from "react"
import { useSession } from "../context/SessionContext"
import { fetchTasks, subscribeToTasks } from "../services/tasks"
import { fetchVotes, submitVote } from "../services/votes"
import { getSessionParticipants, deactivateSession } from "../services/sessions"
import { deleteParticipant } from "../services/participants"
import type { Tasks } from "../lib/supabase"
import type { Votes } from "../lib/supabase"

// valeurs possibles d'une cartes de planning poker 
type CardValue = 0 | 1 | 2 | 3 | 5 | 8 | 13 | 20 | 40 | "coffee" | "question";

// Historique des votes par tâche
type TaskVoteHistory = {
  taskTitle: string;
  votes: { userId: string; value: CardValue | null }[];
};

export function GameBlock({ onOpenHome }: { onOpenHome: () => void }) {

  // carte sélectionné par l'utilisateur pour la tâche active
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  // variable booleenne : si vrai, on affige la vue résultats
  const [showResults, setShowResults] = useState(false);
  // vote de l'utilisateur
  const [votes, setVotes] = useState<{ userId: string; value: CardValue | null }[]>([]);
  // carte sélectionnée par l'utilisateur
  const [selectedCard, setSelectedCard] = useState<CardValue | null>(null);

  // listes des tâches à évaluer (récupérées depuis le service)
  const [tasks, setTasks] = useState<Tasks[]>([]);
  // nombre de participants connectés
  const [participantCount, setParticipantCount] = useState(0);
  // nombre de participants ayant voté
  const [voteCount, setVoteCount] = useState(0);
  // session terminée
  const [sessionEnded, setSessionEnded] = useState(false);
  // affichage du récapitulatif final (20 secondes)
  const [showFinalResults, setShowFinalResults] = useState(false);
  // historique de tous les votes
  const [voteHistory, setVoteHistory] = useState<TaskVoteHistory[]>([]);
  const { currentSession, currentParticipant, setCurrentSession, setCurrentParticipant } = useSession()

  // sélection de la tâche en cours dans la liste tasks
  const currentTask = tasks[currentTaskIndex] ?? null;

  // Déconnexion du participant
  const handleDisconnect = async () => {
    if (!currentParticipant) return;
    await deleteParticipant(currentParticipant.id);
    setCurrentSession(null);
    setCurrentParticipant(null);
    onOpenHome();
  };

  useEffect(() => {
    if (!currentSession) return;

    let removeFn: (() => Promise<void>) | undefined;

    void fetchTasks(currentSession.id).then(setTasks).catch(err => console.error(err));

    // Fonction pour rafraîchir les compteurs
    const refreshCounts = async () => {
      try {
        const participants = await getSessionParticipants(currentSession.id);
        if (participants) setParticipantCount(participants.length);
      } catch (err) {
        console.error(err);
      }
    };

    // Rafraîchissement initial
    void refreshCounts();

    // Rafraîchissement toutes les 3 secondes
    const interval = setInterval(() => {
      void refreshCounts();
    }, 3000);

    try {
      const maybe = subscribeToTasks(currentSession.id, (fetched: Tasks[]) => setTasks(fetched));
      if (maybe && typeof (maybe as any).then === 'function') {
        (maybe as unknown as Promise<() => Promise<void>>).then(fn => { removeFn = fn })
      } else {
        removeFn = maybe as any
      }
    } catch (err) {
      console.error('Erreur souscription tasks:', err)
    }

    return () => {
      if (removeFn) void removeFn()
      clearInterval(interval)
    }
  }, [currentSession])

  // Rafraîchir le nombre de votes pour la tâche en cours
  useEffect(() => {
    if (!currentTask) {
      setVoteCount(0);
      return;
    }

    const refreshVoteCount = async () => {
      try {
        const votes = await fetchVotes(currentTask.id);
        setVoteCount(votes.length);
      } catch (err) {
        console.error(err);
      }
    };

    void refreshVoteCount();
    const interval = setInterval(() => void refreshVoteCount(), 2000);

    return () => clearInterval(interval);
  }, [currentTask])

// gère la sélection des cartes avant la validation
const handleSelectCard = (value: CardValue) => setSelectedCard(value)

// retourne le nom du fichier correspondant à la CardValue 
const getCardImage = (card: CardValue | null) => `/cards/cartes_${card}.svg`

// fonction de validation du vote pour la tâche en cours
const handleValidateVote = async () => {
  if (selectedCard === null || !currentTask || !currentParticipant) return;

  // Envoyer le vote au backend (uniquement si numérique)
  if (typeof selectedCard === 'number') {
    await submitVote(currentTask.id, currentParticipant.id, selectedCard).catch(err => console.error(err))
  }

  // Récupérer les votes pour la tâche (affichage)
  const fetchedVotes: Votes[] = await fetchVotes(currentTask.id).catch(() => [])

  // Récupère les participants de la session pour résoudre les ids en noms
  let participantsMap: Record<string, string> = {}
  if (currentSession) {
    const parts = await getSessionParticipants(currentSession.id).catch(() => null)
    if (parts && Array.isArray(parts)) {
      participantsMap = parts.reduce((acc, p) => { acc[p.id] = p.name; return acc }, {} as Record<string, string>)
    }
  }

  const mapped = fetchedVotes.map(v => ({ userId: participantsMap[v.participant_id] ?? v.participant_id, value: (v.value as CardValue) }))
  
  // Ajouter le vote local si non numérique (car non envoyé au backend)
  if (typeof selectedCard !== 'number') {
    mapped.push({ userId: participantsMap[currentParticipant.id] ?? currentParticipant.name, value: selectedCard })
  }
  
  setVotes(mapped)
  setShowResults(true)

  // Sauvegarder les votes de cette tâche dans l'historique
  setVoteHistory(prev => [...prev, { taskTitle: currentTask.title, votes: mapped }]);

  // Vérifier si c'était la dernière tâche
  const isLastTask = currentTaskIndex >= tasks.length - 1;

  // Passer au vote de la tâche suivante au bout de 5 secondes
  setTimeout(async () => {
    setShowResults(false)
    setSelectedCard(null)
    setVotes([])
    
    if (isLastTask && currentSession) {
      // Afficher le récapitulatif final pendant 20 secondes
      setShowFinalResults(true);
      
      setTimeout(async () => {
        // Fermer la session après 20 secondes
        await deactivateSession(currentSession.id);
        if (currentParticipant) {
          await deleteParticipant(currentParticipant.id);
        }
        setShowFinalResults(false);
        setSessionEnded(true);
        setCurrentSession(null);
        setCurrentParticipant(null);
      }, 20000);
    } else {
      setCurrentTaskIndex((prev) => prev + 1)
    }
  }, 5000)
};



return (
  <div className="bg-white rounded-2xl shadow-xl ring-1 ring-gray-100 p-6 w-auto">

    {sessionEnded ? (
      // --- Session terminée ---
      <div className="flex flex-col gap-4 items-center py-8">
        <h2 className="text-2xl font-bold text-green-600">Session terminée !</h2>
        <p className="text-gray-600">Toutes les tâches ont été estimées.</p>
        <p className="text-sm text-gray-500">Merci pour votre participation !</p>
        <button
          onClick={onOpenHome}
          className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          Retour à l'accueil
        </button>
      </div>
    ) : showFinalResults ? (
      // --- Récapitulatif final (20 secondes) ---
      <div className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-gray-800 text-center">Récapitulatif des votes</h2>
        <p className="text-sm text-gray-500 text-center">La session se fermera automatiquement dans quelques secondes...</p>
        <div className="space-y-6 max-h-96 overflow-y-auto">
          {voteHistory.map((task, idx) => (
            <div key={idx} className="border rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3">{task.taskTitle}</h3>
              <div className="flex flex-wrap gap-2">
                {task.votes.map((v, vIdx) => (
                  <div key={vIdx} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                    <span className="text-sm font-medium text-gray-700">{v.userId}:</span>
                    <img src={getCardImage(v.value)} alt={`${v.value}`} className="w-8 h-12 object-contain" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    ) : (
      <>
        {/* Nombre de participants et votes */}
        <div className="flex justify-between mb-4">
          <span className="text-sm text-gray-500">{participantCount} participant{participantCount > 1 ? 's' : ''} connecté{participantCount > 1 ? 's' : ''}</span>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{voteCount}/{participantCount} vote{voteCount > 1 ? 's' : ''}</span>
            <button
              onClick={handleDisconnect}
              className="text-sm text-red-500 hover:text-red-700"
            >
              Se déconnecter
            </button>
          </div>
        </div>

    {showResults ? (
      // --- Vue résultats ---
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-bold text-gray-800">Résultats des votes</h2>
        <div className="space-y-2">
          {votes.map(v => (
            <div key={v.userId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-700">{v.userId} a choisi</span>
              <img src={getCardImage(v.value)} alt={`Carte ${v.value}`} className="w-12 h-18 object-contain" />
            </div>
          ))}
        </div>
      </div>
    ) : (
      // --- Vue normale avec la tâche et les cartes ---
      <div className="flex flex-col gap-6">
        <h2 className="text-xl font-bold text-gray-800 text-center">{currentTask?.title ?? 'Aucune tâche'}</h2>

        <div className="flex justify-center gap-2 flex-wrap">
          {[0,1,2,3,5,8,13,20,40,"coffee","question"].map(card => (
            <button
              key={String(card)}
              onClick={() => handleSelectCard(card as CardValue)}
              className={`w-14 h-20 rounded-lg border flex items-center justify-center transition ${selectedCard === card ? 'border-indigo-600 ring-2 ring-indigo-200' : 'border-gray-300 hover:border-gray-400'}`}
            >
              <img src={getCardImage(card as CardValue)} alt={`Carte ${card}`} className="w-full h-full p-1 object-contain pointer-events-none" />
            </button>
          ))}
        </div>

        <button
          onClick={handleValidateVote}
          disabled={selectedCard === null}
          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50"
        >
          Valider
        </button>

        <p className="text-center text-sm text-gray-500">Carte sélectionnée : {String(selectedCard)}</p>
      </div>
    )}
      </>
    )}
  </div>
)
}