import { useState, type JSX } from "react"
import { useSession } from "../context/SessionContext"
import { findParticipantByName, createParticipant } from "../services/participants"
import { createSession, joinSession } from "../services/sessions"

/**
 * Bloc Home : Login puis Créer/Rejoindre session
 */
export function HomeBlock({ onOpenSession, onOpenGame }: { onOpenSession: () => void; onOpenGame: () => void }): JSX.Element {
  const [pseudo, setPseudo] = useState("")
  const [loggedIn, setLoggedIn] = useState(false)
  const [sessionName, setSessionName] = useState("")
  const [sessionCode, setSessionCode] = useState("")

  const { setCurrentSession, setCurrentParticipant, currentParticipant } = useSession()

  // Valider le pseudo (chercher ou créer dans Supabase)
  const handleLogin = async () => {
    if (!pseudo.trim()) return alert("Entrez un pseudo")
    let participant = await findParticipantByName(pseudo.trim())
    if (!participant) {
      participant = await createParticipant(pseudo.trim())
    }
    if (!participant) return alert("Impossible de valider le pseudo.")
    setCurrentParticipant(participant)
    setLoggedIn(true)
  }

  // Créer une session
  const handleCreate = async () => {
    if (!sessionName.trim()) return alert("Entrez un nom de session")
    await createSession(sessionName.trim(), pseudo.trim(), setCurrentSession, setCurrentParticipant)
    onOpenSession()
  }

  // Rejoindre une session
  const handleJoin = async () => {
    if (!sessionCode.trim()) return alert("Entrez le code de session")
    await joinSession(sessionCode.trim(), pseudo.trim(), setCurrentSession, setCurrentParticipant)
    onOpenGame()
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl ring-1 ring-gray-100 p-6 max-w-md mx-auto">
      {!loggedIn ? (
        // Étape 1 : Login
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-gray-800">Connexion</h2>
          <input
            value={pseudo}
            onChange={e => setPseudo(e.target.value)}
            type="text"
            placeholder="Votre pseudo..."
            className="w-full px-3 py-2 border rounded-lg"
          />
          <button onClick={handleLogin} className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg">Valider</button>
        </div>
      ) : (
        // Étape 2 : Créer ou Rejoindre
        <div className="flex flex-col gap-6">
          <p className="text-lg text-gray-700">Bonjour <span className="font-bold text-indigo-600">{currentParticipant?.name ?? pseudo}</span> !</p>

          {/* Créer session */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Créer une session</label>
            <input
              value={sessionName}
              onChange={e => setSessionName(e.target.value)}
              type="text"
              placeholder="Nom de la session..."
              className="w-full px-3 py-2 border rounded-lg"
            />
            <button onClick={handleCreate} className="w-full px-4 py-2 bg-green-600 text-white rounded-lg">Créer</button>
          </div>

          {/* Rejoindre session */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Rejoindre une session</label>
            <input
              value={sessionCode}
              onChange={e => setSessionCode(e.target.value)}
              type="text"
              placeholder="Code de session..."
              className="w-full px-3 py-2 border rounded-lg"
            />
            <button onClick={handleJoin} className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg">Rejoindre</button>
          </div>
        </div>
      )}
    </div>
  )
}
