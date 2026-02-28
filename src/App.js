import React, { useState, useEffect } from 'react';
import CodeLogin from './components/CodeLogin';
import MovieGrid from './components/MovieGrid';

function App() {
  const [auth, setAuth] = useState(false);
  const [type, setType] = useState('gratuit');
  const [pub, setPub] = useState(true);
  const [load, setLoad] = useState(true);

  useEffect(() => {
    const code = localStorage.getItem('code');
    const id = localStorage.getItem('id');
    if (code && id) {
      setAuth(true);
      setType(localStorage.getItem('type') || 'gratuit');
      setPub(localStorage.getItem('pub') !== 'false');
    }
    setLoad(false);
  }, []);

  const login = (d) => {
    setAuth(true);
    setType(d.type);
    setPub(d.has_pub);
  };

  const logout = () => {
    localStorage.clear();
    setAuth(false);
  };

  if (load) return <div>Chargement...</div>;

  return (
    <div>
      {!auth ? (
        <CodeLogin onLogin={login} />
      ) : (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: 10 }}>
            <span>Ley TV - {type} {pub ? '(pubs)' : '(sans pubs)'}</span>
            <button onClick={logout}>Déconnexion</button>
          </div>
          <MovieGrid hasPub={pub} />
        </div>
      )}
    </div>
  );
}

export default App;