import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Paper,
  Typography,
  Button,
  Grid,
  TextField,
  MenuItem,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { DateInput } from '../components/DateInput';
import { SelectField } from '../components/SelectField';
import { FormActionsBar } from '../components/FormActionsBar';
import type { RootState } from '../store';
import { DOMANDE_PATHS } from '../navigation';

const formSchema = z.object({
  tipologiaGraduatoria: z.string().min(1, 'Obbligatorio'),
  codiceFiscale: z.string().length(16, 'Deve contenere 16 caratteri'),
  cognome: z.string().min(1, 'Obbligatorio'),
  nome: z.string().min(1, 'Obbligatorio'),
  dataNascita: z.string().min(1, 'Obbligatorio'),
  comuneNascita: z.string().min(1, 'Obbligatorio'),
  sesso: z.string().min(1, 'Obbligatorio'),
  comuneResidenza: z.string().min(1, 'Obbligatorio'),
  residenteDa: z.string().min(1, 'Obbligatorio'),
  indirizzo: z.string().min(1, 'Obbligatorio'),
  cap: z.string().min(5, 'CAP non valido'),
  telefonoCellulare: z.string().min(1, 'Obbligatorio'),
  pec: z.string().email('PEC non valida'),
  // Facoltativa, ma se compilata deve essere valida
  email: z.union([z.literal(''), z.email('Email non valida')]),
  laureatoIn: z.string().min(1, 'Obbligatorio'),
  votoLaurea: z.string().min(1, 'Obbligatorio'),
  lode: z.string().min(1, 'Obbligatorio'),
  pressoUniversita: z.string().min(1, 'Obbligatorio'),
  dataLaurea: z.string().min(1, 'Obbligatorio'),
});

type FormValues = z.infer<typeof formSchema>;

// Domanda nuova: tutti i campi vuoti (la tipologia dipende dal programma selezionato)
const EMPTY_DOMANDA: Omit<FormValues, 'tipologiaGraduatoria'> = {
  codiceFiscale: '',
  cognome: '',
  nome: '',
  dataNascita: '',
  comuneNascita: '',
  sesso: '',
  comuneResidenza: '',
  residenteDa: '',
  indirizzo: '',
  cap: '',
  telefonoCellulare: '',
  pec: '',
  email: '',
  laureatoIn: '',
  votoLaurea: '',
  lode: '',
  pressoUniversita: '',
  dataLaurea: '',
};

// Domanda di esempio per visualizzazione e modifica: in futuro arriverà dall'API
const MOCK_DOMANDA: Omit<FormValues, 'tipologiaGraduatoria'> = {
  codiceFiscale: 'CNNSVT75P17F839U',
  cognome: 'CANNA',
  nome: 'SALVATORE',
  dataNascita: '1975-09-17',
  comuneNascita: 'NAPOLI - NA',
  sesso: 'Maschio',
  comuneResidenza: 'CASALNUOVO DI NAPOLI - NA',
  residenteDa: '2026-01-12',
  indirizzo: 'VIA NAPOLI',
  cap: '80000',
  telefonoCellulare: '3338232691',
  pec: 'cdellabruna@cidsoftware.it',
  email: '',
  laureatoIn: 'Medicina E Chirurgia',
  votoLaurea: '110',
  lode: 'Si',
  pressoUniversita: 'TEST',
  dataLaurea: '1995-01-12',
};

// Campi presenti in ciascuna scheda (stesso ordine delle schede)
const TAB_FIELDS: (keyof FormValues)[][] = [
  ['tipologiaGraduatoria'],
  ['codiceFiscale', 'nome', 'cognome', 'dataNascita', 'comuneNascita', 'sesso', 'comuneResidenza', 'residenteDa', 'indirizzo', 'cap', 'telefonoCellulare', 'pec', 'email'],
  ['laureatoIn', 'votoLaurea', 'lode', 'pressoUniversita', 'dataLaurea'],
];

// Moduli su due colonne: spazio tra le righe e, più ampio, tra le colonne
const ROW_GAP = 2;
const COLUMN_GAP = 6;
const FORM_MAX_WIDTH = 960;
// Colonna con più campi impilati: stesso passo verticale della griglia
const columnSx = { display: 'flex', flexDirection: 'column', gap: ROW_GAP };

