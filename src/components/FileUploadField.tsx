import React from 'react';
import { Box, Button, IconButton, Typography, FormHelperText, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import DescriptionIcon from '@mui/icons-material/Description';

interface FileUploadFieldProps {
  id: string;
  label: string;
  value?: File;
  onChange: (file: File | undefined) => void;
  error?: string;
  accept?: string;
  // Mostra l'asterisco rosso dei campi obbligatori (default: sì)
  required?: boolean;
  // Nasconde l'etichetta quando la pagina la mostra già nella propria griglia
  hideLabel?: boolean;
}

// Selettore file con pulsante "Sfoglia": mostra il nome del file scelto e permette di rimuoverlo
export const FileUploadField: React.FC<FileUploadFieldProps> = ({ id, label, value, onChange, error, accept, required = true, hideLabel = false }) => (
  <Box>
    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
      {!hideLabel && (
        <Typography component="label" htmlFor={id} sx={{ fontSize: 'var(--fs-md)', fontWeight: 600, color: '#333333', minWidth: 230 }}>
          {label} :{required && <span style={{ color: 'red' }}> *</span>}
        </Typography>
      )}
      <Button component="label" aria-label={hideLabel ? `Sfoglia: ${label}` : undefined} variant="contained" disableElevation startIcon={<AddIcon sx={{ fontSize: 18 }} />}>
        Sfoglia
        <input
          id={id}
          type="file"
          hidden
          accept={accept}
          onChange={(e) => {
            onChange(e.target.files?.[0]);
            // Permette di riselezionare lo stesso file dopo averlo rimosso
            e.target.value = '';
          }}
        />
      </Button>
    </Box>

    {value && (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.8 }}>
        <DescriptionIcon sx={{ fontSize: 16, color: 'primary.main' }} />
        <Typography sx={{ fontSize: 'var(--fs-sm)', color: '#444444', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {value.name} ({(value.size / 1024 / 1024).toFixed(2)} MB)
        </Typography>
        <Tooltip title="Rimuovi">
          <IconButton size="small" onClick={() => onChange(undefined)} aria-label={`Rimuovi ${label}`} sx={{ p: 0.2 }}>
            <CloseIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Tooltip>
      </Box>
    )}
    {error && <FormHelperText error>{error}</FormHelperText>}
  </Box>
);
