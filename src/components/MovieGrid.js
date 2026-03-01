import React, { useEffect, useState } from 'react';
import './MovieGrid.css'; // On va créer ce fichier

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

  const getLanguageInfo = (langCode) => {
    const normalizedCode = langCode === 'gb' ? 'en' : langCode;
    const languages = {
      'en': { flag: '🇬🇧', name: 'Anglais' },
      'fr': { flag: '🇫🇷', name: 'Français' },
      'ar': { flag: '🇸🇦', name: 'Arabe' },
      'ko': { flag: '🇰🇷', name: 'Coréen' },
      'ja': { flag: '🇯🇵', name: 'Japonais' },
      'zh': { flag: '🇨🇳', name: 'Chinois' },
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
      const filmsArray = data.films || data.results || [];
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
      if (data.results?.length > 0) {
        const trailer = data.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');
        setTrailerUrl(`https://www.youtube.com/watch?v=${(trailer || data.results[0]).key}`);
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

  // Netflix style : Lecteur
  if (selectedMovie) {
    const langInfo = getLanguageInfo(selectedMovie.original_language);
    return (
      <div className="netflix-player">
        <button className="netflix-back-btn" onClick={closePlayer}>← Retour</button>
        <h1 className="netflix-title">{selectedMovie.title}</h1>
        <p className="netflix-meta">
          <span>{langInfo.flag} {langInfo.name}</span>
          {selectedMovie.year && <span> • {selectedMovie.year}</span>}
        </p>

        {loadingTrailer && <p>Chargement...</p>}
        {!loadingTrailer && trailerUrl && (
          <a href={trailerUrl} target="_blank" rel="noopener noreferrer" className="netflix-trailer-btn">
            ▶ Bande-annonce
          </a>
        )}

        {selectedMovie.description && (
          <div className="netflix-description">
            <h3>Synopsis</h3>
            <p>{selectedMovie.description}</p>
          </div>
        )}

        <iframe src={streamUrl} className="netflix-iframe" allowFullScreen title={selectedMovie.title} />
      </div>
    );
  }

  // Netflix style : Grille
  return (
    <div className="netflix-container">
      <h1 className="netflix-logo">LeY Tv</h1>
      
      <div className="netflix-categories">
        {['movies', 'anime', 'dramas', 'arabic'].map(cat => (
          <button
            key={cat}
            className={`netflix-cat-btn ${category === cat ? 'active' : ''}`}
            onClick={() => { setCategory(cat); setPage(1); }}
          >
            {cat === 'movies' && 'Films'}
            {cat === 'anime' && 'Animes'}
            {cat === 'dramas' && 'Dramas'}
            {cat === 'arabic' && 'Arabes'}
          </button>
        ))}
      </div>

      {loading && <div className="netflix-loading">Chargement...</div>}
      {error && <div className="netflix-error">{error}</div>}

      {!loading && !error && items.length === 0 && (
        <div className="netflix-empty">Aucun film</div>
      )}

      {items.length > 0 && (
        <>
          <div className="netflix-row">
            {items.map(item => {
              const langInfo = getLanguageInfo(item.original_language);
              return (
                <div key={item.id} className="netflix-card" onClick={() => playMovie(item)}>
                  <img src={item.image} alt={item.title} className="netflix-card-img" />
                  <div className="netflix-card-overlay">
                    <h3>{item.title}</h3>
                    <p>{langInfo.flag} {langInfo.name} • {item.year || ''}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="netflix-pagination">
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}>←</button>
              <span>{page} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages}>→</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default MovieGrid;
