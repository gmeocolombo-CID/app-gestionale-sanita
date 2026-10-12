import { useState } from 'react';

/**
 * Gestisce i filtri delle schede "Parametri Ricerca":
 * i campi modificano una bozza, che diventa effettiva solo al click su "Cerca".
 */
export function useSearchFilters<T extends Record<string, string>>(initial: T) {
  const [draft, setDraft] = useState<T>(initial);
  const [applied, setApplied] = useState<T>(initial);

  // Props pronte da passare a un TextField: value + onChange
  const bind = (key: keyof T) => ({
    value: draft[key],
    onChange: (e: { target: { value: string } }) => setDraft((prev) => ({ ...prev, [key]: e.target.value })),
  });

  // Variante per i campi data (DateInput), che restituiscono direttamente il valore
  const bindDate = (key: keyof T) => ({
    value: draft[key],
    onChange: (value: string) => setDraft((prev) => ({ ...prev, [key]: value })),
  });

  const apply = () => setApplied(draft);

  // Svuota i filtri e ripete subito la ricerca con i valori iniziali
  const reset = () => {
    setDraft(initial);
    setApplied(initial);
  };

  return { bind, bindDate, applied, apply, reset };
}
