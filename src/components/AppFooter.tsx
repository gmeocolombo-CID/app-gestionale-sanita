import React from 'react';
import { Box, Typography } from '@mui/material';
import { APP_NAME } from '../navigation';
import logoCid from '../assets/logos/logo-cid-software.svg';

const CURRENT_YEAR = new Date().getFullYear();

// height: altezza del footer, uguale a quella della barra in alto della pagina
export const AppFooter: React.FC<{ height: number }> = ({ height }) => (
  <Box
    component="footer"
    sx={{
      borderTop: '1px solid',
      borderColor: 'divider',
      backgroundColor: 'background.paper',
      minHeight: height,
      px: 2.5,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 1,
    }}
  >
    {/* Logo CID Software: decorativo, il nome è già scritto accanto */}
    <Box component="img" src={logoCid} alt="" aria-hidden sx={{ height: 18, width: 'auto', display: 'block', flexShrink: 0 }} />
    <Typography sx={{ fontSize: 'var(--fs-xs)', color: 'text.secondary' }}>
      CID Software © {CURRENT_YEAR} {APP_NAME}
    </Typography>
  </Box>
);
