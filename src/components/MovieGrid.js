import React, { useEffect, useState } from 'react';
import './MovieGrid.css';

const API_URL = 'https://ley-tv.onrender.com';

function MovieGrid() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('movies');
  const [error, setError] = useState('');
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [scrolled, setScrolled] = useState(false);

  // Détection du scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      
      let filmsArray = [];
      if (data.films && Array.isArray(data.films)) {
        filmsArray = data.films;
      } else if (data.results && Array.isArray(data.results)) {
        filmsArray = data.results;
      } else if (Array.isArray(data)) {
        filmsArray = data;
      }
      
      setItems(filmsArray);
      setTotalPages(data.totalPages || data.total_pages || 1);
    } catch (error) {
      setError('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  // Version simplifiée qui devrait marcher
  const playMovie = (movie) => {
    setSelectedMovie(movie);
  };

  const closePlayer = () => {
    setSelectedMovie(null);
  };

  // Lecteur intégré simplifié
  if (selectedMovie) {
    const langInfo = getLanguageInfo(selectedMovie.original_language);
    return (
      <div className="netflix-player">
        <button className="netflix-back-btn" onClick={closePlayer}>← Retour</button>
        <h1 className="netflix-player-title">{selectedMovie.title}</h1>
        <p className="netflix-player-meta">
          <span>{langInfo.flag} {langInfo.name}</span>
          {selectedMovie.year && <span> • {selectedMovie.year}</span>}
        </p>
        
        <iframe
          src={`https://vidsrc.xyz/embed/movie/${selectedMovie.id}`}
          className="netflix-player-iframe"
          allowFullScreen
          title={selectedMovie.title}
        />
      </div>
    );
  }

  return (
    <>
      <header className={`netflix-header ${scrolled ? 'scrolled' : ''}`}>
        <span className="netflix-logo">LeY Tv</span>
        <nav className="netflix-nav">
          <a href="#" onClick={(e) => { e.preventDefault(); setCategory('movies'); setPage(1); }} className={category === 'movies' ? 'active' : ''}>Films</a>
          <a href="#" onClick={(e) => { e.preventDefault(); setCategory('anime'); setPage(1); }} className={category === 'anime' ? 'active' : ''}>Animes</a>
          <a href="#" onClick={(e) => { e.preventDefault(); setCategory('dramas'); setPage(1); }} className={category === 'dramas' ? 'active' : ''}>Dramas</a>
          <a href="#" onClick={(e) => { e.preventDefault(); setCategory('arabic'); setPage(1); }} className={category === 'arabic' ? 'active' : ''}>Arabes</a>
        </nav>
      </header>

      <div style={{ paddingTop: '70px' }}>
        {/* Hero banner */}
        {!loading && items.length > 0 && page === 1 && (
          <div 
            className="netflix-hero" 
            style={{ 
              backgroundImage: `linear-gradient(90deg, rgba(0,0,0,0.8) 0%, transparent 50%), url(${items[0]?.image})`
            }}
          >
            <div className="netflix-hero-content">
              <h1 className="netflix-hero-title">{items[0]?.title}</h1>
              <p className="netflix-hero-description">{items[0]?.description}</p>
              <div className="netflix-hero-buttons">
                <button className="netflix-hero-btn play" onClick={() => playMovie(items[0])}>▶ Lecture</button>
              </div>
            </div>
          </div>
        )}

        {/* Section films */}
        <div className="netflix-section">
          <h2 className="netflix-section-title">
            {category === 'movies' && 'Films populaires'}
            {category === 'anime' && 'Animes populaires'}
            {category === 'dramas' && 'Dramas populaires'}
            {category === 'arabic' && 'Films arabes populaires'}
          </h2>

          {loading && <div className="netflix-loading">Chargement...</div>}
          {error && <div className="netflix-error">{error}</div>}

          {!loading && !error && items.length === 0 && (
            <div className="netflix-empty">Aucun film trouvé</div>
          )}

          {items.length > 0 && (
            <>
              <div className="netflix-row">
                {items.map((item) => {
                  if (!item || !item.id) return null;
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="netflix-pagination">
                  <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}>
                    ← Précédent
                  </button>
                  <span>{page} / {totalPages}</span>
                  <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages}>
                    Suivant →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default MovieGrid;
