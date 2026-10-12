import React from 'react';
import { Box, Grid, MenuItem } from '@mui/material';
import { SelectField } from '../components/SelectField';
import { useQuery } from '@tanstack/react-query';
import { SearchFilterCard } from '../components/SearchFilterCard';
import { DataTable, type Column } from '../components/DataTable';
import { useSearchFilters } from '../hooks/useSearchFilters';

interface GraduatoriaItem {
  id: string;
  anno: number;
  tipologiaGraduatoria: string;
  descrizioneGraduatoria: string;
  dataInizio: string;
  dataFine: string;
}

export const GraduatoriePage: React.FC = () => {
  const { bind, applied, apply, reset } = useSearchFilters({ anno: '2026', tipologia: '' });

  const { data: graduatorie = [] } = useQuery<GraduatoriaItem[]>({
    queryKey: ['graduatoriePubblicate', applied],
    queryFn: async () => {
      const mockGraduatorie: GraduatoriaItem[] = [
        { id: '1', anno: 2026, tipologiaGraduatoria: 'Medici di medicina generale', descrizioneGraduatoria: 'Graduatoria dei medici di base', dataInizio: '11/01/2026', dataFine: '11/02/2026' },
        { id: '2', anno: 2026, tipologiaGraduatoria: 'Pediatri di libera scelta', descrizioneGraduatoria: 'Graduatoria dei pediatri', dataInizio: '11/01/2026', dataFine: '11/02/2026' },
        { id: '3', anno: 2024, tipologiaGraduatoria: 'Pediatri di libera scelta', descrizioneGraduatoria: 'Graduatoria dei pediatri', dataInizio: '09/10/2024', dataFine: '10/10/2024' },
        { id: '4', anno: 2024, tipologiaGraduatoria: 'Medici di medicina generale', descrizioneGraduatoria: 'Graduatoria dei medici di base', dataInizio: '08/10/2024', dataFine: '09/10/2024' },
      ];
      return mockGraduatorie.filter(
        (g) =>
          String(g.anno) === applied.anno &&
          (!applied.tipologia || g.tipologiaGraduatoria === applied.tipologia)
      );
    },
    staleTime: 1000 * 60 * 5,
  });

  const columns: Column<GraduatoriaItem>[] = [
    { id: 'anno', header: 'Anno', render: (r) => r.anno },
    { id: 'tipologiaGraduatoria', header: 'Tipologia Graduatoria', render: (r) => r.tipologiaGraduatoria },
    { id: 'descrizioneGraduatoria', header: 'Descrizione Graduatoria', render: (r) => r.descrizioneGraduatoria },
    { id: 'dataInizio', header: 'Data Inizio', render: (r) => r.dataInizio },
    { id: 'dataFine', header: 'Data Fine', render: (r) => r.dataFine },
  ];

  return (
    <Box sx={{ width: '100%' }}>
      <SearchFilterCard onSearch={apply} onReset={reset}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <SelectField placeholder="Anno" size="small" fullWidth {...bind('anno')}>
              <MenuItem value="2026">2026</MenuItem>
              <MenuItem value="2025">2025</MenuItem>
              <MenuItem value="2024">2024</MenuItem>
            </SelectField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <SelectField placeholder="Tipologia graduatoria" size="small" fullWidth {...bind('tipologia')}>
              <MenuItem value="">Tutte</MenuItem>
              <MenuItem value="Medici di medicina generale">Medici di medicina generale</MenuItem>
              <MenuItem value="Pediatri di libera scelta">Pediatri di libera scelta</MenuItem>
            </SelectField>
          </Grid>
        </Grid>
      </SearchFilterCard>

      <DataTable columns={columns} data={graduatorie} />
    </Box>
  );
};