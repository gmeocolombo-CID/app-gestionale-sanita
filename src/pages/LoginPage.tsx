import React from 'react';
import { Box, Button, Link } from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import { useDispatch } from 'react-redux';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { login, type AppDispatch } from '../store';
import { AuthLayout } from '../components/auth/AuthLayout';
import { AuthField } from '../components/auth/AuthField';

const loginSchema = z.object({
  username: z.string().trim().min(1, 'Obbligatorio'),
  password: z.string().min(1, 'Obbligatorio'),
});

type LoginValues = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  });

  // TODO: sostituire con la chiamata all'API di autenticazione (al momento qualsiasi credenziale è accettata)
  const onSubmit = (values: LoginValues) => {
    dispatch(login(values.username));
    navigate(from, { replace: true });
  };

  return (
    <AuthLayout title="Accesso" subtitle="Inserisci le tue credenziali per entrare nel portale">
      <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <AuthField
          id="login-username"
          label="Username"
          icon={PersonIcon}
          autoFocus
          autoComplete="username"
          registration={register('username')}
          error={errors.username?.message}
        />
        <AuthField
          id="login-password"
          label="Password"
          type="password"
          icon={LockIcon}
          autoComplete="current-password"
          registration={register('password')}
          error={errors.password?.message}
        />
        <Button type="submit" variant="contained" startIcon={<LoginIcon sx={{ fontSize: 18 }} />} disableElevation sx={{ mt: 1 }}>
          Accedi
        </Button>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
          <Link component={RouterLink} to="/registrazione" underline="hover" sx={{ fontSize: 'var(--fs-base)' }}>
            Non sono registrato
          </Link>
          <Link component={RouterLink} to="/reset-password" underline="hover" sx={{ fontSize: 'var(--fs-base)' }}>
            Password dimenticata?
          </Link>
        </Box>
      </Box>
    </AuthLayout>
  );
};
