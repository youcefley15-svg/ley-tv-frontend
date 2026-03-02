import React, { useEffect, useRef, useState } from 'react';
// Importer Plyr correctement
import Plyr from 'plyr';

const NetflixPlayer = ({ movie, onClose }) => {
  const playerRef = useRef(null);
  const plyrInstance = useRef(null);
  const [currentLanguage, setCurrentLanguage] = useState('fr');
  const [showControls, setShowControls] = useState(true);
  const controlsTimeout = useRef(null);

  // Liste des langues disponibles
  const languages = {
    'fr': { label: 'Français', flag: '🇫🇷' },
    'en': { label: 'English', flag: '🇬🇧' },
    'ar': { label: 'العربية', flag: '🇸🇦' },
    'ja': { label: '日本語', flag: '🇯🇵' },
    'ko': { label: '한국어', flag: '🇰🇷' },
    'zh': { label: '中文', flag: '🇨🇳' },
    'hi': { label: 'हिन्दी', flag: '🇮🇳' },
    'de': { label: 'Deutsch', flag: '🇩🇪' },
    'es': { label: 'Español', flag: '🇪🇸' },
    'it': { label: 'Italiano', flag: '🇮🇹' },
    'pt': { label: 'Português', flag: '🇵🇹' },
    'ru': { label: 'Русский', flag: '🇷🇺' }
  };

  // Ajouter le CSS Plyr directement dans le head
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.plyr.io/3.7.8/plyr.css';
    document.head.appendChild(link);
    
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  useEffect(() => {
    // Sauvegarder la position toutes les 5 secondes
    const saveInterval = setInterval(() => {
      if (plyrInstance.current) {
        const currentTime = plyrInstance.current.currentTime;
        if (currentTime > 0) {
          localStorage.setItem(`movie-${movie.id}-position`, currentTime.toString());
        }
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
          'play-large',
          'restart',
          'rewind',
          'play',
          'fast-forward',
          'progress',
          'current-time',
          'duration',
          'mute',
          'volume',
          'settings',
          'pip',
          'airplay',
          'fullscreen'
        ],
        settings: ['captions', 'quality', 'speed', 'loop'],
        i18n: {
          restart: 'Recommencer',
          rewind: 'Reculer de 10s',
          play: 'Lecture',
          pause: 'Pause',
          fastForward: 'Avancer de 10s',
          seek: 'Chercher',
          seekLabel: '{currentTime} / {duration}',
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
          frameTitle: 'Lecteur - {title}',
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

      // Gérer l'affichage des contrôles
      const handleMouseMove = () => {
        setShowControls(true);
        if (controlsTimeout.current) {
          clearTimeout(controlsTimeout.current);
        }
        controlsTimeout.current = setTimeout(() => {
          if (plyrInstance.current?.playing) {
            setShowControls(false);
          }
        }, 3000);
      };

      document.addEventListener('mousemove', handleMouseMove);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        if (controlsTimeout.current) {
          clearTimeout(controlsTimeout.current);
        }
      };
    }

    return () => {
      if (plyrInstance.current) {
        plyrInstance.current.destroy();
      }
    };
  }, [movie.id]);

  const changeLanguage = (lang) => {
    setCurrentLanguage(lang);
    console.log(`Langue changée pour: ${languages[lang].label}`);
  };

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
        background: showControls ? 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, transparent)' : 'transparent',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        transition: 'background 0.3s',
        pointerEvents: showControls ? 'auto' : 'none'
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
            borderRadius: '50%',
            transition: 'all 0.3s',
            opacity: showControls ? 1 : 0
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
          opacity: showControls ? 1 : 0,
          transition: 'opacity 0.3s'
        }}>
          {movie.title}
        </span>
      </div>

      {/* Sélecteur de langue (apparaît au survol) */}
      <div style={{
        position: 'absolute',
        top: '80px',
        right: '20px',
        zIndex: 20,
        opacity: showControls ? 1 : 0,
        transition: 'opacity 0.3s',
        pointerEvents: showControls ? 'auto' : 'none'
      }}>
        <select
          value={currentLanguage}
          onChange={(e) => changeLanguage(e.target.value)}
          style={{
            padding: '10px 15px',
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            border: '1px solid #333',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.9rem'
          }}
        >
          {Object.entries(languages).map(([code, { flag, label }]) => (
            <option key={code} value={code}>
              {flag} {label}
            </option>
          ))}
        </select>
      </div>

      {/* Lecteur Plyr */}
      <video
        ref={playerRef}
        className="plyr-react plyr"
        poster={movie.image}
        crossOrigin="anonymous"
        playsInline
      >
        <source src={`https://vidsrc.xyz/embed/movie/${movie.id}`} type="video/mp4" />
      </video>

      {/* Style personnalisé */}
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
        .plyr__control--overlaid svg {
          width: 24px;
          height: 24px;
        }
        .plyr__controls {
          background: linear-gradient(0deg, rgba(0,0,0,0.7) 0%, transparent);
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
        .plyr__progress__buffer {
          background: rgba(255,255,255,0.3);
        }
        .plyr__progress__buffer::-webkit-progress-bar {
          background: rgba(255,255,255,0.3);
        }
        .plyr__progress__buffer::-webkit-progress-value {
          background: #fff;
        }
        .plyr__progress__buffer::-moz-progress-bar {
          background: #fff;
        }
      `}</style>
    </div>
  );
};

export default NetflixPlayer;
