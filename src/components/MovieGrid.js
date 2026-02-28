import React, { useEffect, useState } from 'react';

const API_URL = 'https://ley-tv.onrender.com';

function MovieGrid({ hasPub, userType }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('movies');

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        let url = '';
        if (category === 'movies') url = `${API_URL}/api/movies/popular`;
        else if (category === 'anime') url = `${API_URL}/api/anime/popular`;
        else if (category === 'dramas') url = `${API_URL}/api/dramas/popular`;
        
        const res = await fetch(url);
        const data = await res.json();
        setItems(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchItems();
  }, [category]);

  return (
    <div style={{ padding: '20px' }}>
      <div>
        <button onClick={() => setCategory('movies')}>🎬 Films</button>
        <button onClick={() => setCategory('anime')}>🎌 Animes</button>
        <button onClick={() => setCategory('dramas')}>📺 Dramas</button>
      </div>

      {loading ? (
        <div>⏳ Chargement...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
          {items.map(item => (
            <div key={item.id}>
              <img src={item.image} alt={item.title} style={{ width: '100%', height: '250px' }} />
              <h3>{item.title}</h3>
              {item.year && <p>{item.year}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MovieGrid;