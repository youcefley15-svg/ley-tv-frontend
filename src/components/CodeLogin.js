import React, { useState } from 'react';

// 🌐 URL de ton backend Render
const API_URL = 'https://ley-tv.onrender.com';

function CodeLogin({ onLogin }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let appareil_id = localStorage.getItem('appareil_id');
      if (!appareil_id) {
        appareil_id = 'dev_' + Math.random().toString(36).substring(2) + Date.now();
        localStorage.setItem('appareil_id', appareil_id);
      }
      
      const response = await fetch(`${API_URL}/api/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, appareil_id })
      });

      const data = await response.json();

      if (data.valid) {
        localStorage.setItem('user_code', code);
        localStorage.setItem('user_type', data.type);
        localStorage.setItem('has_pub', data.has_pub ? 'true' : 'false');
        onLogin(data);
      } else {
        setError(data.error || 'Code invalide');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '10px',
        boxShadow: '0 0 10px rgba(0,0,0,0.1)',
        width: '300px'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>🔐 Connexion Ley TV</h2>
        
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Entrez votre code"
            style={{
              width: '100%',
              padding: '10px',
              marginBottom: '10px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              fontSize: '16px',
              textTransform: 'uppercase'
            }}
            maxLength="8"
          />
          
          {error && (
            <p style={{ color: 'red', fontSize: '14px', marginBottom: '10px' }}>
              {error}
            </p>
          )}
          
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              fontSize: '16px',
              cursor: 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Vérification...' : 'Se connecter'}
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: '#999' }}>
          Version gratuite 1 mois
        </p>
      </div>
    </div>
  );
}

export default CodeLogin;