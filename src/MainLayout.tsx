import React, { Suspense, useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Breadcrumbs,
  LinearProgress,
  Tooltip,
  Link,
  Avatar,
  ButtonBase,
} from '@mui/material';
import { alpha, type Theme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet, useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { logout, type RootState, type AppDispatch } from './store';
import { topBarStripeGradient } from './theme';
import { APP_NAME, DOMANDE_PATHS, findMenuItem } from './navigation';
import { AppMenu } from './components/AppMenu';
import { AppFooter } from './components/AppFooter';
import { NotificationsMenu } from './components/notifiche/NotificationsMenu';
import { AnimatedBackground } from './components/AnimatedBackground';
import logoAsl from './assets/logos/logo-asl-napoli1.jpg';
import logoRegione from './assets/logos/logo-regione-campania.png';

const HEADER_HEIGHT = 60;

// Voce del percorso: con "to" è un link, senza è la pagina corrente
interface Crumb {
  label: string;
  to?: string;
}

const crumbFocusSx = {
  borderRadius: '6px',
  outlineOffset: 2,
  '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main' },
};

export const MainLayout: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const username = useSelector((state: RootState) => state.auth.username);
  const activeProgram = useSelector((state: RootState) => state.ui.activeProgram);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  // Percorso della pagina corrente (dopo "Home")
  const crumbs = ((): Crumb[] => {
    const p = location.pathname;

    // Wizard domanda: lista del programma corrente + pagina attuale
    if (p.startsWith('/domande/nuova') || p.startsWith('/domande/visualizza')) {
      const listPath = DOMANDE_PATHS[activeProgram];
      const listItem = findMenuItem(listPath);
      return [
        { label: listItem?.title ?? listItem?.label ?? 'Domande', to: listPath },
        {
          label: p.startsWith('/domande/visualizza')
            ? 'Visualizza Domanda'
            : new URLSearchParams(location.search).has('edit')
              ? 'Modifica Domanda'
              : 'Nuova Domanda',
        },
      ];
    }

    // Inserimento / modifica utente: lista Utenti + pagina attuale
    if (p.startsWith('/utenti/')) {
      return [{ label: 'Utenti', to: '/utenti' }, { label: p === '/utenti/nuovo' ? 'Nuovo Utente' : 'Modifica Utente' }];
    }

    if (p === '/') return [];
    // Pagina raggiunta dal campanello, non presente nel menu
    if (p === '/notifiche') return [{ label: 'Notifiche' }];
    if (p === '/profilo') return [{ label: 'Il mio profilo' }];
    const item = findMenuItem(p);
    return item ? [{ label: item.title ?? item.label }] : [];
  })();
  const isHome = crumbs.length === 0;

  const pageTitle = crumbs[crumbs.length - 1]?.label;
  const initials = (username ?? '').slice(0, 2).toUpperCase();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'background.default' }}>
      {/* 1. Barra in alto: bianca, con logo, nome del portale al centro e utente */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={(theme: Theme) => ({
          height: HEADER_HEIGHT,
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          borderBottom: `1px solid ${theme.palette.divider}`,
          justifyContent: 'center',
          // Bordo inferiore di 1px con la sfumatura nel colore del programma (copre esattamente il bordo grigio)
          '&::after': {
            content: '""',
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: -1,
            height: '1px',
            background: topBarStripeGradient(theme),
          },
        })}
      >
        {/* Griglia a 3 colonne con i lati di pari larghezza: il titolo resta centrato rispetto alla pagina */}
        <Toolbar sx={{ minHeight: `${HEADER_HEIGHT}px !important`, px: 2, gap: 1.5, display: 'grid', gridTemplateColumns: '1fr auto 1fr' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, justifySelf: 'start' }}>
            <IconButton onClick={() => setMenuOpen(true)} aria-label="Apri menu" sx={{ color: 'primary.main' }}>
              <MenuIcon sx={{ fontSize: 26 }} />
            </IconButton>
            <Box
              component={RouterLink}
              to="/"
              aria-label="Vai alla home"
              sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1.5, ...crumbFocusSx }}
            >
              {/* Loghi istituzionali, nello stesso ordine delle pagine di accesso: ASL Napoli 1 Centro, poi Regione Campania */}
              <Box component="img" src={logoAsl} alt="ASL Napoli 1 Centro" sx={{ height: 44, width: 'auto', display: 'block' }} />
              <Box component="img" src={logoRegione} alt="Regione Campania" sx={{ height: 44, width: 'auto', display: 'block' }} />
            </Box>
          </Box>
          <Typography
            noWrap
            sx={{ fontWeight: 700, fontSize: 'var(--fs-xl)', textAlign: 'center', maxWidth: '55vw', color: 'primary.dark' }}
          >
            {APP_NAME}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifySelf: 'end' }}>
            <NotificationsMenu />
            {/* Avatar e nome: portano alla pagina del profilo */}
            <Tooltip title="Il mio profilo">
              <ButtonBase
                component={RouterLink}
                to="/profilo"
                aria-label={`Il mio profilo (${username})`}
                sx={(theme: Theme) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  py: 0.5,
                  pl: 0.5,
                  pr: { xs: 0.5, md: 1.25 },
                  borderRadius: '999px',
                  transition: 'background-color 0.2s ease',
                  '&:hover, &.Mui-focusVisible': { backgroundColor: alpha(theme.palette.primary.main, 0.08) },
                  ...(location.pathname === '/profilo' && { backgroundColor: alpha(theme.palette.primary.main, 0.1) }),
                })}
              >
                <Avatar sx={{ width: 32, height: 32, fontSize: 'var(--fs-sm)', fontWeight: 700, bgcolor: 'primary.main' }}>
                  {initials}
                </Avatar>
                <Typography
                  noWrap
                  sx={{ display: { xs: 'none', md: 'block' }, fontWeight: 600, fontSize: 'var(--fs-base)', maxWidth: 160, color: 'text.primary' }}
                >
                  {username}
                </Typography>
              </ButtonBase>
            </Tooltip>
            <Tooltip title="Esci">
              <IconButton onClick={handleLogout} aria-label="Esci" sx={{ color: 'text.secondary', ml: 0.5 }}>
                <LogoutIcon sx={{ fontSize: 22 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* 2. Menu a scomparsa */}
      <AppMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* 3. Contenuto Principale */}
      <Box component="main" sx={{ flexGrow: 1, pt: `${HEADER_HEIGHT}px`, display: 'flex', flexDirection: 'column' }}>
        {/* Intestazione di pagina: percorso piccolo e titolo grande (non in home, che ha la sua intestazione) */}
        {!isHome && (
          <Box sx={{ px: { xs: 2, md: 3 }, pt: 2.5, pb: 0.5 }}>
            <Breadcrumbs
              aria-label="Percorso"
              separator={<NavigateNextIcon sx={{ fontSize: 16, color: 'text.secondary' }} />}
              sx={{ fontSize: 'var(--fs-sm)' }}
            >
              <Link
                component={RouterLink}
                to="/"
                underline="hover"
                sx={{ ...crumbFocusSx, display: 'inline-flex', alignItems: 'center', gap: 0.5, fontWeight: 600 }}
              >
                <HomeIcon sx={{ fontSize: 16 }} />
                Home
              </Link>
              {/* Solo i livelli superiori: la pagina corrente è già nel titolo sotto */}
              {crumbs.slice(0, -1).map((crumb) => (
                <Link key={crumb.label} component={RouterLink} to={crumb.to ?? '/'} underline="hover" sx={{ ...crumbFocusSx, fontWeight: 600 }}>
                  {crumb.label}
                </Link>
              ))}
            </Breadcrumbs>
            {/* Titolo nel colore del programma attivo: blu (medici) o verde acqua (pediatri) */}
            <Typography component="h1" sx={{ mt: 0.5, fontSize: 'var(--fs-3xl)', fontWeight: 700, color: 'primary.main', lineHeight: 1.3 }}>
              {pageTitle}
            </Typography>
          </Box>
        )}

        {/* Area contenuti in colonna: una pagina può occupare tutta l'altezza disponibile (es. home centrata) */}
        <Box sx={{ position: 'relative', flexGrow: 1, px: { xs: 2, md: 3 }, py: 2, display: 'flex', flexDirection: 'column' }}>
          {/* Sfondo animato solo in home, con le onde ai lati */}
          {location.pathname === '/' && <AnimatedBackground variant="sides" />}
          <Box sx={{ position: 'relative', zIndex: 1, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <Suspense fallback={<LinearProgress />}>
              <Outlet />
            </Suspense>
          </Box>
        </Box>
      </Box>

      {/* 4. Footer */}
      <AppFooter height={HEADER_HEIGHT} />
    </Box>
  );
};
