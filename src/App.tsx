import React, { lazy, Suspense } from 'react';
import { LinearProgress } from '@mui/material';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { MainLayout } from './MainLayout';
import { RequireAuth } from './components/RequireAuth';
import { DOMANDE_PATHS, GRADUATORIA_PATHS } from './navigation';

// Le pagine vengono caricate solo quando servono, per ridurre il bundle iniziale
const LoginPage = lazy(() => import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegistrationPage = lazy(() => import('./pages/RegistrationPage').then((m) => ({ default: m.RegistrationPage })));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage })));
const PlatformsPage = lazy(() => import('./pages/PlatformsPage').then((m) => ({ default: m.PlatformsPage })));
const ProfilesPage = lazy(() => import('./pages/ProfilesPage').then((m) => ({ default: m.ProfilesPage })));
const UsersPage = lazy(() => import('./pages/UsersPage').then((m) => ({ default: m.UsersPage })));
const UserFormPage = lazy(() => import('./pages/UserFormPage').then((m) => ({ default: m.UserFormPage })));
const ApplicationsPage = lazy(() => import('./pages/ApplicationsPage').then((m) => ({ default: m.ApplicationsPage })));
const GraduatoriePage = lazy(() => import('./pages/GraduatoriePage').then((m) => ({ default: m.GraduatoriePage })));
const GraduatoriaDettaglioPage = lazy(() =>
  import('./pages/GraduatoriaDettaglioPage').then((m) => ({ default: m.GraduatoriaDettaglioPage }))
);
const ApplicationWizardPage = lazy(() =>
  import('./pages/ApplicationWizardPage').then((m) => ({ default: m.ApplicationWizardPage }))
);
const ChangePasswordPage = lazy(() => import('./pages/ChangePasswordPage').then((m) => ({ default: m.ChangePasswordPage })));
const ConsolidamentoPage = lazy(() => import('./pages/ConsolidamentoPage').then((m) => ({ default: m.ConsolidamentoPage })));
const ConfigurazionePage = lazy(() => import('./pages/ConfigurazionePage').then((m) => ({ default: m.ConfigurazionePage })));
const ProfiloPage = lazy(() => import('./pages/ProfiloPage').then((m) => ({ default: m.ProfiloPage })));
const NotifichePage = lazy(() => import('./pages/NotifichePage').then((m) => ({ default: m.NotifichePage })));
const CausaliEsclusionePage = lazy(() =>
  import('./pages/CausaliEsclusionePage').then((m) => ({ default: m.CausaliEsclusionePage }))
);

// Rimuove lo slash iniziale: le rotte figlie sono relative a "/"
const rel = (path: string) => path.slice(1);

export const App: React.FC = () => {
  return (
    <Routes>
      {/* Pagine pubbliche (fuori dal layout e senza autenticazione) */}
      <Route
        element={
          <Suspense fallback={<LinearProgress />}>
            <Outlet />
          </Suspense>
        }
      >
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registrazione" element={<RegistrationPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

      <Route element={<RequireAuth />}>
        <Route path="/" element={<MainLayout />}>
          {/* Home Page */}
          <Route index element={<PlatformsPage />} />

          {/* Amministrazione */}
          <Route path="profili" element={<ProfilesPage />} />
          <Route path="utenti" element={<UsersPage />} />
          <Route path="utenti/nuovo" element={<UserFormPage />} />
          <Route path="utenti/:id/modifica" element={<UserFormPage />} />
          <Route path="configurazione" element={<ConfigurazionePage />} />

          {/* Graduatorie Annuali: la key forza un nuovo stato (filtri) al cambio di programma */}
          <Route path={rel(DOMANDE_PATHS.medicinaGenerale)} element={<ApplicationsPage key="mmg" program="medicinaGenerale" />} />
          <Route path={rel(DOMANDE_PATHS.pediatria)} element={<ApplicationsPage key="pls" program="pediatria" />} />
          <Route path="domande/nuova" element={<ApplicationWizardPage mode="create" />} />
          <Route path="domande/visualizza/:id" element={<ApplicationWizardPage mode="view" />} />
          <Route path="consolidamento" element={<ConsolidamentoPage />} />
          <Route path="causali-esclusione" element={<CausaliEsclusionePage />} />
          <Route path="graduatorie" element={<GraduatoriePage />} />
          <Route
            path={rel(GRADUATORIA_PATHS.medicinaGenerale)}
            element={<GraduatoriaDettaglioPage key="mmg" program="medicinaGenerale" />}
          />
          <Route path={rel(GRADUATORIA_PATHS.pediatria)} element={<GraduatoriaDettaglioPage key="pls" program="pediatria" />} />

          {/* Utilità */}
          <Route path="modifica-password" element={<ChangePasswordPage />} />
          <Route path="notifiche" element={<NotifichePage />} />
          <Route path="profilo" element={<ProfiloPage />} />

          {/* Fallback di sicurezza */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default App;
