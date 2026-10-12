import { useState } from 'react';

const readStored = (key: string): string[] => {
  try {
    const raw = localStorage.getItem(key);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : [];
  } catch {
    // localStorage non disponibile o dato corrotto: impostazione predefinita
    return [];
  }
};

// Elenco di id memorizzato nel browser; vuoto = impostazione predefinita (la chiave viene rimossa)
function useStoredIds(storageKey: string) {
  const [ids, setIdsState] = useState<string[]>(() => readStored(storageKey));

  const setIds = (next: string[]) => {
    setIdsState(next);
    try {
      if (next.length) localStorage.setItem(storageKey, JSON.stringify(next));
      else localStorage.removeItem(storageKey);
    } catch {
      // ignorato: la scelta resta comunque attiva nella pagina
    }
  };

  return [ids, setIds] as const;
}

// Sposta l'elemento da una posizione all'altra
export const moveItem = <T>(list: T[], from: number, to: number): T[] => {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
};

/**
 * Preferenze sulle colonne di una tabella, memorizzate nel browser (preferenza del singolo utente):
 * colonne nascoste e ordine di visualizzazione.
 * Se la memoria del browser non è disponibile la scelta vale solo finché la pagina resta aperta.
 */
export function useColumnPrefs<C extends { id: string }>(storageKey: string, columns: C[]) {
  const [hidden, setHidden] = useStoredIds(`tabella-colonne:${storageKey}`);
  const [order, setOrderState] = useStoredIds(`tabella-ordine:${storageKey}`);

  // Colonne nell'ordine scelto; quelle aggiunte dopo il salvataggio finiscono in fondo
  const ordered = [
    ...order.map((id) => columns.find((c) => c.id === id)).filter((c): c is C => !!c),
    ...columns.filter((c) => !order.includes(c.id)),
  ];

  const defaultIds = columns.map((c) => c.id).join();
  const setOrder = (ids: string[]) => setOrderState(ids.join() === defaultIds ? [] : ids);

  // Sposta una colonna (indici riferiti a "ordered")
  const moveColumn = (from: number, to: number) => {
    if (from === to || from < 0 || to < 0 || to >= ordered.length) return;
    setOrder(moveItem(ordered.map((c) => c.id), from, to));
  };

  return {
    ordered,
    hidden,
    setHidden,
    moveColumn,
    isCustomOrder: order.length > 0,
    resetOrder: () => setOrderState([]),
  };
}
