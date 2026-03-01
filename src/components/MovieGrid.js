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
      console.log('📦 Données reçues:', data);
      
      if (data.films && data.films.length > 0) {
        setItems(data.films);
      } else {
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
          {items.map(item => (
            <div 
              key={item.id} 
              onClick={() => playMovie(item)}
              style={{ border: '1px solid #ddd', padding: '10px', cursor: 'pointer' }}
            >
              <img 
                src={item.image} 
                alt={item.title} 
                style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/200x300?text=Image+non+disponible';
                }}
              />
              <h3>{item.title}</h3>
              {item.year && <p>{item.year}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MovieGrid;
