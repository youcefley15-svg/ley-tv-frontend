import React, { useEffect, useState } from 'react';

const API_URL = 'https://ley-tv.onrender.com';

function MovieGrid() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('movies');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchItems();
  }, [category]);

  const fetchItems = async () => {
    setLoading(true);
    setError('');
    try {
      console.log(`🔍 Chargement: ${API_URL}/api/${category}/popular?page=1`);
      const response = await fetch(`${API_URL}/api/${category}/popular?page=1`);
      const data = await response.json();
      console.log('📦 Données brutes:', data);
      
      // Gestion de tous les formats possibles
      let filmsArray = [];
      
      if (data.films && Array.isArray(data.films)) {
        // Format { films: [...] }
        filmsArray = data.films;
      } else if (data.results && Array.isArray(data.results)) {
        // Format { results: [...] } (TMDB direct)
        filmsArray = data.results;
      } else if (Array.isArray(data)) {
        // Format direct [...]
        filmsArray = data;
      } else if (data.data && Array.isArray(data.data)) {
        // Format { data: [...] }
        filmsArray = data.data;
      }
      
      if (filmsArray.length > 0) {
        console.log(`✅ ${filmsArray.length} films trouvés`);
        setItems(filmsArray);
      } else {
        console.log('⚠️ Aucun film dans le format attendu');
        setError('Aucun film trouvé');
        setItems([]);
      }
    } catch (error) {
      console.error('❌ Erreur:', error);
      setError('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const playMovie = (movie) => {
    window.open(`https://vidsrc.to/embed/movie/${movie.id}`, '_blank');
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => setCategory('movies')}>🎬 Films</button>
        <button onClick={() => setCategory('anime')}>🎌 Animes</button>
        <button onClick={() => setCategory('dramas')}>📺 Dramas</button>
        <button onClick={() => setCategory('arabic')}>🌍 Arabes</button>
      </div>

      {loading && <div>⏳ Chargement...</div>}
      {error && <div style={{ color: 'red' }}>❌ {error}</div>}

      {!loading && !error && items.length === 0 && (
        <div>Aucun film disponible</div>
      )}

      {items.length > 0 && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
          gap: '20px' 
        }}>
          {items.map(item => (
            <div 
              key={item.id} 
              onClick={() => playMovie(item)}
              style={{ 
                border: '1px solid #ddd', 
                borderRadius: '8px',
                padding: '10px', 
                cursor: 'pointer',
                textAlign: 'center'
              }}
            >
              <img 
                src={item.image || item.poster_path || 'https://via.placeholder.com/200x300'} 
                alt={item.title || item.name} 
                style={{ 
                  width: '100%', 
                  height: '200px', 
                  objectFit: 'cover',
                  borderRadius: '4px'
                }}
              />
              <h3 style={{ fontSize: '16px', margin: '10px 0 5px' }}>
                {item.title || item.name}
              </h3>
              {item.year && <p style={{ margin: 0, color: '#666' }}>{item.year}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MovieGrid;
