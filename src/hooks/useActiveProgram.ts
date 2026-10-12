import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setProgram, type AppDispatch } from '../store';
import type { MedicalProgramKey } from '../theme';

// Allinea il tema al programma della pagina (anche aprendo l'URL direttamente)
export function useActiveProgram(program: MedicalProgramKey) {
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    dispatch(setProgram(program));
  }, [dispatch, program]);
}
