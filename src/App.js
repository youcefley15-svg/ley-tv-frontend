import React, { useState, useEffect } from 'react';
import CodeLogin from './components/CodeLogin';
import MovieGrid from './components/MovieGrid';

// 🌐 URL de ton backend Render
const API_URL = 'https://ley-tv.onrender.com';

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [userType, setUserType] = useState('gratuit');
  const [hasPub, setHasPub] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const code = localStorage.getItem('user_code');
    const appareil_id = localStorage.getItem('appareil_id');

    if (code && appareil_id) {
      setAuthenticated(true);
      setUserType(localStorage.getItem('user_type') || 'gratuit');
      setHasPub(localStorage.getItem('has_pub') !== 'false');
    }
    setLoading(false);
  }, []);

  const handleLogin = (data) => {
    setAuthenticated(true);
    setUserType(data.type);
    setHasPub(data.has_pub);
  };

  const handleLogout = () => {
    localStorage.removeItem('user_code');
    localStorage.removeItem('user_type');
    localStorage.removeItem('has_pub');
    setAuthenticated(false);
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>⏳ Chargement...</div>;
  }

  return (
    <div>
      {!authenticated ? (
        <CodeLogin onLogin={handleLogin} />
      ) : (
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
                {userType === 'premium' ? '⭐ Premium' : '📺 Gratuit'}
                {hasPub ? ' - avec pubs' : ' - sans pubs'}
              </span>
            </div>
            <button
              onClick={handleLogout}
              style={{
                padding: '5px 10px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer'
              }}
            >
              Déconnexion
            </button>
          </div>
          <MovieGrid hasPub={hasPub} userType={userType} />
        </div>
      )}
    </div>
  );
}

export default App;