import React, { useEffect, useState } from 'react';

const API_URL = 'https://ley-tv.onrender.com';

function MovieGrid() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('movies');
  const [error, setError] = useState('');
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [streamUrl, setStreamUrl] = useState('');

  useEffect(() => {
    fetchItems();
  }, [category]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/${category}/popular?page=1`);
      const data = await response.json();
      
      if (data.films) {
        setItems(data.films);
      } else {
        setError('Aucun film');
      }
    } catch (err) {
      setError('Erreur');
    } finally {
      setLoading(false);
    }
  };

  const playMovie = (movie) => {
    setSelectedMovie(movie);
    setStreamUrl(`https://vidsrc.xyz/embed/movie/${movie.id}`);
  };

  if (selectedMovie) {
    return (
      <div>
        <button onClick={() => setSelectedMovie(null)}>Retour</button>
        <h2>{selectedMovie.title}</h2>
        <iframe src={streamUrl} width="100%" height="500" allowFullScreen />
      </div>
    );
  }

  return (
    <div>
      <div>
        <button onClick={() => setCategory('movies')}>Films</button>
        <button onClick={() => setCategory('anime')}>Animes</button>
        <button onClick={() => setCategory('dramas')}>Dramas</button>
        <button onClick={() => setCategory('arabic')}>Arabes</button>
      </div>
      {loading && <div>Chargement...</div>}
      {error && <div>{error}</div>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)' }}>
        {items.map(item => (
          <div key={item.id} onClick={() => playMovie(item)}>
            <img src={item.image} alt={item.title} style={{ width: '100%', height: '200px' }} />
            <p>{item.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MovieGrid;
