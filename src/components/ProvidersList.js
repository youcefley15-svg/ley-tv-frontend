import React, { useEffect, useState } from 'react';

function ProvidersList({ onSelectProvider }) {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      const response = await fetch('http://localhost:3000/repo/arabic');
      const data = await response.json();
      setProviders(data.providers || []);
    } catch (error) {
      console.error('Erreur chargement providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProviders = providers.filter(p => {
    if (filter === 'all') return true;
    if (filter === 'active') return p.status === 'active';
    if (filter === 'movies') return p.tvTypes?.includes('Movie');
    if (filter === 'series') return p.tvTypes?.includes('TvSeries');
    if (filter === 'anime') return p.tvTypes?.includes('Anime');
    if (filter === 'live') return p.tvTypes?.includes('Live');
    return true;
  });

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>⏳ Chargement des providers...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>📦 Providers Arabes disponibles ({filteredProviders.length})</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => setFilter('all')} style={buttonStyle(filter === 'all')}>Tous</button>
        <button onClick={() => setFilter('active')} style={buttonStyle(filter === 'active')}>Actifs</button>
        <button onClick={() => setFilter('movies')} style={buttonStyle(filter === 'movies')}>Films</button>
        <button onClick={() => setFilter('series')} style={buttonStyle(filter === 'series')}>Séries</button>
        <button onClick={() => setFilter('anime')} style={buttonStyle(filter === 'anime')}>Animes</button>
        <button onClick={() => setFilter('live')} style={buttonStyle(filter === 'live')}>TV Live</button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '15px'
      }}>
        {filteredProviders.map((provider, index) => (
          <div
            key={index}
            onClick={() => provider.status === 'active' && onSelectProvider(provider)}
            style={{
              border: `1px solid ${provider.status === 'active' ? '#28a745' : '#dc3545'}`,
              borderRadius: '8px',
              padding: '15px',
              cursor: provider.status === 'active' ? 'pointer' : 'not-allowed',
              opacity: provider.status === 'active' ? 1 : 0.5,
              backgroundColor: '#f8f9fa',
              transition: 'transform 0.2s',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>{provider.name}</h3>
              <span style={{
                backgroundColor: provider.status === 'active' ? '#28a745' : '#dc3545',
                color: 'white',
                padding: '3px 8px',
                borderRadius: '12px',
                fontSize: '12px'
              }}>
                {provider.status === 'active' ? 'Actif' : 'Inactif'}
              </span>
            </div>
            
            <p style={{ margin: '10px 0', color: '#666', fontSize: '14px' }}>
              {provider.description || 'Provider pour contenu arabe'}
            </p>
            
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
              {provider.tvTypes?.map((type, i) => (
                <span key={i} style={{
                  backgroundColor: '#e9ecef',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  color: '#495057'
                }}>
                  {type}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const buttonStyle = (isActive) => ({
  padding: '8px 12px',
  margin: '0 5px',
  backgroundColor: isActive ? '#007bff' : '#f8f9fa',
  color: isActive ? 'white' : '#333',
  border: `1px solid ${isActive ? '#007bff' : '#ddd'}`,
  borderRadius: '4px',
  cursor: 'pointer'
});

export default ProvidersList;