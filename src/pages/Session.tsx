import { useState, type JSX } from "react"
import { SlUser } from "react-icons/sl"
import type { Task } from "./types/Task"
import { useNavigate } from "react-router-dom"

export default function CreateSession() {
    const [sessionName, setSessionName] = useState("")
    const [taskTitle, setTaskTitle] = useState("")
    const [tasks, setTasks] = useState<Task[]>([])
    
    const addTask = () => {
        if (!taskTitle.trim()) return
    
        setTasks(prev => [
        ...prev,
        {
            id: crypto.randomUUID(),
            title: taskTitle.trim()
        }
        ])
    
        setTaskTitle("")
    }
    
    const removeTask = (id: string) => {
        setTasks(prev => prev.filter(task => task.id !== id))
    }

    const navigate = useNavigate()

    const handleContinue = () => {
        navigate("/game")
    }
    
    return (
        <div className="min-h-screen bg-gray-50 flex justify-center p-6">
        <div className="w-full max-w-xl bg-white rounded-2xl shadow p-6 space-y-6">
        <div justify-content="center">
        <h1 className="text-3xl font-extrabold text-gray-800" >
            Planning Poker
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Estimez les tâches en équipe rapidement
          </p>
        </div>
        
            <h1 className="text-2xl font-bold text-gray-800">
            Préparer la session
            </h1>
    
            {/* Nom de la session */}
            <div>
            <label className="block text-sm font-medium text-gray-700">
                Nom de la session
            </label>
            <input
                value={sessionName}
                onChange={e => setSessionName(e.target.value)}
                className="mt-1 w-full px-3 py-2 border rounded-lg"
                placeholder="Sprint 42 – Backlog"
            />
            </div>
    
            {/* Ajout de tâche */}
            <div className="flex gap-2">
            <input
                value={taskTitle}
                onChange={e => setTaskTitle(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg"
                placeholder="Nouvelle tâche à estimer"
            />
            <button
                onClick={addTask}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
            >
                Ajouter
            </button>
            </div>
    
            {/* Liste des tâches */}
            {tasks.length > 0 && (
            <ul className="space-y-2">
                {tasks.map(task => (
                <li
                    key={task.id}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                >
                    <span>{task.title}</span>
                    <button
                    onClick={() => removeTask(task.id)}
                    className="text-sm text-red-500 hover:text-red-700"
                    >
                    Supprimer
                    </button>
                </li>
                ))}
            </ul>
            )}
    
            {/* Action future */}
            <button
            onClick={handleContinue}
            disabled={tasks.length === 0}
            className="w-full py-2 bg-green-600 text-white rounded-lg disabled:opacity-50"
            >
            Lancer la session
            </button>
        </div>
        </div>
    )
    }