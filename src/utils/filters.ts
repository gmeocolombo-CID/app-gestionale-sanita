// Confronto testuale case-insensitive; un filtro vuoto accetta tutto
export const matchesText = (value: string, query: string) =>
  !query.trim() || value.toLowerCase().includes(query.trim().toLowerCase());

// Converte 'gg/mm/aaaa' nel formato 'aaaa-mm-gg' usato dai campi data (DateInput)
export const itDateToIso = (date: string) => {
  const [d, m, y] = date.split('/');
  return `${y}-${m}-${d}`;
};
