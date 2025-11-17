import { useState, type JSX } from 'react';

function App(): JSX.Element {
  const [count, setCount] = useState<number>(0);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  return (
    <div className="font-sans p-5">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold m-0">Planning Poker</h1>
        <button
          onClick={() => setMenuOpen(open => !open)}
          aria-expanded={menuOpen}
          className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          Menu
        </button>
      </header>

      {menuOpen && (
        <nav className="border border-gray-200 p-3 mt-3 w-56 rounded bg-gray-50 shadow-sm">
          <ul className="space-y-2 p-0 m-0 list-none">
            <li>
              <button
                onClick={() => alert('Option 1')}
                className="w-full text-left bg-white border border-gray-200 rounded px-3 py-2 hover:bg-gray-100"
              >
                Option 1
              </button>
            </li>
            <li>
              <button
                onClick={() => alert('Option 2')}
                className="w-full text-left bg-white border border-gray-200 rounded px-3 py-2 hover:bg-gray-100"
              >
                Option 2
              </button>
            </li>
          </ul>
        </nav>
      )}

      <main className="mt-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCount(c => c + 1)}
            className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            +1
          </button>
          <div className="text-lg">
            Compteur : <strong className="ml-1">{count}</strong>
          </div>
          <button
            onClick={() => setCount(0)}
            className="ml-4 px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            Réinitialiser
          </button>
        </div>
      </main>
    </div>
  );
}

export default App;