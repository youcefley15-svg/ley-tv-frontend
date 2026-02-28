import React, { useState } from 'react';

const API = 'https://ley-tv.onrender.com';

function CodeLogin({ onLogin }) {
  const [code, setCode] = useState('');
  const [err, setErr] = useState('');
  const [load, setLoad] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoad(true);
    setErr('');
    try {
      let id = localStorage.getItem('id');
      if (!id) {
        id = 'dev_' + Date.now();
        localStorage.setItem('id', id);
      }
      const res = await fetch(`${API}/api/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, appareil_id: id })
      });
      const data = await res.json();
      if (data.valid) {
        localStorage.setItem('code', code);
        localStorage.setItem('type', data.type);
        localStorage.setItem('pub', data.has_pub);
        onLogin(data);
      } else setErr(data.error || 'Invalide');
    } catch (error) {
      setErr('Erreur');
    } finally {
      setLoad(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <form onSubmit={submit} style={{ padding: 40, background: 'white', borderRadius: 10 }}>
        <h2>Connexion</h2>
        <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Code" maxLength="8" style={{ display: 'block', margin: '10px 0', padding: 10 }} />
        {err && <p style={{ color: 'red' }}>{err}</p>}
        <button type="submit" disabled={load} style={{ padding: '10px 20px', background: '#007bff', color: 'white' }}>
          {load ? '...' : 'OK'}
        </button>
      </form>
    </div>
  );
}

export default CodeLogin;