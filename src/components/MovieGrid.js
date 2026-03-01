import React, { useEffect, useState } from 'react';

const API_URL = 'https://ley-tv.onrender.com';

function MovieGrid() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('movies');
  const [error, setError] = useState('');
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [streamUrl, setStreamUrl] = useState('');
  const [trailerUrl, setTrailerUrl] = useState('');
  const [loadingTrailer, setLoadingTrailer] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 🌍 Drapeaux et noms de langues
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

  useEffect(() => {
    fetchItems();
  }, [category, page]);

  const fetchItems = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/api/${category}/popular?page=${page}`);
      const data = await response.json();
      
      console.log('📦 Données reçues:', data);
      
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
        setItems([]);
      }
    } catch (error) {
      console.error('❌ Erreur:', error);
      setError('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour charger la bande-annonce
  const fetchTrailer = async (movieId) => {
    setLoadingTrailer(true);
    try {
      const response = await fetch(`${API_URL}/api/movies/${movieId}/videos`);
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const trailer = data.results.find(video => video.type === 'Trailer' && video.site === 'YouTube');
        if (trailer) {
          setTrailerUrl(`https://www.youtube.com/watch?v=${trailer.key}`);
        } else {
          setTrailerUrl(`https://www.youtube.com/watch?v=${data.results[0].key}`);
        }
      } else {
        setTrailerUrl(null);
      }
    } catch (error) {
      console.error('Erreur chargement bande-annonce:', error);
      setTrailerUrl(null);
    } finally {
      setLoadingTrailer(false);
    }
  };

  const playMovie = (movie) => {
    setSelectedMovie(movie);
    setStreamUrl(`https://vidsrc.xyz/embed/movie/${movie.id}`);
    setTrailerUrl('');
    fetchTrailer(movie.id);
  };

  const closePlayer = () => {
    setSelectedMovie(null);
    setStreamUrl('');
    setTrailerUrl('');
  };

  // Affichage du lecteur
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
        
        {/* Langue et année */}
        <p style={{ marginBottom: '15px', fontSize: '1.1rem' }}>
          <span style={{ marginRight: '15px' }}>{langInfo.flag} {langInfo.name}</span>
          {selectedMovie.year && <span>📅 {selectedMovie.year}</span>}
        </p>

        {/* Bande-annonce */}
        {loadingTrailer ? (
          <p>Chargement de la bande-annonce...</p>
        ) : trailerUrl ? (
          <div style={{ marginBottom: '20px' }}>
            <a
              href={trailerUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                padding: '10px 20px',
                backgroundColor: '#ff0000',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '4px',
                fontWeight: 'bold'
              }}
            >
              ▶ Regarder la bande-annonce
            </a>
          </div>
        ) : null}

        {/* Description */}
        {selectedMovie.description && (
          <div style={{ 
            marginBottom: '20px', 
            padding: '15px', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '8px',
            lineHeight: '1.6'
          }}>
            <h3 style={{ marginTop: 0 }}>Synopsis</h3>
            <p style={{ margin: 0 }}>{selectedMovie.description}</p>
          </div>
        )}

        {/* Lecteur */}
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

  // Grille des films
  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button onClick={() => { setCategory('movies'); setPage(1); }} style={buttonStyle(category === 'movies')}>🎬 Films</button>
        <button onClick={() => { setCategory('anime'); setPage(1); }} style={buttonStyle(category === 'anime')}>🎌 Animes</button>
        <button onClick={() => { setCategory('dramas'); setPage(1); }} style={buttonStyle(category === 'dramas')}>📺 Dramas</button>
        <button onClick={() => { setCategory('arabic'); setPage(1); }} style={buttonStyle(category === 'arabic')}>🌍 Arabes</button>
      </div>

      {loading && <div style={{ textAlign: 'center', padding: '20px' }}>⏳ Chargement...</div>}
      {error && <div style={{ color: 'red', textAlign: 'center' }}>❌ {error}</div>}

      {!loading && !error && items.length === 0 && (
        <div style={{ textAlign: 'center' }}>Aucun film disponible</div>
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
                    backgroundColor: 'white',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                    transition: 'transform 0.2s'
                  }}
                >
                  <img 
                    src={item.image || 'https://via.placeholder.com/300x450'} 
                    alt={item.title} 
                    style={{ 
                      width: '100%', 
                      height: '250px', 
                      objectFit: 'cover' 
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

          {/* Pagination */}
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
