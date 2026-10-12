import React from 'react';
import { Box, Grid, TextField, MenuItem } from '@mui/material';
import { SearchFilterCard } from '../components/SearchFilterCard';
import { DateInput } from '../components/DateInput';
import { SelectField } from '../components/SelectField';
import { DataTable, type Column } from '../components/DataTable';
import { useSearchFilters } from '../hooks/useSearchFilters';
import { matchesText, itDateToIso } from '../utils/filters';
import { useActiveProgram } from '../hooks/useActiveProgram';
import type { MedicalProgramKey } from '../theme';

interface RecordGraduatoria {
  id: string;
  anno: number;
  nProt: string;
  codiceFiscale: string;
  posizione: number;
  categoria: string;
  cognome: string;
  nome: string;
  dataNascita: string;
  posGradReg: number;
  punteggioGradReg: string;
  giorniLaurea: number;
  voto: number;
  dataLaurea: string;
  pec: string;
  telefono: string;
  escluso: 'Si' | 'No';
  dataPresentazione: string;
}

// Dati di esempio per programma: in futuro arriveranno dall'API
const DATI: Record<MedicalProgramKey, RecordGraduatoria[]> = {
  medicinaGenerale: [
    {
      id: '1',
      anno: 2026,
      nProt: '202/2026',
      codiceFiscale: 'RSSMRA80A01F839W',
      posizione: 1,
      categoria: 'CORSISTI RESIDENTI 3 ANNO',
      cognome: 'ROSSI',
      nome: 'MARIO',
      dataNascita: '01/01/1980',
      posGradReg: 0,
      punteggioGradReg: '0.0',
      giorniLaurea: 7317,
      voto: 110,
      dataLaurea: '13/01/2000',
      pec: 'cdellabruna@cidsoftware.it',
      telefono: '3338232691',
      escluso: 'No',
      dataPresentazione: '13/01/2026',
    },
    {
      id: '2',
      anno: 2026,
      nProt: '182/2026',
      codiceFiscale: 'CNNMNL78L65C495G',
      posizione: 2,
      categoria: 'CORSISTI NON RESIDENTI 3 ANNO',
      cognome: 'CENNAMO',
      nome: 'EMANUELA',
      dataNascita: '25/07/1978',
      posGradReg: 0,
      punteggioGradReg: '0.0',
      giorniLaurea: 15146,
      voto: 110,
      dataLaurea: '12/01/2020',
      pec: 'cdellabruna@cidsoftware.it',
      telefono: '3338232691',
      escluso: 'No',
      dataPresentazione: '12/01/2026',
    },
    {
      id: '3',
      anno: 2026,
      nProt: '201/2026',
      codiceFiscale: 'RCCRFL90H25F839B',
      posizione: 3,
      categoria: 'CORSISTI NON RESIDENTI 2 ANNO',
      cognome: 'RICCIO',
      nome: 'RAFFAELE',
      dataNascita: '25/06/1990',
      posGradReg: 0,
      punteggioGradReg: '0.0',
      giorniLaurea: 2028,
      voto: 110,
      dataLaurea: '13/01/1996',
      pec: 'cdellabruna@cidsoftware.it',
      telefono: '3338232691',
      escluso: 'No',
      dataPresentazione: '13/01/2026',
    },
  ],
  pediatria: [
    {
      id: 'p1',
      anno: 2026,
      nProt: '190/2026',
      codiceFiscale: 'BNCLRA85M41F839K',
      posizione: 1,
      categoria: 'SPECIALIZZATI IN PEDIATRIA',
      cognome: 'BIANCHI',
      nome: 'LAURA',
      dataNascita: '01/08/1985',
      posGradReg: 0,
      punteggioGradReg: '0.0',
      giorniLaurea: 5480,
      voto: 110,
      dataLaurea: '15/07/2011',
      pec: 'lbianchi@pec.it',
      telefono: '3331112233',
      escluso: 'No',
      dataPresentazione: '12/01/2026',
    },
    {
      id: 'p2',
      anno: 2026,
      nProt: '195/2026',
      codiceFiscale: 'VRDGPP82D10F839T',
      posizione: 2,
      categoria: 'SPECIALIZZANDI IN PEDIATRIA',
      cognome: 'VERDI',
      nome: 'GIUSEPPE',
      dataNascita: '10/04/1982',
      posGradReg: 0,
      punteggioGradReg: '0.0',
      giorniLaurea: 6200,
      voto: 108,
      dataLaurea: '20/03/2009',
      pec: 'gverdi@pec.it',
      telefono: '3334445566',
      escluso: 'No',
      dataPresentazione: '13/01/2026',
    },
  ],
};

