export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// Calcola pagina valida e righe visibili; se i dati si riducono (es. dopo un filtro) torna nei limiti
export function paginate<T>(rows: T[], page: number, pageSize: number) {
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  return {
    page: safePage,
    pageCount,
    rows: rows.slice(safePage * pageSize, safePage * pageSize + pageSize),
  };
}
