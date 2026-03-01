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

  // 🌍 Fonction de mapping des langues (corrigée)
  const getLanguageInfo = (langCode) => {
    // Mapping spécial pour 'gb' qui doit être traité comme 'en'
    const normalizedCode = langCode === 'gb' ? 'en' : langCode;

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
    
    return languages[normalizedCode] || { flag: '🌐', name: langCode?.toUpperCase() || 'VO' };
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

      let filmsArray = [];
      if (data.films) filmsArray = data.films;
      else if (data.results) filmsArray = data.results;
      else if (Array.isArray(data)) filmsArray = data;

      setItems(filmsArray);
      setTotalPages(data.totalPages || data.total_pages || 1);
    } catch (error) {
      setError('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const fetchTrailer = async (movieId) => {
    setLoadingTrailer(true);
    setTrailerUrl('');
    try {
      const response = await fetch(`${API_URL}/api/movies/${movieId}/videos`);
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        // Cherche une bande-annonce en priorité
        const trailer = data.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');
        if (trailer) {
          setTrailerUrl(`https://www.youtube.com/watch?v=${trailer.key}`);
        } else {
          // Sinon, prend la première vidéo disponible
          setTrailerUrl(`https://www.youtube.com/watch?v=${data.results[0].key}`);
        }
      }
    } catch (error) {
      console.log('Pas de bande-annonce');
    } finally {
      setLoadingTrailer(false);
    }
  };

  const playMovie = (movie) => {
    setSelectedMovie(movie);
    setStreamUrl(`https://vidsrc.xyz/embed/movie/${movie.id}`);
    fetchTrailer(movie.id);
  };

  const closePlayer = () => {
    setSelectedMovie(null);
    setStreamUrl('');
    setTrailerUrl('');
  };

  // Lecteur
  if (selectedMovie) {
    const langInfo = getLanguageInfo(selectedMovie.original_language);
    return (
      <div style={styles.playerContainer}>
        <button onClick={closePlayer} style={styles.backButton}>← Retour</button>
        <h2>{selectedMovie.title}</h2>
        <p style={styles.meta}>
          <span>{langInfo.flag} {langInfo.name}</span>
          {selectedMovie.year && <span> • {selectedMovie.year}</span>}
        </p>

        {/* Bande-annonce */}
        <div style={styles.trailerSection}>
          {loadingTrailer && <p>Chargement de la bande-annonce...</p>}
          {!loadingTrailer && trailerUrl && (
            <a href={trailerUrl} target="_blank" rel="noopener noreferrer" style={styles.trailerButton}>
              ▶ Regarder la bande-annonce
            </a>
          )}
          {!loadingTrailer && !trailerUrl && (
            <p style={styles.noTrailer}>🎬 Aucune bande-annonce disponible</p>
          )}
        </div>

        {/* Description */}
        {selectedMovie.description && selectedMovie.description !== "Description non disponible" && (
          <div style={styles.description}>
            <h3>Synopsis</h3>
            <p>{selectedMovie.description}</p>
          </div>
        )}

        {/* Lecteur */}
        <iframe
          src={streamUrl}
          width="100%"
          height="500"
          style={styles.iframe}
          allowFullScreen
          title={selectedMovie.title}
        />
      </div>
    );
  }

  // Grille
  return (
    <div style={styles.container}>
      <div style={styles.categoryRow}>
        {['movies', 'anime', 'dramas', 'arabic'].map(cat => (
          <button
            key={cat}
            onClick={() => { setCategory(cat); setPage(1); }}
            style={buttonStyle(category === cat)}
          >
            {cat === 'movies' && '🎬 Films'}
            {cat === 'anime' && '🎌 Animes'}
            {cat === 'dramas' && '📺 Dramas'}
            {cat === 'arabic' && '🌍 Arabes'}
          </button>
        ))}
      </div>

      {loading && <div style={styles.centered}>⏳ Chargement...</div>}
      {error && <div style={{ ...styles.centered, color: 'red' }}>❌ {error}</div>}

      {!loading && !error && items.length === 0 && (
        <div style={styles.centered}>Aucun film disponible</div>
      )}

      {items.length > 0 && (
        <>
          <div style={styles.grid}>
            {items.map(item => {
              const langInfo = getLanguageInfo(item.original_language);
              return (
                <div key={item.id} onClick={() => playMovie(item)} style={styles.card}>
                  <img src={item.image} alt={item.title} style={styles.cardImage} />
                  <div style={styles.cardContent}>
                    <h3 style={styles.cardTitle}>{item.title}</h3>
                    <div style={styles.cardMeta}>
                      <span>{item.year || ''}</span>
                      <span>{langInfo.flag} {langInfo.name}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div style={styles.pagination}>
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} style={pageButtonStyle(page === 1)}>←</button>
              <span>{page} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages} style={pageButtonStyle(page === totalPages)}>→</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Styles
const styles = {
  container: { padding: '20px' },
  playerContainer: { padding: '20px' },
  backButton: { padding: '10px 20px', marginBottom: '20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  meta: { marginBottom: '15px', fontSize: '1.1rem' },
  trailerSection: { marginBottom: '20px' },
  trailerButton: { display: 'inline-block', padding: '10px 20px', backgroundColor: '#ff0000', color: 'white', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold' },
  noTrailer: { color: '#888', fontStyle: 'italic' },
  description: { marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', lineHeight: '1.6' },
  iframe: { border: 'none', borderRadius: '8px' },
  categoryRow: { marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' },
  centered: { textAlign: 'center', padding: '20px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' },
  card: { border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer', backgroundColor: 'white', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' },
  cardImage: { width: '100%', height: '250px', objectFit: 'cover' },
  cardContent: { padding: '12px' },
  cardTitle: { fontSize: '16px', margin: '0 0 8px 0' },
  cardMeta: { display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#666' },
  pagination: { marginTop: '30px', textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px' }
};

const buttonStyle = (isActive) => ({
  padding: '10px 20px',
  backgroundColor: isActive ? '#007bff' : '#f0f0f0',
  color: isActive ? 'white' : 'black',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer'
});

const pageButtonStyle = (isDisabled) => ({
  padding: '8px 16px',
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: isDisabled ? 'not-allowed' : 'pointer',
  opacity: isDisabled ? 0.5 : 1
});

export default MovieGrid;
