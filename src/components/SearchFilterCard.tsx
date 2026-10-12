import React, { useId, useState } from 'react';
import { Box, Paper, Collapse, Button, IconButton, Typography, Tooltip } from '@mui/material';
import { alpha, type Theme } from '@mui/material/styles';
import TuneIcon from '@mui/icons-material/Tune';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

interface SearchFilterCardProps {
  children: React.ReactNode;
  onSearch: () => void;
  // Svuota i filtri (pulsante "Azzera"); se assente il pulsante non compare
  onReset?: () => void;
}

// Freccia dei menu a tendina e icona del calendario nel colore primario (il resto dello stile dei campi è nel tema)
const fieldsSx = (theme: Theme) => ({
  '& .MuiSelect-icon, & .MuiPickersOutlinedInput-root .MuiIconButton-root': { color: theme.palette.primary.main },
});

export const SearchFilterCard: React.FC<SearchFilterCardProps> = ({ children, onSearch, onReset }) => {
  const [open, setOpen] = useState(true);
  const bodyId = useId();

  return (
    // È un form: Invio in un campo avvia la ricerca
    <Paper
      elevation={0}
      component="form"
      noValidate
      onSubmit={(e: React.SubmitEvent) => {
        e.preventDefault();
        onSearch();
      }}
      sx={(theme: Theme) => ({
        mb: 2.5,
        border: `1px solid ${theme.palette.divider}`,
        overflow: 'hidden',
        ...fieldsSx(theme),
      })}
    >
      {/* Intestazione: titolo con icona e pulsante per chiudere/aprire */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.2,
          px: 2.5,
          py: 1.2,
          borderBottom: open ? '1px solid' : 'none',
          borderColor: 'divider',
        }}
      >
        <Box
          sx={(theme: Theme) => ({
            width: 30,
            height: 30,
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'primary.main',
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
          })}
        >
          <TuneIcon sx={{ fontSize: 18 }} />
        </Box>
        <Typography component="h2" sx={{ flexGrow: 1, fontSize: 'var(--fs-lg)', fontWeight: 700, color: 'text.primary' }}>
          Parametri di ricerca
        </Typography>
        <Tooltip title={open ? 'Nascondi filtri' : 'Mostra filtri'}>
          <IconButton
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls={bodyId}
            aria-label={open ? 'Nascondi filtri' : 'Mostra filtri'}
            size="small"
          >
            <ExpandMoreIcon sx={{ transition: 'transform 0.25s ease', transform: open ? 'rotate(180deg)' : 'none' }} />
          </IconButton>
        </Tooltip>
      </Box>

      <Collapse in={open} id={bodyId}>
        <Box sx={{ px: 2.5, pt: 2.5, pb: 2 }}>{children}</Box>
        {/* Azioni in basso a destra */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, px: 2.5, pb: 2 }}>
          {onReset && (
            <Button type="button" variant="text" startIcon={<RestartAltIcon sx={{ fontSize: 18 }} />} onClick={onReset}>
              Azzera
            </Button>
          )}
          <Button type="submit" variant="contained" startIcon={<SearchIcon sx={{ fontSize: 18 }} />} sx={{ px: 3 }}>
            Cerca
          </Button>
        </Box>
      </Collapse>
    </Paper>
  );
};
