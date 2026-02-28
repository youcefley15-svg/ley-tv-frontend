import React, { useEffect, useState, useCallback } from 'react';

const API_URL = 'https://ley-tv.onrender.com';

function MovieGrid() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('movies');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [streamUrl, setStreamUrl] = useState('');
  const [loadingStream, setLoadingStream] = useState(false);

  const getLanguageName = (lang) => {
    const languages = {
      'en': '🇬🇧 Anglais',
      'fr': '🇫🇷 Français',
      'ar': '🇸🇦 Arabe',
      'ko': '🇰🇷 Coréen',
      'ja': '🇯🇵 Japonais',
      'zh': '🇨🇳 Chinois',
      'hi': '🇮🇳 Hindi',
      'de': '🇩🇪 Allemand',
      'es': '🇪🇸 Espagnol',
      'it': '🇮🇹 Italien'
    };
    return languages[lang] || `🌐 ${lang.toUpperCase()}`;
  };

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/${category}/popular?page=${page}`);
      const data = await response.json();
      
      if (data.films) {
        setItems(data.films);
        setTotalPages(data.totalPages || 1);
      } else if (Array.isArray(data)) {
        setItems(data);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Erreur chargement:', error);
    } finally {
      setLoading(false);
    }
  }, [category, page]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const playMovie = async (movie) => {
    try {
      setSelectedMovie(movie);
      setStreamUrl('');
      setLoadingStream(true);
      
      // Afficher un message sur la langue
      const langMsg = movie.original_language === 'fr' 
        ? '🇫🇷 Film français (VO française)'
        : movie.original_language === 'en'
        ? '🇬🇧 Film anglais (VO anglaise)'
        : `${getLanguageName(movie.original_language)} (VO)`;
      
      // On peut l'afficher dans la console ou dans l'interface
      console.log('Langue:', langMsg);
      
      const response = await fetch(`${API_URL}/api/movies/${movie.id}/stream`);
      const data = await response.json();
      
      if (data.embed) {
        setStreamUrl(data.embed);
      } else {
        alert('Lien de streaming non disponible');
      }
    } catch (error) {
      console.error('Erreur lecture:', error);
      alert('Impossible de lire ce film');
    } finally {
      setLoadingStream(false);
    }
  };

  const closePlayer = () => {
    setSelectedMovie(null);
    setStreamUrl('');
  };

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
      {!selectedMovie ? (
        <>
          <div style={{ marginBottom: '20px' }}>
            <button onClick={() => { setCategory('movies'); setPage(1); }} style={getButtonStyle('movies')}>🎬 Films</button>
            <button onClick={() => { setCategory('anime'); setPage(1); }} style={getButtonStyle('anime')}>🎌 Animes</button>
            <button onClick={() => { setCategory('dramas'); setPage(1); }} style={getButtonStyle('dramas')}>📺 Dramas</button>
            <button onClick={() => { setCategory('arabic'); setPage(1); }} style={getButtonStyle('arabic')}>🌍 Arabes</button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px' }}>⏳ Chargement...</div>
          ) : (
            <>
              <h2>
                {category === 'movies' && 'Films populaires'}
                {category === 'anime' && 'Animes populaires'}
                {category === 'dramas' && 'Dramas populaires'}
                {category === 'arabic' && 'Films arabes populaires'}
              </h2>
              
              {items.length === 0 ? (
                <p>Aucun contenu trouvé</p>
              ) : (
                <>
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
                          transition: 'transform 0.2s'
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
                            e.target.src = 'https://via.placeholder.com/200x250?text=Image+non+disponible';
                          }}
                        />
                        <div style={{ padding: '10px' }}>
                          <h3 style={{ fontSize: '16px', margin: 0 }}>{item.title}</h3>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '5px' }}>
                            {item.year && <span style={{ color: '#666', fontSize: '12px' }}>{item.year}</span>}
                            {item.original_language && (
                              <span style={{ 
                                backgroundColor: '#f0f0f0', 
                                padding: '2px 6px', 
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: 'bold'
                              }}>
                                {getLanguageName(item.original_language)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {totalPages > 1 && (
                    <div style={{ marginTop: '30px', textAlign: 'center' }}>
                      <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}>← Précédent</button>
                      <span style={{ margin: '0 15px' }}>Page {page} / {totalPages}</span>
                      <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages}>Suivant →</button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </>
      ) : (
        <div>
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
          <p style={{ marginBottom: '20px', color: '#666' }}>
            {getLanguageName(selectedMovie.original_language)} • {selectedMovie.year || 'Année inconnue'}
          </p>
          
          {loadingStream ? (
            <p>🔍 Chargement du lecteur...</p>
          ) : streamUrl ? (
            <iframe
              src={streamUrl}
              width="100%"
              height="500"
              style={{ border: 'none', borderRadius: '8px' }}
              allowFullScreen
              title={selectedMovie.title}
            />
          ) : (
            <p>Aucune source disponible</p>
          )}
        </div>
      )}
    </div>
  );
}

export default MovieGrid;
