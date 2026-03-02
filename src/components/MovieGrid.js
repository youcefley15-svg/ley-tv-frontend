import React, { useEffect, useState } from 'react';
import './MovieGrid.css';

const API_URL = 'https://ley-tv.onrender.com';

function MovieGrid() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('movies');
  const [filter, setFilter] = useState('popular'); // popular, trending, top_rated, upcoming
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [error, setError] = useState('');
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [streamUrl, setStreamUrl] = useState('');
  const [trailerUrl, setTrailerUrl] = useState('');
  const [loadingTrailer, setLoadingTrailer] = useState(false);
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

  // Charger les genres au démarrage
  useEffect(() => {
    fetchGenres();
  }, []);

  const fetchGenres = async () => {
    try {
      const response = await fetch(`${API_URL}/api/movies/genres`);
      const data = await response.json();
      setGenres(data);
    } catch (error) {
      console.error('Erreur chargement genres:', error);
    }
  };

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
    if (searchQuery) {
      searchMovies();
    } else if (selectedGenre) {
      fetchByGenre();
    } else {
      fetchItems();
    }
  }, [category, filter, selectedGenre, page, searchQuery]);

  const fetchItems = async () => {
    setLoading(true);
    setSearchResults(null);
    try {
      let endpoint = '';
      
      if (category === 'movies') {
        switch(filter) {
          case 'trending':
            endpoint = `${API_URL}/api/movies/trending?timeWindow=day`;
            break;
          case 'top_rated':
            endpoint = `${API_URL}/api/movies/top-rated?page=${page}`;
            break;
          case 'upcoming':
            endpoint = `${API_URL}/api/movies/upcoming?page=${page}`;
            break;
          default:
            endpoint = `${API_URL}/api/movies/popular?page=${page}`;
        }
      } else {
        endpoint = `${API_URL}/api/${category}/popular?page=${page}`;
      }
      
      const response = await fetch(endpoint);
      const data = await response.json();
      
      setItems(data.films || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      setError('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const searchMovies = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/movies/search?query=${encodeURIComponent(searchQuery)}&page=${page}`);
      const data = await response.json();
      setSearchResults(data.films);
      setItems(data.films || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      setError('Erreur de recherche');
    } finally {
      setLoading(false);
    }
  };

  const fetchByGenre = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/movies/genre/${selectedGenre}?page=${page}`);
      const data = await response.json();
      setItems(data.films || []);
    } catch (error) {
      setError('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const fetchTrailer = async (movieId) => {
    setLoadingTrailer(true);
    try {
      const response = await fetch(`${API_URL}/api/movies/${movieId}/videos`);
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const trailer = data.results.find(v => v.type === 'Trailer');
        if (trailer) {
          setTrailerUrl(`https://www.youtube.com/watch?v=${trailer.key}`);
        }
      }
    } catch (error) {
      console.log('Pas de trailer');
    } finally {
      setLoadingTrailer(false);
    }
  };

  const playMovie = async (movie) => {
    setSelectedMovie(movie);
    setStreamUrl(`https://vidsrc.xyz/embed/movie/${movie.id}`);
    await fetchTrailer(movie.id);
  };

  const closePlayer = () => {
    setSelectedMovie(null);
    setStreamUrl('');
    setTrailerUrl('');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setPage(1);
      searchMovies();
    }
  };

  const handleGenreChange = (genreId) => {
    setSelectedGenre(genreId);
    setFilter(null);
    setPage(1);
  };

  // Lecteur
  if (selectedMovie) {
    const langInfo = getLanguageInfo(selectedMovie.original_language);
    return (
      <div className="netflix-player">
        <button className="netflix-back-btn" onClick={closePlayer}>← Retour</button>
        <h1 className="netflix-player-title">{selectedMovie.title}</h1>
        <p className="netflix-player-meta">
          <span>{langInfo.flag} {langInfo.name}</span>
          {selectedMovie.year && <span> • {selectedMovie.year}</span>}
          {selectedMovie.rating && <span> • ⭐ {selectedMovie.rating.toFixed(1)}</span>}
        </p>
        
        {loadingTrailer && <p>Chargement...</p>}
        {!loadingTrailer && trailerUrl && (
          <div style={{ marginBottom: '20px' }}>
            <a href={trailerUrl} target="_blank" rel="noopener noreferrer" className="netflix-hero-btn play">
              ▶ Bande-annonce
            </a>
          </div>
        )}

        <iframe
          src={streamUrl}
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
          <a href="#" onClick={(e) => { e.preventDefault(); setCategory('movies'); setSelectedGenre(null); setFilter('popular'); }} className={category === 'movies' && !selectedGenre ? 'active' : ''}>Films</a>
          <a href="#" onClick={(e) => { e.preventDefault(); setCategory('anime'); setSelectedGenre(null); }} className={category === 'anime' ? 'active' : ''}>Animes</a>
          <a href="#" onClick={(e) => { e.preventDefault(); setCategory('dramas'); setSelectedGenre(null); }} className={category === 'dramas' ? 'active' : ''}>Dramas</a>
          <a href="#" onClick={(e) => { e.preventDefault(); setCategory('arabic'); setSelectedGenre(null); }} className={category === 'arabic' ? 'active' : ''}>Arabes</a>
        </nav>
      </header>

      <div style={{ paddingTop: '70px' }}>
        {/* Barre de recherche */}
        <div style={{ padding: '20px 60px' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un film..."
              style={{
                flex: 1,
                padding: '12px',
                background: '#333',
                border: 'none',
                borderRadius: '4px',
                color: 'white',
                fontSize: '1rem'
              }}
            />
            <button
              type="submit"
              style={{
                padding: '12px 30px',
                background: '#e50914',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Rechercher
            </button>
          </form>
        </div>

        {/* Filtres pour les films */}
        {category === 'movies' && !searchQuery && !selectedGenre && (
          <div style={{ padding: '0 60px 20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button onClick={() => setFilter('popular')} className={`netflix-filter-btn ${filter === 'popular' ? 'active' : ''}`}>Populaires</button>
            <button onClick={() => setFilter('trending')} className={`netflix-filter-btn ${filter === 'trending' ? 'active' : ''}`}>Tendances</button>
            <button onClick={() => setFilter('top_rated')} className={`netflix-filter-btn ${filter === 'top_rated' ? 'active' : ''}`}>Mieux notés</button>
            <button onClick={() => setFilter('upcoming')} className={`netflix-filter-btn ${filter === 'upcoming' ? 'active' : ''}`}>À venir</button>
          </div>
        )}

        {/* Sélecteur de genres */}
        {category === 'movies' && !searchQuery && genres.length > 0 && (
          <div style={{ padding: '0 60px 20px', overflowX: 'auto', whiteSpace: 'nowrap' }}>
            {genres.map(genre => (
              <button
                key={genre.id}
                onClick={() => handleGenreChange(genre.id)}
                style={{
                  padding: '8px 16px',
                  margin: '0 5px',
                  background: selectedGenre === genre.id ? '#e50914' : '#333',
                  color: 'white',
                  border: 'none',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  display: 'inline-block'
                }}
              >
                {genre.name}
              </button>
            ))}
          </div>
        )}

        {/* Section films */}
        <div className="netflix-section">
          <h2 className="netflix-section-title">
            {searchQuery ? `Résultats pour "${searchQuery}"` : 
             selectedGenre ? genres.find(g => g.id === selectedGenre)?.name :
             category === 'movies' ? 
               filter === 'popular' ? 'Films populaires' :
               filter === 'trending' ? 'Tendances du moment' :
               filter === 'top_rated' ? 'Les mieux notés' :
               'Films à venir' :
             category === 'anime' ? 'Animes populaires' :
             category === 'dramas' ? 'Dramas populaires' :
             'Films arabes populaires'}
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
                        <p>
                          {langInfo.flag} {langInfo.name} • {item.year || ''}
                          {item.rating && <span> • ⭐ {item.rating.toFixed(1)}</span>}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

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

      {/* Navigation en bas */}
      <nav className="netflix-bottom-nav">
        <a href="#" onClick={(e) => { e.preventDefault(); setSearchQuery(''); setSelectedGenre(null); setFilter('popular'); }} className="active">Accueil</a>
        <a href="#" onClick={(e) => { e.preventDefault(); setFilter('upcoming'); }}>Tout nouveau</a>
        <a href="#">Mon Netflix</a>
      </nav>

      {/* Style pour les filtres */}
      <style>{`
        .netflix-filter-btn {
          padding: 8px 20px;
          background: #333;
          color: white;
          border: none;
          border-radius: 20px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.3s;
        }
        .netflix-filter-btn:hover,
        .netflix-filter-btn.active {
          background: #e50914;
        }
      `}</style>
    </>
  );
}

export default MovieGrid;
