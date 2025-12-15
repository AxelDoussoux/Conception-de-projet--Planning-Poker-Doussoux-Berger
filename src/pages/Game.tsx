import { useState, type JSX } from "react"
//import { SlUser } from "react-icons/sl"
import type { Task } from "../Types/Task"

type CardValue =
  | 0 | 1 | 2 | 3 | 5 | 8 | 13 | 20 | 40
  | "coffee" | "question"

export default function Game() {
  // Tâche en cours 
  const [currentTask] = useState<Task>({
    id: "1",
    sessionId: "session-1",
    title: "Créer la page Planning Poker"
  })


  return(
    <div className="min-h-screen bg-gray-50 flex justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl ring-1 ring-gray-100 overflow-hidden">
        <header className="p-6 text-center">
        <h1 className="text-3xl font-extrabold text-gray-800">
            Planning Poker
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Estimez les tâches en équipe rapidement
          </p>
        </header>
        <div className="min-h-screen flex flex-col justify-between p-6">
        <h1 className="text-2xl font-bold text-gray-800">{currentTask.title}</h1>
        </div>

      </div>
    </div>
  )
}