export const GraduatoriaDettaglioPage: React.FC<{ program: MedicalProgramKey }> = ({ program }) => {
  useActiveProgram(program);
  const records = DATI[program];
  const categorie = Array.from(new Set(records.map((r) => r.categoria)));
  const { bind, bindDate, applied, apply, reset } = useSearchFilters({
    anno: '2026',
    categoria: '',
    nome: '',
    cognome: '',
    nProt: '',
    codiceFiscale: '',
    escluso: '',
    dal: '',
    al: '',
  });

  const dati = records.filter((r) => {
    const presentazione = itDateToIso(r.dataPresentazione);
    return (
      String(r.anno) === applied.anno &&
      (!applied.categoria || r.categoria === applied.categoria) &&
      matchesText(r.nome, applied.nome) &&
      matchesText(r.cognome, applied.cognome) &&
      matchesText(r.nProt, applied.nProt) &&
      matchesText(r.codiceFiscale, applied.codiceFiscale) &&
      (!applied.escluso || r.escluso === applied.escluso) &&
      (!applied.dal || presentazione >= applied.dal) &&
      (!applied.al || presentazione <= applied.al)
    );
  });

  const columns: Column<RecordGraduatoria>[] = [
    { id: 'anno', header: 'Anno', render: (r) => r.anno },
    { id: 'nProt', header: 'N.Prot.', render: (r) => r.nProt },
    { id: 'posizione', header: 'Posizione', render: (r) => r.posizione },
    { id: 'categoria', header: 'Categoria', render: (r) => r.categoria },
    { id: 'cognome', header: 'Cognome', render: (r) => <Box component="strong">{r.cognome}</Box> },
    { id: 'nome', header: 'Nome', render: (r) => r.nome },
    { id: 'dataNascita', header: 'Data di nascita', render: (r) => r.dataNascita },
    { id: 'posGradReg', header: 'Pos. Grad. Reg.', render: (r) => r.posGradReg },
    { id: 'punteggioGradReg', header: 'Punteggio Grad. Reg.', render: (r) => r.punteggioGradReg },
    { id: 'giorniLaurea', header: 'Giorni Laurea', render: (r) => r.giorniLaurea },
    { id: 'voto', header: 'Voto', render: (r) => r.voto },
    { id: 'dataLaurea', header: 'Data Laurea', render: (r) => r.dataLaurea },
    { id: 'pec', header: 'Pec', render: (r) => r.pec },
    { id: 'telefono', header: 'Telefono', render: (r) => r.telefono },
  ];

  return (
    <Box sx={{ width: '100%' }}>
      {/* 1. Box Filtri (Screenshot 12) */}
      <SearchFilterCard onSearch={apply} onReset={reset}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <SelectField placeholder="Anno" size="small" fullWidth {...bind('anno')}>
              <MenuItem value="2026">2026</MenuItem>
              <MenuItem value="2025">2025</MenuItem>
            </SelectField>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <SelectField placeholder="Categoria" size="small" fullWidth {...bind('categoria')}>
              <MenuItem value="">Tutte</MenuItem>
              {categorie.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </SelectField>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField size="small" fullWidth placeholder="Nome" {...bind('nome')} />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField size="small" fullWidth placeholder="Cognome" {...bind('cognome')} />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField size="small" fullWidth placeholder="N. protocollo" {...bind('nProt')} />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField size="small" fullWidth placeholder="Codice fiscale" {...bind('codiceFiscale')} />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <SelectField placeholder="Escluso" size="small" fullWidth {...bind('escluso')}>
              <MenuItem value="">Tutti</MenuItem>
              <MenuItem value="Si">Si</MenuItem>
              <MenuItem value="No">No</MenuItem>
            </SelectField>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <DateInput fullWidth placeholder="Domanda presentata dal" {...bindDate('dal')} />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <DateInput fullWidth placeholder="Domanda presentata al" {...bindDate('al')} />
          </Grid>
        </Grid>
      </SearchFilterCard>

      <DataTable
        columns={columns}
        data={dati}
        paginated
        nowrap
        exportOptions={[
          { label: 'Esporta Excel', type: 'excel' },
          { label: 'Esporta PDF 1', type: 'pdf' },
          { label: 'Esporta PDF 2', type: 'pdf' },
        ]}
      />
    </Box>
  );
};