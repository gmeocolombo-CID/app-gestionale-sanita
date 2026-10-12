// Accesso alle notifiche dell'utente collegato.
// TODO: sostituire le implementazioni simulate con le chiamate all'API reale (stesse firme).

export type TipoNotifica = 'domanda' | 'registrazione' | 'graduatoria' | 'documento' | 'sistema';

export const TIPI_NOTIFICA: Record<TipoNotifica, string> = {
  domanda: 'Domande',
  registrazione: 'Registrazioni',
  graduatoria: 'Graduatorie',
  documento: 'Documenti',
  sistema: 'Sistema',
};

export interface Notifica {
  id: string;
  tipo: TipoNotifica;
  titolo: string;
  testo: string;
  // Data e ora in formato ISO
  data: string;
  letta: boolean;
  // Pagina da aprire al click (facoltativa)
  link?: string;
}

export interface FiltriNotifiche {
  // '' = tutti i tipi
  tipo: TipoNotifica | '';
  soloNonLette: boolean;
}

// Data di esempio: "n minuti fa" rispetto al caricamento della pagina
const minutiFa = (minuti: number) => new Date(Date.now() - minuti * 60_000).toISOString();

let notifiche: Notifica[] = [
  {
    id: '1',
    tipo: 'domanda',
    titolo: 'Nuova domanda inviata',
    testo: 'CANNA SALVATORE ha inviato la domanda 181/2026 per la graduatoria dei medici di medicina generale.',
    data: minutiFa(12),
    letta: false,
    link: '/domande/visualizza/1',
  },
  {
    id: '2',
    tipo: 'registrazione',
    titolo: 'Richiesta di registrazione',
    testo: 'RICCIO RAFFAELE ha chiesto l\'accesso al portale: verifica i dati e i documenti.',
    data: minutiFa(95),
    letta: false,
    link: '/utenti/2/modifica',
  },
  {
    id: '3',
    tipo: 'documento',
    titolo: 'Documento di identità scaduto',
    testo: 'Il documento di CENNAMO EMANUELA è scaduto il 31/05/2023.',
    data: minutiFa(60 * 5),
    letta: false,
    link: '/utenti/3/modifica',
  },
  {
    id: '4',
    tipo: 'graduatoria',
    titolo: 'Graduatoria da consolidare',
    testo: 'La graduatoria 2026 dei medici di medicina generale è pronta per il consolidamento.',
    data: minutiFa(60 * 26),
    letta: true,
    link: '/consolidamento',
  },
  {
    id: '5',
    tipo: 'domanda',
    titolo: 'Nuova domanda inviata',
    testo: 'BIANCHI LAURA ha inviato la domanda 190/2026 per la graduatoria dei pediatri di libera scelta.',
    data: minutiFa(60 * 30),
    letta: true,
    link: '/domande/pediatri',
  },
  {
    id: '6',
    tipo: 'graduatoria',
    titolo: 'Graduatoria pubblicata',
    testo: 'È stata pubblicata la graduatoria 2025 dei pediatri di libera scelta.',
    data: minutiFa(60 * 24 * 4),
    letta: true,
    link: '/graduatorie',
  },
  {
    id: '7',
    tipo: 'sistema',
    titolo: 'Manutenzione programmata',
    testo: 'Il portale non sarà disponibile sabato dalle 20:00 alle 23:00 per un aggiornamento.',
    data: minutiFa(60 * 24 * 6),
    letta: true,
  },
];

// Notifiche dalla più recente; filtri facoltativi
export async function listNotifiche(filtri: FiltriNotifiche = { tipo: '', soloNonLette: false }): Promise<Notifica[]> {
  return notifiche
    .filter((n) => (!filtri.tipo || n.tipo === filtri.tipo) && (!filtri.soloNonLette || !n.letta))
    .sort((a, b) => b.data.localeCompare(a.data));
}

export async function contaNonLette(): Promise<number> {
  return notifiche.filter((n) => !n.letta).length;
}

export async function segnaLetta(id: string, letta = true): Promise<void> {
  notifiche = notifiche.map((n) => (n.id === id ? { ...n, letta } : n));
}

export async function segnaTutteLette(): Promise<void> {
  notifiche = notifiche.map((n) => ({ ...n, letta: true }));
}
