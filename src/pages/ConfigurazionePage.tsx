import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Snackbar,
  Alert,
} from '@mui/material';
import EditNoteIcon from '@mui/icons-material/EditNote';
import MailOutlineIcon from '@mui/icons-material/MailOutlined';
import GavelIcon from '@mui/icons-material/Gavel';
import type { SvgIconComponent } from '@mui/icons-material';
import { SectionCard } from '../components/SectionCard';
import SaveIcon from '@mui/icons-material/Save';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller, type UseFormRegisterReturn } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { itDateToIso } from '../utils/filters';
import { DateInput } from '../components/DateInput';

// --- Modello dati ---

interface ParametriEmail {
  mailOut: string;
  outPort: string;
  from: string;
  ssl: boolean;
  user: string;
  fromAnagraficaSpecialisti: string;
  userAnagraficaSpecialisti: string;
}

interface ParametriBurc {
  numeroBurc: string;
  // Formato gg/mm/aaaa
  dataBurc: string;
}

interface Configurazione {
  email: ParametriEmail;
  burc: ParametriBurc;
}

// Dati di esempio ripresi dal vecchio portale: in futuro arriveranno dall'API.
// Le password non vengono mai lette dal server: si possono solo sostituire.
const mockConfig: Configurazione = {
  email: {
    mailOut: 'smtps.pec.aruba.it',
    outPort: '465',
    from: 'graduatoria.aziendale.convenzionati@pec.aslna1centro.it',
    ssl: true,
    user: 'graduatoria.aziendale.convenzionati@pec.aslna1centro.it',
    fromAnagraficaSpecialisti: 'graduatoria.aziendale.convenzionati@pec.aslna1centro.it',
    userAnagraficaSpecialisti: 'graduatoria.aziendale.convenzionati@pec.aslna1centro.it',
  },
  burc: { numeroBurc: '9', dataBurc: '29/01/2024' },
};

// Lunghezza fissa: non rivela la lunghezza reale della password
const PASSWORD_MASK = '**********';

const isoToItDate = (iso: string) => {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

// --- Validazione ---

const emailSchema = z.object({
  mailOut: z
    .string()
    .trim()
    .regex(/^[a-z0-9.-]+$/i, 'Server non valido'),
  outPort: z
    .string()
    .trim()
    .regex(/^\d+$/, 'Porta non valida')
    .refine((p) => Number(p) >= 1 && Number(p) <= 65535, 'Porta non valida (1-65535)'),
  from: z.email('Email non valida'),
  ssl: z.boolean(),
  user: z.email('Email non valida'),
  // Vuota = password invariata
  password: z.string(),
  fromAnagraficaSpecialisti: z.email('Email non valida'),
  userAnagraficaSpecialisti: z.email('Email non valida'),
  passwordAnagraficaSpecialisti: z.string(),
});

const burcSchema = z.object({
  numeroBurc: z
    .string()
    .trim()
    .regex(/^\d+$/, 'Numero non valido'),
  // Formato aaaa-mm-gg (vedi DateInput)
  dataBurc: z.string().min(1, 'Obbligatorio'),
});

type EmailFormValues = z.infer<typeof emailSchema>;
type BurcFormValues = z.infer<typeof burcSchema>;

// --- Componenti di impaginazione ---

const labelSx = { fontSize: 'var(--fs-md)', fontWeight: 700, color: '#333333' };
const valueSx = { fontSize: 'var(--fs-md)', color: '#333333', wordBreak: 'break-all' as const };

const RequiredLabel: React.FC<{ label: string }> = ({ label }) => (
  <Typography component="span" sx={labelSx}>
    {label}
    <span style={{ color: 'red' }}>*</span>:
  </Typography>
);

// Riquadro di sezione con intestazione colorata e pulsante di modifica
const ConfigSection: React.FC<{
  title: string;
  icon: SvgIconComponent;
  editing: boolean;
  onEdit: () => void;
  children: React.ReactNode;
}> = ({ title, icon, editing, onEdit, children }) => (
  <SectionCard
    title={title}
    icon={icon}
    action={
      !editing && (
        <Button variant="outlined" size="small" startIcon={<EditNoteIcon sx={{ fontSize: 18 }} />} onClick={onEdit} aria-label={`Modifica ${title}`}>
          Modifica
        </Button>
      )
    }
  >
    {children}
  </SectionCard>
);

// Griglia in sola lettura: coppie etichetta/valore su due colonne, come nel vecchio portale
const ReadOnlyGrid: React.FC<{ items: { label: string; value: React.ReactNode }[] }> = ({ items }) => (
  <Grid container rowSpacing={1} columnSpacing={2}>
    {items.map(({ label, value }) => (
      <React.Fragment key={label}>
        <Grid size={{ xs: 12, sm: 4, md: 2 }}>
          <RequiredLabel label={label} />
        </Grid>
        <Grid size={{ xs: 12, sm: 8, md: 4 }}>
          <Typography sx={valueSx}>{value}</Typography>
        </Grid>
      </React.Fragment>
    ))}
  </Grid>
);

// Cella della griglia in modifica: due campi per riga
const editCellSize = { xs: 12, sm: 6 };

// Campo in modifica senza etichetta: il nome è il placeholder (con eventuale nota, es. per le password)
const EditField: React.FC<{
  id: string;
  label: string;
  registration: UseFormRegisterReturn;
  error?: string;
  type?: string;
  hint?: string;
  autoComplete?: string;
}> = ({ id, label, registration, error, hint, ...inputProps }) => {
  const { ref, ...field } = registration;
  return (
    <Grid size={editCellSize}>
      <TextField
        id={id}
        placeholder={hint ? `${label} (${hint})` : `${label} *`}
        size="small"
        fullWidth
        {...inputProps}
        {...field}
        inputRef={ref}
        error={!!error}
        helperText={error}
      />
    </Grid>
  );
};

const FormActions: React.FC<{ onCancel: () => void; saving: boolean }> = ({ onCancel, saving }) => (
  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2.5 }}>
    <Button onClick={onCancel} disabled={saving}>
      Annulla
    </Button>
    <Button type="submit" variant="contained" disableElevation disabled={saving} startIcon={<SaveIcon sx={{ fontSize: 18 }} />}>
      Salva
    </Button>
  </Box>
);

