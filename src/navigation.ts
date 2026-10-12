// Icone del menu: PNG della cartella src/assets/icone
import iconHome from './assets/icone/home.png';
import iconProfili from './assets/icone/overlay.png';
import iconUtenti from './assets/icone/user (1).png';
import iconConfigurazione from './assets/icone/website-interface.png';
import iconDomandeMedici from './assets/icone/doctor.png';
import iconDomandePediatri from './assets/icone/pediatrician.png';
import iconConsolidamento from './assets/icone/certification.png';
import iconCausali from './assets/icone/list (1).png';
import iconGraduatoriaPubblicata from './assets/icone/laptop.png';
import iconGraduatoriaMedici from './assets/icone/brigade.png';
import iconGraduatoriaPediatri from './assets/icone/matron.png';
import iconModificaPassword from './assets/icone/browser.png';
import type { MedicalProgramKey } from './theme';

export const APP_NAME = 'Portale dei Medici Medicina Generale e dei Pediatri di Libera Scelta';

export interface MenuItemConfig {
  label: string;
  path: string;
  // URL dell'immagine dell'icona
  icon: string;
  // Titolo mostrato nel breadcrumb, se diverso dall'etichetta del menu
  title?: string;
}

export interface MenuSection {
  label: string;
  items: MenuItemConfig[];
}

export const DOMANDE_PATHS: Record<MedicalProgramKey, string> = {
  medicinaGenerale: '/domande/medici',
  pediatria: '/domande/pediatri',
};

export const GRADUATORIA_PATHS: Record<MedicalProgramKey, string> = {
  medicinaGenerale: '/graduatoria/medici',
  pediatria: '/graduatoria/pediatri',
};

export const MENU_SECTIONS: MenuSection[] = [
  {
    label: 'Home Page',
    items: [{ label: 'Home Page', path: '/', icon: iconHome }],
  },
  {
    label: 'Amministrazione',
    items: [
      { label: 'Profili', path: '/profili', icon: iconProfili },
      { label: 'Utenti', path: '/utenti', icon: iconUtenti },
      { label: 'Configurazione', path: '/configurazione', icon: iconConfigurazione },
    ],
  },
  {
    label: 'Graduatorie Annuali',
    items: [
      {
        label: 'Domande Medici Medicina Gen.',
        path: DOMANDE_PATHS.medicinaGenerale,
        icon: iconDomandeMedici,
        title: 'Domande Annuali Medici di Medicina Generale',
      },
      {
        label: 'Domande Pediatri',
        path: DOMANDE_PATHS.pediatria,
        icon: iconDomandePediatri,
        title: 'Domande Annuali Pediatri di Libera Scelta',
      },
      { label: 'Consolidamento', path: '/consolidamento', icon: iconConsolidamento },
      { label: 'Causali di Esclusione', path: '/causali-esclusione', icon: iconCausali },
      {
        label: 'Graduatoria Annuale Pubblicata',
        path: '/graduatorie',
        icon: iconGraduatoriaPubblicata,
        title: 'Graduatorie Annuali Pubblicate',
      },
      { label: 'Graduatoria Medici Di Base', path: GRADUATORIA_PATHS.medicinaGenerale, icon: iconGraduatoriaMedici },
      { label: 'Graduatoria Pediatri', path: GRADUATORIA_PATHS.pediatria, icon: iconGraduatoriaPediatri },
    ],
  },
  {
    label: 'Utilità',
    items: [{ label: 'Modifica Password', path: '/modifica-password', icon: iconModificaPassword }],
  },
];

export const findMenuItem = (path: string) =>
  MENU_SECTIONS.flatMap((s) => s.items).find((item) => item.path === path);
