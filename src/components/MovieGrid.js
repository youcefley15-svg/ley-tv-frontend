import React, { useEffect, useState } from 'react';

const API = 'https://ley-tv.onrender.com';

function MovieGrid() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState('movies');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        let url = `${API}/api/${cat}/popular`;
        const res = await fetch(url);
        const data = await res.json();
        setItems(data);
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [cat]);

  const btnStyle = (c) => ({
    padding: 10,
    margin: 5,
    background: cat === c ? '#007bff' : '#f0f0f0',
    color: cat === c ? 'white' : 'black'
  });

  return (
    <div style={{ padding: 20 }}>
      <div>
        <button onClick={() => setCat('movies')} style={btnStyle('movies')}>Films</button>
        <button onClick={() => setCat('anime')} style={btnStyle('anime')}>Animes</button>
        <button onClick={() => setCat('dramas')} style={btnStyle('dramas')}>Dramas</button>
      </div>

      {loading ? <p>Chargement...</p> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }}>
          {items.map(i => (
            <div key={i.id}>
              <img src={i.image} alt={i.title} style={{ width: '100%', height: 250 }} />
              <h4>{i.title}</h4>
              {i.year && <p>{i.year}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MovieGrid;