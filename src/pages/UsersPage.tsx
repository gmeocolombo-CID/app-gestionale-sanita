import React, { useEffect, useState } from 'react';
import { Box, Grid, TextField, MenuItem, Chip, Snackbar, Alert } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { SearchFilterCard } from '../components/SearchFilterCard';
import { SelectField } from '../components/SelectField';
import { DataTable, type Column } from '../components/DataTable';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useSearchFilters } from '../hooks/useSearchFilters';
import { listUtenti, resetPassword, setAttivo, setBloccato, type Utente } from '../api/utenti';
import { listProfili } from '../api/profili';

type Operazione = { tipo: 'reset' | 'blocco' | 'attivazione'; utente: Utente };
interface Esito {
  messaggio: string;
  severity: 'success' | 'error';
}


const siNo = (value: boolean, colorSi: 'success' | 'error', colorNo: 'default' | 'success') => (
  <Chip
    size="small"
    variant="outlined"
    label={value ? 'Si' : 'No'}
    color={value ? colorSi : colorNo}
    sx={{ fontSize: 'var(--fs-xs)', fontWeight: 600, minWidth: 40 }}
  />
);

export const UsersPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { bind, applied, apply, reset } = useSearchFilters({
    utente: '',
    nome: '',
    cognome: '',
    pec: '',
    profilo: '',
    attivo: '',
    bloccato: '',
  });
  const [operazione, setOperazione] = useState<Operazione | null>(null);
  const [motivoBlocco, setMotivoBlocco] = useState('');
  // Esito passato dalla pagina di modifica dopo il salvataggio
  const [esito, setEsito] = useState<Esito | null>(() => {
    const messaggio = (location.state as { esito?: string } | null)?.esito;
    return messaggio ? { messaggio, severity: 'success' } : null;
  });

  // Rimuove l'esito dalla cronologia, così non ricompare ricaricando la pagina
  useEffect(() => {
    if (location.state) navigate(location.pathname, { replace: true, state: null });
  }, [location.state, location.pathname, navigate]);

  const { data: profili = [] } = useQuery({ queryKey: ['profili', 'tutti'], queryFn: () => listProfili() });

  const { data: utenti = [] } = useQuery({
    queryKey: ['utenti', applied],
    queryFn: () => listUtenti(applied),
  });

  const esegui = useMutation({
    mutationFn: async ({ tipo, utente, motivo }: Operazione & { motivo: string }): Promise<string> => {
      switch (tipo) {
        case 'reset': {
          const pec = await resetPassword(utente.id);
          return `Password reimpostata: le nuove credenziali sono state inviate a ${pec}.`;
        }
        case 'blocco':
          await setBloccato(utente.id, !utente.bloccato, motivo);
          return utente.bloccato ? `Utente ${utente.codice} sbloccato.` : `Utente ${utente.codice} bloccato.`;
        case 'attivazione':
          await setAttivo(utente.id, !utente.attivo);
          return utente.attivo ? `Utente ${utente.codice} disattivato.` : `Utente ${utente.codice} riattivato.`;
      }
    },
    onSuccess: (messaggio) => {
      queryClient.invalidateQueries({ queryKey: ['utenti'] });
      setEsito({ messaggio, severity: 'success' });
    },
    onError: (e) => setEsito({ messaggio: e instanceof Error ? e.message : 'Operazione non riuscita', severity: 'error' }),
  });

  const apri = (tipo: Operazione['tipo'], utente: Utente) => {
    setMotivoBlocco('');
    setOperazione({ tipo, utente });
  };

  const conferma = () => {
    if (operazione) esegui.mutate({ ...operazione, motivo: motivoBlocco.trim() });
    setOperazione(null);
  };

  const columns: Column<Utente>[] = [
    { id: 'codice', header: 'Codice', render: (r) => r.codice },
    { id: 'nome', header: 'Nome', render: (r) => r.nome },
    { id: 'cognome', header: 'Cognome', render: (r) => r.cognome },
    { id: 'pec', header: 'Pec', render: (r) => r.pec },
    { id: 'telefono', header: 'Telefono', render: (r) => r.telefono },
    { id: 'attivo', header: 'Attivo', align: 'center', render: (r) => siNo(r.attivo, 'success', 'default') },
    { id: 'bloccato', header: 'Bloccato', align: 'center', render: (r) => siNo(r.bloccato, 'error', 'default') },
    { id: 'motivoBlocco', header: 'Motivo blocco', render: (r) => r.motivoBlocco },
    { id: 'profilo', header: 'Profilo', render: (r) => r.profilo },
  ];

  // Testi della finestra di conferma in base all'operazione scelta
  const dialog = (() => {
    if (!operazione) return null;
    const { tipo, utente } = operazione;
    const nome = (
      <strong>
        {utente.cognome} {utente.nome}
      </strong>
    );
    switch (tipo) {
      case 'reset':
        return {
          title: 'Reset Password',
          message: (
            <>
              Sei sicuro di voler resettare la password dell'utente {nome}? Le nuove credenziali saranno inviate a{' '}
              <strong>{utente.pec}</strong>.
            </>
          ),
          color: 'primary' as const,
        };
      case 'blocco':
        return utente.bloccato
          ? { title: 'Sblocca utente', message: <>Sei sicuro di voler sbloccare l'utente {nome}?</>, color: 'primary' as const }
          : {
              title: 'Blocca utente',
              message: <>L'utente {nome} non potrà accedere al portale finché non sarà sbloccato. Indica il motivo del blocco.</>,
              color: 'error' as const,
            };
      case 'attivazione':
        return utente.attivo
          ? { title: 'Disattiva utente', message: <>Sei sicuro di voler disattivare l'utente {nome}?</>, color: 'error' as const }
          : { title: 'Riattiva utente', message: <>Sei sicuro di voler riattivare l'utente {nome}?</>, color: 'primary' as const };
    }
  })();
  const richiedeMotivo = operazione?.tipo === 'blocco' && !operazione.utente.bloccato;

  return (
    <Box sx={{ width: '100%' }}>
      <SearchFilterCard onSearch={apply} onReset={reset}>
        <Grid container spacing={2} sx={{ alignItems: 'center' }}>
          {(
            [
              ['utente', 'Utente'],
              ['nome', 'Nome'],
              ['cognome', 'Cognome'],
              ['pec', 'Pec'],
            ] as const
          ).map(([key, label]) => (
            <Grid key={key} size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField size="small" fullWidth placeholder={label} {...bind(key)} />
            </Grid>
          ))}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <SelectField placeholder="Profilo" size="small" fullWidth {...bind('profilo')}>
              <MenuItem value="">Tutti</MenuItem>
              {profili.map((p) => (
                <MenuItem key={p.id} value={p.descrizione}>
                  {p.descrizione}
                </MenuItem>
              ))}
            </SelectField>
          </Grid>
          {(
            [
              ['attivo', 'Attivo'],
              ['bloccato', 'Bloccato'],
            ] as const
          ).map(([key, label]) => (
            <Grid key={key} size={{ xs: 12, sm: 6, md: 4 }}>
              <SelectField placeholder={label} size="small" fullWidth {...bind(key)}>
                <MenuItem value="">Tutti</MenuItem>
                <MenuItem value="Si">Si</MenuItem>
                <MenuItem value="No">No</MenuItem>
              </SelectField>
            </Grid>
          ))}
        </Grid>
      </SearchFilterCard>

      <DataTable
        headerAction={{ label: 'Nuovo', onClick: () => navigate('/utenti/nuovo') }}
        columns={columns}
        data={utenti}
        paginated
        actions={{
          onEdit: (r) => navigate(`/utenti/${r.id}/modifica`),
          onKey: (r) => apri('reset', r),
          onLock: (r) => apri('blocco', r),
          onDisable: (r) => apri('attivazione', r),
        }}
      />

      <ConfirmDialog
        open={!!dialog}
        title={dialog?.title ?? ''}
        message={dialog?.message}
        color={dialog?.color}
        onClose={() => setOperazione(null)}
        onConfirm={conferma}
        confirmDisabled={richiedeMotivo && !motivoBlocco.trim()}
      >
        {richiedeMotivo && (
          <TextField
            placeholder="Motivo blocco *"
            required
            fullWidth
            multiline
            minRows={2}
            size="small"
            autoFocus
            value={motivoBlocco}
            onChange={(e) => setMotivoBlocco(e.target.value)}
            slotProps={{ htmlInput: { maxLength: 255 } }}
            sx={{ mt: 2 }}
          />
        )}
      </ConfirmDialog>

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
