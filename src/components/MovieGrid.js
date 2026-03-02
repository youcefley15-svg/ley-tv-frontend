import React, { useEffect, useState } from 'react';
import './MovieGrid.css';  // ← IMPORTANT !

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

  useEffect(() => {
    fetchItems();
  }, [category, page]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/${category}/popular?page=${page}`);
      const data = await response.json();
      
      if (data.films) {
        setItems(data.films);
        setTotalPages(data.totalPages || 1);
      }
    } catch (error) {
      setError('Erreur');
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

  if (selectedMovie) {
    return (
      <div className="netflix-player">
        <button className="netflix-back-btn" onClick={closePlayer}>← Retour</button>
        <h1 className="netflix-player-title">{selectedMovie.title}</h1>
        
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
      <header className="netflix-header">
        <span className="netflix-logo">LeY Tv</span>
        <nav className="netflix-nav">
          <a href="#" onClick={(e) => { e.preventDefault(); setCategory('movies'); }} className={category === 'movies' ? 'active' : ''}>Films</a>
          <a href="#" onClick={(e) => { e.preventDefault(); setCategory('anime'); }} className={category === 'anime' ? 'active' : ''}>Animes</a>
          <a href="#" onClick={(e) => { e.preventDefault(); setCategory('dramas'); }} className={category === 'dramas' ? 'active' : ''}>Dramas</a>
          <a href="#" onClick={(e) => { e.preventDefault(); setCategory('arabic'); }} className={category === 'arabic' ? 'active' : ''}>Arabes</a>
        </nav>
      </header>

      {/* Hero banner avec le premier film */}
      {!loading && items.length > 0 && (
        <div 
          className="netflix-hero" 
          style={{ backgroundImage: `url(${items[0]?.image})` }}
        >
          <div className="netflix-hero-content">
            <h1 className="netflix-hero-title">{items[0]?.title}</h1>
            <p className="netflix-hero-description">{items[0]?.description}</p>
            <div className="netflix-hero-buttons">
              <button className="netflix-hero-btn play" onClick={() => playMovie(items[0])}>▶ Lecture</button>
              <button className="netflix-hero-btn info">ℹ Plus d'infos</button>
            </div>
          </div>
        </div>
      )}

      <div className="netflix-row-custom">
        <h2>Pour vous</h2>
        <div className="netflix-row">
          {items.slice(1, 7).map(item => (
            <div key={item.id} className="netflix-card" onClick={() => playMovie(item)}>
              <img src={item.image} alt={item.title} className="netflix-card-img" />
              <div className="netflix-card-overlay">
                <h3>{item.title}</h3>
                <p>Regarder maintenant</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="netflix-section">
        <h2 className="netflix-section-title">Notre sélection du jour</h2>
        <div className="netflix-row">
          {items.slice(7, 13).map(item => (
            <div key={item.id} className="netflix-card" onClick={() => playMovie(item)}>
              <img src={item.image} alt={item.title} className="netflix-card-img" />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation en bas */}
      <nav className="netflix-bottom-nav">
        <a href="#" className="active">Accueil</a>
        <a href="#">Tout nouveau</a>
        <a href="#">Mon Netflix</a>
      </nav>
    </>
  );
}

export default MovieGrid;
