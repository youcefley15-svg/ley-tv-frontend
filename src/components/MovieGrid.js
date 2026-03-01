import React, { useEffect, useState } from 'react';

const API_URL = 'https://ley-tv.onrender.com';

function MovieGrid() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('movies');
  const [error, setError] = useState('');
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [streamUrl, setStreamUrl] = useState('');

  // Fonction pour obtenir la langue selon la catégorie et les données
  const getLanguageInfo = (item, cat) => {
    // 1. Si l'API fournit la langue, on l'utilise
    if (item.original_language) {
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
      return languages[item.original_language] || { flag: '🌐', name: item.original_language.toUpperCase() };
    }
    
    // 2. Sinon, on utilise la catégorie pour deviner
    switch(cat) {
      case 'anime':
        return { flag: '🇯🇵', name: 'Japonais' };
      case 'arabic':
        return { flag: '🇸🇦', name: 'Arabe' };
      case 'dramas':
        // Pour les dramas, on peut avoir plusieurs langues
        if (item.title && /[가-힣]/.test(item.title)) return { flag: '🇰🇷', name: 'Coréen' };
        if (item.title && /[一-龯]/.test(item.title)) return { flag: '🇨🇳', name: 'Chinois' };
        if (item.title && /[ぁ-んァ-ン]/.test(item.title)) return { flag: '🇯🇵', name: 'Japonais' };
        return { flag: '🌏', name: 'Asiatique' };
      default:
        return { flag: '🇬🇧', name: 'Anglais' };
    }
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
    const langInfo = getLanguageInfo(selectedMovie, category);
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
        <p style={{ marginBottom: '20px', fontSize: '1.1rem' }}>
          <span style={{ marginRight: '10px' }}>{langInfo.flag}</span>
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
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button onClick={() => setCategory('movies')} style={buttonStyle(category === 'movies')}>🎬 Films</button>
        <button onClick={() => setCategory('anime')} style={buttonStyle(category === 'anime')}>🎌 Animes</button>
        <button onClick={() => setCategory('dramas')} style={buttonStyle(category === 'dramas')}>📺 Dramas</button>
        <button onClick={() => setCategory('arabic')} style={buttonStyle(category === 'arabic')}>🌍 Arabes</button>
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
            const langInfo = getLanguageInfo(item, category);
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

// Fonction pour le style des boutons
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
