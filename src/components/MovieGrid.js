import React, { useEffect, useState } from 'react';

const API_URL = 'https://ley-tv.onrender.com';

function MovieGrid() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('movies');
  const [filter, setFilter] = useState('popular');
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
    setError('');
    try {
      let endpoint = '';
      
      if (category === 'movies') {
        switch(filter) {
          case 'trending':
            endpoint = `${API_URL}/api/movies/trending?timeWindow=day&page=${page}`;
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
      
      if (data.films) {
        setItems(data.films);
        setTotalPages(data.totalPages || 1);
      } else {
        setItems([]);
        setError('Aucun film trouvé');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const searchMovies = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/api/movies/search?query=${encodeURIComponent(searchQuery)}&page=${page}`);
      const data = await response.json();
      
      if (data.films) {
        setSearchResults(data.films);
        setItems(data.films);
        setTotalPages(data.totalPages || 1);
      } else {
        setItems([]);
        setError('Aucun résultat');
      }
    } catch (error) {
      console.error('Erreur recherche:', error);
      setError('Erreur de recherche');
    } finally {
      setLoading(false);
    }
  };

  const fetchByGenre = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/api/movies/genre/${selectedGenre}?page=${page}`);
      const data = await response.json();
      
      if (data.films) {
        setItems(data.films);
        setTotalPages(data.totalPages || 1);
      } else {
        setItems([]);
        setError('Aucun film dans ce genre');
      }
    } catch (error) {
      console.error('Erreur genre:', error);
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
    setSearchQuery('');
  };

  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
    setSelectedGenre(null);
    setFilter('popular');
    setSearchQuery('');
    setPage(1);
  };

  // Styles
  const styles = {
    container: {
      backgroundColor: '#141414',
      color: 'white',
      fontFamily: 'Netflix Sans, Helvetica Neue, sans-serif',
      minHeight: '100vh'
    },
    header: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '68px',
      background: scrolled ? '#141414' : 'linear-gradient(180deg, rgba(0,0,0,0.8) 0%, transparent)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 60px',
      zIndex: 1000,
      transition: 'background 0.3s'
    },
    logo: {
      color: '#e50914',
      fontSize: '1.8rem',
      fontWeight: 'bold',
      marginRight: '40px',
      cursor: 'pointer'
    },
    nav: {
      display: 'flex',
      gap: '20px'
    },
    navLink: {
      color: '#e5e5e5',
      textDecoration: 'none',
      fontSize: '0.9rem',
      cursor: 'pointer',
      transition: 'color 0.3s'
    },
    navLinkActive: {
      color: 'white',
      fontWeight: 600,
      borderBottom: '2px solid #e50914',
      paddingBottom: '4px'
    },
    hero: {
      height: '80vh',
      minHeight: '600px',
      position: 'relative',
      marginBottom: '40px',
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    },
    heroOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(90deg, rgba(0,0,0,0.8) 0%, transparent 70%)'
    },
    heroContent: {
      position: 'absolute',
      bottom: '30%',
      left: '60px',
      maxWidth: '600px',
      zIndex: 10
    },
    heroTitle: {
      fontSize: '3.5rem',
      fontWeight: 'bold',
      marginBottom: '20px',
      textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
    },
    heroDesc: {
      fontSize: '1.1rem',
      lineHeight: 1.5,
      marginBottom: '25px',
      color: '#e5e5e5',
      maxHeight: '3.3rem',
      overflow: 'hidden'
    },
    heroButtons: {
      display: 'flex',
      gap: '15px'
    },
    playBtn: {
      padding: '12px 30px',
      background: 'white',
      color: 'black',
      border: 'none',
      borderRadius: '4px',
      fontWeight: 600,
      cursor: 'pointer',
      fontSize: '1.1rem',
      transition: 'all 0.3s'
    },
    infoBtn: {
      padding: '12px 30px',
      background: 'rgba(109,109,110,0.7)',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      fontWeight: 600,
      cursor: 'pointer',
      fontSize: '1.1rem',
      transition: 'all 0.3s'
    },
    section: {
      padding: '0 60px',
      marginBottom: '50px'
    },
    sectionTitle: {
      fontSize: '1.5rem',
      fontWeight: 500,
      marginBottom: '20px',
      color: 'white'
    },
    row: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
      gap: '8px'
    },
    card: {
      position: 'relative',
      borderRadius: '4px',
      overflow: 'hidden',
      cursor: 'pointer',
      transition: 'transform 0.3s',
      aspectRatio: '2/3'
    },
    cardImage: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    },
    cardOverlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
      padding: '30px 10px 15px',
      opacity: 0,
      transition: 'opacity 0.3s'
    },
    cardTitle: {
      margin: '0 0 5px 0',
      fontSize: '0.9rem',
      fontWeight: 600
    },
    cardMeta: {
      margin: 0,
      fontSize: '0.8rem',
      color: '#ccc'
    },
    player: {
      minHeight: '100vh',
      background: '#141414',
      padding: '90px 60px 30px'
    },
    backBtn: {
      background: 'transparent',
      color: 'white',
      border: 'none',
      fontSize: '1rem',
      cursor: 'pointer',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '5px',
      padding: '8px 0'
    },
    playerTitle: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      marginBottom: '15px'
    },
    playerMeta: {
      color: '#ccc',
      marginBottom: '25px',
      fontSize: '1.1rem',
      display: 'flex',
      gap: '20px'
    },
    iframe: {
      width: '100%',
      height: '70vh',
      border: 'none',
      borderRadius: '8px',
      background: '#000'
    },
    searchContainer: {
      padding: '20px 60px'
    },
    searchForm: {
      display: 'flex',
      gap: '10px'
    },
    searchInput: {
      flex: 1,
      padding: '12px',
      background: '#333',
      border: 'none',
      borderRadius: '4px',
      color: 'white',
      fontSize: '1rem'
    },
    searchBtn: {
      padding: '12px 30px',
      background: '#e50914',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontWeight: 'bold'
    },
    filterContainer: {
      padding: '0 60px 20px',
      display: 'flex',
      gap: '10px',
      flexWrap: 'wrap'
    },
    filterBtn: {
      padding: '8px 20px',
      background: '#333',
      color: 'white',
      border: 'none',
      borderRadius: '20px',
      cursor: 'pointer',
      fontSize: '0.9rem',
      transition: 'all 0.3s'
    },
    filterBtnActive: {
      background: '#e50914'
    },
    genresContainer: {
      padding: '0 60px 20px',
      overflowX: 'auto',
      whiteSpace: 'nowrap'
    },
    genreBtn: {
      padding: '8px 16px',
      margin: '0 5px',
      background: '#333',
      color: 'white',
      border: 'none',
      borderRadius: '20px',
      cursor: 'pointer',
      display: 'inline-block'
    },
    genreBtnActive: {
      background: '#e50914'
    },
    pagination: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '20px',
      margin: '50px 0'
    },
    paginationBtn: {
      background: '#333',
      color: 'white',
      border: 'none',
      padding: '10px 25px',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '1rem'
    },
    paginationBtnDisabled: {
      opacity: 0.3,
      cursor: 'not-allowed'
    },
    paginationSpan: {
      color: '#ccc',
      fontSize: '1.1rem'
    },
    loading: {
      textAlign: 'center',
      padding: '100px 0',
      color: '#e50914',
      fontSize: '1.2rem'
    },
    error: {
      textAlign: 'center',
      padding: '100px 0',
      color: '#e50914',
      fontSize: '1.2rem'
    },
    empty: {
      textAlign: 'center',
      padding: '100px 0',
      color: '#666',
      fontSize: '1.2rem'
    }
  };

  // Lecteur
  if (selectedMovie) {
    const langInfo = getLanguageInfo(selectedMovie.original_language);
    return (
      <div style={styles.player}>
        <button style={styles.backBtn} onClick={closePlayer}>← Retour</button>
        <h1 style={styles.playerTitle}>{selectedMovie.title}</h1>
        <div style={styles.playerMeta}>
          <span>{langInfo.flag} {langInfo.name}</span>
          {selectedMovie.year && <span> • {selectedMovie.year}</span>}
          {selectedMovie.rating && <span> • ⭐ {selectedMovie.rating.toFixed(1)}</span>}
        </div>
        
        {loadingTrailer && <p>Chargement...</p>}
        {!loadingTrailer && trailerUrl && (
          <div style={{ marginBottom: '20px' }}>
            <a href={trailerUrl} target="_blank" rel="noopener noreferrer" style={styles.playBtn}>
              ▶ Bande-annonce
            </a>
          </div>
        )}

        <iframe
          src={streamUrl}
          style={styles.iframe}
          allowFullScreen
          title={selectedMovie.title}
        />
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <span style={styles.logo}>LeY Tv</span>
        <nav style={styles.nav}>
          <a href="#" style={{...styles.navLink, ...(category === 'movies' && !selectedGenre ? styles.navLinkActive : {})}} onClick={(e) => { e.preventDefault(); handleCategoryChange('movies'); }}>Films</a>
          <a href="#" style={{...styles.navLink, ...(category === 'anime' ? styles.navLinkActive : {})}} onClick={(e) => { e.preventDefault(); handleCategoryChange('anime'); }}>Animes</a>
          <a href="#" style={{...styles.navLink, ...(category === 'dramas' ? styles.navLinkActive : {})}} onClick={(e) => { e.preventDefault(); handleCategoryChange('dramas'); }}>Dramas</a>
          <a href="#" style={{...styles.navLink, ...(category === 'arabic' ? styles.navLinkActive : {})}} onClick={(e) => { e.preventDefault(); handleCategoryChange('arabic'); }}>Arabes</a>
        </nav>
      </header>

      <div style={{ paddingTop: '70px' }}>
        {/* Barre de recherche */}
        <div style={styles.searchContainer}>
          <form style={styles.searchForm} onSubmit={handleSearch}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un film..."
              style={styles.searchInput}
            />
            <button type="submit" style={styles.searchBtn}>
              Rechercher
            </button>
          </form>
        </div>

        {/* Filtres pour les films */}
        {category === 'movies' && !searchQuery && !selectedGenre && (
          <div style={styles.filterContainer}>
            <button onClick={() => setFilter('popular')} style={{...styles.filterBtn, ...(filter === 'popular' ? styles.filterBtnActive : {})}}>Populaires</button>
            <button onClick={() => setFilter('trending')} style={{...styles.filterBtn, ...(filter === 'trending' ? styles.filterBtnActive : {})}}>Tendances</button>
            <button onClick={() => setFilter('top_rated')} style={{...styles.filterBtn, ...(filter === 'top_rated' ? styles.filterBtnActive : {})}}>Mieux notés</button>
            <button onClick={() => setFilter('upcoming')} style={{...styles.filterBtn, ...(filter === 'upcoming' ? styles.filterBtnActive : {})}}>À venir</button>
          </div>
        )}

        {/* Sélecteur de genres */}
        {category === 'movies' && !searchQuery && genres.length > 0 && (
          <div style={styles.genresContainer}>
            {genres.map(genre => (
              <button
                key={genre.id}
                onClick={() => handleGenreChange(genre.id)}
                style={{...styles.genreBtn, ...(selectedGenre === genre.id ? styles.genreBtnActive : {})}}
              >
                {genre.name}
              </button>
            ))}
          </div>
        )}

        {/* Section films */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
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

          {loading && <div style={styles.loading}>Chargement...</div>}
          {error && <div style={styles.error}>{error}</div>}

          {!loading && !error && items.length === 0 && (
            <div style={styles.empty}>Aucun film trouvé</div>
          )}

          {items.length > 0 && (
            <>
              <div style={styles.row}>
                {items.map((item) => {
                  if (!item || !item.id) return null;
                  const langInfo = getLanguageInfo(item.original_language);
                  return (
                    <div 
                      key={item.id} 
                      style={styles.card} 
                      onClick={() => playMovie(item)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.zIndex = '10';
                        e.currentTarget.querySelector('.card-overlay').style.opacity = '1';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.zIndex = '1';
                        e.currentTarget.querySelector('.card-overlay').style.opacity = '0';
                      }}
                    >
                      <img src={item.image} alt={item.title} style={styles.cardImage} />
                      <div className="card-overlay" style={styles.cardOverlay}>
                        <h3 style={styles.cardTitle}>{item.title}</h3>
                        <p style={styles.cardMeta}>
                          {langInfo.flag} {langInfo.name} • {item.year || ''}
                          {item.rating && <span> • ⭐ {item.rating.toFixed(1)}</span>}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div style={styles.pagination}>
                  <button 
                    onClick={() => setPage(p => Math.max(1, p-1))} 
                    disabled={page === 1}
                    style={{...styles.paginationBtn, ...(page === 1 ? styles.paginationBtnDisabled : {})}}
                  >
                    ← Précédent
                  </button>
                  <span style={styles.paginationSpan}>{page} / {totalPages}</span>
                  <button 
                    onClick={() => setPage(p => Math.min(totalPages, p+1))} 
                    disabled={page === totalPages}
                    style={{...styles.paginationBtn, ...(page === totalPages ? styles.paginationBtnDisabled : {})}}
                  >
                    Suivant →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default MovieGrid;
