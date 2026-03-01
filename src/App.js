import React from 'react';
import MovieGrid from './components/MovieGrid';

function App() {
  return (
    <div>
      <h1 style={{ 
        textAlign: 'center', 
        padding: '20px',
        margin: 0,
        backgroundColor: '#1a1a1a',
        color: 'white',
        fontSize: '2.5rem',
        letterSpacing: '2px'
      }}>
        🎬 LeY Tv
      </h1>
      <MovieGrid />
    </div>
  );
}

export default App;
