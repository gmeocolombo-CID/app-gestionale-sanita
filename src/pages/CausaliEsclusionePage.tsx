import React, { useState } from 'react';
import {
  Box,
  Grid,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { SearchFilterCard } from '../components/SearchFilterCard';
import { DataTable, type Column } from '../components/DataTable';
import { useSearchFilters } from '../hooks/useSearchFilters';
import { matchesText } from '../utils/filters';

interface CausaleEsclusione {
  id: string;
  codice: string;
  descrizione: string;
}

// Dati di esempio ripresi dal vecchio portale: in futuro arriveranno dall'API
let mockDb: CausaleEsclusione[] = [
  { id: '1', codice: '1', descrizione: 'MANCANZA DEL TITOLO VALIDO PER INCLUSIONE IN GRADUATORIA' },
  { id: '2', codice: '2', descrizione: "RAGGIUNTO LIMITE DI ETA'" },
  { id: '3', codice: '3', descrizione: 'DOMANDA PRESENTATA FUORI TERMINE' },
  { id: '4', codice: '4', descrizione: 'MANCANZA DOCUMENTAZIONE ATTESTANTE PUNTEGGI' },
  { id: '5', codice: '5', descrizione: 'MANCANZA DOCUMENTAZIONE E ATTESTAZIONE ORDINE MEDICI' },
  { id: '6', codice: '6', descrizione: "NON IN REGOLA CON L'IMPOSTA DI BOLLO" },
  { id: '7', codice: '7', descrizione: 'MANCANZA ISCRIZIONE ALBO' },
  { id: '8', codice: '8', descrizione: 'DOMANDA ERRATA E INCOMPLETA' },
  { id: '9', codice: '9', descrizione: 'Raggiunto massimale orario art.26 , comma12' },
];

const causaleSchema = z.object({
  codice: z.string().trim().min(1, 'Obbligatorio').max(10, 'Massimo 10 caratteri'),
  descrizione: z.string().trim().min(1, 'Obbligatorio').max(255, 'Massimo 255 caratteri'),
});

type CausaleFormValues = z.infer<typeof causaleSchema>;

// --- Finestra di inserimento / modifica ---

const CausaleDialog: React.FC<{
  // null = nuova causale
  causale: CausaleEsclusione | null;
  onClose: () => void;
  onSaved: (msg: string) => void;
}> = ({ causale, onClose, onSaved }) => {
  const queryClient = useQueryClient();
  const isNew = causale === null;

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CausaleFormValues>({
    resolver: zodResolver(causaleSchema),
    defaultValues: { codice: causale?.codice ?? '', descrizione: causale?.descrizione ?? '' },
  });

  // TODO: sostituire con le chiamate all'API (inserimento / aggiornamento)
  const save = useMutation({
    mutationFn: async (values: CausaleFormValues) => {
      if (isNew) {
        mockDb = [...mockDb, { id: crypto.randomUUID(), ...values }];
      } else {
        mockDb = mockDb.map((c) => (c.id === causale.id ? { ...c, descrizione: values.descrizione } : c));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['causaliEsclusione'] });
      onSaved(isNew ? 'Causale inserita.' : 'Causale aggiornata.');
      onClose();
    },
  });

  const onSubmit = (values: CausaleFormValues) => {
    // Il codice identifica la causale: non può essere duplicato
    if (isNew && mockDb.some((c) => c.codice.toLowerCase() === values.codice.toLowerCase())) {
      setError('codice', { message: 'Codice già esistente' });
      return;
    }
    save.mutate(values);
  };

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle sx={{ fontSize: 'var(--fs-2xl)', fontWeight: 700 }}>{isNew ? 'Nuova causale di esclusione' : 'Modifica causale di esclusione'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
          <TextField
            placeholder="Codice *"
            size="small"
            required
            autoFocus={isNew}
            // Il codice è la chiave della causale: modificabile solo in inserimento
            disabled={!isNew}
            {...register('codice')}
            error={!!errors.codice}
            helperText={errors.codice?.message}
            sx={{ maxWidth: 200 }}
          />
          <TextField
            placeholder="Descrizione *"
            size="small"
            required
            fullWidth
            multiline
            minRows={2}
            autoFocus={!isNew}
            {...register('descrizione')}
            error={!!errors.descrizione}
            helperText={errors.descrizione?.message}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={save.isPending}>
            Annulla
          </Button>
          <Button type="submit" variant="contained" disableElevation disabled={save.isPending} startIcon={<SaveIcon sx={{ fontSize: 18 }} />}>
            Salva
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

// --- Pagina ---

export const CausaliEsclusionePage: React.FC = () => {
  const queryClient = useQueryClient();
  const { bind, applied, apply, reset } = useSearchFilters({ codice: '', descrizione: '' });
  // undefined = finestra chiusa, null = nuova causale, oggetto = modifica
  const [inModifica, setInModifica] = useState<CausaleEsclusione | null | undefined>(undefined);
  const [daEliminare, setDaEliminare] = useState<CausaleEsclusione | null>(null);
  const [esito, setEsito] = useState<string | null>(null);

  const { data: causali = [] } = useQuery<CausaleEsclusione[]>({
    queryKey: ['causaliEsclusione', applied],
    queryFn: async () =>
      mockDb.filter((c) => matchesText(c.codice, applied.codice) && matchesText(c.descrizione, applied.descrizione)),
  });

  // TODO: sostituire con la chiamata all'API di eliminazione
  const elimina = useMutation({
    mutationFn: async (id: string) => {
      mockDb = mockDb.filter((c) => c.id !== id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['causaliEsclusione'] });
      setEsito('Causale eliminata.');
    },
  });

  const columns: Column<CausaleEsclusione>[] = [
    { id: 'codice', header: 'Codice', render: (r) => r.codice },
    { id: 'descrizione', header: 'Descrizione', render: (r) => r.descrizione },
  ];

  return (
    <Box sx={{ width: '100%' }}>
      <SearchFilterCard onSearch={apply} onReset={reset}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField size="small" fullWidth placeholder="Codice" {...bind('codice')} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField size="small" fullWidth placeholder="Descrizione" {...bind('descrizione')} />
          </Grid>
        </Grid>
      </SearchFilterCard>

      <DataTable
        headerAction={{ label: 'Nuovo', onClick: () => setInModifica(null) }}
        columns={columns}
        data={causali}
        showToolbar={false}
        paginated
        actions={{
          onEdit: (r) => setInModifica(r),
          onDelete: (r) => setDaEliminare(r),
        }}
      />

      {/* La key forza un modulo nuovo a ogni apertura */}
      {inModifica !== undefined && (
        <CausaleDialog key={inModifica?.id ?? 'nuova'} causale={inModifica} onClose={() => setInModifica(undefined)} onSaved={setEsito} />
      )}

      <Dialog open={!!daEliminare} onClose={() => setDaEliminare(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontSize: 'var(--fs-2xl)', fontWeight: 700 }}>Elimina causale</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: 'var(--fs-lg)' }}>
            Vuoi eliminare la causale <strong>{daEliminare?.codice}</strong> – {daEliminare?.descrizione}?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDaEliminare(null)}>Annulla</Button>
          <Button
            variant="contained"
            color="error"
            disableElevation
            startIcon={<DeleteOutlinedIcon sx={{ fontSize: 18 }} />}
            onClick={() => {
              if (daEliminare) elimina.mutate(daEliminare.id);
              setDaEliminare(null);
            }}
          >
            Elimina
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
