import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import type { RootState } from '../store';

// Protegge le rotte interne: senza utente autenticato si torna al login
export const RequireAuth: React.FC = () => {
  const username = useSelector((state: RootState) => state.auth.username);
  const location = useLocation();

  if (!username) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
};
