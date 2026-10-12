import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import type { Theme } from '@mui/material/styles';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import type { RootState } from '../../store';
import { APP_NAME } from '../../navigation';
import { RADIUS, topBarStripeGradient } from '../../theme';
import { AppFooter } from '../AppFooter';
import { AnimatedBackground } from '../AnimatedBackground';
import logoAsl from '../../assets/logos/logo-asl-napoli1.jpg';
import logoRegione from '../../assets/logos/logo-regione-campania.png';
import iconaMedici from '../../assets/icone/brigade.png';

// Altezza della barra in alto (e del footer) delle pagine di accesso
const AUTH_HEADER_HEIGHT = 80;

// Altezza dell'icona dei medici nella barra in alto
const ICONA_ALTEZZA = 64;

interface AuthLayoutProps {
  title: string;
  // Breve frase di aiuto sotto il titolo
  subtitle?: string;
  maxWidth?: number;
  children: React.ReactNode;
}

// Cornice comune delle pagine pubbliche (login, registrazione, reset password)
export const AuthLayout: React.FC<AuthLayoutProps> = ({ title, subtitle, maxWidth = 400, children }) => {
  const username = useSelector((state: RootState) => state.auth.username);

  // Utente già autenticato: niente pagine pubbliche, si va alla home
  if (username) return <Navigate to="/" replace />;

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'background.default' }}>
      {/* Barra in alto: bianca con striscia sfumata, come nelle pagine interne */}
      <Box
        component="header"
        sx={(theme: Theme) => ({
          position: 'relative',
          height: AUTH_HEADER_HEIGHT,
          backgroundColor: theme.palette.background.paper,
          borderBottom: `0px solid ${theme.palette.divider}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 1.5,
          // Bordo inferiore di 1px con la sfumatura (copre esattamente il bordo grigio)
          '&::after': {
            content: '""',
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: -1,
            height: '2px',
            background: topBarStripeGradient(theme),
          },
        })}
      >
        {/* Icona dei medici appoggiata sul bordo inferiore, nome del portale centrato in verticale */}
        <Box sx={{ height: '100%', display: 'flex', alignItems: 'flex-end', gap: 1.5, minWidth: 0 }}>
          <Box
            component="img"
            src={iconaMedici}
            alt=""
            aria-hidden
            // Il PNG ha 31px trasparenti in basso (su 512): li compensiamo, così il disegno
            // tocca esattamente la linea sfumata del bordo inferiore
            sx={{
              height: ICONA_ALTEZZA,
              width: 'auto',
              display: 'block',
              mb: `${-(ICONA_ALTEZZA * 31) / 512}px`,
              flexShrink: 0,
            }}
          />
          <Typography
            noWrap
            sx={{ alignSelf: 'center', color: 'primary.dark', fontWeight: 600, fontSize: 'var(--fs-3xl)', textAlign: 'center' }}
          >
            {APP_NAME}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ position: 'relative', flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
        <AnimatedBackground variant="horizontal" />
        <Paper
          elevation={0}
          sx={{
            position: 'relative',
            zIndex: 1,
            width: '100%',
            maxWidth,
            borderRadius: `${RADIUS.lg}px`,
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: (theme: Theme) => theme.shadows[6],
          }}
        >
          {/* Loghi istituzionali: prima ASL Napoli 1 Centro, poi Regione Campania */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              px: 3,
              pt: 3,
              pb: 1,
            }}
          >
            <Box component="img" src={logoAsl} alt="ASL Napoli 1 Centro" sx={{ height: 80, width: 'auto' }} />
            <Box component="img" src={logoRegione} alt="Regione Campania" sx={{ height: 80, width: 'auto' }} />
          </Box>

          {/* Titolo e frase di aiuto */}
          <Box sx={{ px: 3, pt: 1.5, textAlign: 'center' }}>
            <Typography component="h1" sx={{ fontWeight: 700, fontSize: 'var(--fs-3xl)', color: 'text.primary', lineHeight: 1.3 }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography sx={{ mt: 0.5, fontSize: 'var(--fs-sm)', color: 'text.secondary' }}>{subtitle}</Typography>
            )}
          </Box>

          <Box sx={{ px: 3, pt: 2.5, pb: 3 }}>{children}</Box>
        </Paper>
      </Box>

      <AppFooter height={AUTH_HEADER_HEIGHT} />
    </Box>
  );
};
