import { useState, type JSX } from "react"
import type { Tasks } from "../lib/supabase"
import type { GameMode } from "../lib/types"
import { useSession } from "../context/SessionContext"
import { createSession } from "../services/sessions"


export function SessionBlock({ onOpenGame }: { onOpenGame: () => void }): JSX.Element {
    const [sessionName, setSessionName] = useState("")
    const [taskTitle, setTaskTitle] = useState("")
    const [tasks, setTasks] = useState<Tasks[]>([])
    const [gameMode, setGameMode] = useState<GameMode>("strict");

    const { currentParticipant, setCurrentSession, setCurrentParticipant } = useSession()

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

    const handleContinue = async () => {
        if (!currentParticipant) return alert('Vous devez d\'abord vous connecter depuis Home');
        if (!sessionName.trim()) return alert('Entrez un nom de session');
        await createSession(sessionName, currentParticipant.name, gameMode, setCurrentSession, setCurrentParticipant);
        onOpenGame()
    }
    
    return (
        <div className="bg-white rounded-2xl shadow-xl ring-1 ring-gray-100 p-6 w-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Créer la session</h2>
    
            {/* Nom de la session */}
            <div className="flex flex-col gap-2 mb-4">
                <label className="text-sm font-medium text-gray-700">Nom de la session</label>
                <input
                    value={sessionName}
                    onChange={e => setSessionName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Sprint 42 – Backlog"
                />
            </div>

            {/* Choix du mode de jeu */}
            <div className="flex flex-col gap-2 mb-4">
                <label className="text-sm font-medium text-gray-700">Mode de jeu</label>
                <select
                    value={gameMode}
                    onChange={e => setGameMode(e.target.value as GameMode)}
                    className="w-full px-3 py-2 border rounded-lg"
                >
                    <option value="strict">Strict (unanimité)</option>
                    <option value="mean">Moyenne</option>
                </select>
            </div>

            {/* Ajout de tâche */}
            <div className="flex flex-col gap-2 mb-4">
                <label className="text-sm font-medium text-gray-700">Ajouter une tâche</label>
                <div className="flex gap-2">
                    <input
                        value={taskTitle}
                        onChange={e => setTaskTitle(e.target.value)}
                        className="flex-1 px-3 py-2 border rounded-lg"
                        placeholder="Nouvelle tâche à estimer"
                    />
                    <button onClick={addTask} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Ajouter</button>
                </div>
            </div>
            {/* Liste des tâches */}
            {tasks.length > 0 && (
                <ul className="space-y-2 mb-4">
                    {tasks.map(task => (
                        <li key={task.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span>{task.title}</span>
                            <button onClick={() => removeTask(task.id)} className="text-sm text-red-500 hover:text-red-700">Supprimer</button>
                        </li>
                    ))}
                </ul>
            )}

            {/* Action */}
            <button
                onClick={handleContinue}
                disabled={tasks.length === 0}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50"
            >
                Lancer la session
            </button>
        </div>
    )
}