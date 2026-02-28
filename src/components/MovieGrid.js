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
      'zh': '🇨🇳 Chinois'
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
      
      console.log('🎬 Tentative pour:', movie.title);
      
      const response = await fetch(`${API_URL}/api/movies/${movie.id}/stream`);
      const data = await response.json();
      
      if (data.embed) {
        console.log('✅ Source trouvée');
        setStreamUrl(data.embed);
      } else {
        console.log('⚠️ Source de secours');
        setStreamUrl(`https://vidsrc.to/embed/movie/${movie.id}`);
      }
      
    } catch (error) {
      console.error('❌ Erreur:', error);
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
    cursor: 'pointer'
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
            <div>⏳ Chargement...</div>
          ) : (
            <>
              <h2>
                {category === 'movies' && 'Films populaires'}
                {category === 'anime' && 'Animes populaires'}
                {category === 'dramas' && 'Dramas populaires'}
                {category === 'arabic' && 'Films arabes populaires'}
              </h2>
              
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
                      cursor: 'pointer'
                    }}
                  >
                    <img src={item.image} alt={item.title} style={{ width: '100%', height: '250px' }} />
                    <div style={{ padding: '10px' }}>
                      <h3 style={{ fontSize: '16px', margin: 0 }}>{item.title}</h3>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
                        {item.year && <span>{item.year}</span>}
                        {item.original_language && <span>{getLanguageName(item.original_language)}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {totalPages > 1 && (
                <div style={{ marginTop: '30px', textAlign: 'center' }}>
                  <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}>← Précédent</button>
                  <span> Page {page} / {totalPages} </span>
                  <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages}>Suivant →</button>
                </div>
              )}
            </>
          )}
        </>
      ) : (
        <div>
          <button onClick={closePlayer} style={{ padding: '10px 20px', marginBottom: '20px' }}>← Retour</button>
          <h2>{selectedMovie.title}</h2>
          
          {loadingStream ? (
            <p>Chargement...</p>
          ) : streamUrl ? (
            <iframe
              src={streamUrl}
              width="100%"
              height="500"
              style={{ border: 'none' }}
              allowFullScreen
              title={selectedMovie.title}
            />
          ) : (
            <p>Aucune source</p>
          )}
        </div>
      )}
    </div>
  );
}

export default MovieGrid;
