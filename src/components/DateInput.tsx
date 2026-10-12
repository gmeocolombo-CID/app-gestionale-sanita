import React, { useState } from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { type Dayjs } from 'dayjs';

interface DateInputProps {
  // Data in formato aaaa-mm-gg ('' = nessuna data), come gli input type="date" che sostituisce
  value: string;
  onChange: (value: string) => void;
  id?: string;
  error?: boolean;
  helperText?: React.ReactNode;
  disabled?: boolean;
  fullWidth?: boolean;
  inputRef?: React.Ref<HTMLInputElement>;
  onBlur?: () => void;
  // Nome del campo, mostrato al posto di gg/mm/aaaa finché il campo è vuoto e non attivo
  placeholder?: string;
  sx?: React.ComponentProps<typeof DatePicker>['sx'];
}

const toDayjs = (value: string) => (value ? dayjs(value) : null);

// Testo per la proprietà CSS "content"
const cssString = (text: string) => `"${text.replace(/["\\]/g, '\\$&')}"`;

/**
 * Campo data con calendario in italiano (formato gg/mm/aaaa), indipendente dalla lingua del browser.
 * Mentre la data è incompleta o non valida comunica '' al modulo, così la validazione la rileva.
 */
export const DateInput: React.FC<DateInputProps> = ({ value, onChange, id, error, helperText, disabled, fullWidth, inputRef, onBlur, placeholder, sx }) => {
  const [draft, setDraft] = useState<Dayjs | null>(toDayjs(value));
  const [focused, setFocused] = useState(false);
  // Valore ricevuto dal modulo: se cambia dall'esterno (es. annulla/reset) il campo si riallinea
  const [lastValue, setLastValue] = useState(value);
  if (value !== lastValue) {
    setLastValue(value);
    setDraft(toDayjs(value));
  }

  const handleChange = (date: Dayjs | null) => {
    setDraft(date);
    const next = date && date.isValid() ? date.format('YYYY-MM-DD') : '';
    setLastValue(next);
    if (next !== value) onChange(next);
  };

  // Il calendario non accetta un placeholder libero: le sezioni gg/mm/aaaa si nascondono
  // e al loro posto compare il nome del campo
  const showPlaceholder = !!placeholder && draft === null && !focused;
  const placeholderSx = showPlaceholder
    ? {
        '& .MuiPickersSectionList-root': { opacity: 0 },
        '& .MuiPickersInputBase-root::before': {
          content: cssString(placeholder),
          position: 'absolute',
          left: 12,
          right: 48,
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'text.secondary',
          fontSize: 'var(--fs-base)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          pointerEvents: 'none',
        },
      }
    : {};

  return (
    <DatePicker
      value={draft}
      onChange={handleChange}
      format="DD/MM/YYYY"
      disabled={disabled}
      inputRef={inputRef}
      sx={[placeholderSx, ...(Array.isArray(sx) ? sx : [sx])]}
      slotProps={{
        textField: {
          id,
          size: 'small',
          fullWidth,
          error,
          helperText,
          'aria-label': placeholder,
          onFocus: () => setFocused(true),
          onBlur: () => {
            setFocused(false);
            onBlur?.();
          },
        },
        openPickerButton: { size: 'small' },
      }}
    />
  );
};
