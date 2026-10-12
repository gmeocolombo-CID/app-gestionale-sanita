import React, { useState } from 'react';
import { Box, Button, MenuItem, Paper, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import { useQuery } from '@tanstack/react-query';
import { listNotifiche, TIPI_NOTIFICA, type TipoNotifica } from '../api/notifiche';
import { useAzioniNotifiche, useNonLette } from '../hooks/useNotifiche';
import { NotificaItem } from '../components/notifiche/NotificaItem';
import { SelectField } from '../components/SelectField';
import { TablePaginator } from '../components/TablePaginator';
import { paginate } from '../utils/pagination';

// Storico completo delle notifiche: filtri per stato e tipo, paginazione
export const NotifichePage: React.FC = () => {
  const [soloNonLette, setSoloNonLette] = useState(false);
  const [tipo, setTipo] = useState<TipoNotifica | ''>('');
  const [requestedPage, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const { data: nonLette = 0 } = useNonLette();
  const { apri, cambiaLetta, segnaTutteLette } = useAzioniNotifiche();

  const { data: notifiche = [], isLoading } = useQuery({
    queryKey: ['notifiche', 'elenco', tipo, soloNonLette],
    queryFn: () => listNotifiche({ tipo, soloNonLette }),
    staleTime: 0,
  });
  const { page, pageCount, rows } = paginate(notifiche, requestedPage, pageSize);

  return (
    <Box sx={{ width: '100%', maxWidth: 960 }}>
      {/* Filtri: si applicano subito */}
      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 2 }}>
        <ToggleButtonGroup
          exclusive
          size="small"
          color="primary"
          value={soloNonLette ? 'nonLette' : 'tutte'}
          onChange={(_, v: string | null) => {
            if (!v) return;
            setSoloNonLette(v === 'nonLette');
            setPage(0);
          }}
          aria-label="Stato delle notifiche"
          sx={{ backgroundColor: 'background.paper', '& .MuiToggleButton-root': { textTransform: 'none', px: 2, fontWeight: 600 } }}
        >
          <ToggleButton value="tutte">Tutte</ToggleButton>
          <ToggleButton value="nonLette">Non lette{nonLette > 0 && ` (${nonLette})`}</ToggleButton>
        </ToggleButtonGroup>

        <SelectField
          placeholder="Tipo"
          size="small"
          value={tipo}
          onChange={(e) => {
            setTipo(e.target.value as TipoNotifica | '');
            setPage(0);
          }}
          sx={{ width: 220 }}
        >
          <MenuItem value="">Tutti i tipi</MenuItem>
          {Object.entries(TIPI_NOTIFICA).map(([value, label]) => (
            <MenuItem key={value} value={value}>
              {label}
            </MenuItem>
          ))}
        </SelectField>

        <Button
          variant="outlined"
          startIcon={<DoneAllIcon sx={{ fontSize: 18 }} />}
          onClick={segnaTutteLette}
          disabled={!nonLette}
          sx={{ ml: { sm: 'auto' } }}
        >
          Segna tutte come lette
        </Button>
      </Box>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
        <Box sx={{ px: 2, py: 1.2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography aria-live="polite" sx={{ fontSize: 'var(--fs-sm)', color: 'text.secondary' }}>
            <Box component="strong" sx={{ color: 'text.primary', fontSize: 'var(--fs-base)' }}>
              {notifiche.length}
            </Box>{' '}
            {notifiche.length === 1 ? 'notifica' : 'notifiche'}
          </Typography>
        </Box>

        {!isLoading && notifiche.length === 0 ? (
          <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
            <NotificationsNoneIcon sx={{ fontSize: 36, opacity: 0.5 }} />
            <Typography sx={{ fontSize: 'var(--fs-md)' }}>
              {soloNonLette || tipo ? 'Nessuna notifica per i filtri scelti' : 'Nessuna notifica'}
            </Typography>
          </Box>
        ) : (
          rows.map((n) => <NotificaItem key={n.id} notifica={n} onOpen={apri} onToggleLetta={cambiaLetta} />)
        )}

        {notifiche.length > 0 && (
          <TablePaginator
            page={page}
            pageCount={pageCount}
            pageSize={pageSize}
            totalCount={notifiche.length}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(0);
            }}
          />
        )}
      </Paper>
    </Box>
  );
};
