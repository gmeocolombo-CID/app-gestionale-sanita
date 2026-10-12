import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { contaNonLette, segnaLetta, segnaTutteLette, type Notifica } from '../api/notifiche';

// Ogni quanto si ricontrollano le notifiche nuove (il campanello resta aggiornato senza ricaricare)
const INTERVALLO_AGGIORNAMENTO = 60_000;

// Numero di notifiche non lette, per il contatore sul campanello
export function useNonLette() {
  return useQuery({
    queryKey: ['notifiche', 'nonLette'],
    queryFn: contaNonLette,
    staleTime: 0,
    refetchInterval: INTERVALLO_AGGIORNAMENTO,
  });
}

// Azioni comuni al pannello del campanello e alla pagina delle notifiche
export function useAzioniNotifiche() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const aggiorna = () => queryClient.invalidateQueries({ queryKey: ['notifiche'] });

  const cambiaLetta = useMutation({
    mutationFn: ({ id, letta }: { id: string; letta: boolean }) => segnaLetta(id, letta),
    onSuccess: aggiorna,
  });

  const tutteLette = useMutation({ mutationFn: segnaTutteLette, onSuccess: aggiorna });

  // Apre la pagina collegata e segna la notifica come letta
  const apri = (n: Notifica) => {
    if (!n.letta) cambiaLetta.mutate({ id: n.id, letta: true });
    if (n.link) navigate(n.link);
  };

  return {
    apri,
    cambiaLetta: (n: Notifica) => cambiaLetta.mutate({ id: n.id, letta: !n.letta }),
    segnaTutteLette: () => tutteLette.mutate(),
  };
}
