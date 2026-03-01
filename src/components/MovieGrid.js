// ===================================
// ROUTE POUR LES BANDES-ANNONCES (VIDEOS)
// ===================================
app.get('/api/movies/:id/videos', async (req, res) => {
  const { id } = req.params;
  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/movie/${id}/videos?api_key=${TMDB_API_KEY}&language=fr-FR`
    );
    res.json(response.data);
  } catch (error) {
    console.error('Erreur lors de la récupération des vidéos:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des vidéos' });
  }
});
