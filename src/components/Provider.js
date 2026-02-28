import React, { useState, useEffect } from "react";

function Provider({ url, providerType = "movie" }) {
  const [movies, setMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Charger les films/dramas
  useEffect(() => {
    setLoading(true);
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setMovies(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [url]);

  // Fonction pour rechercher
  const handleSearch = () => {
    if (!searchQuery) return;
    
    setLoading(true);
    // Si c'est DramaBox, utiliser l'URL de recherche
    const searchUrl = url.includes('dramabox') 
      ? `http://localhost:3000/api/providers/dramabox/search?q=${searchQuery}`
      : url;
    
    fetch(searchUrl)
      .then((res) => res.json())
      .then((data) => {
        setMovies(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  // Fonction pour gérer le clic sur un film/drama
  const handleMovieClick = (movie) => {
    setSelectedMovie(movie);
    setVideoUrl(null); // Reset de la vidéo
    
    // Si c'est un drama, charger la vidéo
    if (providerType === "drama") {
      fetch(`http://localhost:3000/api/providers/dramabox/watch/${movie.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.sources && data.sources.length > 0) {
            setVideoUrl(data.sources[0].url);
          }
        })
        .catch((err) => console.error(err));
    } else {
      // Pour TMDB, utiliser la vidéo directement si disponible
      setVideoUrl(movie.video);
    }
  };

  return (
    <div>
      <h1>{providerType === "drama" ? "Dramas" : "Films"}</h1>

      {/* Barre de recherche */}
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`Rechercher un ${providerType === "drama" ? "drama" : "film"}...`}
          style={{
            padding: "8px",
            marginRight: "10px",
            width: "300px",
            borderRadius: "4px",
            border: "1px solid #ccc"
          }}
        />
        <button
          onClick={handleSearch}
          style={{
            padding: "8px 15px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Rechercher
        </button>
      </div>

      {/* Affichage des films/dramas */}
      {loading ? (
        <p>Chargement...</p>
      ) : (
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
          {movies.map((movie) => (
            <div
              key={movie.id}
              onClick={() => handleMovieClick(movie)}
              style={{
                cursor: "pointer",
                width: "150px",
                textAlign: "center",
                border: "1px solid #eee",
                padding: "10px",
                borderRadius: "8px"
              }}
            >
              <img
                src={movie.image || "https://via.placeholder.com/150x200?text=No+Image"}
                alt={movie.title}
                width="150"
                height="200"
                style={{ objectFit: "cover", borderRadius: "4px" }}
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/150x200?text=Error";
                }}
              />
              <p style={{ margin: "10px 0 0", fontWeight: "bold" }}>{movie.title}</p>
              {movie.year && <small style={{ color: "#666" }}>{movie.year}</small>}
            </div>
          ))}
        </div>
      )}

      {/* Lecteur vidéo */}
      {selectedMovie && (
        <div style={{ marginTop: "30px", borderTop: "2px solid #eee", paddingTop: "20px" }}>
          <h2>{selectedMovie.title}</h2>
          {providerType === "drama" && !videoUrl && (
            <p>Chargement de la vidéo...</p>
          )}
          {(videoUrl || selectedMovie.video) && (
            <video
              width="600"
              controls
              src={videoUrl || selectedMovie.video}
              style={{ maxWidth: "100%", borderRadius: "8px" }}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default Provider;