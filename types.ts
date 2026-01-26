
export enum LeadStatus {
  INCOMPLETE = 'Formulario incompleto',
  COMPLETE = 'Formulario completo',
  CONTACTED = 'Contactado',
  QUALIFIED = 'Calificado',
  PENDING = 'Pendiente'
}

export interface Lead {
  nombre: string;
  telefono: string;
  pais: string;
  interes: string;
  perfil: string;
  desafios: string;
  presupuesto: string;
  disponibilidad: string;
  compromiso: string;
  antiguedad: string;
  fecha_registro: string;
  hora_registro: string;
  estado: string;
  score?: number;
}

export type Section = 'analytics' | 'leads';

export interface DashboardStats {
  totalLeads: number;
  leadsPorEstado: Record<string, number>;
  topPais: string;
  interesComun: string;
  leadsMes: number;
}

export interface ChartData {
  date: string;
  count: number;
}

export interface DateRange {
  start: Date | null;
  end: Date | null;
}
