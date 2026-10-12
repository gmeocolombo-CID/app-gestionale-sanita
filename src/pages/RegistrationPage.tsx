import React, { useState } from 'react';
import { Box, Button, Link, Typography, Alert } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import BadgeIcon from '@mui/icons-material/Badge';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { Link as RouterLink } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthLayout } from '../components/auth/AuthLayout';
import { AuthField } from '../components/auth/AuthField';
import { FileUploadField } from '../components/FileUploadField';

const MAX_FILE_MB = 5;

const documentoSchema = z
  .instanceof(File, { message: 'Obbligatorio' })
  .refine((f) => f.size <= MAX_FILE_MB * 1024 * 1024, `Il file supera i ${MAX_FILE_MB} MB`)
  .refine((f) => f.type.startsWith('image/') || f.type === 'application/pdf', 'Formato non valido (immagine o PDF)');

const registrationSchema = z
  .object({
    nome: z.string().trim().min(1, 'Obbligatorio'),
    cognome: z.string().trim().min(1, 'Obbligatorio'),
    codiceFiscale: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z]{6}[0-9LMNPQRSTUV]{2}[A-Z][0-9LMNPQRSTUV]{2}[A-Z][0-9LMNPQRSTUV]{3}[A-Z]$/, 'Codice fiscale non valido'),
    telefono: z
      .string()
      .trim()
      .regex(/^\+?[0-9 ]{6,15}$/, 'Numero di telefono non valido'),
    email: z.email('Email non valida'),
    password: z.string().min(8, 'Almeno 8 caratteri'),
    confermaPassword: z.string().min(1, 'Obbligatorio'),
    documentoFronte: documentoSchema,
    documentoRetro: documentoSchema,
  })
  .refine((v) => v.password === v.confermaPassword, {
    message: 'Le password non coincidono',
    path: ['confermaPassword'],
  });

type RegistrationInput = z.input<typeof registrationSchema>;
type RegistrationValues = z.output<typeof registrationSchema>;

export const RegistrationPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationInput, unknown, RegistrationValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: { nome: '', cognome: '', codiceFiscale: '', telefono: '', email: '', password: '', confermaPassword: '' },
  });

  // TODO: inviare i dati e i documenti all'API (multipart/form-data); al momento l'invio è solo simulato
  const onSubmit = async (_values: RegistrationValues) => {
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <AuthLayout title="Registrazione nuovo medico" subtitle="Compila i dati per richiedere l'accesso al portale" maxWidth={560}>
        <Alert severity="success" sx={{ mb: 2 }}>
          Richiesta di registrazione inviata. Riceverai una comunicazione quando l'account sarà attivato.
        </Alert>
        <Link component={RouterLink} to="/login" underline="hover" sx={{ fontSize: 'var(--fs-base)' }}>
          Torna a login
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Registrazione nuovo medico" subtitle="Compila i dati per richiedere l'accesso al portale" maxWidth={560}>
      <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <AuthField id="reg-nome" label="Nome" icon={PersonIcon} autoFocus autoComplete="given-name" registration={register('nome')} error={errors.nome?.message} />
        <AuthField id="reg-cognome" label="Cognome" icon={PersonIcon} autoComplete="family-name" registration={register('cognome')} error={errors.cognome?.message} />
        <AuthField id="reg-cf" label="Codice fiscale" icon={BadgeIcon} registration={register('codiceFiscale')} error={errors.codiceFiscale?.message} />
        <AuthField id="reg-telefono" label="Telefono" type="tel" icon={PhoneIcon} autoComplete="tel" registration={register('telefono')} error={errors.telefono?.message} />
        <AuthField id="reg-email" label="Email" type="email" icon={EmailIcon} autoComplete="email" registration={register('email')} error={errors.email?.message} />
        <AuthField id="reg-password" label="Password" type="password" icon={LockIcon} autoComplete="new-password" registration={register('password')} error={errors.password?.message} />
        <AuthField
          id="reg-conferma"
          label="Conferma password"
          type="password"
          icon={LockIcon}
          autoComplete="new-password"
          registration={register('confermaPassword')}
          error={errors.confermaPassword?.message}
        />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1 }}>
          <Controller
            name="documentoFronte"
            control={control}
            render={({ field }) => (
              <FileUploadField
                id="reg-doc-fronte"
                label="Foto fronte documento di identità"
                accept="image/*,application/pdf"
                value={field.value}
                onChange={field.onChange}
                error={errors.documentoFronte?.message}
              />
            )}
          />
          <Controller
            name="documentoRetro"
            control={control}
            render={({ field }) => (
              <FileUploadField
                id="reg-doc-retro"
                label="Foto retro documento di identità"
                accept="image/*,application/pdf"
                value={field.value}
                onChange={field.onChange}
                error={errors.documentoRetro?.message}
              />
            )}
          />
          <Typography sx={{ fontSize: 'var(--fs-sm)', fontWeight: 600, color: '#555555' }}>
            Dimensione massima di caricamento file: {MAX_FILE_MB} MB.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Link component={RouterLink} to="/login" underline="hover" sx={{ fontSize: 'var(--fs-base)' }}>
            Annulla
          </Link>
        </Box>
        <Button
          type="submit"
          variant="contained"
          disableElevation
          disabled={isSubmitting}
          startIcon={<PersonAddIcon sx={{ fontSize: 18 }} />}
        >
          Registrami
        </Button>
      </Box>
    </AuthLayout>
  );
};
