import React, { useEffect, useRef } from 'react';
import Plyr from 'plyr';

const NetflixPlayer = ({ movie, onClose }) => {
  const playerRef = useRef(null);
  const plyrInstance = useRef(null);

  // Liste des pistes audio disponibles
  const audioTracks = [
    { srclang: 'fr', label: 'Français', default: true },
    { srclang: 'en', label: 'English' },
    { srclang: 'ar', label: 'العربية' },
    { srclang: 'ja', label: '日本語' },
    { srclang: 'ko', label: '한국어' }
  ];

  useEffect(() => {
    // Sauvegarder la position actuelle toutes les 5 secondes
    const saveInterval = setInterval(() => {
      if (plyrInstance.current) {
        const currentTime = plyrInstance.current.currentTime;
        localStorage.setItem(`movie-${movie.id}-position`, currentTime.toString());
      }
    }, 5000);

    return () => clearInterval(saveInterval);
  }, [movie.id]);

  useEffect(() => {
    if (playerRef.current) {
      // Récupérer la position sauvegardée
      const savedPosition = localStorage.getItem(`movie-${movie.id}-position`);
      
      // Initialiser Plyr avec toutes les options
      plyrInstance.current = new Plyr(playerRef.current, {
        controls: [
          'play-large',    // Gros bouton play au milieu
          'restart',       // Recommencer
          'rewind',        // Reculer de 10s
          'play',          // Play/pause
          'fast-forward',  // Avancer de 10s
          'progress',      // Barre de progression
          'current-time',  // Temps actuel
          'duration',      // Durée totale
          'mute',          // Muet
          'volume',        // Volume
          'settings',      // Paramètres (audio, sous-titres, vitesse)
          'pip',           // Picture-in-picture
          'airplay',       // AirPlay
          'fullscreen'     // Plein écran
        ],
        settings: ['captions', 'quality', 'speed', 'loop'],
        i18n: {
          restart: 'Recommencer',
          rewind: 'Reculer de 10s',
          play: 'Lecture',
          pause: 'Pause',
          fastForward: 'Avancer de 10s',
          seek: 'Chercher',
          seekLabel: '{currentTime} sur {duration}',
          played: 'Lecture en cours',
          buffered: 'Tampon',
          currentTime: 'Temps actuel',
          duration: 'Durée totale',
          volume: 'Volume',
          mute: 'Muet',
          unmute: 'Son',
          enableCaptions: 'Activer les sous-titres',
          disableCaptions: 'Désactiver les sous-titres',
          download: 'Télécharger',
          enterFullscreen: 'Plein écran',
          exitFullscreen: 'Quitter le plein écran',
          frameTitle: 'Lecteur pour {title}',
          captions: 'Sous-titres',
          settings: 'Paramètres',
          menuBack: 'Retour',
          speed: 'Vitesse',
          normal: 'Normale',
          quality: 'Qualité',
          loop: 'Boucle'
        },
        keyboard: {
          focused: true,
          global: true
        },
        tooltips: {
          controls: true,
          seek: true
        },
        duration: 0,
        displayDuration: true,
        invertTime: false,
        toggleInvert: true,
        storage: {
          enabled: true,
          key: 'plyr'
        }
      });

      // Restaurer la position sauvegardée
      if (savedPosition) {
        plyrInstance.current.on('ready', () => {
          plyrInstance.current.currentTime = parseFloat(savedPosition);
        });
      }

      // Sauvegarder la position à la fermeture
      plyrInstance.current.on('ended', () => {
        localStorage.removeItem(`movie-${movie.id}-position`);
      });
    }

    return () => {
      if (plyrInstance.current) {
        plyrInstance.current.destroy();
      }
    };
  }, [movie.id]);

  // Générer les sources avec plusieurs pistes audio
  const generateSources = () => {
    const sources = [];
    
    // Vidéo principale (avec toutes les pistes audio)
    sources.push({
      src: `https://vidsrc.xyz/embed/movie/${movie.id}`,
      type: 'video/mp4'
    });

    return sources;
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#000',
      zIndex: 2000,
      display: 'flex',
      flexDirection: 'column'
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
        padding: '0 20px',
        pointerEvents: 'none'
      }}>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'white',
            fontSize: '1.5rem',
            cursor: 'pointer',
            pointerEvents: 'auto',
            padding: '10px',
            borderRadius: '50%',
            transition: 'background 0.3s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          ←
        </button>
        <span style={{
          color: 'white',
          fontSize: '1.2rem',
          fontWeight: 'bold',
          marginLeft: '10px',
          pointerEvents: 'auto'
        }}>
          {movie.title}
        </span>
      </div>

      {/* Lecteur Plyr */}
      <video
        ref={playerRef}
        className="plyr-react plyr"
        poster={movie.image}
        crossOrigin="anonymous"
        playsInline
      >
        {/* Sources vidéo */}
        <source src={`https://vidsrc.xyz/embed/movie/${movie.id}`} type="video/mp4" />

        {/* Pistes audio (pour les vraies vidéos avec plusieurs pistes) */}
        {audioTracks.map((track, index) => (
          <track
            key={index}
            kind="subtitles"
            label={track.label}
            srcLang={track.srclang}
            src={`/api/subtitles/${movie.id}/${track.srclang}`}
            default={track.default}
          />
        ))}
      </video>

      {/* Style personnalisé pour Plyr */}
      <style jsx>{`
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
        .plyr__menu__container .plyr__control[role="menuitemradio"][aria-checked="true"] {
          background: rgba(229, 9, 20, 0.1);
        }
        .plyr__menu__container .plyr__control[role="menuitemradio"][aria-checked="true"]:hover {
          background: #e50914;
        }
      `}</style>
    </div>
  );
};

export default NetflixPlayer;
