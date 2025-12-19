import { useState, useEffect } from "react"
import { useSession } from "../context/SessionContext"
import { fetchTasks, subscribeToTasks } from "../services/tasks"
import { fetchVotes, submitVote } from "../services/votes"
import { getSessionParticipants } from "../services/sessions"
import type { Tasks } from "../lib/supabase"
import type { Votes } from "../lib/supabase"

// valeurs possibles d'une cartes de planning poker 
type CardValue = 0 | 1 | 2 | 3 | 5 | 8 | 13 | 20 | 40 | "coffee" | "question";

export function GameBlock({ onNavigate }: { onNavigate?: (page: 'home'|'session'|'game') => void }) {

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
  const { currentSession, currentParticipant } = useSession()

  // sélection de la tâche en cours dans la liste tasks
  const currentTask = tasks[currentTaskIndex] ?? null;

  useEffect(() => {
    if (!currentSession) return;

    let removeFn: (() => Promise<void>) | undefined;

    void fetchTasks(currentSession.id).then(setTasks).catch(err => console.error(err));

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
    }
  }, [currentSession])

// gère la sélection des cartes avant la validation
const handleSelectCard = (value: CardValue) => setSelectedCard(value)

// retourne le nom du fichier correspondant à la CardValue 
const getCardImage = (card: CardValue | null) => `/cards/cartes_${card}.svg`

// fonction de validation du vote pour la tâche en cours
const handleValidateVote = async () => {
  if (selectedCard === null || !currentTask) return;

  // si vote numérique, on envoie au back
  if (typeof selectedCard === 'number' && currentParticipant) {
    await submitVote(currentTask.id, currentParticipant.id, selectedCard as number).catch(err => console.error(err))
  }

  // récupérer les votes pour la tâche (affichage)
    if (currentTask) {
      const fetchedVotes: Votes[] = await fetchVotes(currentTask.id).catch(() => [])

      // récupère les participants de la session pour résoudre les ids en noms
      let participantsMap: Record<string, string> = {}
      if (currentSession) {
        const parts = await getSessionParticipants(currentSession.id).catch(() => null)
        if (parts && Array.isArray(parts)) {
          participantsMap = parts.reduce((acc, p) => { acc[p.id] = p.name; return acc }, {} as Record<string,string>)
        }
      }

      const mapped = fetchedVotes.map(v => ({ userId: participantsMap[v.participant_id] ?? v.participant_id, value: (v.value as CardValue) }))
      // ajouter le vote local si non numérique
      if (typeof selectedCard !== 'number' && currentParticipant) {
        mapped.push({ userId: participantsMap[currentParticipant.id] ?? currentParticipant.id, value: selectedCard })
      }
      setVotes(mapped)
    }

  setShowResults(true)
  // passer au vote de la tâche suivante au bout de 5 secondes
  setTimeout(() => {
    setShowResults(false)
    setSelectedCard(null)
    setVotes([])
    setCurrentTaskIndex((prev) => (prev + 1 < tasks.length ? prev + 1 : prev))
  }, 5000)

};



return (<div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-start justify-center p-6">
<div className="w-full max-w-lg bg-white rounded-2xl shadow-xl ring-1 ring-gray-100">

  {/* Header commun aux deux vues */}
  <header className="px-6 py-4 text-center border-b">
    <h1 className="text-3xl font-extrabold text-gray-800">
      Planning Poker
    </h1>
    <p className="mt-2 text-sm text-gray-500">
      Estimez les tâches en équipe rapidement
    </p>
  </header>

  {showResults ? (
    // --- Vue résultats ---
    <div className="p-6">
      <h2 className="text-2xl font-bold text-center mb-4">
        Résultats des votes
      </h2>
      <div className="space-y-2">
        {votes.map(v => (
           <div key={v.userId} className="flex items-center gap-3">
           <span className="font-medium">{v.userId} a choisi</span>
           <img
             src={getCardImage(v.value)}      // <-- ici
             alt={`Carte ${v.value}`}
             className="w-16 h-24 object-contain"
           />
         </div>
        ))}
      </div>
    </div>
  ) : (
    // --- Vue normale avec la tâche et les cartes ---
    <div className="p-6 flex flex-col gap-8">
      <h2 className="text-xl font-semibold text-gray-800 text-center">
        {currentTask.title}
      </h2>

      <div className="h-15" /> 
      <div className="flex justify-center gap-3 flex-wrap">
        {[0,1,2,3,5,8,13,20,40,"coffee","question"].map(card => (
          <button
            key={card}
            onClick={() => handleSelectCard(card as CardValue)}
            className={`
              cursor-pointer w-16 h-24 rounded-lg border flex items-center justify-center
              transition
              ${selectedCard === card
                ? "border-indigo-600 ring-2 ring-indigo-200"
                : "border-gray-300 hover:border-gray-400"}
            `}
          >
            <img
              src={getCardImage(card as CardValue)}
              alt={`Carte ${card}`}
              className="w-full h-full p-2 object-contain pointer-events-none"
            />
          </button>
        ))}
      </div>
      <button
        className="cursor-pointer relative z-50 bg-green-600 text-white px-4 py-2 rounded"
        disabled={selectedCard === null}
        onClick={handleValidateVote}
      >
        Valider
      </button>
      <p className="text-center text-sm text-gray-500">
        Carte sélectionnée : {String(selectedCard)}
      </p>
    </div>
  )}

</div>
</div>
)
}