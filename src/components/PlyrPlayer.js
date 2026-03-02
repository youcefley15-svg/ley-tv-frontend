import React, { useEffect, useRef } from 'react';

// Charger Plyr uniquement côté client
const loadPlyr = async () => {
  const Plyr = (await import('plyr')).default;
  return Plyr;
};

const PlyrPlayer = ({ movie, onClose }) => {
  const playerRef = useRef(null);
  const playerInstance = useRef(null);

  useEffect(() => {
    let mounted = true;

    // Ajouter le CSS Plyr depuis le CDN
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.plyr.io/3.7.8/plyr.css';
    document.head.appendChild(link);

    const initPlayer = async () => {
      if (!playerRef.current || !mounted) return;

      const Plyr = await loadPlyr();
      
      playerInstance.current = new Plyr(playerRef.current, {
        controls: [
          'play-large', 'restart', 'rewind', 'play', 'fast-forward',
          'progress', 'current-time', 'duration', 'mute', 'volume',
          'settings', 'pip', 'airplay', 'fullscreen'
        ],
        settings: ['captions', 'quality', 'speed'],
        i18n: {
          restart: 'Recommencer',
          rewind: 'Reculer 10s',
          play: 'Lecture',
          pause: 'Pause',
          fastForward: 'Avancer 10s',
          seek: 'Chercher',
          volume: 'Volume',
          mute: 'Muet',
          unmute: 'Son',
          enterFullscreen: 'Plein écran',
          exitFullscreen: 'Quitter plein écran',
          captions: 'Sous-titres',
          settings: 'Paramètres',
          speed: 'Vitesse',
          normal: 'Normale',
          quality: 'Qualité'
        }
      });

      // Restaurer la position si elle existe
      const savedPosition = localStorage.getItem(`movie-${movie.id}-position`);
      if (savedPosition) {
        playerInstance.current.on('ready', () => {
          playerInstance.current.currentTime = parseFloat(savedPosition);
        });
      }

      // Sauvegarder la position toutes les 5 secondes
      const saveInterval = setInterval(() => {
        if (playerInstance.current?.currentTime > 0) {
          localStorage.setItem(`movie-${movie.id}-position`, playerInstance.current.currentTime.toString());
        }
      }, 5000);

      // Nettoyer à la fin
      playerInstance.current.on('ended', () => {
        localStorage.removeItem(`movie-${movie.id}-position`);
        clearInterval(saveInterval);
      });

      return () => clearInterval(saveInterval);
    };

    initPlayer();

    return () => {
      mounted = false;
      if (playerInstance.current) {
        playerInstance.current.destroy();
      }
      document.head.removeChild(link);
    };
  }, [movie.id]);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#000',
      zIndex: 2000
    }}>
      {/* Barre de contrôle supérieure */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '70px',
        background: 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, transparent)',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px'
      }}>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'white',
            fontSize: '1.5rem',
            cursor: 'pointer',
            padding: '10px',
            borderRadius: '50%'
          }}
        >
          ←
        </button>
        <span style={{
          color: 'white',
          fontSize: '1.2rem',
          fontWeight: 'bold',
          marginLeft: '10px'
        }}>
          {movie.title}
        </span>
      </div>

      {/* Lecteur */}
      <video
        ref={playerRef}
        poster={movie.image}
        style={{ width: '100%', height: '100%' }}
        controls
      >
        <source src={`https://vidsrc.xyz/embed/movie/${movie.id}`} type="video/mp4" />
      </video>

      <style>{`
        .plyr {
          width: 100%;
          height: 100%;
        }
        .plyr--video {
          background: #000;
        }
        .plyr__control--overlaid {
          background: #e50914;
        }
        .plyr__control--overlaid:hover {
          background: #f40612;
        }
        .plyr__menu__container .plyr__control[role="menuitemradio"][aria-checked="true"]::before {
          background: #e50914;
        }
      `}</style>
    </div>
  );
};

export default PlyrPlayer;
