import React, { useEffect, useState } from 'react';

const API_URL = 'https://ley-tv.onrender.com';

function MovieGrid() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('movies');
  const [error, setError] = useState('');
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [streamUrl, setStreamUrl] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 🌍 Drapeaux et noms de langues (corrigé)
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
    return languages[langCode] || { flag: '🌐', name: langCode?.toUpperCase() || 'VO' };
  };

  // Charger les films avec pagination
  useEffect(() => {
    fetchItems();
  }, [category, page]);

  const fetchItems = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/api/${category}/popular?page=${page}`);
      const data = await response.json();
      
      let filmsArray = [];
      if (data.films && Array.isArray(data.films)) {
        filmsArray = data.films;
        setTotalPages(data.totalPages || 1);
      } else if (data.results && Array.isArray(data.results)) {
        filmsArray = data.results;
        setTotalPages(data.total_pages || 1);
      } else if (Array.isArray(data)) {
        filmsArray = data;
        setTotalPages(1);
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

  // Lire le film avec embed.su (moins de pubs)
  const playMovie = (movie) => {
    setSelectedMovie(movie);
    setStreamUrl(`https://embed.su/embed/movie/${movie.id}`);
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
          <span style={{ fontSize: '1.5rem', marginRight: '10px' }}>{langInfo.flag}</span>
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
        <button onClick={() => { setCategory('movies'); setPage(1); }} style={buttonStyle(category === 'movies')}>🎬 Films</button>
        <button onClick={() => { setCategory('anime'); setPage(1); }} style={buttonStyle(category === 'anime')}>🎌 Animes</button>
        <button onClick={() => { setCategory('dramas'); setPage(1); }} style={buttonStyle(category === 'dramas')}>📺 Dramas</button>
        <button onClick={() => { setCategory('arabic'); setPage(1); }} style={buttonStyle(category === 'arabic')}>🌍 Arabes</button>
      </div>

      {loading && <div>⏳ Chargement...</div>}
      {error && <div style={{ color: 'red' }}>❌ {error}</div>}

      {!loading && !error && items.length === 0 && (
        <div>Aucun film disponible</div>
      )}

      {items.length > 0 && (
        <>
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
                    backgroundColor: 'white',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
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
                    <h3 style={{ fontSize: '16px', margin: '0 0 8px 0', color: '#333' }}>
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

          {/* Pagination pour plus de films */}
          {totalPages > 1 && (
            <div style={{ marginTop: '30px', textAlign: 'center' }}>
              <button 
                onClick={() => setPage(p => Math.max(1, p-1))}
                disabled={page === 1}
                style={{
                  padding: '8px 16px',
                  marginRight: '10px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: page === 1 ? 'not-allowed' : 'pointer',
                  opacity: page === 1 ? 0.5 : 1
                }}
              >
                ← Précédent
              </button>
              <span style={{ margin: '0 15px', fontWeight: 'bold' }}>
                Page {page} / {totalPages}
              </span>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p+1))}
                disabled={page === totalPages}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: page === totalPages ? 'not-allowed' : 'pointer',
                  opacity: page === totalPages ? 0.5 : 1
                }}
              >
                Suivant →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Style des boutons de catégorie
const buttonStyle = (isActive) => ({
  padding: '10px 20px',
  backgroundColor: isActive ? '#007bff' : '#f0f0f0',
  color: isActive ? 'white' : 'black',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: isActive ? 'bold' : 'normal'
});

export default MovieGrid;
