import React, { useState } from 'react';
import { Badge, Box, Checkbox, Divider, IconButton, ListItemText, Menu, MenuItem, Tooltip, Typography } from '@mui/material';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';

interface ColumnChooserProps {
  // Colonne nell'ordine di visualizzazione
  columns: { id: string; header: string }[];
  hidden: string[];
  onChange: (hidden: string[]) => void;
  // Sposta una colonna (indici riferiti a "columns")
  onMove: (from: number, to: number) => void;
  isCustomOrder: boolean;
  onResetOrder: () => void;
}

const arrowSx = { p: 0.25, color: 'text.secondary' };

// Pulsante "Disposizione colonne": mostra/nasconde le colonne e ne cambia l'ordine (trascinando o con le frecce)
export const ColumnChooser: React.FC<ColumnChooserProps> = ({ columns, hidden, onChange, onMove, isCustomOrder, onResetOrder }) => {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const hiddenCount = columns.filter((c) => hidden.includes(c.id)).length;
  const visibleCount = columns.length - hiddenCount;
  const customized = hiddenCount > 0 || isCustomOrder;

  const toggle = (id: string) => onChange(hidden.includes(id) ? hidden.filter((h) => h !== id) : [...hidden, id]);

  const endDrag = () => {
    setDragIndex(null);
    setOverIndex(null);
  };

  const label = hiddenCount ? `Disposizione colonne (${hiddenCount} nascoste)` : 'Disposizione colonne';

  return (
    <>
      <Tooltip title={label}>
        <IconButton
          size="small"
          aria-label={label}
          aria-haspopup="true"
          aria-expanded={!!anchor}
          onClick={(e) => setAnchor(e.currentTarget)}
          sx={{
            border: '1px solid',
            borderColor: customized ? 'primary.main' : 'divider',
            color: customized ? 'primary.main' : 'text.secondary',
          }}
        >
          {/* Il numero indica quante colonne sono nascoste */}
          <Badge badgeContent={hiddenCount} color="primary" sx={{ '& .MuiBadge-badge': { fontSize: 'var(--fs-2xs)', height: 16, minWidth: 16 } }}>
            <ViewColumnIcon sx={{ fontSize: 18 }} />
          </Badge>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchor}
        open={!!anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { minWidth: 280, maxHeight: 480 } } }}
      >
        <Box sx={{ px: 2, pt: 1, pb: 0.5 }}>
          <Typography sx={{ fontSize: 'var(--fs-sm)', fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Colonne visibili
          </Typography>
          <Typography sx={{ fontSize: 'var(--fs-xs)', color: 'text.secondary' }}>Trascina o usa le frecce per cambiare l'ordine</Typography>
        </Box>
        {columns.map((col, index) => {
          const visible = !hidden.includes(col.id);
          // Almeno una colonna deve restare visibile
          const isLastVisible = visible && visibleCount === 1;
          const isDropTarget = dragIndex !== null && overIndex === index && dragIndex !== index;
          return (
            <MenuItem
              key={col.id}
              dense
              draggable
              onClick={() => !isLastVisible && toggle(col.id)}
              onDragStart={(e) => {
                setDragIndex(index);
                e.dataTransfer.effectAllowed = 'move';
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setOverIndex(index);
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (dragIndex !== null) onMove(dragIndex, index);
                endDrag();
              }}
              onDragEnd={endDrag}
              sx={{
                py: 0.25,
                pl: 1,
                opacity: dragIndex === index ? 0.4 : 1,
                // Linea che indica dove verrà inserita la colonna trascinata
                boxShadow: isDropTarget ? (theme) => `inset 0 ${dragIndex! < index ? -2 : 2}px 0 ${theme.palette.primary.main}` : 'none',
              }}
            >
              <DragIndicatorIcon sx={{ fontSize: 18, color: 'text.disabled', cursor: 'grab', mr: 0.5 }} />
              <Checkbox size="small" checked={visible} disabled={isLastVisible} tabIndex={-1} disableRipple sx={{ p: 0.5, mr: 1 }} />
              <ListItemText primary={col.header} slotProps={{ primary: { sx: { fontSize: 'var(--fs-base)' } } }} />
              <Box sx={{ display: 'flex', ml: 1 }}>
                <IconButton
                  size="small"
                  aria-label={`Sposta ${col.header} in su`}
                  disabled={index === 0}
                  onClick={(e) => {
                    e.stopPropagation();
                    onMove(index, index - 1);
                  }}
                  sx={arrowSx}
                >
                  <KeyboardArrowUpIcon sx={{ fontSize: 18 }} />
                </IconButton>
                <IconButton
                  size="small"
                  aria-label={`Sposta ${col.header} in giù`}
                  disabled={index === columns.length - 1}
                  onClick={(e) => {
                    e.stopPropagation();
                    onMove(index, index + 1);
                  }}
                  sx={arrowSx}
                >
                  <KeyboardArrowDownIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Box>
            </MenuItem>
          );
        })}
        <Divider />
        <MenuItem dense onClick={() => onChange([])} disabled={!hiddenCount}>
          <RestartAltIcon sx={{ fontSize: 18, mr: 1.5, color: 'primary.main' }} />
          <ListItemText primary="Mostra tutte" slotProps={{ primary: { sx: { fontSize: 'var(--fs-base)', fontWeight: 600 } } }} />
        </MenuItem>
        <MenuItem dense onClick={onResetOrder} disabled={!isCustomOrder}>
          <SwapHorizIcon sx={{ fontSize: 18, mr: 1.5, color: 'primary.main' }} />
          <ListItemText primary="Ordine originale" slotProps={{ primary: { sx: { fontSize: 'var(--fs-base)', fontWeight: 600 } } }} />
        </MenuItem>
      </Menu>
    </>
  );
};
