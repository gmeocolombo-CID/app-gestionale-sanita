import React from 'react';
import { Alert, Avatar, Box, Button, Chip, Grid, LinearProgress, Paper, Typography } from '@mui/material';
import { alpha, type Theme } from '@mui/material/styles';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlined';
import ContactMailOutlinedIcon from '@mui/icons-material/ContactMailOutlined';
import LockResetIcon from '@mui/icons-material/LockReset';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '../store';
import { getUtenteCollegato } from '../api/utenti';
import { SectionCard } from '../components/SectionCard';

const labelSx = { fontSize: 'var(--fs-md)', fontWeight: 700, color: 'text.secondary' };
const valueSx = { fontSize: 'var(--fs-base)', color: 'text.primary', wordBreak: 'break-word' as const };

// Coppie etichetta/valore in sola lettura, su due colonne
const DatiGrid: React.FC<{ items: { label: string; value: React.ReactNode }[] }> = ({ items }) => (
  <Grid container rowSpacing={1.5} columnSpacing={2}>
    {items.map(({ label, value }) => (
      <React.Fragment key={label}>
        <Grid size={{ xs: 12, sm: 4, md: 3 }}>
          <Typography sx={labelSx}>{label}</Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 8, md: 9 }}>
          <Typography sx={valueSx}>{value || '—'}</Typography>
        </Grid>
      </React.Fragment>
    ))}
  </Grid>
);

// Profilo dell'utente collegato: dati in sola lettura e scorciatoie personali
export const ProfiloPage: React.FC = () => {
  const navigate = useNavigate();
  const username = useSelector((state: RootState) => state.auth.username) ?? '';

  const { data: utente, isLoading } = useQuery({
    queryKey: ['utenti', 'collegato', username],
    queryFn: () => getUtenteCollegato(username),
  });

  if (isLoading) return <LinearProgress />;

  const nomeCompleto = utente ? `${utente.nome} ${utente.cognome}` : username;

  return (
    <Box sx={{ width: '100%', maxWidth: 960 }}>
      {/* Intestazione: avatar, nome, profilo e azioni personali */}
      <Paper
        elevation={0}
        sx={(theme: Theme) => ({
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2.5,
          p: 3,
          mb: 2.5,
          border: '1px solid',
          borderColor: 'divider',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${theme.palette.background.paper} 70%)`,
        })}
      >
        <Avatar sx={{ width: 72, height: 72, fontSize: 'var(--fs-3xl)', fontWeight: 700, bgcolor: 'primary.main' }}>
          {username.slice(0, 2).toUpperCase()}
        </Avatar>
        <Box sx={{ flexGrow: 1, minWidth: 200 }}>
          <Typography component="h2" sx={{ fontSize: 'var(--fs-2xl)', fontWeight: 700, lineHeight: 1.3 }}>
            {nomeCompleto}
          </Typography>
          <Typography sx={{ fontSize: 'var(--fs-md)', color: 'text.secondary', mb: utente ? 1 : 0 }}>Username: {username}</Typography>
          {utente && (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip size="small" label={utente.profilo} color="primary" />
              <Chip size="small" variant="outlined" label={utente.attivo ? 'Attivo' : 'Disattivato'} color={utente.attivo ? 'success' : 'default'} />
              {utente.bloccato && <Chip size="small" variant="outlined" label="Bloccato" color="error" />}
            </Box>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button variant="outlined" startIcon={<NotificationsNoneIcon sx={{ fontSize: 18 }} />} onClick={() => navigate('/notifiche')}>
            Notifiche
          </Button>
          <Button variant="contained" startIcon={<LockResetIcon sx={{ fontSize: 18 }} />} onClick={() => navigate('/modifica-password')}>
            Modifica password
          </Button>
        </Box>
      </Paper>

      {utente ? (
        <>
          <SectionCard title="Dati anagrafici" icon={PersonOutlineIcon}>
            <DatiGrid
              items={[
                { label: 'Codice fiscale', value: utente.codice },
                { label: 'Nome', value: utente.nome },
                { label: 'Cognome', value: utente.cognome },
              ]}
            />
          </SectionCard>
          <SectionCard title="Contatti e documento" icon={ContactMailOutlinedIcon}>
            <DatiGrid
              items={[
                { label: 'PEC', value: utente.pec },
                { label: 'Telefono', value: utente.telefono },
                { label: 'Scadenza documento', value: utente.dataScadenzaDocumento },
              ]}
            />
          </SectionCard>
          <Typography sx={{ fontSize: 'var(--fs-sm)', color: 'text.secondary' }}>
            Per correggere i tuoi dati rivolgiti all'amministratore del portale.
          </Typography>
        </>
      ) : (
        <Alert severity="info">I dati anagrafici di questo account non sono disponibili.</Alert>
      )}
    </Box>
  );
};
