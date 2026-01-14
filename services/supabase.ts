
import { createClient } from '@supabase/supabase-js';
import { Lead, Alumno } from '../types';

const SUPABASE_URL = 'https://vrronsyhwktoekbbnyub.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_mytpLkNQIMgUmkZbOCoMmQ_mzga7tR7';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- LEADS ---
export const fetchLeads = async (): Promise<Lead[]> => {
  try {
    const { data, error } = await supabase
      .from('leads_typeform_setter')
      .select('*')
      .order('fecha_registro', { ascending: false });

    if (error) return [];
    return data || [];
  } catch (err) {
    return [];
  }
};

export const updateLead = async (telefono: string, updates: Partial<Lead>): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('leads_typeform_setter')
      .update(updates)
      .eq('telefono', telefono);
    return !error;
  } catch (err) {
    return false;
  }
};

// --- ALUMNOS ---
export const fetchAlumnos = async (): Promise<Alumno[]> => {
  try {
    const { data, error } = await supabase
      .from('alumnos')
      .select('*')
      .order('fecha_compra', { ascending: false });

    if (error) return [];
    return data || [];
  } catch (err) {
    return [];
  }
};

export const updateAlumno = async (email: string, updates: Partial<Alumno>): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('alumnos')
      .update(updates)
      .eq('email', email);
    return !error;
  } catch (err) {
    return false;
  }
};
