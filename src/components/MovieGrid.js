import React, { useEffect, useState, useCallback } from 'react';

// 🌐 URL de ton backend Render
const API_URL = 'https://ley-tv.onrender.com';

function MovieGrid({ hasPub, userType }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('movies'); // 'movies', 'anime', 'dramas'

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      let url = '';
      if (category === 'movies') {
        url = `${API_URL}/api/movies/popular`;
      } else if (category === 'anime') {
        url = `${API_URL}/api/anime/popular`;
      } else if (category === 'dramas') {
        url = `${API_URL}/api/dramas/popular`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error('Erreur chargement:', error);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const getButtonStyle = (cat) => ({
    padding: '10px 20px',
    marginRight: '10px',
    backgroundColor: category === cat ? '#007bff' : '#f0f0f0',
    color: category === cat ? 'white' : 'black',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  });

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={() => setCategory('movies')}
          style={getButtonStyle('movies')}
        >
          🎬 Films
        </button>
        <button 
          onClick={() => setCategory('anime')}
          style={getButtonStyle('anime')}
        >
          🎌 Animes
        </button>
        <button 
          onClick={() => setCategory('dramas')}
          style={getButtonStyle('dramas')}
        >
          📺 Dramas
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>⏳ Chargement...</div>
      ) : (
        <>
          <h2>
            {category === 'movies' && 'Films populaires'}
            {category === 'anime' && 'Animes populaires'}
            {category === 'dramas' && 'Dramas populaires'}
          </h2>
          {items.length === 0 ? (
            <p>Aucun contenu trouvé</p>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
              gap: '20px' 
            }}>
              {items.map(item => (
                <div key={item.id} style={{ 
                  border: '1px solid #ddd', 
                  borderRadius: '8px',
                  overflow: 'hidden',
                  cursor: 'pointer'
                }}>
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    style={{ 
                      width: '100%', 
                      height: '250px', 
                      objectFit: 'cover' 
                    }} 
                  />
                  <div style={{ padding: '10px' }}>
                    <h3 style={{ fontSize: '16px', margin: 0 }}>{item.title}</h3>
                    {item.year && <p style={{ margin: '5px 0 0', color: '#666' }}>{item.year}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default MovieGrid;