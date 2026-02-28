import React, { useEffect, useState } from 'react';

function FilmGrid({ hasPub }) {
  const [films, setFilms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3000/films')
      .then(res => res.json())
      .then(data => {
        setFilms(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '20px' }}>⏳ Chargement des films...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      {hasPub && (
        <div style={{
          backgroundColor: '#fff3cd',
          color: '#856404',
          padding: '10px',
          marginBottom: '20px',
          borderRadius: '5px',
          textAlign: 'center'
        }}>
          📺 Mode Standard - Des pubs seront affichées
        </div>
      )}
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: '20px'
      }}>
        {films.map(film => (
          <div
            key={film.id}
            style={{
              border: '1px solid #ddd',
              borderRadius: '10px',
              overflow: 'hidden',
              cursor: 'pointer'
            }}
          >
            <img
              src={film.image}
              alt={film.title}
              style={{
                width: '100%',
                height: '250px',
                objectFit: 'cover'
              }}
            />
            <div style={{ padding: '10px' }}>
              <h3 style={{ fontSize: '16px', margin: 0 }}>{film.title}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FilmGrid;