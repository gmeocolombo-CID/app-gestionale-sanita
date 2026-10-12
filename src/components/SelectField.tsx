import React from 'react';
import { Box, TextField, type TextFieldProps } from '@mui/material';

type SelectFieldProps = Omit<TextFieldProps, 'select' | 'placeholder'> & {
  // Nome del campo, mostrato finché non si sceglie un valore (valore '')
  placeholder: string;
};

// Menu a tendina senza etichetta: con valore vuoto mostra il nome del campo come placeholder
export const SelectField: React.FC<SelectFieldProps> = ({ placeholder, value, slotProps, ...props }) => (
  <TextField
    select
    value={value}
    {...props}
    slotProps={{
      ...slotProps,
      select: {
        displayEmpty: true,
        renderValue:
          value === ''
            ? () => (
                <Box component="span" sx={{ color: 'text.secondary' }}>
                  {placeholder}
                </Box>
              )
            : undefined,
        // Senza etichetta visibile il nome del campo resta disponibile ai lettori di schermo
        SelectDisplayProps: { 'aria-label': placeholder },
      },
    }}
  />
);