// --- Sezione Parametri Invio Email ---

const EmailSection: React.FC<{ data: ParametriEmail; onSaved: (msg: string) => void }> = ({ data, onSaved }) => {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    values: { ...data, password: '', passwordAnagraficaSpecialisti: '' },
  });

  // TODO: inviare all'API; le password vanno trasmesse solo se compilate
  const save = useMutation({
    mutationFn: async ({ password: _password, passwordAnagraficaSpecialisti: _passwordSpecialisti, ...values }: EmailFormValues) => {
      mockConfig.email = values;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configurazione'] });
      setEditing(false);
      onSaved('Parametri invio email salvati.');
    },
  });

  const cancel = () => {
    reset();
    setEditing(false);
  };

  return (
    <ConfigSection title="Parametri Invio Email" icon={MailOutlineIcon} editing={editing} onEdit={() => setEditing(true)}>
      {editing ? (
        <Box component="form" noValidate onSubmit={handleSubmit((v) => save.mutate(v))}>
          <Grid container rowSpacing={1.5} columnSpacing={2}>
            <EditField id="cfg-mailout" label="Mail Out" registration={register('mailOut')} error={errors.mailOut?.message} />
            <EditField id="cfg-from" label="From" type="email" registration={register('from')} error={errors.from?.message} />
            <EditField id="cfg-port" label="Out Port" registration={register('outPort')} error={errors.outPort?.message} />
            <Grid size={editCellSize} sx={{ display: 'flex', alignItems: 'center' }}>
              <Controller
                name="ssl"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch id="cfg-ssl" checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                    label={`SSL: ${field.value ? 'Sì' : 'No'}`}
                    slotProps={{ typography: { sx: { fontSize: 'var(--fs-md)' } } }}
                  />
                )}
              />
            </Grid>
            <EditField id="cfg-user" label="User" type="email" autoComplete="off" registration={register('user')} error={errors.user?.message} />
            <EditField
              id="cfg-password"
              label="Password"
              type="password"
              autoComplete="new-password"
              hint="lascia vuoto per non modificarla"
              registration={register('password')}
            />
            <EditField
              id="cfg-from-spec"
              label="From Anagrafica Specialisti"
              type="email"
              registration={register('fromAnagraficaSpecialisti')}
              error={errors.fromAnagraficaSpecialisti?.message}
            />
            <EditField
              id="cfg-user-spec"
              label="User Anagrafica Specialisti"
              type="email"
              autoComplete="off"
              registration={register('userAnagraficaSpecialisti')}
              error={errors.userAnagraficaSpecialisti?.message}
            />
            <EditField
              id="cfg-password-spec"
              label="Password Anagrafica Specialisti"
              type="password"
              autoComplete="new-password"
              hint="lascia vuoto per non modificarla"
              registration={register('passwordAnagraficaSpecialisti')}
            />
          </Grid>
          <FormActions onCancel={cancel} saving={save.isPending} />
        </Box>
      ) : (
        <ReadOnlyGrid
          items={[
            { label: 'Mail Out', value: data.mailOut },
            { label: 'From', value: data.from },
            { label: 'Out Port', value: data.outPort },
            { label: 'SSL', value: data.ssl ? 'Sì' : 'No' },
            { label: 'User', value: data.user },
            { label: 'Password', value: PASSWORD_MASK },
            { label: 'From Anagrafica Specialisti', value: data.fromAnagraficaSpecialisti },
            { label: 'User Anagrafica Specialisti', value: data.userAnagraficaSpecialisti },
            { label: 'Password Anagrafica Specialisti', value: PASSWORD_MASK },
          ]}
        />
      )}
    </ConfigSection>
  );
};

