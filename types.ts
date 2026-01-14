
export enum LeadStatus {
  QUALIFIED = 'Calificado',
  IN_PROCESS = 'En proceso',
  NOT_FIT = 'No apto',
  PENDING = 'Pendiente',
  CONTACTED = 'Contactado'
}

export interface Lead {
  nombre: string;
  telefono: string; // Primary Key
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
  score?: number; // Optional field for ranking
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
