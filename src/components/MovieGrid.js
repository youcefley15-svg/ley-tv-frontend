import React, { useEffect, useState } from 'react';

const API_URL = 'https://ley-tv.onrender.com';

function MovieGrid() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('movies');
  const [error, setError] = useState('');
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [streamUrl, setStreamUrl] = useState('');

  useEffect(() => {
    fetchItems();
  }, [category]);

  const fetchItems = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/api/${category}/popular?page=1`);
      const data = await response.json();
      
      let filmsArray = [];
      if (data.films && Array.isArray(data.films)) {
        filmsArray = data.films;
      } else if (data.results && Array.isArray(data.results)) {
        filmsArray = data.results;
      } else if (Array.isArray(data)) {
        filmsArray = data;
      }
      
      if (filmsArray.length > 0) {
        setItems(filmsArray);
      } else {
        setError('Aucun film trouvé');
      }
    } catch (error) {
      setError('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const playMovie = (movie) => {
    setSelectedMovie(movie);
    setStreamUrl(`https://vidsrc.to/embed/movie/${movie.id}`);
  };

  const closePlayer = () => {
    setSelectedMovie(null);
    setStreamUrl('');
  };

  if (selectedMovie) {
    return (
      <div style={{ padding: '20px' }}>
        <button 
          onClick={closePlayer}
          style={{
            padding: '10px 20px',
            marginBottom: '20px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          ← Retour aux films
        </button>
        
        <h2>{selectedMovie.title}</h2>
        
        <iframe
          src={streamUrl}
          width="100%"
          height="500"
          style={{ border: 'none', borderRadius: '8px' }}
          allowFullScreen
          title={selectedMovie.title}
        />
      </div>
    );
  }

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
                src={item.image} 
                alt={item.title} 
                style={{ 
                  width: '100%', 
                  height: '200px', 
                  objectFit: 'cover',
                  borderRadius: '4px'
                }}
              />
              <h3 style={{ fontSize: '16px', margin: '10px 0 5px' }}>
                {item.title}
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
