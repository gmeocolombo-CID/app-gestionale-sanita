import React, { useState } from 'react';
import { Box, Button, Link, Alert } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LockResetIcon from '@mui/icons-material/LockReset';
import { Link as RouterLink } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthLayout } from '../components/auth/AuthLayout';
import { AuthField } from '../components/auth/AuthField';

const resetSchema = z.object({
  username: z.string().trim().min(1, 'Obbligatorio'),
  pec: z.email('PEC non valida'),
});

type ResetValues = z.infer<typeof resetSchema>;

export const ResetPasswordPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { username: '', pec: '' },
  });

  // TODO: chiamare l'API di reset; al momento l'invio è solo simulato
  const onSubmit = async () => {
    setSubmitted(true);
  };

  return (
    <AuthLayout title="Recupero password" subtitle="Riceverai alla tua PEC le istruzioni per reimpostarla">
      {submitted ? (
        // Messaggio volutamente generico: non rivela se l'utente esiste
        <Alert severity="success" sx={{ mb: 2 }}>
          Se i dati inseriti sono corretti, riceverai alla PEC indicata le istruzioni per reimpostare la password.
        </Alert>
      ) : (
        <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <AuthField
            id="reset-username"
            label="Username / Codice fiscale"
            icon={PersonIcon}
            autoFocus
            autoComplete="username"
            registration={register('username')}
            error={errors.username?.message}
          />
          <AuthField id="reset-pec" label="PEC" type="email" icon={EmailIcon} autoComplete="email" registration={register('pec')} error={errors.pec?.message} />
          <Button
            type="submit"
            variant="contained"
            disableElevation
            disabled={isSubmitting}
            startIcon={<LockResetIcon sx={{ fontSize: 18 }} />}
            sx={{ mt: 1 }}
          >
            Reset Password
          </Button>
        </Box>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: submitted ? 0 : 2 }}>
        <Link component={RouterLink} to="/login" underline="hover" sx={{ fontSize: 'var(--fs-base)' }}>
          Torna a login
        </Link>
      </Box>
    </AuthLayout>
  );
};
