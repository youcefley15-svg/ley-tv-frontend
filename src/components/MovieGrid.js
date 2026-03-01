import React, { useEffect, useState } from 'react';

const API_URL = 'https://ley-tv.onrender.com';

function MovieGrid() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('movies');
  const [error, setError] = useState('');
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [streamUrl, setStreamUrl] = useState('');

  // Fonction pour obtenir le drapeau et le nom de la langue
  const getLanguageInfo = (langCode) => {
    const languages = {
      'en': { flag: '🇬🇧', name: 'Anglais' },
      'fr': { flag: '🇫🇷', name: 'Français' },
      'ar': { flag: '🇸🇦', name: 'Arabe' },
      'ko': { flag: '🇰🇷', name: 'Coréen' },
      'ja': { flag: '🇯🇵', name: 'Japonais' },
      'zh': { flag: '🇨🇳', name: 'Chinois' },
      'hi': { flag: '🇮🇳', name: 'Hindi' },
      'de': { flag: '🇩🇪', name: 'Allemand' },
      'es': { flag: '🇪🇸', name: 'Espagnol' },
      'it': { flag: '🇮🇹', name: 'Italien' },
      'pt': { flag: '🇵🇹', name: 'Portugais' },
      'ru': { flag: '🇷🇺', name: 'Russe' },
      'tr': { flag: '🇹🇷', name: 'Turc' }
    };
    return languages[langCode] || { flag: '🌐', name: langCode?.toUpperCase() || 'Inconnu' };
  };

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
    const langInfo = getLanguageInfo(selectedMovie.original_language);
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
        <p style={{ marginBottom: '20px' }}>
          <span style={{ fontSize: '1.2rem', marginRight: '10px' }}>{langInfo.flag}</span>
          {langInfo.name} • {selectedMovie.year || 'Année inconnue'}
        </p>
        
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
          {items.map(item => {
            const langInfo = getLanguageInfo(item.original_language);
            return (
              <div 
                key={item.id} 
                onClick={() => playMovie(item)}
                style={{ 
                  border: '1px solid #ddd', 
                  borderRadius: '8px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  backgroundColor: 'white'
                }}
              >
                <img 
                  src={item.image} 
                  alt={item.title} 
                  style={{ 
                    width: '100%', 
                    height: '250px', 
                    objectFit: 'cover' 
                  }}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x450?text=Image+non+disponible';
                  }}
                />
                <div style={{ padding: '12px' }}>
                  <h3 style={{ fontSize: '16px', margin: '0 0 8px 0' }}>
                    {item.title}
                  </h3>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    fontSize: '13px',
                    color: '#666'
                  }}>
                    <span>{item.year || 'N/A'}</span>
                    <span title={langInfo.name}>
                      {langInfo.flag} {langInfo.name}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MovieGrid;
