import React, { useId } from 'react';
import { Box, useMediaQuery } from '@mui/material';
import { alpha, lighten, useTheme } from '@mui/material/styles';
import { keyframes } from '@emotion/react';

// --- Variante "horizontal" (pagine pubbliche): onde sopra e sotto ---

// Percorsi ampi su più punti delle "macchie" di colore, così il movimento è riconoscibile
const drift1 = keyframes`
  0%   { transform: translate(0, 0) scale(1); }
  33%  { transform: translate(260px, 120px) scale(1.2); }
  66%  { transform: translate(120px, 260px) scale(0.9); }
  100% { transform: translate(-60px, 80px) scale(1.1); }
`;
const drift2 = keyframes`
  0%   { transform: translate(0, 0) scale(1.1); }
  33%  { transform: translate(-280px, -90px) scale(0.9); }
  66%  { transform: translate(-120px, -240px) scale(1.2); }
  100% { transform: translate(80px, -100px) scale(1); }
`;
// Onde: scorrimento orizzontale ampio con una leggera ondulazione verticale
const waveFlow = keyframes`
  0%   { transform: translate(0, 0); }
  50%  { transform: translate(-110px, 22px); }
  100% { transform: translate(-220px, 0); }
`;

// --- Variante "sides" (home): onde ai lati ---

// Le macchie girano attorno al centro in versi opposti, a ciclo continuo
const orbit1 = keyframes`
  0%   { transform: translate(-320px, 0) scale(1); }
  25%  { transform: translate(0, 140px) scale(1.2); }
  50%  { transform: translate(320px, 0) scale(0.9); }
  75%  { transform: translate(0, -100px) scale(1.15); }
  100% { transform: translate(-320px, 0) scale(1); }
`;
const orbit2 = keyframes`
  0%   { transform: translate(320px, 0) scale(1.1); }
  25%  { transform: translate(0, -140px) scale(0.9); }
  50%  { transform: translate(-320px, 0) scale(1.2); }
  75%  { transform: translate(0, 100px) scale(1); }
  100% { transform: translate(320px, 0) scale(1.1); }
`;
// Onde che "respirano": scorrono lungo il bordo ed entrano/escono verso il centro.
// Le coordinate sono quelle dell'onda prima della rotazione: x = lungo il bordo, y = profondità
const waveSurge = keyframes`
  0%   { transform: translate(0, 0); }
  50%  { transform: translate(-140px, -50px); }
  100% { transform: translate(-280px, 10px); }
`;

export type AnimatedBackgroundVariant = 'horizontal' | 'sides';

const VARIANTS = {
  horizontal: {
    blobs: [
      { cx: 260, cy: 220, r: 380, animation: `${drift1} 12s ease-in-out infinite alternate` },
      { cx: 1180, cy: 640, r: 440, animation: `${drift2} 14s ease-in-out infinite alternate` },
    ],
    wave1: `${waveFlow} 7s ease-in-out infinite alternate`,
    wave2: `${waveFlow} 9s ease-in-out infinite alternate-reverse`,
    // Onde in basso e le stesse ruotate di 180° in alto: la cresta più ampia in alto cade
    // sopra quella più piccola in basso, e lo scorrimento va in direzione opposta
    waveTransforms: [undefined, 'rotate(180 720 450)'],
    gradientRotation: '0 0.5 0.5; 90 0.5 0.5; 0 0.5 0.5',
    gradientDuration: '12s',
  },
  sides: {
    blobs: [
      { cx: 720, cy: 180, r: 360, animation: `${orbit1} 16s ease-in-out infinite` },
      { cx: 720, cy: 720, r: 420, animation: `${orbit2} 18s ease-in-out infinite` },
    ],
    wave1: `${waveSurge} 10s ease-in-out infinite alternate`,
    wave2: `${waveSurge} 13s ease-in-out infinite alternate-reverse`,
    // Onda a sinistra (rotazione di 90°) e a destra (−90°), simmetriche rispetto al centro
    waveTransforms: ['rotate(90 450 450)', 'rotate(-90 990 450)'],
    gradientRotation: '0 0.5 0.5; -90 0.5 0.5; 0 0.5 0.5',
    gradientDuration: '16s',
  },
} as const;

/**
 * Sfondo astratto animato (pagine pubbliche e home).
 * I colori derivano dal tema (primario e azzurro chiaro delle intestazioni),
 * le animazioni si disattivano con "riduci movimento" del sistema operativo.
 */
