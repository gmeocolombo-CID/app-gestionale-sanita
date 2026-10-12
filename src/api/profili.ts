// Accesso ai profili utente.
// TODO: sostituire le implementazioni simulate con le chiamate all'API reale (stesse firme).
import { contaUtentiConProfilo, rinominaProfiloUtenti } from './utenti';

export interface Profilo {
  id: string;
  codice: string;
  descrizione: string;
}

export interface ProfiloInput {
  codice: string;
  descrizione: string;
}

let profili: Profilo[] = [
  { id: '1', codice: 'ADMIN', descrizione: 'AMMINISTRATORE' },
  { id: '2', codice: 'MED', descrizione: 'Medico' },
  { id: '3', codice: 'OPASL', descrizione: 'Operatore Asl' },
  { id: '4', codice: 'SUPADMIN', descrizione: 'Superadmin' },
];

const contains = (value: string, query: string) => !query.trim() || value.toLowerCase().includes(query.trim().toLowerCase());

export async function listProfili(filtri: { codice?: string; descrizione?: string } = {}): Promise<Profilo[]> {
  return profili.filter((p) => contains(p.codice, filtri.codice ?? '') && contains(p.descrizione, filtri.descrizione ?? ''));
}

// Crea (senza id) o aggiorna un profilo; il codice non è modificabile dopo la creazione
export async function saveProfilo(input: ProfiloInput, id?: string): Promise<Profilo> {
  const descrizioneUsata = profili.some(
    (p) => p.id !== id && p.descrizione.toLowerCase() === input.descrizione.toLowerCase()
  );
  if (descrizioneUsata) throw new Error('Esiste già un profilo con questa descrizione');

  if (id) {
    const esistente = profili.find((p) => p.id === id);
    if (!esistente) throw new Error('Profilo non trovato');
    if (esistente.descrizione !== input.descrizione) {
      await rinominaProfiloUtenti(esistente.descrizione, input.descrizione);
    }
    const aggiornato = { ...esistente, descrizione: input.descrizione };
    profili = profili.map((p) => (p.id === id ? aggiornato : p));
    return aggiornato;
  }

  if (profili.some((p) => p.codice.toUpperCase() === input.codice.toUpperCase())) {
    throw new Error('Esiste già un profilo con questo codice');
  }
  const nuovo = { id: crypto.randomUUID(), ...input };
  profili = [...profili, nuovo];
  return nuovo;
}

// Un profilo assegnato ad almeno un utente non può essere eliminato
export async function deleteProfilo(id: string): Promise<void> {
  const profilo = profili.find((p) => p.id === id);
  if (!profilo) throw new Error('Profilo non trovato');
  const assegnati = await contaUtentiConProfilo(profilo.descrizione);
  if (assegnati > 0) {
    throw new Error(
      `Impossibile eliminare il profilo ${profilo.codice}: è assegnato a ${assegnati} ${assegnati === 1 ? 'utente' : 'utenti'}.`
    );
  }
  profili = profili.filter((p) => p.id !== id);
}
