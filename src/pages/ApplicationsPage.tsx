import React from 'react';
import { Box, Grid, Typography, TextField, MenuItem } from '@mui/material';
import { SelectField } from '../components/SelectField';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { SearchFilterCard } from '../components/SearchFilterCard';
import { DateInput } from '../components/DateInput';
import { DataTable, type Column } from '../components/DataTable';
import { useSearchFilters } from '../hooks/useSearchFilters';
import { matchesText, itDateToIso } from '../utils/filters';
import { useActiveProgram } from '../hooks/useActiveProgram';
import type { MedicalProgramKey } from '../theme';

interface ApplicationItem {
  id: string;
  anno: number;
  nProtocollo: string;
  codiceFiscale: string;
  cognome: string;
  nome: string;
  dataInvio: string;
}

// Dati di esempio per programma: in futuro arriveranno dall'API
const MOCK_DOMANDE: Record<MedicalProgramKey, ApplicationItem[]> = {
  medicinaGenerale: [
    { id: '1', anno: 2026, nProtocollo: '181/2026', codiceFiscale: 'CNNSVT75P17F839U', cognome: 'CANNA', nome: 'SALVATORE', dataInvio: '12/01/2026' },
    { id: '2', anno: 2026, nProtocollo: '201/2026', codiceFiscale: 'RCCRFL90H25F839B', cognome: 'RICCIO', nome: 'RAFFAELE', dataInvio: '13/01/2026' },
    { id: '3', anno: 2026, nProtocollo: '202/2026', codiceFiscale: 'RSSMRA80A01F839W', cognome: 'ROSSI', nome: 'MARIO', dataInvio: '13/01/2026' },
    { id: '4', anno: 2026, nProtocollo: '182/2026', codiceFiscale: 'CNNMNL78L65C495G', cognome: 'CENNAMO', nome: 'EMANUELA', dataInvio: '12/01/2026' },
    { id: '5', anno: 2026, nProtocollo: '183/2026', codiceFiscale: 'DLLCRI92H14F839I', cognome: 'DELLA BRUNA', nome: 'CIRO', dataInvio: '12/01/2026' },
  ],
  pediatria: [
    { id: '6', anno: 2026, nProtocollo: '190/2026', codiceFiscale: 'BNCLRA85M41F839K', cognome: 'BIANCHI', nome: 'LAURA', dataInvio: '12/01/2026' },
    { id: '7', anno: 2026, nProtocollo: '195/2026', codiceFiscale: 'VRDGPP82D10F839T', cognome: 'VERDI', nome: 'GIUSEPPE', dataInvio: '13/01/2026' },
  ],
};

export const ApplicationsPage: React.FC<{ program: MedicalProgramKey }> = ({ program }) => {
  const navigate = useNavigate();
  useActiveProgram(program);
  const { bind, bindDate, applied, apply, reset } = useSearchFilters({ anno: '2026', dataInvio: '', nProtocollo: '' });

  const { data: domande = [] } = useQuery<ApplicationItem[]>({
    queryKey: ['domandeAnnuali', program, applied],
    queryFn: async () => {
      const mockDomande = MOCK_DOMANDE[program];
      return mockDomande.filter(
        (d) =>
          String(d.anno) === applied.anno &&
          (!applied.dataInvio || itDateToIso(d.dataInvio) === applied.dataInvio) &&
          matchesText(d.nProtocollo, applied.nProtocollo)
      );
    },
    staleTime: 1000 * 60 * 5,
  });

  const columns: Column<ApplicationItem>[] = [
    { id: 'anno', header: 'Anno', render: (r) => r.anno },
    { id: 'nProtocollo', header: 'N. Protocollo', render: (r) => r.nProtocollo },
    { id: 'codiceFiscale', header: 'Codice Fiscale', render: (r) => r.codiceFiscale },
    { id: 'cognome', header: 'Cognome', render: (r) => <Typography sx={{ fontWeight: 600, fontSize: 'var(--fs-md)' }}>{r.cognome}</Typography> },
    { id: 'nome', header: 'Nome', render: (r) => r.nome },
    { id: 'dataInvio', header: 'Data Invio', render: (r) => r.dataInvio },
  ];

  return (
    <Box sx={{ width: '100%' }}>
      <SearchFilterCard onSearch={apply} onReset={reset}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <SelectField placeholder="Anno" fullWidth size="small" {...bind('anno')}>
              <MenuItem value="2026">2026</MenuItem>
              <MenuItem value="2025">2025</MenuItem>
            </SelectField>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <DateInput fullWidth placeholder="Data invio" {...bindDate('dataInvio')} />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField fullWidth size="small" placeholder="Numero protocollo" {...bind('nProtocollo')} />
          </Grid>
        </Grid>
      </SearchFilterCard>

      <DataTable
        headerAction={{ label: 'Nuova domanda', onClick: () => navigate('/domande/nuova') }}
        columns={columns}
        data={domande}
        actions={{
          onView: (r) => navigate(`/domande/visualizza/${r.id}`),
          onDelete: (r) => alert(`Elimina domanda ${r.nProtocollo}`),
          onEdit: (r) => navigate(`/domande/nuova?edit=${r.id}`),
          onPrint: (r) => alert(`Stampa domanda ${r.nProtocollo}`),
          onDocs: (r) => alert(`Allegati domanda ${r.nProtocollo}`),
        }}
      />
    </Box>
  );
};