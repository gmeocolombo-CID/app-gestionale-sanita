// Separazione corretta per evitare l'errore di build con Vite
import { createTheme } from '@mui/material/styles';
import type { ThemeOptions, Shadows, Theme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
// Testi dei componenti MUI e del calendario in italiano
import { itIT as coreItIT } from '@mui/material/locale';
import { itIT as pickersItIT } from '@mui/x-date-pickers/locales';
import type {} from '@mui/x-date-pickers/themeAugmentation';

// --- Dimensioni del testo ---
// Unica "manopola": cambiando BASE_FONT_SIZE si ridimensiona tutto il testo del portale.
// Le altre misure sono scostamenti dalla base e vengono pubblicate come variabili CSS
// (es. fontSize: 'var(--fs-md)'), usate da componenti e pagine al posto dei pixel.
export const BASE_FONT_SIZE = 14;

const FONT_SCALE = {
  '2xs': -2, // note minime
  xs: -1.5, // etichette piccole, testi di supporto
  sm: -1, // testi secondari, pulsanti compatti
  md: -0.5, // etichette dei moduli, celle di tabella
  base: 0, // testo base, campi, pulsanti
  lg: 0.5, // voci di menu, titoli delle sezioni
  xl: 1, // titoli dei riquadri
  '2xl': 2, // titoli delle finestre e dei riquadri principali
  '3xl': 8, // titolo della pagina
} as const;

const fontSizeVariables = Object.fromEntries(
  Object.entries(FONT_SCALE).map(([step, delta]) => [`--fs-${step}`, `${BASE_FONT_SIZE + delta}px`])
);

// Altezza unica di campi e pulsanti; l'imbottitura dei campi si adatta alla dimensione del testo
const CONTROL_HEIGHT = 38;
const INPUT_LINE_HEIGHT = 1.4375; // interlinea dei campi MUI
const inputPaddingY = `${((CONTROL_HEIGHT - BASE_FONT_SIZE * INPUT_LINE_HEIGHT) / 2).toFixed(2)}px`;

// --- Ombre ---
// Scala di 25 livelli (come quella di MUI) ma molto più raccolta: le ombre predefinite di MUI
// arrivano fino a ~46px di sfocatura (finestre di dialogo), qui il massimo è 12px.
// Usata da finestre, menu, calendario, menu laterale e da ogni componente con "elevation".
const compactShadows = [
  'none',
  ...Array.from({ length: 24 }, (_, i) => {
    const level = i + 1;
    const offsetY = 1 + Math.round(level / 8); // 1-4px
    const blur = 2 + Math.round(level / 2.4); // 2-12px
    const opacity = (0.1 + level * 0.004).toFixed(3); // 0.10-0.20
    return `0 ${offsetY}px ${blur}px rgba(20, 45, 60, ${opacity})`;
  }),
] as Shadows;

// --- Stile "moderno": colori neutri, raggi e bordi ---
// Colori dei testi e delle superfici (contrasti verificati WCAG AA)
export const UI = {
  canvas: '#f4f7f9', // sfondo generale delle pagine
  surface: '#ffffff', // schede, tabelle, finestre
  border: '#e3e9ee', // bordi e divisori
  borderStrong: '#d5dee5', // bordi più marcati
  fieldLine: '#8796a3', // linea sotto i campi (3:1 sul bianco)
  text: '#1f2d3a', // testo principale (14:1)
  textSecondary: '#5b6b78', // testo secondario (5,5:1)
  tableHead: '#f6f9fb', // intestazione delle tabelle
} as const;

// Raggi degli angoli: piccolo (campi, pulsanti), medio (schede), grande (finestre)
export const RADIUS = { sm: 8, md: 12, lg: 14 } as const;

// Colori per programma: tonalità vicine alle originali ma con contrasto AA sul bianco
export const MEDICAL_PROGRAMS = {
  medicinaGenerale: {
    name: 'Medicina di Base',
    primary: '#2f7399', // 5,2:1 sul bianco
    primaryDark: '#1f5473',
    tableHeader: '#e8f1f6',
    tableBorder: '#cfe0ea',
  },
  pediatria: {
    name: 'Pediatria di Libera Scelta',
    primary: '#00727c', // 5,7:1 sul bianco
    primaryDark: '#00545b',
    tableHeader: '#e3f2f1',
    tableBorder: '#c4e3e0',
  },
};

// Colori delle fasce/intestazioni tabella, variano con il programma selezionato
declare module '@mui/material/styles' {
  interface Palette {
    tableHeader: { main: string; border: string };
  }
  interface PaletteOptions {
    tableHeader?: { main: string; border: string };
  }
}

export type MedicalProgramKey = keyof typeof MEDICAL_PROGRAMS;

// Colore centrale della striscia sotto la barra in alto: turchese (lo stesso del logo CID Software)
export const STRIPE_CENTER_COLOR = '#00a19a';

// Striscia colorata sotto la barra in alto: sfumata ai due lati, turchese al centro
export const topBarStripeGradient = (theme: Theme) => {
  const { main } = theme.palette.primary;
  const faded = alpha(main, 0.12);
  return `linear-gradient(90deg, ${faded} 0%, ${main} 28%, ${STRIPE_CENTER_COLOR} 50%, ${main} 72%, ${faded} 100%)`;
};

// --- Campi dei moduli ---
// Linea in basso al posto del bordo sui 4 lati (la cornice di MUI è un fieldset: restano solo i bordi a zero)
const fieldLineSx = {
  borderWidth: '0 0 1px 0',
  borderRadius: 0,
  borderColor: UI.fieldLine,
  transition: 'border-color 0.2s ease',
};

const fieldRootSx = (primary: string) => ({
  borderRadius: `${RADIUS.sm}px ${RADIUS.sm}px 0 0`,
  backgroundColor: 'transparent',
  fontSize: 'var(--fs-base)',
  transition: 'background-color 0.2s ease',
  '&:hover:not(.Mui-disabled)': { backgroundColor: alpha(primary, 0.04) },
  '&.Mui-focused': { backgroundColor: alpha(primary, 0.09) },
  '&.Mui-disabled': { backgroundColor: 'transparent' },
});

export const buildAppTheme = (programKey: MedicalProgramKey = 'medicinaGenerale') => {
  const current = MEDICAL_PROGRAMS[programKey];

  const themeOptions: ThemeOptions = {
    palette: {
      primary: {
        main: current.primary,
        dark: current.primaryDark,
        contrastText: '#ffffff',
      },
      tableHeader: {
        main: current.tableHeader,
        border: current.tableBorder,
      },
      background: {
        default: UI.canvas,
        paper: UI.surface,
      },
      text: {
        primary: UI.text,
        secondary: UI.textSecondary,
      },
      divider: UI.border,
    },
    shape: { borderRadius: RADIUS.md },
    shadows: compactShadows,
    typography: {
      fontFamily: '"Titillium Web", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      // Titillium Web non ha il peso 500: MUI lo usa per bottoni, tab e intestazioni, lo mappiamo su 600
      fontWeightLight: 300,
      fontWeightRegular: 400,
      fontWeightMedium: 600,
      fontWeightBold: 700,
      fontSize: BASE_FONT_SIZE,
    },
    components: {
      // Variabili CSS della scala del testo e sfondo generale
      MuiCssBaseline: {
        styleOverrides: {
          ':root': fontSizeVariables,
          body: { backgroundColor: UI.canvas, color: UI.text },
        },
      },
      MuiPaper: {
        styleOverrides: { root: { backgroundImage: 'none' } },
      },
      MuiButton: {
        // Pulsanti piatti: l'ombra si aggiunge solo dove serve
        defaultProps: { size: 'medium', disableElevation: true },
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: RADIUS.sm,
            fontWeight: 600,
            lineHeight: 1.5,
          },
          // Pulsanti standard: testo base, altezza come i campi
          sizeMedium: {
            fontSize: 'var(--fs-base)',
            minHeight: CONTROL_HEIGHT,
            padding: '6px 18px',
          },
          // Pulsanti compatti (es. dentro le righe delle tabelle)
          sizeSmall: {
            fontSize: 'var(--fs-sm)',
            minHeight: 32,
            padding: '4px 12px',
          },
          startIcon: { marginRight: 8 },
          outlined: { backgroundColor: UI.surface },
        },
      },
      MuiIconButton: {
        styleOverrides: { root: { borderRadius: RADIUS.sm } },
      },
      // Campi senza etichetta: il nome del campo è il placeholder, che lascia il posto al testo digitato.
      // Solo la linea in basso; sfondo tinto nel colore del programma quando il campo è attivo.
      // Stesso aspetto per campi normali (MuiOutlinedInput) e campi data (MuiPickersOutlinedInput)
      MuiPickersOutlinedInput: {
        styleOverrides: {
          root: {
            ...fieldRootSx(current.primary),
            paddingLeft: 12,
            paddingRight: 12,
            '&.Mui-focused .MuiPickersOutlinedInput-notchedOutline': { borderWidth: '0 0 2px 0' },
          },
          sectionsContainer: { padding: `${inputPaddingY} 0` },
          notchedOutline: fieldLineSx,
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            ...fieldRootSx(current.primary),
            // Stessa imbottitura per testo, date e menu a tendina: tutti i campi alti CONTROL_HEIGHT.
            // I campi su più righe sono esclusi perché l'imbottitura è sul contenitore
            '& .MuiOutlinedInput-input:not(.MuiInputBase-inputMultiline)': { padding: `${inputPaddingY} 12px` },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderWidth: '0 0 2px 0' },
          },
          notchedOutline: fieldLineSx,
        },
      },
      // Placeholder leggibile (MUI lo schiarisce al 42%)
      MuiInputBase: {
        styleOverrides: {
          input: { '&::placeholder': { color: UI.textSecondary, opacity: 1 } },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            padding: '11px 16px',
            fontSize: 'var(--fs-md)',
            borderColor: UI.border,
            color: UI.text,
          },
          // Intestazioni chiare, in maiuscoletto: separano senza appesantire
          head: {
            backgroundColor: UI.tableHead,
            color: UI.textSecondary,
            fontSize: 'var(--fs-sm)',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            whiteSpace: 'nowrap',
            borderBottom: `1px solid ${UI.border}`,
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            '&.MuiTableRow-hover:hover': { backgroundColor: `${current.tableHeader}99` },
            '&:last-of-type td': { borderBottom: 'none' },
          },
        },
      },
      MuiDialog: {
        styleOverrides: { paper: { borderRadius: RADIUS.lg } },
      },
      MuiDialogTitle: {
        styleOverrides: { root: { fontWeight: 700, color: UI.text } },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: { backgroundColor: UI.text, fontSize: 'var(--fs-xs)', borderRadius: 6, padding: '5px 9px' },
        },
      },
      MuiChip: {
        styleOverrides: { root: { fontWeight: 600 } },
      },
      MuiAlert: {
        styleOverrides: { root: { borderRadius: RADIUS.sm } },
      },
    },
  };

  return createTheme(themeOptions, coreItIT, pickersItIT);
};
