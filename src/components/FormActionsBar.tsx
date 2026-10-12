import React from 'react';
import { Box, Button, Paper } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface FormActionsBarProps {
  onBack: () => void;
  backLabel?: string;
  // Pulsanti a destra (es. "Salva")
  children?: React.ReactNode;
}

// Barra delle azioni dei moduli: resta visibile in fondo allo schermo mentre si scorre la pagina
export const FormActionsBar: React.FC<FormActionsBarProps> = ({ onBack, backLabel = 'Indietro', children }) => (
  <Paper
    elevation={4}
    sx={{
      position: 'sticky',
      bottom: 12,
      zIndex: 2,
      mt: 1,
      px: 2,
      py: 1.2,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 1,
      border: '1px solid',
      borderColor: 'divider',
    }}
  >
    <Button variant="outlined" startIcon={<ArrowBackIcon sx={{ fontSize: 18 }} />} onClick={onBack}>
      {backLabel}
    </Button>
    <Box sx={{ display: 'flex', gap: 1 }}>{children}</Box>
  </Paper>
);
