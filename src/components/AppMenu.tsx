import React, { useState } from 'react';
import { Avatar, Box, Button, Collapse, Drawer, IconButton, List, ListItemButton, Typography } from '@mui/material';
import { alpha, type Theme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { keyframes } from '@emotion/react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { MENU_SECTIONS } from '../navigation';
import type { RootState } from '../store';

const MENU_WIDTH = 300;

// Ingresso delle voci a cascata all'apertura del menu
const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-12px); }
  to   { opacity: 1; transform: translateX(0); }
`;

interface AppMenuProps {
  open: boolean;
  onClose: () => void;
}

export const AppMenu: React.FC<AppMenuProps> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const username = useSelector((state: RootState) => state.auth.username) ?? '';
  // Tutte le sezioni aperte di default, come nel menu originale
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleSection = (label: string) => setCollapsed((prev) => ({ ...prev, [label]: !prev[label] }));

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  // Indice progressivo delle voci, per ritardare l'ingresso di ciascuna
  let itemIndex = 0;

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: { sx: { width: MENU_WIDTH, backgroundColor: '#f7fafb', borderRight: 'none' } },
        backdrop: { sx: { backgroundColor: 'rgba(20, 45, 60, 0.25)', backdropFilter: 'blur(2px)' } },
      }}
    >
      {/* Intestazione: fascia colorata con utente collegato */}
      <Box
        sx={(theme: Theme) => ({
          position: 'relative',
          px: 2.5,
          pt: 3,
          pb: 2.5,
          color: '#ffffff',
          background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 60%, ${alpha(
            theme.palette.primary.main,
            0.85
          )} 100%)`,
          overflow: 'hidden',
          // Cerchi decorativi sullo sfondo della fascia
          '&::before, &::after': {
            content: '""',
            position: 'absolute',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
          },
          '&::before': { width: 160, height: 160, top: -60, right: -40 },
          '&::after': { width: 90, height: 90, bottom: -40, right: 70 },
        })}
      >
        <IconButton
          size="small"
          onClick={onClose}
          aria-label="Chiudi menu"
          sx={{ position: 'absolute', top: 8, right: 8, color: '#ffffff', zIndex: 1 }}
        >
          <CloseIcon sx={{ fontSize: 20 }} />
        </IconButton>
        <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar
            sx={{
              width: 44,
              height: 44,
              backgroundColor: '#ffffff',
              color: 'primary.main',
              fontWeight: 700,
              fontSize: 'var(--fs-2xl)',
              boxShadow: '0 1px 4px rgba(0, 0, 0, 0.15)',
            }}
          >
            {username.slice(0, 2).toUpperCase()}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: 'var(--fs-2xs)', opacity: 0.85, textTransform: 'uppercase', letterSpacing: '1.2px' }}>
              Menu
            </Typography>
            <Typography noWrap sx={{ fontSize: 'var(--fs-2xl)', fontWeight: 700, textTransform: 'uppercase' }}>
              {username}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Sezioni */}
      <Box component="nav" aria-label="Menu principale" sx={{ px: 1.5, py: 1.5, flexGrow: 1, overflowY: 'auto' }}>
        {MENU_SECTIONS.map((section) => {
          const isOpen = !collapsed[section.label];
          return (
            <Box key={section.label} sx={{ mb: 1 }}>
              {/* Titolo sezione: maiuscoletto con freccia che ruota */}
              <ListItemButton
                onClick={() => toggleSection(section.label)}
                aria-expanded={isOpen}
                sx={{
                  borderRadius: '8px',
                  px: 1,
                  py: 0.6,
                  gap: 1,
                  color: 'primary.dark',
                  '&:hover': { backgroundColor: 'transparent', color: 'primary.main' },
                }}
              >
                <Typography sx={{ fontSize: 'var(--fs-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.2px' }}>
                  {section.label}
                </Typography>
                <Box sx={{ flexGrow: 1, height: '1px', backgroundColor: (theme: Theme) => alpha(theme.palette.primary.main, 0.2) }} />
                <ExpandMoreIcon
                  sx={{ fontSize: 18, transition: 'transform 0.25s ease', transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)' }}
                />
              </ListItemButton>

              <Collapse in={isOpen}>
                <List disablePadding sx={{ py: 0.5 }}>
                  {section.items.map(({ label, path, icon }) => {
                    const isSelected = location.pathname === path;
                    const delay = itemIndex++ * 30;
                    return (
                      <ListItemButton
                        key={path}
                        selected={isSelected}
                        onClick={() => handleNavigate(path)}
                        sx={(theme: Theme) => ({
                          position: 'relative',
                          gap: 1.5,
                          py: 0.6,
                          px: 1,
                          mb: 0.3,
                          borderRadius: '10px',
                          transition: 'background-color 0.2s ease, transform 0.2s ease',
                          animation: `${slideIn} 0.35s ease-out both`,
                          animationDelay: `${delay}ms`,
                          '@media (prefers-reduced-motion: reduce)': { animation: 'none', transition: 'none' },
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.07),
                            transform: 'translateX(3px)',
                            '& .menu-icon img': { transform: 'scale(1.1)' },
                          },
                          // Voce attiva: sfondo tenue e barretta laterale
                          '&.Mui-selected, &.Mui-selected:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.12),
                          },
                          '&.Mui-selected::before': {
                            content: '""',
                            position: 'absolute',
                            left: -6,
                            top: 8,
                            bottom: 8,
                            width: 4,
                            borderRadius: 4,
                            backgroundColor: theme.palette.primary.main,
                          },
                        })}
                      >
                        <Box
                          className="menu-icon"
                          sx={{
                            flexShrink: 0,
                            // Icona senza riquadro: resta la trasparenza del PNG
                            width: 32,
                            height: 32,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            '& img': { transition: 'transform 0.2s ease' },
                          }}
                        >
                          <img src={icon} alt="" width={26} height={26} />
                        </Box>
                        <Typography
                          sx={{
                            fontSize: 'var(--fs-lg)',
                            fontWeight: isSelected ? 700 : 500,
                            color: isSelected ? 'primary.dark' : '#2b3a42',
                            lineHeight: 1.25,
                          }}
                        >
                          {label}
                        </Typography>
                      </ListItemButton>
                    );
                  })}
                </List>
              </Collapse>
            </Box>
          );
        })}
      </Box>

      {/* Chiusura */}
      <Box sx={{ px: 2, py: 2, borderTop: '1px solid #e6eef2' }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<CloseIcon sx={{ fontSize: 18 }} />}
          onClick={onClose}
          sx={{ borderRadius: '10px', py: 0.8, backgroundColor: '#ffffff' }}
        >
          Chiudi
        </Button>
      </Box>
    </Drawer>
  );
};
