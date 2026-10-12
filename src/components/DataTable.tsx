import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  IconButton,
  Tooltip,
  Typography,
  Button,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { SvgIconComponent } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import TableViewIcon from '@mui/icons-material/TableView';
import DescriptionIcon from '@mui/icons-material/Description';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import SearchIcon from '@mui/icons-material/Search';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import LockIcon from '@mui/icons-material/Lock';
import DoDisturbOnIcon from '@mui/icons-material/DoDisturbOn';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import { TablePaginator } from './TablePaginator';
import { ColumnChooser } from './ColumnChooser';
import { useColumnPrefs } from '../hooks/useColumnPrefs';
import { useLocation } from 'react-router-dom';
import { paginate } from '../utils/pagination';

export interface Column<T> {
  id: string;
  header: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  render: (row: T) => React.ReactNode;
}

export interface RowActionHandlers<T> {
  onView?: (row: T) => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  onPrint?: (row: T) => void;
  onDocs?: (row: T) => void;
  onKey?: (row: T) => void;
  onLock?: (row: T) => void;
  onDisable?: (row: T) => void;
}

export interface ExportOption {
  label: string;
  type: 'excel' | 'csv' | 'pdf';
  onClick?: () => void;
}

const EXPORT_STYLE = {
  excel: { icon: TableViewIcon, color: '#2e7d32' },
  csv: { icon: DescriptionIcon, color: 'text.secondary' },
  pdf: { icon: PictureAsPdfIcon, color: '#c62828' },
} as const;

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  actions?: RowActionHandlers<T>;
  // Pulsante principale nell'intestazione della tabella (es. "Nuovo")
  headerAction?: { label: string; onClick: () => void };
  showPdfExport?: boolean;
  onExportExcel?: () => void;
  onExportCSV?: () => void;
  onExportPDF?: () => void;
  // Elenco personalizzato delle esportazioni (sostituisce Excel/CSV/PDF predefiniti)
  exportOptions?: ExportOption[];
  // Pulsanti di esportazione nell'intestazione (default: visibili)
  showToolbar?: boolean;
  // Paginazione in fondo alla tabella (default: disattivata)
  paginated?: boolean;
  // Celle su una sola riga con scorrimento orizzontale (tabelle con molte colonne)
  nowrap?: boolean;
  defaultPageSize?: number;
}

// Operazioni sulle righe, nell'ordine in cui compaiono; il colore distingue le azioni distruttive
const ROW_ACTIONS: { key: keyof RowActionHandlers<unknown>; label: string; icon: SvgIconComponent; color: string }[] = [
  { key: 'onView', label: 'Visualizza', icon: SearchIcon, color: 'primary.main' },
  { key: 'onEdit', label: 'Modifica', icon: EditOutlinedIcon, color: '#b26a00' },
  { key: 'onPrint', label: 'Stampa documento', icon: PrintOutlinedIcon, color: 'primary.dark' },
  { key: 'onDocs', label: 'Visualizza allegati', icon: InsertDriveFileOutlinedIcon, color: 'primary.dark' },
  { key: 'onKey', label: 'Reimposta credenziali', icon: VpnKeyIcon, color: 'primary.main' },
  { key: 'onLock', label: 'Blocca / Sblocca', icon: LockIcon, color: 'text.primary' },
  { key: 'onDisable', label: 'Disattiva / Riattiva', icon: DoDisturbOnIcon, color: '#c62828' },
  { key: 'onDelete', label: 'Elimina', icon: DeleteOutlinedIcon, color: '#c62828' },
];

