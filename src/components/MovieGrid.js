import React, { useEffect, useState } from 'react';
import PlyrPlayer from './PlyrPlayer';

const API_URL = 'https://ley-tv.onrender.com';

function MovieGrid() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('movies');
  const [filter, setFilter] = useState('popular');
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
        setItems(data.films);
        setTotalPages(data.totalPages || 1);
      } else {
        setItems([]);
        setError('Aucun résultat');
      }
    } catch (error) {
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
      setError('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const playMovie = (movie) => {
    setSelectedMovie(movie);
  };

  const closePlayer = () => {
    setSelectedMovie(null);
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

  // Utiliser PlyrPlayer quand un film est sélectionné
  if (selectedMovie) {
    return <PlyrPlayer movie={selectedMovie} onClose={closePlayer} />;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#141414', color: 'white' }}>
      {/* Header */}
      <header style={{
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
      }}>
        <span style={{ color: '#e50914', fontSize: '1.8rem', fontWeight: 'bold', marginRight: '40px', cursor: 'pointer' }}>
          LeY Tv
        </span>
        <nav style={{ display: 'flex', gap: '20px' }}>
          {[
            { id: 'movies', label: 'Films' },
            { id: 'anime', label: 'Animes' },
            { id: 'dramas', label: 'Dramas' },
            { id: 'arabic', label: 'Arabes' }
          ].map(cat => (
            <a
              key={cat.id}
              href="#"
              onClick={(e) => { e.preventDefault(); handleCategoryChange(cat.id); }}
              style={{
                color: category === cat.id ? 'white' : '#e5e5e5',
                textDecoration: 'none',
                fontSize: '0.9rem',
                fontWeight: category === cat.id ? 600 : 400,
                borderBottom: category === cat.id ? '2px solid #e50914' : 'none',
                paddingBottom: '4px',
                transition: 'color 0.3s'
              }}
            >
              {cat.label}
            </a>
          ))}
        </nav>
      </header>

      {/* Contenu principal */}
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
                padding: '12px 15px',
                background: '#333',
                border: 'none',
                borderRadius: '4px',
                color: 'white',
                fontSize: '1rem',
                outline: 'none'
              }}
            />
            <button type="submit" style={{
              padding: '12px 30px',
              background: '#e50914',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'background 0.3s'
            }}>
              Rechercher
            </button>
          </form>
        </div>

        {/* Filtres pour les films */}
        {category === 'movies' && !searchQuery && !selectedGenre && (
          <div style={{ padding: '0 60px 20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {[
              { id: 'popular', label: 'Populaires' },
              { id: 'trending', label: 'Tendances' },
              { id: 'top_rated', label: 'Mieux notés' },
              { id: 'upcoming', label: 'À venir' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                style={{
                  padding: '8px 20px',
                  background: filter === f.id ? '#e50914' : '#333',
                  color: 'white',
                  border: 'none',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}

        {/* Sélecteur de genres */}
        {category === 'movies' && !searchQuery && genres.length > 0 && (
          <div style={{
            padding: '0 60px 20px',
            overflowX: 'auto',
            whiteSpace: 'nowrap',
            scrollbarWidth: 'thin',
            scrollbarColor: '#e50914 #333'
          }}>
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
                  display: 'inline-block',
                  transition: 'all 0.3s'
                }}
              >
                {genre.name}
              </button>
            ))}
          </div>
        )}

        {/* Section films */}
        <div style={{ padding: '0 60px', marginBottom: '50px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 500, marginBottom: '20px' }}>
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

          {loading && <div style={{ textAlign: 'center', padding: '100px 0', color: '#e50914' }}>Chargement...</div>}
          {error && <div style={{ textAlign: 'center', padding: '100px 0', color: '#e50914' }}>{error}</div>}

          {!loading && !error && items.length === 0 && (
            <div style={{ textAlign: 'center', padding: '100px 0', color: '#666' }}>Aucun film trouvé</div>
          )}

          {items.length > 0 && (
            <>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: '8px'
              }}>
                {items.map((item) => {
                  if (!item || !item.id) return null;
                  const langInfo = getLanguageInfo(item.original_language);
                  return (
                    <div
                      key={item.id}
                      onClick={() => playMovie(item)}
                      style={{
                        position: 'relative',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        aspectRatio: '2/3',
                        transition: 'transform 0.3s',
                        transformOrigin: 'center'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.zIndex = '10';
                        e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.5)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.zIndex = '1';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <img
                        src={item.image}
                        alt={item.title}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.3s'
                        }}
                      />
                      <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
                        padding: '30px 10px 15px',
                        opacity: 0,
                        transition: 'opacity 0.3s'
                      }}
                      className="card-overlay">
                        <h3 style={{ margin: '0 0 5px', fontSize: '0.9rem', fontWeight: 600, color: 'white' }}>
                          {item.title}
                        </h3>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#ccc' }}>
                          {langInfo.flag} {langInfo.name} • {item.year || ''}
                          {item.rating && <span> • ⭐ {item.rating.toFixed(1)}</span>}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', margin: '50px 0' }}>
                  <button
                    onClick={() => setPage(p => Math.max(1, p-1))}
                    disabled={page === 1}
                    style={{
                      padding: '10px 25px',
                      background: '#333',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: page === 1 ? 'not-allowed' : 'pointer',
                      opacity: page === 1 ? 0.3 : 1,
                      transition: 'all 0.3s'
                    }}
                  >
                    ← Précédent
                  </button>
                  <span style={{ color: '#ccc', fontSize: '1.1rem' }}>{page} / {totalPages}</span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p+1))}
                    disabled={page === totalPages}
                    style={{
                      padding: '10px 25px',
                      background: '#333',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: page === totalPages ? 'not-allowed' : 'pointer',
                      opacity: page === totalPages ? 0.3 : 1,
                      transition: 'all 0.3s'
                    }}
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
