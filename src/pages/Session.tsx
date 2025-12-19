import { useState, type JSX } from "react"
import type { Tasks } from "../lib/supabase"
import type { GameMode } from "../lib/types"
import { useSession } from "../context/SessionContext"
import { createSession } from "../services/sessions"


export function SessionBlock({ onOpenGame }: { onOpenGame: () => void }): JSX.Element {
    const [sessionName, setSessionName] = useState("")
    const [pseudo, setPseudo] = useState<string>("")
    const [taskTitle, setTaskTitle] = useState("")
    const [tasks, setTasks] = useState<Tasks[]>([])
    const [gameMode, setGameMode] = useState<GameMode>("strict");

    const addTask = () => {
        if (!taskTitle.trim()) return
    
        setTasks(prev => [
        ...prev,
        {
            id: crypto.randomUUID(),
            title: taskTitle.trim(),
            session_id: '',
            description: '',
            is_current: false,
            created_at: new Date().toISOString()
        }
        ])
    
        setTaskTitle("")
    }
    
    const removeTask = (id: string) => {
        setTasks(prev => prev.filter(task => task.id !== id))
    }

    const { setCurrentSession, setCurrentParticipant } = useSession()

    const handleContinue = async () => {
        if (!pseudo.trim() || !sessionName.trim()) return alert('Entrez un pseudo et un nom de session');
        await createSession(sessionName, pseudo, setCurrentSession, setCurrentParticipant);
        onOpenGame()
    }
    
    return (
        <div className="min-h-screen bg-gray-50 flex justify-center p-6">
        <div className="w-full max-w-xl bg-white rounded-2xl shadow p-6 space-y-6">
        
        
            <h1 className="text-2xl font-bold text-gray-800">
            Créer la session
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
            {/* Choix du mode de jeu */}
            <div>
            <label className="block text-sm font-medium text-gray-700">
                Mode de jeu
            </label>

            <select
                value={gameMode}
                onChange={e => setGameMode(e.target.value as GameMode)}
                className="mt-1 w-full px-3 py-2 border rounded-lg"
            >
                <option value="strict">Strict (unanimité)</option>
                <option value="mean">Moyenne</option>
            </select>
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