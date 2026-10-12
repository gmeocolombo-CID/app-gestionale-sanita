// Accesso ai dati degli utenti.
// TODO: sostituire le implementazioni simulate con le chiamate all'API reale (stesse firme).

export interface Utente {
  id: string;
  // Codice fiscale (o codice utente per gli account tecnici)
  codice: string;
  nome: string;
  cognome: string;
  pec: string;
  telefono: string;
  attivo: boolean;
  bloccato: boolean;
  motivoBlocco: string;
  // Descrizione del profilo (vedi api/profili.ts)
  profilo: string;
  // Formato gg/mm/aaaa, vuoto se non indicata
  dataScadenzaDocumento: string;
  // Nomi dei file del documento d'identità già caricati
  documentoFronte?: string;
  documentoRetro?: string;
}

export interface UtenteInput {
  codice: string;
  nome: string;
  cognome: string;
  pec: string;
  telefono: string;
  profilo: string;
  dataScadenzaDocumento: string;
  documentoFronte?: File;
  documentoRetro?: File;
}

export interface FiltriUtenti {
  utente: string;
  nome: string;
  cognome: string;
  pec: string;
  profilo: string;
  attivo: string;
  bloccato: string;
}

let utenti: Utente[] = [
  {
    id: '1',
    codice: 'ADMIN',
    nome: 'Admin',
    cognome: 'Amministratore',
    pec: 'admin@test.it',
    telefono: '33333',
    attivo: true,
    bloccato: false,
    motivoBlocco: '',
    profilo: 'Superadmin',
    dataScadenzaDocumento: '',
  },
  {
    id: '2',
    codice: 'RCCRFL90H25F839B',
    nome: 'RAFFAELE',
    cognome: 'RICCIO',
    pec: 'rriccio@cidsoftware.it',
    telefono: '3333333334',
    attivo: true,
    bloccato: false,
    motivoBlocco: '',
    profilo: 'Medico',
    dataScadenzaDocumento: '30/09/2028',
    documentoFronte: 'carta-identita-fronte.jpg',
    documentoRetro: 'carta-identita-retro.jpg',
  },
  {
    id: '3',
    codice: 'CNNMNL78L65C495G',
    nome: 'EMANUELA',
    cognome: 'CENNAMO',
    pec: 'ecennamo@cidsoftware.it',
    telefono: '4563217',
    attivo: true,
    bloccato: false,
    motivoBlocco: '',
    profilo: 'Medico',
    dataScadenzaDocumento: '31/05/2023',
    documentoFronte: 'documento-fronte.pdf',
    documentoRetro: 'documento-retro.pdf',
  },
];

const contains = (value: string, query: string) => !query.trim() || value.toLowerCase().includes(query.trim().toLowerCase());
// Filtro vuoto = tutti
const yesNo = (value: boolean, filter: string) => !filter || (filter === 'Si') === value;

const findOrThrow = (id: string) => {
  const utente = utenti.find((u) => u.id === id);
  if (!utente) throw new Error('Utente non trovato');
  return utente;
};

const update = (id: string, changes: Partial<Utente>) => {
  findOrThrow(id);
  utenti = utenti.map((u) => (u.id === id ? { ...u, ...changes } : u));
};

export async function listUtenti(f: FiltriUtenti): Promise<Utente[]> {
  return utenti.filter(
    (u) =>
      contains(u.codice, f.utente) &&
      contains(u.nome, f.nome) &&
      contains(u.cognome, f.cognome) &&
      contains(u.pec, f.pec) &&
      (!f.profilo || u.profilo === f.profilo) &&
      yesNo(u.attivo, f.attivo) &&
      yesNo(u.bloccato, f.bloccato)
  );
}

export async function getUtente(id: string): Promise<Utente> {
  return { ...findOrThrow(id) };
}

// Utente collegato, cercato per username (codice). null se non è tra gli utenti registrati.
// TODO: con l'API reale i dati arriveranno dalla sessione (es. /me)
export async function getUtenteCollegato(username: string): Promise<Utente | null> {
  const utente = utenti.find((u) => u.codice.toUpperCase() === username.trim().toUpperCase());
  return utente ? { ...utente } : null;
}

// Crea (senza id) o aggiorna un utente. I file vengono solo "registrati" per nome nella simulazione.
export async function saveUtente(input: UtenteInput, id?: string): Promise<Utente> {
  const { documentoFronte, documentoRetro, ...dati } = input;
  const files = {
    ...(documentoFronte && { documentoFronte: documentoFronte.name }),
    ...(documentoRetro && { documentoRetro: documentoRetro.name }),
  };

  if (id) {
    // Il codice fiscale non è modificabile
    const { codice: _codice, ...modificabili } = dati;
    update(id, { ...modificabili, ...files });
    return getUtente(id);
  }

  if (utenti.some((u) => u.codice.toUpperCase() === dati.codice.toUpperCase())) {
    throw new Error('Esiste già un utente con questo codice fiscale');
  }
  const nuovo: Utente = { id: crypto.randomUUID(), ...dati, ...files, attivo: true, bloccato: false, motivoBlocco: '' };
  utenti = [...utenti, nuovo];
  return nuovo;
}

// Genera una nuova password e la invia alla PEC dell'utente; restituisce la PEC usata
export async function resetPassword(id: string): Promise<string> {
  return findOrThrow(id).pec;
}

export async function setBloccato(id: string, bloccato: boolean, motivo = ''): Promise<void> {
  update(id, { bloccato, motivoBlocco: bloccato ? motivo : '' });
}

export async function setAttivo(id: string, attivo: boolean): Promise<void> {
  update(id, { attivo });
}

// --- Funzioni di supporto usate dalla gestione profili (simulazione) ---

export async function contaUtentiConProfilo(profilo: string): Promise<number> {
  return utenti.filter((u) => u.profilo === profilo).length;
}

// Quando la descrizione di un profilo cambia, gli utenti collegati la seguono
export async function rinominaProfiloUtenti(vecchio: string, nuovo: string): Promise<void> {
  utenti = utenti.map((u) => (u.profilo === vecchio ? { ...u, profilo: nuovo } : u));
}
