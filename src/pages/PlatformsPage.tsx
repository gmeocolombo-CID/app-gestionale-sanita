import React from 'react';
import { Box, Card, CardActionArea, Typography, Grid, Paper } from '@mui/material';
import { alpha, type Theme } from '@mui/material/styles';
import { keyframes } from '@emotion/react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setProgram, type AppDispatch } from '../store';
import { MEDICAL_PROGRAMS, RADIUS, type MedicalProgramKey } from '../theme';
import { DOMANDE_PATHS } from '../navigation';
import iconaMedici from '../assets/icone/brigade.png';
import iconaPediatri from '../assets/icone/matron.png';

interface PlatformCard {
  key: MedicalProgramKey;
  title: string;
  icon: string;
}

const PLATFORMS: PlatformCard[] = [
  { key: 'medicinaGenerale', title: 'Medici di Medicina Generale', icon: iconaMedici },
  { key: 'pediatria', title: 'Pediatri di Libera Scelta', icon: iconaPediatri },
];

// Spinta ripetuta verso destra della freccia, per invitare al click
const nudge = keyframes`
  0%, 100% { transform: translateX(0); }
  50%      { transform: translateX(5px); }
`;

// Freccia in un cerchio: compare al passaggio del mouse (o al focus da tastiera) sopra il box
const HoverArrow: React.FC<{ color: string }> = ({ color }) => (
  <Box
    className="platform-arrow"
    aria-hidden
    sx={{
      position: 'absolute',
      right: 20,
      bottom: 20,
      width: 52,
      height: 52,
      color,
      opacity: 0,
      transform: 'translateX(-14px) scale(0.85)',
      transition: 'opacity 0.25s ease, transform 0.25s ease',
      pointerEvents: 'none',
      '& .arrow-head': {
        animation: `${nudge} 1s ease-in-out infinite`,
        '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
      },
    }}
  >
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
      <circle cx="26" cy="26" r="25" fill="currentColor" />
      <circle cx="26" cy="26" r="25" stroke="#ffffff" strokeOpacity="0.5" strokeWidth="2" />
      <g className="arrow-head" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 26 H35" />
        <path d="M28 18 L36 26 L28 34" />
      </g>
    </svg>
  </Box>
);

export const PlatformsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleSelectPlatform = (programKey: MedicalProgramKey) => {
    dispatch(setProgram(programKey));
    navigate(DOMANDE_PATHS[programKey]);
  };

  return (
    // Riquadro centrato in verticale nello spazio tra breadcrumb e footer
    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100%', maxWidth: 1200, mx: 'auto', p: 2 }}>
      {/* Riquadro semitrasparente ("vetro smerigliato"): lascia intravedere lo sfondo animato */}
      <Paper
        variant="outlined"
        sx={{
          p: 4,
          borderRadius: 1,
          borderColor: 'rgba(255, 255, 255, 0.7)',
          backgroundColor: 'rgba(255, 255, 255, 0.55)',
          backdropFilter: 'blur(6px)',
        }}
      >
        {/* Fascia del titolo: blu semitrasparente a tutta larghezza (annulla l'imbottitura del riquadro) */}
        <Box
          sx={(theme: Theme) => ({
            mx: -4,
            mt: -4,
            mb: 4,
            px: 4,
            py: 1.6,
            backgroundColor: alpha(theme.palette.primary.main, 0.14),
            borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.45)}`,
            borderRadius: `${RADIUS.md}px ${RADIUS.md}px 0 0`,
          })}
        >
          <Typography component="h1" sx={{ color: 'primary.dark', fontSize: 'var(--fs-2xl)', fontWeight: 700, textAlign: 'center' }}>
            Piattaforme di Domande Annuali
          </Typography>
        </Box>

        <Grid container spacing={4} sx={{ justifyContent: 'center' }}>
          {PLATFORMS.map(({ key, title, icon }) => {
            const program = MEDICAL_PROGRAMS[key];
            return (
              <Grid key={key} size={{ xs: 12, md: 6 }}>
                <Card
                  variant="outlined"
                  sx={{ borderRadius: 1, borderColor: '#e0e0e0', boxShadow: '0 2px 6px rgba(30, 70, 90, 0.1)' }}
                >
                  <CardActionArea
                    onClick={() => handleSelectPlatform(key)}
                    sx={{
                      position: 'relative',
                      height: 280,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-start',
                      '&:hover .platform-arrow, &.Mui-focusVisible .platform-arrow': {
                        opacity: 1,
                        transform: 'translateX(0) scale(1)',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: '100%',
                        backgroundColor: program.tableHeader,
                        py: 1.5,
                        textAlign: 'center',
                        borderBottom: '1px solid #e0e0e0',
                      }}
                    >
                      <Typography component="h2" sx={{ color: '#333', fontSize: 'var(--fs-xl)', fontWeight: 700 }}>
                        {title}
                      </Typography>
                    </Box>
                    <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Box component="img" src={icon} alt={program.name} sx={{ width: 120, height: 120, objectFit: 'contain' }} />
                    </Box>
                    <HoverArrow color={program.primary} />
                  </CardActionArea>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Paper>
    </Box>
  );
};
