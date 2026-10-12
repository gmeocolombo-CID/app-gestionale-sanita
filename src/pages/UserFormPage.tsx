import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Button,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  LinearProgress,
} from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import ContactMailOutlinedIcon from '@mui/icons-material/ContactMailOutlined';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import DescriptionIcon from '@mui/icons-material/Description';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller, type UseFormRegisterReturn } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileUploadField } from '../components/FileUploadField';
import { SectionCard } from '../components/SectionCard';
import { FormActionsBar } from '../components/FormActionsBar';
import { DateInput } from '../components/DateInput';
import { SelectField } from '../components/SelectField';
import { getUtente, saveUtente, type Utente } from '../api/utenti';
import { listProfili } from '../api/profili';
import { itDateToIso } from '../utils/filters';

const MAX_FILE_MB = 5;
const CF_REGEX = /^[A-Z]{6}[0-9LMNPQRSTUV]{2}[A-Z][0-9LMNPQRSTUV]{2}[A-Z][0-9LMNPQRSTUV]{3}[A-Z]$/;

const isoToItDate = (iso: string) => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

const documentoSchema = z
  .instanceof(File)
  .refine((f) => f.size <= MAX_FILE_MB * 1024 * 1024, `Il file supera i ${MAX_FILE_MB} MB`)
  .refine((f) => f.type.startsWith('image/') || f.type === 'application/pdf', 'Formato non valido (immagine o PDF)')
  .optional();

// In inserimento codice fiscale e documenti sono obbligatori; in modifica il codice non cambia
// e i documenti già caricati restano validi se non se ne scelgono di nuovi
const buildSchema = (isNew: boolean) =>
  z
    .object({
      codice: z.string().trim().toUpperCase(),
      nome: z.string().trim().min(1, 'Obbligatorio'),
      cognome: z.string().trim().min(1, 'Obbligatorio'),
      pec: z.email('PEC non valida'),
      telefono: z
        .string()
        .trim()
        .regex(/^\+?[0-9 ]{6,15}$/, 'Numero di telefono non valido'),
      profilo: z.string().min(1, 'Obbligatorio'),
      // Formato aaaa-mm-gg (vedi DateInput)
      dataScadenzaDocumento: z.string(),
      documentoFronte: documentoSchema,
      documentoRetro: documentoSchema,
    })
    .superRefine((v, ctx) => {
      if (!isNew) return;
      if (!CF_REGEX.test(v.codice)) ctx.addIssue({ code: 'custom', path: ['codice'], message: 'Codice fiscale non valido' });
      if (!v.documentoFronte) ctx.addIssue({ code: 'custom', path: ['documentoFronte'], message: 'Obbligatorio' });
      if (!v.documentoRetro) ctx.addIssue({ code: 'custom', path: ['documentoRetro'], message: 'Obbligatorio' });
    });

type FormInput = z.input<ReturnType<typeof buildSchema>>;
type FormValues = z.output<ReturnType<typeof buildSchema>>;

const labelSx = { fontSize: 'var(--fs-md)', fontWeight: 700, color: '#333333' };

// Nome del campo usato come placeholder; l'asterisco segnala i campi obbligatori
const fieldName = (label: string, required = true) => (required ? `${label} *` : label);

// Etichetta per le righe che non sono campi di testo (valori in sola lettura, documenti)
const RowLabel: React.FC<{ label: string; required?: boolean }> = ({ label, required = true }) => (
  <Typography sx={labelSx}>
    {label} :{required && <span style={{ color: 'red' }}>*</span>}
  </Typography>
);

// Riga con etichetta a sinistra (solo per le righe che non sono campi di testo)
const FormRow: React.FC<{ label: React.ReactNode; children: React.ReactNode }> = ({ label, children }) => (
  <Grid container spacing={1} sx={{ alignItems: 'center', mb: 1.5 }}>
    <Grid size={{ xs: 12, sm: 4, md: 3 }}>{label}</Grid>
    <Grid size={{ xs: 12, sm: 8, md: 5 }}>{children}</Grid>
  </Grid>
);

// Campo senza etichetta: il nome è il placeholder
const FieldRow: React.FC<{ children: React.ReactNode }> = ({ children }) => <Box sx={{ maxWidth: 520, mb: 2 }}>{children}</Box>;

