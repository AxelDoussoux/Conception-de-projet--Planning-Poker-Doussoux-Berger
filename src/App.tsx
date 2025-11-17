import React, { useState, type JSX } from 'react';

function App(): JSX.Element {
  const [count, setCount] = useState<number>(0);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  return (
    <div style={{ fontFamily: 'sans-serif', padding: 20 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>Planning Poker</h1>
        <button
          onClick={() => setMenuOpen(open => !open)}
          aria-expanded={menuOpen}
          style={{ padding: '8px 12px' }}
        >
          Menu
        </button>
      </header>

      {menuOpen && (
        <nav
          style={{
            border: '1px solid #ddd',
            padding: 10,
            marginTop: 10,
            width: 220,
            borderRadius: 4,
            background: '#fafafa',
          }}
        >
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li style={{ marginBottom: 8 }}>
              <button onClick={() => alert('Option 1')} style={{ width: '100%' }}>
                Option 1
              </button>
            </li>
            <li>
              <button onClick={() => alert('Option 2')} style={{ width: '100%' }}>
                Option 2
              </button>
            </li>
          </ul>
        </nav>
      )}

      <main style={{ marginTop: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => setCount(c => c + 1)}
            style={{ padding: '10px 14px', fontSize: 16 }}
          >
            +1
          </button>
          <div>
            Compteur : <strong>{count}</strong>
          </div>
          <button onClick={() => setCount(0)} style={{ marginLeft: 8 }}>
            Réinitialiser
          </button>
        </div>
      </main>
    </div>
  );
}

export default App;