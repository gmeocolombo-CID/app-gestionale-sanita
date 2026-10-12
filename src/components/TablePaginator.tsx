import React from 'react';
import { Box, IconButton, MenuItem, Select, Tooltip, Typography } from '@mui/material';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import LastPageIcon from '@mui/icons-material/LastPage';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { PAGE_SIZE_OPTIONS } from '../utils/pagination';

interface TablePaginatorProps {
  // Pagina corrente, a partire da 0
  page: number;
  pageCount: number;
  pageSize: number;
  // Numero totale di righe (per "1–50 di 120")
  totalCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

// Barra di paginazione in fondo alla tabella: righe per pagina, intervallo mostrato e frecce
export const TablePaginator: React.FC<TablePaginatorProps> = ({
  page,
  pageCount,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
}) => {
  const isFirst = page === 0;
  const isLast = page >= pageCount - 1;
  const from = totalCount === 0 ? 0 : page * pageSize + 1;
  const to = Math.min(totalCount, (page + 1) * pageSize);

  const nav = [
    { label: 'Prima pagina', icon: <FirstPageIcon sx={{ fontSize: 20 }} />, disabled: isFirst, target: 0 },
    { label: 'Pagina precedente', icon: <KeyboardArrowLeftIcon sx={{ fontSize: 20 }} />, disabled: isFirst, target: page - 1 },
    { label: 'Pagina successiva', icon: <KeyboardArrowRightIcon sx={{ fontSize: 20 }} />, disabled: isLast, target: page + 1 },
    { label: 'Ultima pagina', icon: <LastPageIcon sx={{ fontSize: 20 }} />, disabled: isLast, target: pageCount - 1 },
  ];

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        flexWrap: 'wrap',
        gap: { xs: 1, sm: 3 },
        px: 2,
        py: 1,
        borderTop: '1px solid',
        borderColor: 'divider',
        color: 'text.secondary',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography component="span" sx={{ fontSize: 'var(--fs-sm)' }}>
          Righe per pagina
        </Typography>
        <Select
          size="small"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          inputProps={{ 'aria-label': 'Righe per pagina' }}
          sx={{
            height: 32,
            minWidth: 68,
            fontSize: 'var(--fs-sm)',
            '& .MuiOutlinedInput-input': { py: '4px', pl: 1.2 },
          }}
        >
          {PAGE_SIZE_OPTIONS.map((n) => (
            <MenuItem key={n} value={n}>
              {n}
            </MenuItem>
          ))}
        </Select>
      </Box>

      <Typography component="span" aria-live="polite" sx={{ fontSize: 'var(--fs-sm)', fontWeight: 600, color: 'text.primary' }}>
        {from}–{to} di {totalCount}
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
        {nav.map(({ label, icon, disabled, target }) => (
          <Tooltip key={label} title={label}>
            {/* Lo span permette il tooltip anche sul pulsante disattivato */}
            <span>
              <IconButton size="small" disabled={disabled} onClick={() => onPageChange(target)} aria-label={label}>
                {icon}
              </IconButton>
            </span>
          </Tooltip>
        ))}
      </Box>
    </Box>
  );
};
