
import { Lead } from '../types';
import { supabase } from '../lib/supabase';

// Function to fetch leads from Supabase
export const fetchLeads = async (): Promise<Lead[]> => {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('fecha_registro', { ascending: false });

    if (error) {
      console.error('Error fetching leads:', error);
      return [];
    }

    return (data || []).map((dbLead: any) => ({
      id: dbLead.id,
      nombre: dbLead.nombre || 'Sin nombre',
      telefono: dbLead.telefono || '',
      pais: dbLead.pais || 'Desconocido',
      interes: dbLead.interes || '',
      perfil: dbLead.perfil || '',
      desafios: dbLead.desafios || '',
      presupuesto: dbLead.inversion || '', // Mapping 'inversion' from DB to 'presupuesto'
      disponibilidad: dbLead.disponibilidad || '',
      compromiso: 'Medio', // Default as it is not in DB
      antiguedad: dbLead.antiguedad || '',
      fecha_registro: dbLead.fecha_registro || new Date().toISOString().split('T')[0],
      hora_registro: dbLead.hora_registro ? dbLead.hora_registro.substring(0, 5) : '',
      estado: dbLead.estado || 'Pendiente',
      origen: dbLead.origen || 'Desconocido',
      cualifica: dbLead.cualifica || '-',
      closer: dbLead.closer || '-',
      terapias_anteriores: dbLead.terapias_anteriores || '',
      fecha_llamada: dbLead.fecha_llamada || '',
      fecha_cierre: dbLead.fecha_cierre || '',
      cuotas: dbLead.cuotas || 0,
      plataforma: dbLead.plataforma || '',
      cash_collected: dbLead.cash_collected || 0,
      comision: dbLead.comision || 0
    }));
  } catch (err) {
    console.error('Unexpected error fetching leads:', err);
    return [];
  }
};

export const updateLead = async (idOrPhone: string, updates: Partial<Lead>): Promise<boolean> => {
  try {
    // If we have an ID (which we should from fetchLeads), use it. Fallback to phone if needed but ID is safer.
    // The previous app logic passed phone as first arg, but we can check if updates has an ID or trust the first arg if it looks like a UUID.

    // Ideally we use the ID from the updates object if present, or the passed identifier.
    const leadId = updates.id;

    // Prepare sanitized payload
    // Postgres rejects empty strings for Date/Time/Numeric types. We must convert them to null.
    const payload = {
      nombre: updates.nombre,
      telefono: updates.telefono,
      pais: updates.pais,
      estado: updates.estado,
      interes: updates.interes,
      perfil: updates.perfil,
      antiguedad: updates.antiguedad,
      desafios: updates.desafios,
      inversion: updates.presupuesto,
      disponibilidad: updates.disponibilidad,
      origen: updates.origen,
      cualifica: updates.cualifica,
      closer: updates.closer,
      terapias_anteriores: updates.terapias_anteriores,
      // Convert empty strings to null for date/time types
      fecha_llamada: updates.fecha_llamada || null,
      fecha_cierre: updates.fecha_cierre || null,
      // Ensure numbers are valid (NaN -> null or 0)
      cuotas: (updates.cuotas === undefined || isNaN(updates.cuotas)) ? null : updates.cuotas,
      plataforma: updates.plataforma,
      cash_collected: (updates.cash_collected === undefined || isNaN(updates.cash_collected)) ? null : updates.cash_collected,
      comision: (updates.comision === undefined || isNaN(updates.comision)) ? null : updates.comision,
      fecha_registro: updates.fecha_registro,
      hora_registro: updates.hora_registro
    };

    let query = supabase.from('leads').update(payload);

    if (leadId) {
      query = query.eq('id', leadId);
    } else {
      // Fallback to phone if no ID (legacy support for the call)
      query = query.eq('telefono', idOrPhone);
    }

    const { error } = await query;

    if (error) {
      console.error('Error updating lead in Supabase:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Unexpected error updating lead:', err);
    return false;
  }
};
