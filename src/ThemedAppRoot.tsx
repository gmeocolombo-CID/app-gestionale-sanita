import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { BrowserRouter } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/it';

import type { RootState } from './store';
import { buildAppTheme } from './theme';
import App from './App';

// Wrapper dinamico: inietta il tema corretto in base al programma selezionato nello store Redux
export const ThemedAppRoot: React.FC = () => {
  const activeProgram = useSelector((state: RootState) => state.ui.activeProgram);
  const theme = useMemo(() => buildAppTheme(activeProgram), [activeProgram]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* Date e calendari in italiano in tutta l'applicazione */}
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="it">
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </LocalizationProvider>
    </ThemeProvider>
  );
};