const TextRow: React.FC<{ id: string; label: string; registration: UseFormRegisterReturn; error?: string; type?: string }> = ({
  id,
  label,
  registration,
  error,
  type,
}) => {
  const { ref, ...field } = registration;
  return (
    <FieldRow>
      <TextField
        id={id}
        type={type}
        placeholder={fieldName(label)}
        size="small"
        fullWidth
        {...field}
        inputRef={ref}
        error={!!error}
        helperText={error}
      />
    </FieldRow>
  );
};

// --- Modulo ---

const UserForm: React.FC<{ utente?: Utente }> = ({ utente }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isNew = !utente;
  const [erroreSalvataggio, setErroreSalvataggio] = useState<string | null>(null);
  const [documentoAperto, setDocumentoAperto] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInput, unknown, FormValues>({
    resolver: zodResolver(buildSchema(isNew)),
    defaultValues: {
      codice: utente?.codice ?? '',
      nome: utente?.nome ?? '',
      cognome: utente?.cognome ?? '',
      pec: utente?.pec ?? '',
      telefono: utente?.telefono ?? '',
      profilo: utente?.profilo ?? '',
      dataScadenzaDocumento: utente?.dataScadenzaDocumento ? itDateToIso(utente.dataScadenzaDocumento) : '',
    },
  });

  const save = useMutation({
    mutationFn: (values: FormValues) =>
      saveUtente({ ...values, dataScadenzaDocumento: isoToItDate(values.dataScadenzaDocumento) }, utente?.id),
    onSuccess: (salvato) => {
      queryClient.invalidateQueries({ queryKey: ['utenti'] });
      queryClient.invalidateQueries({ queryKey: ['utente', salvato.id] });
      navigate('/utenti', { state: { esito: isNew ? `Utente ${salvato.codice} creato.` : `Utente ${salvato.codice} aggiornato.` } });
    },
    onError: (e) => setErroreSalvataggio(e instanceof Error ? e.message : 'Salvataggio non riuscito'),
  });

  const haDocumento = !!(utente?.documentoFronte || utente?.documentoRetro);
  const { data: profili = [] } = useQuery({ queryKey: ['profili', 'tutti'], queryFn: () => listProfili() });

  return (
    <Box component="form" noValidate onSubmit={handleSubmit((v) => save.mutate(v))}>
      <Box>
        <Box>
          {erroreSalvataggio && (
            <Alert severity="error" onClose={() => setErroreSalvataggio(null)} sx={{ mb: 2 }}>
              {erroreSalvataggio}
            </Alert>
          )}

          <SectionCard title="Dati anagrafici" icon={PersonOutlineIcon}>
            {isNew ? (
              <TextRow id="utente-cf" label="Codice Fiscale" registration={register('codice')} error={errors.codice?.message} />
            ) : (
              // Il codice fiscale identifica l'utente: in modifica è solo visualizzato
              <FormRow label={<RowLabel label="Codice Fiscale" />}>
                <Typography sx={{ fontSize: 'var(--fs-base)' }}>{utente.codice}</Typography>
              </FormRow>
            )}
            <TextRow id="utente-nome" label="Nome" registration={register('nome')} error={errors.nome?.message} />
            <TextRow id="utente-cognome" label="Cognome" registration={register('cognome')} error={errors.cognome?.message} />
            <TextRow id="utente-pec" label="Pec" type="email" registration={register('pec')} error={errors.pec?.message} />
            <TextRow id="utente-telefono" label="Telefono" type="tel" registration={register('telefono')} error={errors.telefono?.message} />
          </SectionCard>

          <SectionCard title="Profilo" icon={BadgeOutlinedIcon}>
            <FieldRow>
              <Controller
                name="profilo"
                control={control}
                render={({ field }) => (
                  <SelectField
                    id="utente-profilo"
                    placeholder={fieldName('Profilo')}
                    size="small"
                    fullWidth
                    {...field}
                    // Finché i profili non sono caricati il valore resta vuoto (evita l'avviso "valore fuori elenco")
                    value={profili.length ? field.value : ''}
                    error={!!errors.profilo}
                    helperText={errors.profilo?.message}
                  >
                    {profili.map((p) => (
                      <MenuItem key={p.id} value={p.descrizione}>
                        {p.descrizione}
                      </MenuItem>
                    ))}
                  </SelectField>
                )}
              />
            </FieldRow>
          </SectionCard>

          <SectionCard title="Documento di identità" icon={ContactMailOutlinedIcon}>
            <FieldRow>
              <Controller
                name="dataScadenzaDocumento"
                control={control}
                render={({ field }) => (
                  <DateInput
                    id="utente-scadenza"
                    placeholder={fieldName('Data scadenza documento', false)}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    inputRef={field.ref}
                    sx={{ maxWidth: 260 }}
                  />
                )}
              />
            </FieldRow>

            {haDocumento && (
              <FormRow label={<RowLabel label="Documento Di Identità" required={false} />}>
                <Tooltip title="Visualizza documento caricato">
                  <IconButton
                    size="small"
                    onClick={() => setDocumentoAperto(true)}
                    aria-label="Visualizza documento di identità"
                    sx={{ border: '1px solid #d5d5d5', borderRadius: '3px' }}
                  >
                    <SearchIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
              </FormRow>
            )}

            <Box>
              {(
                [
                  ['documentoFronte', 'Foto fronte documento di identità'],
                  ['documentoRetro', 'Foto retro documento di identità'],
                ] as const
              ).map(([name, label]) => (
                <FormRow key={name} label={<RowLabel label={label} required={isNew} />}>
                  <Controller
                    name={name}
                    control={control}
                    render={({ field }) => (
                      <FileUploadField
                        id={`utente-${name}`}
                        label={label}
                        hideLabel
                        accept="image/*,application/pdf"
                        value={field.value}
                        onChange={field.onChange}
                        error={errors[name]?.message}
                      />
                    )}
                  />
                </FormRow>
              ))}
              <Typography sx={{ fontSize: 'var(--fs-sm)', fontWeight: 600, color: '#555555' }}>
                Dimensione massima di caricamento file: {MAX_FILE_MB} MB.
                {!isNew && haDocumento && ' Se non scegli nuovi file, restano quelli già caricati.'}
              </Typography>
            </Box>
          </SectionCard>
        </Box>
      </Box>

      <FormActionsBar onBack={() => navigate('/utenti')}>
        <Button type="submit" variant="contained" disabled={save.isPending} startIcon={<SaveIcon sx={{ fontSize: 18 }} />}>
          Salva
        </Button>
      </FormActionsBar>

      {/* Documento già caricato */}
      <Dialog open={documentoAperto} onClose={() => setDocumentoAperto(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontSize: 'var(--fs-2xl)', fontWeight: 700 }}>Documento di identità</DialogTitle>
        <DialogContent>
          {[
            ['Fronte', utente?.documentoFronte],
            ['Retro', utente?.documentoRetro],
          ].map(([lato, file]) => (
            <Box key={lato} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <DescriptionIcon sx={{ fontSize: 18, color: 'primary.main' }} />
              <Typography sx={{ fontSize: 'var(--fs-base)' }}>
                <strong>{lato}:</strong> {file ?? 'non caricato'}
              </Typography>
            </Box>
          ))}
          {/* TODO: con l'API mostrare l'anteprima o scaricare il file */}
          <Typography sx={{ fontSize: 'var(--fs-sm)', color: '#777777', mt: 1 }}>
            L'anteprima sarà disponibile con il collegamento all'archivio documenti.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDocumentoAperto(false)}>Chiudi</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// --- Pagina: /utenti/nuovo oppure /utenti/:id/modifica ---

export const UserFormPage: React.FC = () => {
  const { id } = useParams();

  const { data: utente, isLoading, isError } = useQuery({
    queryKey: ['utente', id],
    queryFn: () => getUtente(id!),
    enabled: !!id,
  });

  if (!id) return <UserForm />;
  if (isLoading) return <LinearProgress />;
  if (isError || !utente) return <Alert severity="error">Utente non trovato.</Alert>;
  // La key ricrea il modulo se si passa da un utente all'altro
  return <UserForm key={utente.id} utente={utente} />;
};