export const AnimatedBackground: React.FC<{ variant?: AnimatedBackgroundVariant }> = ({ variant = 'horizontal' }) => {
  const theme = useTheme();
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  // ID univoci per i gradienti SVG (i caratteri speciali di useId non sono validi in url(#...))
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const config = VARIANTS[variant];

  const primary = theme.palette.primary.main;
  const header = theme.palette.tableHeader.main;
  const ids = {
    bg: `bg-${uid}`,
    b1: `b1-${uid}`,
    b2: `b2-${uid}`,
    w1: `w1-${uid}`,
    w2: `w2-${uid}`,
    soft: `soft-${uid}`,
  };
  const blobFills = [ids.b1, ids.b2];

  // Onde più larghe e più alte del riquadro, così scorrimento e sfocatura non scoprono i bordi
  const waves = (
    <g filter={`url(#${ids.soft})`}>
      <path
        className="wave1"
        d="M-280 690 C 60 600, 400 790, 720 690 S 1320 600, 1720 690 L 1720 980 L -280 980 Z"
        fill={`url(#${ids.w1})`}
      />
      <path
        className="wave2"
        d="M-280 765 C 120 690, 450 850, 760 765 S 1360 690, 1720 775 L 1720 980 L -280 980 Z"
        fill={`url(#${ids.w2})`}
      />
    </g>
  );

  const animated = (animation: string) => ({
    transformBox: 'fill-box',
    transformOrigin: 'center',
    animation: reduceMotion ? 'none' : animation,
  });

  return (
    <Box
      aria-hidden
      sx={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        '& .blob0': animated(config.blobs[0].animation),
        '& .blob1': animated(config.blobs[1].animation),
        '& .wave1': animated(config.wave1),
        '& .wave2': animated(config.wave2),
      }}
    >
      <svg width="100%" height="100%" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
        <defs>
          {/* Sfumatura di base che ruota lentamente */}
          <linearGradient id={ids.bg} x1="0" y1="0" x2="1" y2="1">
            {/* Toni leggermente saturi per dare contrasto alle onde chiare */}
            <stop offset="0%" stopColor={lighten(header, 0.35)} />
            <stop offset="50%" stopColor={lighten(primary, 0.65)} />
            <stop offset="100%" stopColor={lighten(primary, 0.45)} />
            {!reduceMotion && (
              <animateTransform
                attributeName="gradientTransform"
                type="rotate"
                values={config.gradientRotation}
                dur={config.gradientDuration}
                repeatCount="indefinite"
              />
            )}
          </linearGradient>

          <radialGradient id={ids.b1}>
            <stop offset="0%" stopColor={alpha(primary, 0.45)} />
            <stop offset="100%" stopColor={alpha(primary, 0)} />
          </radialGradient>
          <radialGradient id={ids.b2}>
            <stop offset="0%" stopColor={alpha(lighten(primary, 0.25), 0.5)} />
            <stop offset="100%" stopColor={alpha(lighten(primary, 0.25), 0)} />
          </radialGradient>

          {/* Onde: riempimento che sfuma verso la cresta + sfocatura dei bordi */}
          <linearGradient id={ids.w1} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={alpha('#ffffff', 0.1)} />
            <stop offset="30%" stopColor={alpha('#ffffff', 0.5)} />
            <stop offset="100%" stopColor={alpha('#ffffff', 0.7)} />
          </linearGradient>
          <linearGradient id={ids.w2} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={alpha(primary, 0.04)} />
            <stop offset="35%" stopColor={alpha(primary, 0.2)} />
            <stop offset="100%" stopColor={alpha(primary, 0.28)} />
          </linearGradient>
          <filter id={ids.soft} x="-10%" y="-50%" width="120%" height="200%">
            <feGaussianBlur stdDeviation="9" />
          </filter>
        </defs>

        <rect width="1440" height="900" fill={`url(#${ids.bg})`} />

        {config.blobs.map((b, i) => (
          <circle key={i} className={`blob${i}`} cx={b.cx} cy={b.cy} r={b.r} fill={`url(#${blobFills[i]})`} />
        ))}

        {config.waveTransforms.map((t, i) => (
          <g key={i} transform={t}>
            {waves}
          </g>
        ))}
      </svg>
    </Box>
  );
};
