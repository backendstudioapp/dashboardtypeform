
export enum LeadStatus {
  SALE = 'Venta cerrada',
  RESERVE = 'Reserva',
  NOT_QUALIFIED = 'No cualifica',
  FOLLOW_UP = 'Seguimiento',
  CONTACTED = 'Contactado',
  RECOVERED = 'Lead recuperado',
  NO_SHOW = 'No show',
  NO_ANSWER = 'No contesta',
  NEGATIVE = 'Negativo',
  INCOMPLETE = 'Formulario incompleto',
  COMPLETE = 'Formulario completo',
  QUALIFIED = 'Calificado'
}

export interface Lead {
  id?: string;
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
  origen: string;
  cualifica: string;
  closer: string;
  terapias_anteriores?: string;
  fecha_llamada?: string;
  fecha_cierre?: string;
  cuotas?: number;
  plataforma?: string;
  cash_collected?: number;
  comision?: number;
  score?: number;
}

export interface Note {
  id: string;
  lead_id: string;
  content: string;
  created_at: string;
}

export type Section = 'analytics' | 'leads';

export interface DashboardStats {
  totalLeads: number;
  todayLeads: number;
  leadsPorEstado: Record<string, number>;
  topPais: string;
  interesComun: string;
  leadsMes: number;
  qualifiedCount: number;
  notQualifiedCount: number;
  cashCollected: number;
  completeCount: number;
  incompleteCount: number;
  contactRate: number;
  temporalChart: ChartData[];
  countryMatrix: any[];
  statusChart: any[];
  hourlyData: any[];
}

export interface ChartData {
  date: string;
  count: number;
}

export interface DateRange {
  start: Date | null;
  end: Date | null;
}
