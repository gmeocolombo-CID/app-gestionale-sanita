import React, { useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  List,
  ListItem,
  ListItemText,
  Chip,
  CircularProgress,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { SearchFilterCard } from '../components/SearchFilterCard';
import { DataTable, type Column } from '../components/DataTable';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useSearchFilters } from '../hooks/useSearchFilters';
import { listProfili, saveProfilo, deleteProfilo, type Profilo } from '../api/profili';
import { listUtenti } from '../api/utenti';

interface Esito {
  messaggio: string;
  severity: 'success' | 'error';
}

const profiloSchema = z.object({
  codice: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9_]{2,20}$/, 'Da 2 a 20 caratteri: lettere, numeri o _'),
  descrizione: z.string().trim().min(1, 'Obbligatorio').max(100, 'Massimo 100 caratteri'),
});

type ProfiloFormInput = z.input<typeof profiloSchema>;
type ProfiloFormValues = z.output<typeof profiloSchema>;

const detailLabelSx = { fontSize: 'var(--fs-md)', fontWeight: 700, color: '#555555' };

// --- Finestra di inserimento / modifica ---

const ProfiloDialog: React.FC<{
  // null = nuovo profilo
  profilo: Profilo | null;
  onClose: () => void;
  onSaved: (messaggio: string) => void;
}> = ({ profilo, onClose, onSaved }) => {
  const queryClient = useQueryClient();
  const isNew = profilo === null;
  const [errore, setErrore] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfiloFormInput, unknown, ProfiloFormValues>({
    resolver: zodResolver(profiloSchema),
    defaultValues: { codice: profilo?.codice ?? '', descrizione: profilo?.descrizione ?? '' },
  });

  const save = useMutation({
    mutationFn: (values: ProfiloFormValues) => saveProfilo(values, profilo?.id),
    onSuccess: (salvato) => {
      queryClient.invalidateQueries({ queryKey: ['profili'] });
      // La descrizione compare anche nella lista utenti
      queryClient.invalidateQueries({ queryKey: ['utenti'] });
      onSaved(isNew ? `Profilo ${salvato.codice} creato.` : `Profilo ${salvato.codice} aggiornato.`);
      onClose();
    },
    onError: (e) => setErrore(e instanceof Error ? e.message : 'Salvataggio non riuscito'),
  });

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <Box component="form" noValidate onSubmit={handleSubmit((v) => save.mutate(v))}>
        <DialogTitle sx={{ fontSize: 'var(--fs-2xl)', fontWeight: 700 }}>{isNew ? 'Nuovo profilo' : 'Modifica profilo'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
          {errore && <Alert severity="error">{errore}</Alert>}
          <TextField
            placeholder="Codice *"
            size="small"
            required
            autoFocus={isNew}
            // Il codice identifica il profilo: modificabile solo in inserimento
            disabled={!isNew}
            {...register('codice')}
            error={!!errors.codice}
            helperText={errors.codice?.message ?? (isNew ? 'Es. MED, OPASL' : undefined)}
            sx={{ maxWidth: 240 }}
          />
          <TextField
            placeholder="Descrizione *"
            size="small"
            required
            fullWidth
            autoFocus={!isNew}
            {...register('descrizione')}
            error={!!errors.descrizione}
            helperText={errors.descrizione?.message ?? (isNew ? undefined : 'Gli utenti con questo profilo vengono aggiornati automaticamente')}
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

// --- Finestra di dettaglio (sola lettura) con gli utenti che hanno il profilo ---

const ProfiloDettaglio: React.FC<{ profilo: Profilo; onClose: () => void }> = ({ profilo, onClose }) => {
  const { data: utenti, isLoading } = useQuery({
    queryKey: ['utenti', 'perProfilo', profilo.descrizione],
    queryFn: () =>
      listUtenti({ utente: '', nome: '', cognome: '', pec: '', profilo: profilo.descrizione, attivo: '', bloccato: '' }),
  });

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontSize: 'var(--fs-2xl)', fontWeight: 700 }}>Dettaglio profilo</DialogTitle>
      <DialogContent>
        <Grid container rowSpacing={1} columnSpacing={2} sx={{ mb: 2 }}>
          <Grid size={4}>
            <Typography sx={detailLabelSx}>Codice</Typography>
          </Grid>
          <Grid size={8}>
            <Typography sx={{ fontSize: 'var(--fs-base)' }}>{profilo.codice}</Typography>
          </Grid>
          <Grid size={4}>
            <Typography sx={detailLabelSx}>Descrizione</Typography>
          </Grid>
          <Grid size={8}>
            <Typography sx={{ fontSize: 'var(--fs-base)' }}>{profilo.descrizione}</Typography>
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Typography sx={detailLabelSx}>Utenti con questo profilo</Typography>
          {utenti && <Chip size="small" label={utenti.length} color="primary" variant="outlined" />}
        </Box>
        {isLoading ? (
          <CircularProgress size={20} />
        ) : utenti && utenti.length > 0 ? (
          <List dense disablePadding sx={{ border: '1px solid #e6eef2', borderRadius: '6px', maxHeight: 220, overflowY: 'auto' }}>
            {utenti.map((u) => (
              <ListItem key={u.id} divider>
                <ListItemText
                  primary={`${u.cognome} ${u.nome}`}
                  secondary={u.codice}
                  slotProps={{ primary: { sx: { fontSize: 'var(--fs-base)' } }, secondary: { sx: { fontSize: 'var(--fs-xs)' } } }}
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography sx={{ fontSize: 'var(--fs-md)', color: '#777777' }}>Nessun utente assegnato.</Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Chiudi</Button>
      </DialogActions>
    </Dialog>
  );
};

// --- Pagina ---

export const ProfilesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { bind, applied, apply, reset } = useSearchFilters({ codice: '', descrizione: '' });
  // undefined = finestra chiusa, null = nuovo profilo, oggetto = modifica
  const [inModifica, setInModifica] = useState<Profilo | null | undefined>(undefined);
  const [inDettaglio, setInDettaglio] = useState<Profilo | null>(null);
  const [daEliminare, setDaEliminare] = useState<Profilo | null>(null);
  const [esito, setEsito] = useState<Esito | null>(null);

  const { data: profili = [] } = useQuery({
    queryKey: ['profili', applied],
    queryFn: () => listProfili(applied),
  });

  const elimina = useMutation({
    mutationFn: (profilo: Profilo) => deleteProfilo(profilo.id).then(() => profilo),
    onSuccess: (profilo) => {
      queryClient.invalidateQueries({ queryKey: ['profili'] });
      setEsito({ messaggio: `Profilo ${profilo.codice} eliminato.`, severity: 'success' });
    },
    onError: (e) => setEsito({ messaggio: e instanceof Error ? e.message : 'Eliminazione non riuscita', severity: 'error' }),
  });

  const columns: Column<Profilo>[] = [
    { id: 'codice', header: 'Codice', render: (r) => r.codice },
    { id: 'descrizione', header: 'Descrizione', render: (r) => r.descrizione },
  ];

  return (
    <Box sx={{ width: '100%' }}>
      <SearchFilterCard onSearch={apply} onReset={reset}>
        <Grid container spacing={4} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField size="small" fullWidth placeholder="Codice" {...bind('codice')} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField size="small" fullWidth placeholder="Descrizione" {...bind('descrizione')} />
          </Grid>
        </Grid>
      </SearchFilterCard>

      <DataTable
        headerAction={{ label: 'Nuovo', onClick: () => setInModifica(null) }}
        columns={columns}
        data={profili}
        paginated
        actions={{
          onView: (row) => setInDettaglio(row),
          onEdit: (row) => setInModifica(row),
          onDelete: (row) => setDaEliminare(row),
        }}
      />

      {/* La key forza un modulo nuovo a ogni apertura */}
      {inModifica !== undefined && (
        <ProfiloDialog
          key={inModifica?.id ?? 'nuovo'}
          profilo={inModifica}
          onClose={() => setInModifica(undefined)}
          onSaved={(messaggio) => setEsito({ messaggio, severity: 'success' })}
        />
      )}

      {inDettaglio && <ProfiloDettaglio key={inDettaglio.id} profilo={inDettaglio} onClose={() => setInDettaglio(null)} />}

      <ConfirmDialog
        open={!!daEliminare}
        title="Elimina profilo"
        message={
          <>
            Vuoi eliminare il profilo <strong>{daEliminare?.codice}</strong> – {daEliminare?.descrizione}?
          </>
        }
        confirmLabel="Elimina"
        cancelLabel="Annulla"
        color="error"
        onClose={() => setDaEliminare(null)}
        onConfirm={() => {
          if (daEliminare) elimina.mutate(daEliminare);
          setDaEliminare(null);
        }}
      />

      <Snackbar
        open={!!esito}
        autoHideDuration={5000}
        onClose={() => setEsito(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={esito?.severity ?? 'success'} variant="filled" onClose={() => setEsito(null)}>
          {esito?.messaggio}
        </Alert>
      </Snackbar>
    </Box>
  );
};
