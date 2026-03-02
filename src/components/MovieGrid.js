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
    setTrailerUrl('');
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
      <div style={{ padding: '20px' }}>
        <button onClick={closePlayer}>← Retour</button>
        <h2>{selectedMovie.title}</h2>
        
        {loadingTrailer && <p>Chargement bande-annonce...</p>}
        {!loadingTrailer && trailerUrl && (
          <div style={{ marginBottom: '20px' }}>
            <a 
              href={trailerUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                padding: '10px 20px',
                background: '#e50914',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '4px'
              }}
            >
              ▶ Bande-annonce
            </a>
          </div>
        )}

        <iframe
          src={streamUrl}
          width="100%"
          height="500"
          allowFullScreen
          title={selectedMovie.title}
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <div>
        <button onClick={() => setCategory('movies')}>Films</button>
        <button onClick={() => setCategory('anime')}>Animes</button>
        <button onClick={() => setCategory('dramas')}>Dramas</button>
        <button onClick={() => setCategory('arabic')}>Arabes</button>
      </div>

      <div>
        <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}>←</button>
        <span>Page {page}</span>
        <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages}>→</button>
      </div>

      {loading && <div>Chargement...</div>}
      {error && <div>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '20px' }}>
        {items.map(item => (
          <div key={item.id} onClick={() => playMovie(item)} style={{ cursor: 'pointer' }}>
            <img src={item.image} alt={item.title} style={{ width: '100%', height: '200px' }} />
            <p>{item.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MovieGrid;
