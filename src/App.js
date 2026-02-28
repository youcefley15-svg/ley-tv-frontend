import React from 'react';
import MovieGrid from './components/MovieGrid';

function App() {
  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 20px',
        backgroundColor: '#f8f9fa',
        borderBottom: '1px solid #ddd'
      }}>
        <div>
          <strong>🎬 Ley TV</strong>
          <span style={{ marginLeft: '10px', fontSize: '12px', color: '#666' }}>
            ⭐ Mode Test (sans code)
          </span>
        </div>
      </div>
      <MovieGrid hasPub={false} userType="premium" />
    </div>
  );
}

export default App;