export function DataTable<T extends { id: string | number }>({
  columns,
  data,
  actions,
  headerAction,
  showPdfExport = false,
  onExportExcel,
  onExportCSV,
  onExportPDF,
  exportOptions,
  showToolbar = true,
  paginated = false,
  nowrap = false,
  defaultPageSize = 50,
}: DataTableProps<T>) {
  const location = useLocation();
  // Colonne nascoste e ordine delle colonne ("Disposizione colonne" o trascinando le intestazioni): memorizzati per pagina
  const { ordered, hidden: hiddenColumns, setHidden: setHiddenColumns, moveColumn, isCustomOrder, resetOrder } = useColumnPrefs(
    location.pathname,
    columns
  );
  const visibleColumns = ordered.filter((c) => !hiddenColumns.includes(c.id));
  // Intestazione trascinata e intestazione su cui si trova il puntatore
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const indexOf = (id: string) => ordered.findIndex((c) => c.id === id);
  const endDrag = () => {
    setDragId(null);
    setOverId(null);
  };
  const [requestedPage, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const { page, pageCount, rows } = paginated
    ? paginate(data, requestedPage, pageSize)
    : { page: 0, pageCount: 1, rows: data };

  const rowActions = ROW_ACTIONS.filter((a) => actions?.[a.key]);
  const hasActions = rowActions.length > 0;
  const colSpan = visibleColumns.length + (hasActions ? 1 : 0);

  const exportList: ExportOption[] = exportOptions ?? [
    { label: 'Esporta in Excel', type: 'excel', onClick: onExportExcel },
    { label: 'Esporta in CSV', type: 'csv', onClick: onExportCSV },
    ...(showPdfExport ? [{ label: 'Esporta in PDF', type: 'pdf' as const, onClick: onExportPDF }] : []),
  ];
  const exports = exportList.map((e) => ({ label: e.label, ...EXPORT_STYLE[e.type], onClick: e.onClick }));

  return (
    <Paper elevation={0} sx={{ width: '100%', border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
      {/* Intestazione: numero di risultati, esportazioni e pulsante principale */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1.2, flexWrap: 'wrap' }}>
        <Typography aria-live="polite" sx={{ flexGrow: 1, fontSize: 'var(--fs-sm)', color: 'text.secondary' }}>
          <Box component="strong" sx={{ color: 'text.primary', fontSize: 'var(--fs-base)' }}>
            {data.length}
          </Box>{' '}
          {data.length === 1 ? 'risultato' : 'risultati'}
        </Typography>

        {showToolbar &&
          exports.map(({ label, icon: Icon, color, onClick }) => (
            <Tooltip key={label} title={label}>
              <IconButton size="small" onClick={onClick} aria-label={label} sx={{ border: '1px solid', borderColor: 'divider' }}>
                <Icon sx={{ fontSize: 18, color }} />
              </IconButton>
            </Tooltip>
          ))}

        {showToolbar && (
          <ColumnChooser
            columns={ordered}
            hidden={hiddenColumns}
            onChange={setHiddenColumns}
            onMove={moveColumn}
            isCustomOrder={isCustomOrder}
            onResetOrder={resetOrder}
          />
        )}

        {headerAction && (
          <Button variant="contained" startIcon={<AddIcon sx={{ fontSize: 18 }} />} onClick={headerAction.onClick} sx={{ ml: 1 }}>
            {headerAction.label}
          </Button>
        )}
      </Box>

      <TableContainer
        sx={{ borderTop: '1px solid', borderColor: 'divider', ...(nowrap && { '& td': { whiteSpace: 'nowrap' } }) }}
      >
        <Table>
          <TableHead>
            <TableRow>
              {visibleColumns.map((col) => {
                // Linea sul lato in cui verrà inserita la colonna trascinata
                const dropSide = dragId && overId === col.id && dragId !== col.id ? (indexOf(dragId) < indexOf(col.id) ? 1 : -1) : 0;
                return (
                  <TableCell
                    key={col.id}
                    align={col.align || 'left'}
                    draggable
                    title="Trascina per spostare la colonna"
                    onDragStart={(e) => {
                      setDragId(col.id);
                      e.dataTransfer.effectAllowed = 'move';
                    }}
                    onDragOver={(e) => {
                      if (!dragId) return;
                      e.preventDefault();
                      setOverId(col.id);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (dragId) moveColumn(indexOf(dragId), indexOf(col.id));
                      endDrag();
                    }}
                    onDragEnd={endDrag}
                    sx={(theme) => ({
                      cursor: 'grab',
                      userSelect: 'none',
                      opacity: dragId === col.id ? 0.4 : 1,
                      boxShadow: dropSide ? `inset ${dropSide * -3}px 0 0 ${theme.palette.primary.main}` : 'none',
                    })}
                  >
                    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                      {col.header}
                      {col.sortable && <SwapVertIcon sx={{ fontSize: 16, opacity: 0.6 }} />}
                    </Box>
                  </TableCell>
                );
              })}
              {hasActions && <TableCell align="right">Operazioni</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={colSpan} align="center" sx={{ py: 5, color: 'text.secondary' }}>
                  <SearchOffIcon sx={{ fontSize: 32, opacity: 0.5, display: 'block', mx: 'auto', mb: 1 }} />
                  Nessun risultato per i filtri impostati
                </TableCell>
              </TableRow>
            )}
            {rows.map((row) => (
              <TableRow key={row.id} hover>
                {visibleColumns.map((col) => (
                  <TableCell key={col.id} align={col.align || 'left'}>
                    {col.render(row)}
                  </TableCell>
                ))}

                {hasActions && (
                  <TableCell align="right" sx={{ py: 0.75, whiteSpace: 'nowrap' }}>
                    <Box sx={{ display: 'inline-flex', gap: 0.5 }}>
                      {rowActions.map(({ key, label, icon: Icon, color }) => (
                        <Tooltip key={key} title={label}>
                          <IconButton
                            size="small"
                            aria-label={label}
                            onClick={() => actions![key]!(row)}
                            sx={(theme) => ({
                              width: 34,
                              height: 34,
                              color,
                              transition: 'background-color 0.15s ease',
                              '&:hover': { backgroundColor: alpha(theme.palette.text.primary, 0.06) },
                            })}
                          >
                            <Icon sx={{ fontSize: 19 }} />
                          </IconButton>
                        </Tooltip>
                      ))}
                    </Box>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {paginated && (
        <TablePaginator
          page={page}
          pageCount={pageCount}
          pageSize={pageSize}
          totalCount={data.length}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(0);
          }}
        />
      )}
    </Paper>
  );
}
