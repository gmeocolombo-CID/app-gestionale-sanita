import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { alpha, type Theme } from '@mui/material/styles';
import type { SvgIconComponent } from '@mui/icons-material';

interface SectionCardProps {
  title: string;
  // Icona facoltativa accanto al titolo
  icon?: SvgIconComponent;
  // Azione facoltativa a destra del titolo (es. pulsante "Modifica")
  action?: React.ReactNode;
  children: React.ReactNode;
}

// Scheda di sezione dei moduli e delle pagine di dettaglio: titolo in alto e contenuto
export const SectionCard: React.FC<SectionCardProps> = ({ title, icon: Icon, action, children }) => (
  <Paper elevation={0} component="section" sx={{ border: '1px solid', borderColor: 'divider', mb: 2.5, overflow: 'hidden' }}>
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.2,
        px: 2.5,
        py: 1.4,
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      {Icon && (
        <Box
          sx={(theme: Theme) => ({
            width: 30,
            height: 30,
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'primary.main',
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
          })}
        >
          <Icon sx={{ fontSize: 18 }} />
        </Box>
      )}
      <Typography component="h2" sx={{ flexGrow: 1, fontSize: 'var(--fs-lg)', fontWeight: 700 }}>
        {title}
      </Typography>
      {action}
    </Box>
    <Box sx={{ px: 2.5, py: 2.5 }}>{children}</Box>
  </Paper>
);
