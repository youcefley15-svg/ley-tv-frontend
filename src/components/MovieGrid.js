import React, { useEffect, useState } from 'react';
import './MovieGrid.css';

const API_URL = 'https://ley-tv.onrender.com';

function MovieGrid() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('movies');
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchItems();
  }, [category, page]);

  const fetchItems = async () => {
    try {
      const response = await fetch(`${API_URL}/api/${category}/popular?page=${page}`);
      const data = await response.json();
      setItems(data.films || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const playMovie = (movie) => {
    window.open(`https://vidsrc.xyz/embed/movie/${movie.id}`, '_blank');
  };

  if (selectedMovie) {
    return (
      <div style={{ padding: '20px' }}>
        <button onClick={() => setSelectedMovie(null)}>Retour</button>
        <h2>{selectedMovie.title}</h2>
        <iframe
          src={`https://vidsrc.xyz/embed/movie/${selectedMovie.id}`}
          width="100%"
          height="500"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <div>
        {['movies','anime','dramas','arabic'].map(cat => (
          <button key={cat} onClick={() => { setCategory(cat); setPage(1); }}>
            {cat}
          </button>
        ))}
      </div>

      {loading ? <p>Chargement...</p> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px' }}>
          {items.map(item => (
            <div key={item.id} onClick={() => playMovie(item)} style={{ cursor: 'pointer' }}>
              <img src={item.image} alt={item.title} style={{ width: '100%', height: '200px' }} />
              <p>{item.title}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MovieGrid;
