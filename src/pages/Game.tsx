import { useState, type JSX } from "react"
//import { SlUser } from "react-icons/sl"
import type { Task } from "../Types/Task"

type CardValue =
  | 0 | 1 | 2 | 3 | 5 | 8 | 13 | 20 | 40
  | "cafe" | "interro"

export default function Game() {
  // Tâche en cours 
  const [currentTask] = useState<Task>({
    id: "1",
    sessionId: "session-1",
    title: "Créer la page Planning Poker"
  })

  //carte sélectionné par l'utilisateur
  const [selectedCard, setSelectedCard] = useState<CardValue | null>(null)

  // vote du joueur (pour l'instant c'est un mock)
    const [votes, setVotes] = useState<
      { userId: string; value: CardValue | null }[]
  >([])

const handleSelectCard = (value: CardValue) => {
  setSelectedCard(value)

  // plus tard → envoyer au backend
  setVotes(prev => [
    ...prev,
    { userId: "me", value }
  ])
}

const getCardImage = (card: CardValue) => {
  return typeof card === "number"
    ? `/cards/cartes_${card}.svg`
    : `/cards/cartes_${card}.svg`
}


return (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-start justify-center p-6">
    <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl ring-1 ring-gray-100">
      
      {/* Header */}
      <header className="px-6 py-4 text-center border-b">
        <h1 className="text-3xl font-extrabold text-gray-800">
          Planning Poker
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Estimez les tâches en équipe rapidement
        </p>
      </header>

      {/* Contenu */}
      <div className="p-6 flex flex-col gap-8">
        
        {/* Tâche courante */}
        <h2 className="text-xl font-semibold text-gray-800 text-center">
          {currentTask.title}
        </h2>
        <div className="h-15" /> 
        {/* Cartes */}
        <div className="flex justify-center gap-3 flex-wrap">
          {[0,1,2,3,5,8,13,20,40,"coffee","question"].map(card => (
            <button
              key={card}
              onClick={() => handleSelectCard(card as CardValue)}
              className={`
                w-16 h-24 rounded-lg border flex items-center justify-center
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

      </div>
    </div>
  </div>
)
}