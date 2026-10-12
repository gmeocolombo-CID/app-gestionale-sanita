import React, { useState } from 'react';
import {
  Box,
  Grid,
  MenuItem,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SearchFilterCard } from '../components/SearchFilterCard';
import { SelectField } from '../components/SelectField';
import { DataTable, type Column } from '../components/DataTable';
import { useSearchFilters } from '../hooks/useSearchFilters';

type StatoConsolidamento = 'Da consolidare' | 'Consolidata';

interface ConsolidamentoItem {
  id: string;
  anno: number;
  tipologiaGraduatoria: string;
  stato: StatoConsolidamento;
  dataConsolidamento: string | null;
}

const TIPOLOGIE = ['Medici di medicina generale', 'Pediatri di libera scelta'];

// Dati di esempio: in futuro arriveranno dall'API (qui sono modificabili per simulare il consolidamento)
const mockDb: ConsolidamentoItem[] = [
  { id: '1', anno: 2026, tipologiaGraduatoria: TIPOLOGIE[0], stato: 'Da consolidare', dataConsolidamento: null },
  { id: '2', anno: 2026, tipologiaGraduatoria: TIPOLOGIE[1], stato: 'Da consolidare', dataConsolidamento: null },
  { id: '3', anno: 2025, tipologiaGraduatoria: TIPOLOGIE[0], stato: 'Consolidata', dataConsolidamento: '15/02/2025' },
  { id: '4', anno: 2025, tipologiaGraduatoria: TIPOLOGIE[1], stato: 'Consolidata', dataConsolidamento: '15/02/2025' },
  { id: '5', anno: 2024, tipologiaGraduatoria: TIPOLOGIE[0], stato: 'Consolidata', dataConsolidamento: '20/10/2024' },
  { id: '6', anno: 2024, tipologiaGraduatoria: TIPOLOGIE[1], stato: 'Consolidata', dataConsolidamento: '21/10/2024' },
];

const ANNI = Array.from(new Set(mockDb.map((r) => r.anno))).sort((a, b) => b - a);

export const ConsolidamentoPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { bind, applied, apply, reset } = useSearchFilters({ anno: '', tipologia: '', stato: '' });
  const [daConsolidare, setDaConsolidare] = useState<ConsolidamentoItem | null>(null);
  const [esito, setEsito] = useState<string | null>(null);

  const { data: righe = [] } = useQuery<ConsolidamentoItem[]>({
    queryKey: ['consolidamento', applied],
    queryFn: async () =>
      mockDb.filter(
        (r) =>
          (!applied.anno || String(r.anno) === applied.anno) &&
          (!applied.tipologia || r.tipologiaGraduatoria === applied.tipologia) &&
          (!applied.stato || r.stato === applied.stato)
      ),
  });

  // TODO: sostituire con la chiamata all'API di consolidamento
  const consolida = useMutation({
    mutationFn: async (id: string) => {
      const record = mockDb.find((r) => r.id === id);
      if (record) {
        record.stato = 'Consolidata';
        record.dataConsolidamento = new Date().toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
      }
      return record;
    },
    onSuccess: (record) => {
      queryClient.invalidateQueries({ queryKey: ['consolidamento'] });
      if (record) setEsito(`Graduatoria ${record.tipologiaGraduatoria} ${record.anno} consolidata.`);
    },
  });

  const columns: Column<ConsolidamentoItem>[] = [
    { id: 'anno', header: 'Anno', align: 'center', render: (r) => r.anno },
    { id: 'tipologiaGraduatoria', header: 'Tipologia graduatoria', align: 'center', render: (r) => r.tipologiaGraduatoria },
    {
      id: 'stato',
      header: 'Stato',
      align: 'center',
      render: (r) => (
        <Chip
          size="small"
          label={r.stato}
          color={r.stato === 'Consolidata' ? 'success' : 'warning'}
          variant="outlined"
          sx={{ fontSize: 'var(--fs-xs)', fontWeight: 600 }}
        />
      ),
    },
    { id: 'dataConsolidamento', header: 'Data di consolidamento', align: 'center', render: (r) => r.dataConsolidamento ?? '—' },
    {
      id: 'operazioni',
      header: 'Operazioni',
      align: 'center',
      render: (r) =>
        r.stato === 'Da consolidare' ? (
          <Button
            size="small"
            variant="outlined"
            startIcon={<LockIcon sx={{ fontSize: 18 }} />}
            onClick={() => setDaConsolidare(r)}
          >
            Consolida
          </Button>
        ) : null,
    },
  ];

  const confermaConsolidamento = () => {
    if (daConsolidare) consolida.mutate(daConsolidare.id);
    setDaConsolidare(null);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <SearchFilterCard onSearch={apply} onReset={reset}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <SelectField placeholder="Anno" size="small" fullWidth {...bind('anno')}>
              <MenuItem value="">Tutti</MenuItem>
              {ANNI.map((a) => (
                <MenuItem key={a} value={String(a)}>
                  {a}
                </MenuItem>
              ))}
            </SelectField>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <SelectField placeholder="Tipologia graduatoria" size="small" fullWidth {...bind('tipologia')}>
              <MenuItem value="">Tutte</MenuItem>
              {TIPOLOGIE.map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </SelectField>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <SelectField placeholder="Stato" size="small" fullWidth {...bind('stato')}>
              <MenuItem value="">Tutti</MenuItem>
              <MenuItem value="Da consolidare">Da consolidare</MenuItem>
              <MenuItem value="Consolidata">Consolidata</MenuItem>
            </SelectField>
          </Grid>
        </Grid>
      </SearchFilterCard>

      <DataTable columns={columns} data={righe} showToolbar={false} paginated />

      {/* Conferma: il consolidamento rende definitiva la graduatoria */}
      <Dialog open={!!daConsolidare} onClose={() => setDaConsolidare(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontSize: 'var(--fs-2xl)', fontWeight: 700 }}>Conferma consolidamento</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: 'var(--fs-lg)' }}>
            Vuoi consolidare la graduatoria <strong>{daConsolidare?.tipologiaGraduatoria}</strong> per l'anno{' '}
            <strong>{daConsolidare?.anno}</strong>? Dopo il consolidamento la graduatoria non sarà più modificabile.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDaConsolidare(null)}>Annulla</Button>
          <Button variant="contained" disableElevation startIcon={<LockIcon sx={{ fontSize: 18 }} />} onClick={confermaConsolidamento}>
            Consolida
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!esito}
        autoHideDuration={4000}
        onClose={() => setEsito(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" onClose={() => setEsito(null)}>
          {esito}
        </Alert>
      </Snackbar>
    </Box>
  );
};
