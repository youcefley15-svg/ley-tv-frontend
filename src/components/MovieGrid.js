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
      
      console.log('📦 Données reçues:', data);
      
      // 👇 Gestion de TOUS les formats possibles
      let filmsArray = [];
      
      if (data.films && Array.isArray(data.films)) {
        // Format { films: [...] }
        filmsArray = data.films;
      } else if (data.results && Array.isArray(data.results)) {
        // Format TMDB direct { results: [...] }
        filmsArray = data.results;
      } else if (Array.isArray(data)) {
        // Format simple tableau
        filmsArray = data;
      } else if (data.data && Array.isArray(data.data)) {
        // Format { data: [...] }
        filmsArray = data.data;
      }
      
      if (filmsArray.length > 0) {
        setItems(filmsArray);
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
    setSelectedMovie(movie);
    setStreamUrl(`https://vidsrc.xyz/embed/movie/${movie.id}`);
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
          ← Retour
        </button>
        
        <h2>{selectedMovie.title}</h2>
        {selectedMovie.year && <p>Année : {selectedMovie.year}</p>}
        
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
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button onClick={() => setCategory('movies')} style={buttonStyle(category === 'movies')}>🎬 Films</button>
        <button onClick={() => setCategory('anime')} style={buttonStyle(category === 'anime')}>🎌 Animes</button>
        <button onClick={() => setCategory('dramas')} style={buttonStyle(category === 'dramas')}>📺 Dramas</button>
        <button onClick={() => setCategory('arabic')} style={buttonStyle(category === 'arabic')}>🌍 Arabes</button>
      </div>

      {loading && <div style={{ textAlign: 'center', padding: '20px' }}>⏳ Chargement...</div>}
      {error && <div style={{ color: 'red', textAlign: 'center' }}>❌ {error}</div>}

      {!loading && !error && items.length === 0 && (
        <div style={{ textAlign: 'center' }}>Aucun film disponible</div>
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
                overflow: 'hidden',
                cursor: 'pointer',
                backgroundColor: 'white',
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
              }}
            >
              <img 
                src={item.image || item.poster_path || 'https://via.placeholder.com/300x450'} 
                alt={item.title || item.name} 
                style={{ 
                  width: '100%', 
                  height: '250px', 
                  objectFit: 'cover' 
                }}
              />
              <div style={{ padding: '12px' }}>
                <h3 style={{ fontSize: '16px', margin: '0 0 5px 0' }}>
                  {item.title || item.name}
                </h3>
                {item.year && <p style={{ margin: 0, color: '#666' }}>{item.year}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const buttonStyle = (isActive) => ({
  padding: '10px 20px',
  backgroundColor: isActive ? '#007bff' : '#f0f0f0',
  color: isActive ? 'white' : 'black',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '14px'
});

export default MovieGrid;
