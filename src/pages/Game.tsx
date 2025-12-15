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
    <div>
      <p>hello World !</p>
      <h1>{currentTask.title}</h1>
    </div>
  )
}