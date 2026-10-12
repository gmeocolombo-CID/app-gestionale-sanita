import { configureStore, createSlice, type PayloadAction } from '@reduxjs/toolkit';
// FONDAMENTALE: Importazione type-only per evitare crash
import type { MedicalProgramKey } from './theme';

interface UiState {
  activeProgram: MedicalProgramKey; // Il tipo viene usato qui per validare lo stato
}

const initialState: UiState = {
  activeProgram: 'medicinaGenerale', // Valore di default
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Azione per cambiare il tema in base al programma (Medici / Pediatri)
    setProgram: (state, action: PayloadAction<MedicalProgramKey>) => {
      state.activeProgram = action.payload;
    },
  },
});

// La sessione viene mantenuta in sessionStorage: sopravvive al refresh, non alla chiusura del browser
const AUTH_STORAGE_KEY = 'auth.username';

const readStoredUsername = (): string | null => {
  try {
    return sessionStorage.getItem(AUTH_STORAGE_KEY);
  } catch {
    return null;
  }
};

interface AuthState {
  username: string | null;
}

const authSlice = createSlice({
  name: 'auth',
  initialState: { username: readStoredUsername() } as AuthState,
  reducers: {
    login: (state, action: PayloadAction<string>) => {
      state.username = action.payload;
    },
    logout: (state) => {
      state.username = null;
    },
  },
});

export const { setProgram } = uiSlice.actions;
export const { login, logout } = authSlice.actions;

export const store = configureStore({
  reducer: {
    ui: uiSlice.reducer,
    auth: authSlice.reducer,
  },
});

store.subscribe(() => {
  const { username } = store.getState().auth;
  try {
    if (username) sessionStorage.setItem(AUTH_STORAGE_KEY, username);
    else sessionStorage.removeItem(AUTH_STORAGE_KEY);
  } catch {
    // sessionStorage non disponibile (es. navigazione privata): la sessione resta solo in memoria
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
