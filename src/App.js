import React from 'react';
import MovieGrid from './components/MovieGrid';

function App() {
  return (
    <div>
      <div style={{ padding: '10px', backgroundColor: '#f0f0f0', textAlign: 'center' }}>
        <h1>🎬 Ley TV - Mode Test</h1>
      </div>
      <MovieGrid />
    </div>
  );
}

export default App;
