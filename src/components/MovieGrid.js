import React, { useEffect, useState, useCallback } from 'react';

const API_URL = 'https://ley-tv.onrender.com';

function MovieGrid() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('movies');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedMovie, setSelectedMovie] = useState(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      let url = '';
      if (category === 'movies') {
        url = `${API_URL}/api/movies/popular?page=${page}`;
      } else if (category === 'anime') {
        url = `${API_URL}/api/anime/popular?page=${page}`;
      } else if (category === 'dramas') {
        url = `${API_URL}/api/dramas/popular?page=${page}`;
      } else if (category === 'arabic') {
        url = `${API_URL}/api/arabic/popular?page=${page}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      // Gestion des différents formats de réponse
      if (data.films) {
        setItems(data.films);
        setTotalPages(data.totalPages || 1);
      } else if (Array.isArray(data)) {
        setItems(data);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Erreur chargement:', error);
    } finally {
      setLoading(false);
    }
  }, [category, page]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const playMovie = async (movie) => {
    try {
      setSelectedMovie(movie);
      const response = await fetch(`${API_URL}/api/movies/${movie.id}/stream?premium=false`);
      const data = await response.json();
      
      if (data.embed) {
        window.open(data.embed, '_blank');
      } else {
        alert('Lien de streaming non disponible');
      }
    } catch (error) {
      console.error('Erreur lecture:', error);
      alert('Impossible de lire ce film');
    }
  };

  const getButtonStyle = (cat) => ({
    padding: '10px 20px',
    marginRight: '10px',
    backgroundColor: category === cat ? '#007bff' : '#f0f0f0',
    color: category === cat ? 'white' : 'black',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  });

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => { setCategory('movies'); setPage(1); }} style={getButtonStyle('movies')}>🎬 Films</button>
        <button onClick={() => { setCategory('anime'); setPage(1); }} style={getButtonStyle('anime')}>🎌 Animes</button>
        <button onClick={() => { setCategory('dramas'); setPage(1); }} style={getButtonStyle('dramas')}>📺 Dramas</button>
        <button onClick={() => { setCategory('arabic'); setPage(1); }} style={getButtonStyle('arabic')}>🌍 Arabes</button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>⏳ Chargement...</div>
      ) : (
        <>
          <h2>
            {category === 'movies' && 'Films populaires'}
            {category === 'anime' && 'Animes populaires'}
            {category === 'dramas' && 'Dramas populaires'}
            {category === 'arabic' && 'Films arabes populaires'}
          </h2>
          
          {items.length === 0 ? (
            <p>Aucun contenu trouvé</p>
          ) : (
            <>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
                gap: '20px' 
              }}>
                {items.map(item => (
                  <div 
                    key={item.id} 
                    onClick={() => playMovie(item)}
                    style={{ 
                      border: '1px solid #ddd', 
                      borderRadius: '8px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                      ':hover': {
                        transform: 'scale(1.05)'
                      }
                    }}
                  >
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      style={{ 
                        width: '100%', 
                        height: '250px', 
                        objectFit: 'cover' 
                      }} 
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/200x250?text=Image+non+disponible';
                      }}
                    />
                    <div style={{ padding: '10px' }}>
                      <h3 style={{ fontSize: '16px', margin: 0 }}>{item.title}</h3>
                      {item.year && <p style={{ margin: '5px 0 0', color: '#666' }}>{item.year}</p>}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ marginTop: '30px', textAlign: 'center' }}>
                  <button 
                    onClick={() => setPage(p => Math.max(1, p-1))}
                    disabled={page === 1}
                    style={{
                      padding: '8px 16px',
                      marginRight: '10px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: page === 1 ? 'not-allowed' : 'pointer',
                      opacity: page === 1 ? 0.5 : 1
                    }}
                  >
                    ← Précédent
                  </button>
                  <span style={{ margin: '0 15px' }}>Page {page} / {totalPages}</span>
                  <button 
                    onClick={() => setPage(p => Math.min(totalPages, p+1))}
                    disabled={page === totalPages}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: page === totalPages ? 'not-allowed' : 'pointer',
                      opacity: page === totalPages ? 0.5 : 1
                    }}
                  >
                    Suivant →
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

export default MovieGrid;
