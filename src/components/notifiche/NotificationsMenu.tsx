import React, { useState } from 'react';
import { Badge, Box, Button, CircularProgress, Divider, IconButton, Popover, Tooltip, Typography } from '@mui/material';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { listNotifiche, type Notifica } from '../../api/notifiche';
import { useAzioniNotifiche, useNonLette } from '../../hooks/useNotifiche';
import { NotificaItem } from './NotificaItem';

// Notifiche mostrate nel pannello; le altre nella pagina "Tutte le notifiche"
const MAX_NEL_PANNELLO = 5;

// Campanello della barra in alto: contatore delle non lette e pannello con le ultime notifiche
export const NotificationsMenu: React.FC = () => {
  const navigate = useNavigate();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const open = !!anchor;
  const { data: nonLette = 0 } = useNonLette();
  const { apri, segnaTutteLette } = useAzioniNotifiche();

  // Elenco caricato solo a pannello aperto
  const { data: notifiche, isLoading } = useQuery({
    queryKey: ['notifiche', 'pannello'],
    queryFn: () => listNotifiche(),
    enabled: open,
    staleTime: 0,
  });

  const chiudi = () => setAnchor(null);
  const apriNotifica = (n: Notifica) => {
    chiudi();
    apri(n);
  };

  const label = nonLette ? `Notifiche (${nonLette} non lette)` : 'Notifiche';

  return (
    <>
      <Tooltip title={label}>
        <IconButton
          aria-label={label}
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={(e) => setAnchor(e.currentTarget)}
          sx={{ color: open ? 'primary.main' : 'text.secondary', mr: 0.5 }}
        >
          <Badge
            badgeContent={nonLette}
            color="error"
            max={99}
            sx={{ '& .MuiBadge-badge': { fontSize: 'var(--fs-2xs)', fontWeight: 700, height: 18, minWidth: 18 } }}
          >
            {nonLette ? <NotificationsActiveOutlinedIcon sx={{ fontSize: 24 }} /> : <NotificationsNoneIcon sx={{ fontSize: 24 }} />}
          </Badge>
        </IconButton>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchor}
        onClose={chiudi}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            role: 'dialog',
            'aria-label': 'Notifiche',
            sx: { width: 400, maxWidth: 'calc(100vw - 32px)', mt: 1, borderRadius: '12px', overflow: 'hidden' },
          },
        }}
      >
        {/* Intestazione */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1.5 }}>
          <Typography component="h2" sx={{ flexGrow: 1, fontSize: 'var(--fs-lg)', fontWeight: 700 }}>
            Notifiche
            {nonLette > 0 && (
              <Typography component="span" sx={{ ml: 1, fontSize: 'var(--fs-sm)', fontWeight: 600, color: 'text.secondary' }}>
                {nonLette} {nonLette === 1 ? 'non letta' : 'non lette'}
              </Typography>
            )}
          </Typography>
          <Button size="small" startIcon={<DoneAllIcon sx={{ fontSize: 18 }} />} onClick={segnaTutteLette} disabled={!nonLette}>
            Segna tutte come lette
          </Button>
        </Box>
        <Divider />

        {/* Elenco */}
        <Box sx={{ maxHeight: 420, overflowY: 'auto' }}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={24} />
            </Box>
          ) : notifiche && notifiche.length > 0 ? (
            notifiche.slice(0, MAX_NEL_PANNELLO).map((n) => <NotificaItem key={n.id} notifica={n} onOpen={apriNotifica} compact />)
          ) : (
            <Box sx={{ py: 5, textAlign: 'center', color: 'text.secondary' }}>
              <NotificationsNoneIcon sx={{ fontSize: 36, opacity: 0.5 }} />
              <Typography sx={{ fontSize: 'var(--fs-md)' }}>Nessuna notifica</Typography>
            </Box>
          )}
        </Box>

        <Divider />
        <Button
          fullWidth
          onClick={() => {
            chiudi();
            navigate('/notifiche');
          }}
          sx={{ borderRadius: 0, py: 1.2 }}
        >
          Vedi tutte le notifiche
        </Button>
      </Popover>
    </>
  );
};
