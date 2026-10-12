import React from 'react';
import { TextField, InputAdornment } from '@mui/material';
import type { SvgIconComponent } from '@mui/icons-material';
import type { UseFormRegisterReturn } from 'react-hook-form';

interface AuthFieldProps {
  id: string;
  label: string;
  icon: SvgIconComponent;
  registration: UseFormRegisterReturn;
  error?: string;
  type?: string;
  autoComplete?: string;
  autoFocus?: boolean;
}

// Stesso colore primario dei pulsanti
const iconSx = { fontSize: 18, color: 'primary.main' };

// Campo con il nome come placeholder e icona allineata a destra, usato nelle pagine pubbliche
export const AuthField: React.FC<AuthFieldProps> = ({ id, label, icon: Icon, registration, error, ...inputProps }) => {
  // Il ref di react-hook-form va sull'input nativo, così il focus sul primo errore funziona
  const { ref, ...field } = registration;

  return (
    <TextField
      id={id}
      placeholder={label}
      size="small"
      fullWidth
      {...inputProps}
      {...field}
      inputRef={ref}
      error={!!error}
      helperText={error}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <Icon sx={iconSx} />
            </InputAdornment>
          ),
        },
      }}
    />
  );
};
