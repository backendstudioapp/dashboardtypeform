
import { createClient } from '@supabase/supabase-js';
import { Lead } from '../types';

const SUPABASE_URL = 'https://vrronsyhwktoekbbnyub.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_mytpLkNQIMgUmkZbOCoMmQ_mzga7tR7';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const fetchLeads = async (): Promise<Lead[]> => {
  try {
    const { data, error } = await supabase
      .from('leads_typeform_setter')
      .select('*')
      .order('fecha_registro', { ascending: false });

    if (error) {
      console.warn("Error en Supabase, usando datos de demostración:", error);
      return generateMockLeads();
    }
    return data || [];
  } catch (err) {
    console.error("Error crítico:", err);
    return generateMockLeads();
  }
};

const generateMockLeads = (): Lead[] => {
  return [
    {
      nombre: "Carlos Mendoza",
      telefono: "+34 600 000 001",
      pais: "España",
      interes: "Escalar Negocio",
      perfil: "Emprendedor",
      desafios: "Falta de tiempo y equipo",
      presupuesto: "1000 - 3000",
      disponibilidad: "Inmediata",
      compromiso: "Alto",
      antiguedad: "2 años",
      fecha_registro: "2024-05-15",
      hora_registro: "10:30:00",
      estado: "Calificado"
    },
    {
      nombre: "Lucía Fernández",
      telefono: "+54 11 2233 4455",
      pais: "Argentina",
      interes: "Formación",
      perfil: "Estudiante",
      desafios: "Poca experiencia técnica",
      presupuesto: "0 - 500",
      disponibilidad: "Tardes",
      compromiso: "Medio",
      antiguedad: "Recién iniciado",
      fecha_registro: "2024-05-14",
      hora_registro: "16:45:00",
      estado: "Pendiente"
    }
  ];
};
