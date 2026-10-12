import React from 'react';
import { Box, ButtonBase, IconButton, Tooltip, Typography } from '@mui/material';
import { alpha, type Theme } from '@mui/material/styles';
import type { SvgIconComponent } from '@mui/icons-material';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined';
import MarkEmailUnreadOutlinedIcon from '@mui/icons-material/MarkEmailUnreadOutlined';
import type { Notifica, TipoNotifica } from '../../api/notifiche';

// Icona e colore per tipo di notifica
const STILE_TIPO: Record<TipoNotifica, { icon: SvgIconComponent; color: string }> = {
  domanda: { icon: DescriptionOutlinedIcon, color: '#2f7399' },
  registrazione: { icon: PersonAddAltOutlinedIcon, color: '#00727c' },
  graduatoria: { icon: EmojiEventsOutlinedIcon, color: '#8a5a00' },
  documento: { icon: BadgeOutlinedIcon, color: '#c62828' },
  sistema: { icon: InfoOutlinedIcon, color: '#5b6b78' },
};

const relativa = new Intl.RelativeTimeFormat('it', { numeric: 'auto' });

// "5 minuti fa", "ieri", "3 giorni fa"; oltre una settimana la data completa
const tempoTrascorso = (iso: string) => {
  const minuti = Math.round((new Date(iso).getTime() - Date.now()) / 60_000);
  if (Math.abs(minuti) < 1) return 'adesso';
  if (Math.abs(minuti) < 60) return relativa.format(minuti, 'minute');
  const ore = Math.round(minuti / 60);
  if (Math.abs(ore) < 24) return relativa.format(ore, 'hour');
  const giorni = Math.round(ore / 24);
  if (Math.abs(giorni) < 7) return relativa.format(giorni, 'day');
  return new Date(iso).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

interface NotificaItemProps {
  notifica: Notifica;
  onOpen: (n: Notifica) => void;
  // Pulsante per segnare letta / non letta (nella pagina completa)
  onToggleLetta?: (n: Notifica) => void;
  // Testo su una riga sola (nel pannello del campanello)
  compact?: boolean;
}

// Riga di una notifica: icona del tipo, titolo, testo e orario; le non lette sono evidenziate
export const NotificaItem: React.FC<NotificaItemProps> = ({ notifica, onOpen, onToggleLetta, compact = false }) => {
  const { icon: Icon, color } = STILE_TIPO[notifica.tipo];
  const nonLetta = !notifica.letta;

  return (
    <Box
      sx={(theme: Theme) => ({
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-start',
        backgroundColor: nonLetta ? alpha(theme.palette.primary.main, 0.06) : 'transparent',
        borderBottom: `1px solid ${theme.palette.divider}`,
        '&:last-of-type': { borderBottom: 'none' },
      })}
    >
      <ButtonBase
        onClick={() => onOpen(notifica)}
        aria-label={`${nonLetta ? 'Non letta: ' : ''}${notifica.titolo}`}
        sx={(theme: Theme) => ({
          flexGrow: 1,
          minWidth: 0,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
          gap: 1.5,
          px: 2,
          py: 1.5,
          textAlign: 'left',
          '&:hover, &.Mui-focusVisible': { backgroundColor: alpha(theme.palette.primary.main, 0.06) },
        })}
      >
        {/* Pallino delle non lette */}
        <Box
          aria-hidden
          sx={{ width: 8, height: 8, mt: '15px', borderRadius: '50%', flexShrink: 0, backgroundColor: nonLetta ? 'primary.main' : 'transparent' }}
        />
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '10px',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color,
            backgroundColor: alpha(color, 0.1),
          }}
        >
          <Icon sx={{ fontSize: 20 }} />
        </Box>
        <Box sx={{ minWidth: 0, flexGrow: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
            <Typography noWrap sx={{ flexGrow: 1, fontSize: 'var(--fs-base)', fontWeight: nonLetta ? 700 : 600, color: 'text.primary' }}>
              {notifica.titolo}
            </Typography>
            <Typography component="span" sx={{ flexShrink: 0, fontSize: 'var(--fs-xs)', color: 'text.secondary' }}>
              {tempoTrascorso(notifica.data)}
            </Typography>
          </Box>
          <Typography
            sx={{
              fontSize: 'var(--fs-md)',
              color: 'text.secondary',
              lineHeight: 1.4,
              // Nel pannello al massimo due righe
              ...(compact && { display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }),
            }}
          >
            {notifica.testo}
          </Typography>
        </Box>
      </ButtonBase>

      {onToggleLetta && (
        <Tooltip title={nonLetta ? 'Segna come letta' : 'Segna come non letta'}>
          <IconButton
            size="small"
            onClick={() => onToggleLetta(notifica)}
            aria-label={nonLetta ? `Segna come letta: ${notifica.titolo}` : `Segna come non letta: ${notifica.titolo}`}
            sx={{ alignSelf: 'center', mr: 1.5, color: 'text.secondary' }}
          >
            {nonLetta ? <MarkEmailReadOutlinedIcon sx={{ fontSize: 20 }} /> : <MarkEmailUnreadOutlinedIcon sx={{ fontSize: 20 }} />}
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
};
