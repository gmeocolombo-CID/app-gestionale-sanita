import React from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: React.ReactNode;
  onConfirm: () => void;
  onClose: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  // Colore del pulsante di conferma: "error" per le azioni distruttive
  color?: 'primary' | 'error' | 'warning';
  confirmDisabled?: boolean;
  // Contenuto aggiuntivo sotto il messaggio (es. un campo motivo)
  children?: React.ReactNode;
}

// Finestra di conferma "Procedi / Non procedere" usata per le operazioni sulle righe
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  onConfirm,
  onClose,
  confirmLabel = 'Procedi',
  cancelLabel = 'Non procedere',
  color = 'primary',
  confirmDisabled = false,
  children,
}) => (
  <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
    <DialogTitle sx={{ fontSize: 'var(--fs-2xl)', fontWeight: 700, color: 'primary.main' }}>{title}</DialogTitle>
    <DialogContent>
      <DialogContentText sx={{ fontSize: 'var(--fs-lg)', color: '#333333' }}>{message}</DialogContentText>
      {children}
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 2 }}>
      <Button onClick={onClose} startIcon={<CloseIcon sx={{ fontSize: 18 }} />}>
        {cancelLabel}
      </Button>
      <Button
        variant="contained"
        color={color}
        disableElevation
        disabled={confirmDisabled}
        onClick={onConfirm}
        startIcon={<CheckIcon sx={{ fontSize: 18 }} />}
      >
        {confirmLabel}
      </Button>
    </DialogActions>
  </Dialog>
);
