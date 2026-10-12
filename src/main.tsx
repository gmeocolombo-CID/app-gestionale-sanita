import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { store } from './store';
import { ThemedAppRoot } from './ThemedAppRoot';
// Titillium Web self-hosted (nessuna richiesta a Google Fonts): tutti i pesi e i corsivi disponibili.
// Il browser scarica solo i file dei pesi effettivamente usati.
import '@fontsource/titillium-web/200.css';
import '@fontsource/titillium-web/200-italic.css';
import '@fontsource/titillium-web/300.css';
import '@fontsource/titillium-web/300-italic.css';
import '@fontsource/titillium-web/400.css';
import '@fontsource/titillium-web/400-italic.css';
import '@fontsource/titillium-web/600.css';
import '@fontsource/titillium-web/600-italic.css';
import '@fontsource/titillium-web/700.css';
import '@fontsource/titillium-web/700-italic.css';
import '@fontsource/titillium-web/900.css';
import './index.css';

// Configurazione TanStack Query per il caching delle API sanitarie
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // Dati validi per 5 minuti
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemedAppRoot />
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>
);