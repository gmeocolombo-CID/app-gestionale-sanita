import React, { useState } from 'react';
import { Box, TextField, Button, Alert } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import LockResetIcon from '@mui/icons-material/LockReset';
import { SectionCard } from '../components/SectionCard';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const passwordSchema = z
  .object({
    passwordAttuale: z.string().min(1, 'Obbligatorio'),
    nuovaPassword: z.string().min(8, 'Almeno 8 caratteri'),
    confermaPassword: z.string().min(1, 'Obbligatorio'),
  })
  .refine((v) => v.nuovaPassword === v.confermaPassword, {
    message: 'Le password non coincidono',
    path: ['confermaPassword'],
  });

type PasswordValues = z.infer<typeof passwordSchema>;

const FIELDS: { name: keyof PasswordValues; label: string; autoComplete: string }[] = [
  { name: 'passwordAttuale', label: 'Password attuale', autoComplete: 'current-password' },
  { name: 'nuovaPassword', label: 'Nuova password', autoComplete: 'new-password' },
  { name: 'confermaPassword', label: 'Conferma nuova password', autoComplete: 'new-password' },
];

export const ChangePasswordPage: React.FC = () => {
  const [saved, setSaved] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { passwordAttuale: '', nuovaPassword: '', confermaPassword: '' },
  });

  // TODO: inviare la richiesta all'API (al momento il salvataggio è solo simulato)
  const onSubmit = () => {
    setSaved(true);
    reset();
  };

  return (
    <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)} sx={{ maxWidth: 720 }}>
      <SectionCard title="Nuova password" icon={LockResetIcon}>
        {saved && (
          <Alert severity="success" onClose={() => setSaved(false)} sx={{ mb: 2 }}>
            Password aggiornata.
          </Alert>
        )}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 420 }}>
          {FIELDS.map(({ name, label, autoComplete }) => (
            <TextField
              key={name}
              id={name}
              type="password"
              placeholder={`${label} *`}
              size="small"
              fullWidth
              autoComplete={autoComplete}
              {...register(name, { onChange: () => setSaved(false) })}
              error={!!errors[name]}
              helperText={errors[name]?.message}
            />
          ))}
        </Box>
        <Box sx={{ mt: 2.5, display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="submit" variant="contained" startIcon={<SaveIcon sx={{ fontSize: 18 }} />}>
            Salva
          </Button>
        </Box>
      </SectionCard>
    </Box>
  );
};