// --- Sezione Parametri Configurazione BURC ---

const BurcSection: React.FC<{ data: ParametriBurc; onSaved: (msg: string) => void }> = ({ data, onSaved }) => {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BurcFormValues>({
    resolver: zodResolver(burcSchema),
    values: { numeroBurc: data.numeroBurc, dataBurc: itDateToIso(data.dataBurc) },
  });

  // TODO: inviare all'API
  const save = useMutation({
    mutationFn: async (values: BurcFormValues) => {
      mockConfig.burc = { numeroBurc: values.numeroBurc, dataBurc: isoToItDate(values.dataBurc) };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configurazione'] });
      setEditing(false);
      onSaved('Parametri BURC salvati.');
    },
  });

  const cancel = () => {
    reset();
    setEditing(false);
  };

  return (
    <ConfigSection title="Parametri Configurazione BURC" icon={GavelIcon} editing={editing} onEdit={() => setEditing(true)}>
      {editing ? (
        <Box component="form" noValidate onSubmit={handleSubmit((v) => save.mutate(v))}>
          <Grid container rowSpacing={1.5} columnSpacing={2}>
            <EditField id="cfg-burc-num" label="Numero BURC" registration={register('numeroBurc')} error={errors.numeroBurc?.message} />
            <Grid size={editCellSize}>
              <Controller
                name="dataBurc"
                control={control}
                render={({ field }) => (
                  <DateInput
                    id="cfg-burc-data"
                    placeholder="Data BURC *"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    inputRef={field.ref}
                    fullWidth
                    error={!!errors.dataBurc}
                    helperText={errors.dataBurc?.message}
                  />
                )}
              />
            </Grid>
          </Grid>
          <FormActions onCancel={cancel} saving={save.isPending} />
        </Box>
      ) : (
        <ReadOnlyGrid
          items={[
            { label: 'Numero BURC', value: data.numeroBurc },
            { label: 'Data BURC', value: data.dataBurc },
          ]}
        />
      )}
    </ConfigSection>
  );
};

// --- Pagina ---

export const ConfigurazionePage: React.FC = () => {
  const [esito, setEsito] = useState<string | null>(null);

  const { data } = useQuery<Configurazione>({
    queryKey: ['configurazione'],
    // Copia profonda: i form non devono modificare direttamente i dati di esempio
    queryFn: async () => structuredClone(mockConfig),
  });

  if (!data) return null;

  return (
    <Box sx={{ width: '100%' }}>
      <EmailSection data={data.email} onSaved={setEsito} />
      <BurcSection data={data.burc} onSaved={setEsito} />

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
