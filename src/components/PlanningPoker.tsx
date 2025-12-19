import { useState } from 'react';
import { useSession } from '../context/SessionContext';
import useTasks from '../hooks/useTasks';
import useVotes from '../hooks/useVotes';
import { submitVote } from '../services/votes';

/**
 * Composant Planning Poker pour voter sur les estimations.
 */
function PlanningPoker() {
    const { currentSession, currentParticipant } = useSession();
    const { currentTask } = useTasks(currentSession?.id ?? null);
    const { votes } = useVotes(currentTask?.id ?? null);

    const [selected, setSelected] = useState<string>('');

    const cards: (number | string)[] = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, '?'];

    async function handleCardClick(card: number | string) {
        if (!currentSession || !currentParticipant) return alert('Veuillez rejoindre une session et vous connecter.');
        if (!currentTask) return alert('Aucune tâche courante.');

        const value = typeof card === 'number' ? card : -1;
        const res = await submitVote(currentTask.id, currentParticipant.id, value);
        if (res) {
            setSelected(String(card));
        } else {
            alert('Échec de l\'envoi du vote.');
        }
    }

    const myVote = votes.find((v) => v.participant_id === currentParticipant?.id);

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">Planning Poker</h1>
                <p className="text-gray-600 mb-2">{currentTask ? `Tâche: ${currentTask.title}` : 'Aucune tâche sélectionnée'}</p>
                <p className="text-gray-500 mb-4">Choisissez une carte pour estimer la tâche en cours.</p>

                <div className="mb-4">
                    <strong>Vos votes enregistrés:</strong> {votes.length}
                    {myVote && (
                        <div className="text-sm text-gray-600">Votre dernier vote: {myVote.value === -1 ? '?' : myVote.value}</div>
                    )}
                </div>

                <div className="grid grid-cols-3 md:grid-cols-12 gap-4">
                    {cards.map((card, index) => (
                        <div
                            key={index}
                            className={`bg-white border-2 rounded-lg shadow-md transition-all cursor-pointer p-3 flex items-center justify-center select-none ${selected === String(card) ? 'border-indigo-500 shadow-lg' : 'border-gray-300 hover:shadow-lg hover:border-indigo-400'}`}
                            onClick={() => void handleCardClick(card)}
                            role="button"
                            tabIndex={0}
                        >
                            <span className="text-2xl font-bold text-gray-700">{card}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default PlanningPoker;
