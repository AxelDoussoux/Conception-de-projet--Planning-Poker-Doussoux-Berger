import { cards } from '../lib/planningPoker.ts';

function PlanningPoker() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Planning Poker</h1>
        <p className="text-gray-600 mb-2">Bienvenue dans l'application de Planning Poker !</p>
        <p className="text-gray-500 mb-8">Choisissez une carte pour estimer la tâche en cours.</p>

        <div className="grid grid-cols-3 md:grid-cols-12 gap-4">
          {cards.map((card, index) => (
            <div 
              key={index} 
              className="bg-white border-2 border-gray-300 rounded-lg shadow-md hover:shadow-lg hover:border-indigo-500 transition-all cursor-pointer p-3 flex items-center justify-center"
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