export const ApplicationWizardPage: React.FC<{ mode?: 'create' | 'view' }> = ({ mode = 'create' }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(mode === 'view' ? 1 : 0);
  const isReadOnly = mode === 'view';
  // "Modifica" dalla lista apre /domande/nuova?edit=<id>
  const [searchParams] = useSearchParams();
  const isEmpty = mode === 'create' && !searchParams.get('edit');
  // La domanda appartiene al programma selezionato (Medici o Pediatri)
  const activeProgram = useSelector((state: RootState) => state.ui.activeProgram);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    // Nuova domanda: campi vuoti (si vedono solo i placeholder). Visualizzazione/modifica: dati della domanda
    defaultValues: {
      ...(isEmpty ? EMPTY_DOMANDA : MOCK_DOMANDA),
      tipologiaGraduatoria: activeProgram === 'pediatria' ? 'pediatri' : 'medici_base',
    },
  });

  // Errore di validazione da mostrare sotto il campo
  const fieldError = (name: keyof FormValues) => ({ error: !!errors[name], helperText: errors[name]?.message });

  // Salvataggio con errori: si apre la prima scheda che contiene un campo da correggere
  const onInvalid = (invalid: Partial<Record<keyof FormValues, unknown>>) => {
    const tab = TAB_FIELDS.findIndex((fields) => fields.some((f) => f in invalid));
    if (tab >= 0) setActiveTab(tab);
  };

  const tabList = [
    'Inizio',
    'Dati Anagrafici',
    'Dati Laurea',
    'Albo',
    'Dichiarazione',
    'Privacy',
    'Documenti',
  ];

  return (
    <Box sx={{ width: '100%' }}>
      {/* Riquadro con le schede del modulo */}
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', overflow: 'hidden', mb: 2.5 }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="Sezioni della domanda"
          sx={{
            px: 1.5,
            borderBottom: '1px solid',
            borderColor: 'divider',
            '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0' },
          }}
        >
          {tabList.map((label, idx) => (
            <Tab
              key={label}
              disableRipple
              label={
                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                  {/* Numero del passaggio */}
                  <Box
                    component="span"
                    sx={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 'var(--fs-xs)',
                      fontWeight: 700,
                      color: activeTab === idx ? '#ffffff' : 'text.secondary',
                      backgroundColor: activeTab === idx ? 'primary.main' : 'divider',
                    }}
                  >
                    {idx + 1}
                  </Box>
                  {label}
                </Box>
              }
              sx={{
                textTransform: 'none',
                fontSize: 'var(--fs-base)',
                fontWeight: 600,
                minHeight: 52,
                color: 'text.secondary',
                '&.Mui-selected': { color: 'primary.main' },
              }}
            />
          ))}
        </Tabs>

        <Box sx={{ p: 3 }}>
        {/* Tab 0: Inizio */}
        {activeTab === 0 && (
          <Box sx={{ maxWidth: 850 }}>
            <Grid container spacing={2} sx={{ alignItems: 'center' }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="tipologiaGraduatoria"
                  control={control}
                  render={({ field }) => (
                    <SelectField {...field} {...fieldError('tipologiaGraduatoria')} placeholder="Tipologia graduatoria *" fullWidth size="small" disabled={isReadOnly}>
                      <MenuItem value="medici_base">Medici di medicina generale</MenuItem>
                      <MenuItem value="pediatri">Pediatri di libera scelta</MenuItem>
                    </SelectField>
                  )}
                />
              </Grid>
            </Grid>
            <Box sx={{ mt: 4, color: '#333333' }}>
              <Typography sx={{ fontWeight: 700, fontSize: 'var(--fs-base)', mb: 0.5 }}>CHIEDE</Typography>
              <Typography sx={{ fontSize: 'var(--fs-md)', color: '#444444' }}>
                di essere inserito nella graduatoria valida per l'anno 2026, secondo quanto previsto dall'art. 19 dell'Accordo Collettivo Nazionale per la disciplina dei rapporti con i medici di medicina generale/pediatri di libera scelta.
              </Typography>
            </Box>
          </Box>
        )}

        {/* Tab 1: Dati Anagrafici */}
        {activeTab === 1 && (
          <Box sx={{ maxWidth: FORM_MAX_WIDTH }}>
            <Grid container rowSpacing={ROW_GAP} columnSpacing={COLUMN_GAP} sx={{ alignItems: 'center' }}>
              {/* Dati personali a sinistra (codice fiscale, nome, cognome), dati di nascita a destra */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={columnSx}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Controller
                      name="codiceFiscale"
                      control={control}
                      render={({ field }) => (
                        <TextField {...field} {...fieldError('codiceFiscale')} placeholder="Codice fiscale *" size="small" fullWidth disabled={isReadOnly} />
                      )}
                    />
                    {isReadOnly && (
                      <Button
                        variant="outlined"
                        endIcon={<KeyboardArrowDownIcon />}
                        sx={{
                          backgroundColor: '#f5f5f5',
                          borderColor: '#cccccc',
                          color: '#333333',
                          whiteSpace: 'nowrap',
                          px: 1.5,
                        }}
                      >
                        Documenti
                      </Button>
                    )}
                  </Box>
                  <Controller
                    name="nome"
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} {...fieldError('nome')} placeholder="Nome *" size="small" fullWidth disabled={isReadOnly} />
                    )}
                  />
                  <Controller
                    name="cognome"
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} {...fieldError('cognome')} placeholder="Cognome *" size="small" fullWidth disabled={isReadOnly} />
                    )}
                  />
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={columnSx}>
                  <Controller
                    name="dataNascita"
                    control={control}
                    render={({ field }) => (
                      <DateInput
                        {...fieldError('dataNascita')}
                        placeholder="Data di nascita *"
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        inputRef={field.ref}
                        fullWidth
                        disabled={isReadOnly}
                      />
                    )}
                  />
                  <Controller
                    name="comuneNascita"
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} {...fieldError('comuneNascita')} placeholder="Comune nascita *" size="small" fullWidth disabled={isReadOnly} />
                    )}
                  />
                  <Controller
                    name="sesso"
                    control={control}
                    render={({ field }) => (
                      <SelectField {...field} {...fieldError('sesso')} placeholder="Sesso *" size="small" fullWidth disabled={isReadOnly}>
                        <MenuItem value="Maschio">Maschio</MenuItem>
                        <MenuItem value="Femmina">Femmina</MenuItem>
                      </SelectField>
                    )}
                  />
                </Box>
              </Grid>

              {/* Residenza */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="comuneResidenza"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} {...fieldError('comuneResidenza')} placeholder="Comune residenza *" size="small" fullWidth disabled={isReadOnly} />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="residenteDa"
                  control={control}
                  render={({ field }) => (
                    <DateInput
                      {...fieldError('residenteDa')}
                      placeholder="Residente da *"
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      inputRef={field.ref}
                      fullWidth
                      disabled={isReadOnly}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="indirizzo"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} {...fieldError('indirizzo')} placeholder="Indirizzo *" size="small" fullWidth disabled={isReadOnly} />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="cap"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} {...fieldError('cap')} placeholder="CAP *" size="small" fullWidth disabled={isReadOnly} />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="telefonoCellulare"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} {...fieldError('telefonoCellulare')} placeholder="Telefono cellulare *" size="small" fullWidth disabled={isReadOnly} />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="pec"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} {...fieldError('pec')} placeholder="PEC *" size="small" fullWidth disabled={isReadOnly} />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} {...fieldError('email')} placeholder="Email" size="small" fullWidth disabled={isReadOnly} />
                  )}
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Tab 2: Dati Laurea */}
        {activeTab === 2 && (
          <Box sx={{ maxWidth: FORM_MAX_WIDTH }}>
            <Typography sx={{ fontWeight: 700, fontSize: 'var(--fs-base)', mb: 2 }}>
              Dichiara di essere:
            </Typography>
            <Grid container rowSpacing={ROW_GAP} columnSpacing={COLUMN_GAP} sx={{ alignItems: 'center' }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="laureatoIn"
                  control={control}
                  render={({ field }) => (
                    <SelectField {...field} {...fieldError('laureatoIn')} placeholder="Laureato in *" size="small" fullWidth disabled={isReadOnly}>
                      <MenuItem value="Medicina E Chirurgia">Medicina E Chirurgia</MenuItem>
                      <MenuItem value="Odontoiatria">Odontoiatria</MenuItem>
                    </SelectField>
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Controller
                    name="votoLaurea"
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} {...fieldError('votoLaurea')} placeholder="Voto *" size="small" disabled={isReadOnly} sx={{ width: 100 }} />
                    )}
                  />
                  <Typography sx={{ fontWeight: 600 }}>/ 110</Typography>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="lode"
                  control={control}
                  render={({ field }) => (
                    <SelectField {...field} {...fieldError('lode')} placeholder="Lode *" size="small" disabled={isReadOnly} sx={{ width: 100 }}>
                      <MenuItem value="Si">Si</MenuItem>
                      <MenuItem value="No">No</MenuItem>
                    </SelectField>
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="pressoUniversita"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} {...fieldError('pressoUniversita')} placeholder="Università *" size="small" fullWidth disabled={isReadOnly} />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="dataLaurea"
                  control={control}
                  render={({ field }) => (
                    <DateInput
                      {...fieldError('dataLaurea')}
                      placeholder="Data di laurea *"
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      inputRef={field.ref}
                      fullWidth
                      disabled={isReadOnly}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Box>
        )}
        </Box>
      </Paper>

      <FormActionsBar onBack={() => navigate(DOMANDE_PATHS[activeProgram])}>
        {!isReadOnly && (
          <Button
            variant="contained"
            startIcon={<SaveIcon sx={{ fontSize: 18 }} />}
            onClick={handleSubmit((data) => console.log('Salva domanda:', data), onInvalid)}
          >
            Salva domanda
          </Button>
        )}
      </FormActionsBar>
    </Box>
  );
};