import React, { useEffect, useState, useCallback } from 'react';

const API_URL = 'https://ley-tv.onrender.com';

function MovieGrid() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('movies');

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      let url = '';
      if (category === 'movies') url = `${API_URL}/api/movies/popular`;
      else if (category === 'anime') url = `${API_URL}/api/anime/popular`;
      else if (category === 'dramas') url = `${API_URL}/api/dramas/popular`;
      else if (category === 'arabic') url = `${API_URL}/api/arabic/popular`;
      
      const res = await fetch(url);
      const data = await res.json();
      setItems(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return (
    <div style={{ padding: 20 }}>
      <div style={{ marginBottom: 20 }}>
        <button onClick={() => setCategory('movies')}>🎬 Films</button>
        <button onClick={() => setCategory('anime')}>🎌 Animes</button>
        <button onClick={() => setCategory('dramas')}>📺 Dramas</button>
        <button onClick={() => setCategory('arabic')}>🌍 Arabes</button>
      </div>

      {loading ? <p>Chargement...</p> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }}>
          {items.map(item => (
            <div key={item.id}>
              <img src={item.image} alt={item.title} style={{ width: '100%', height: 250 }} />
              <h4>{item.title}</h4>
              {item.year && <p>{item.year}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MovieGrid;
