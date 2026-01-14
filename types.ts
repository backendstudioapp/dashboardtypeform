
export enum LeadStatus {
  INCOMPLETE = 'Formulario incompleto',
  COMPLETE = 'Formulario completo',
  CONTACTED = 'Contactado',
  QUALIFIED = 'Calificado',
  PENDING = 'Pendiente'
}

export enum AlumnoStatus {
  ACTIVE = 'Activo',
  INACTIVE = 'Inactivo',
  PENDING = 'Pendiente',
  PAID = 'Pagado'
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

export interface Alumno {
  id?: number;
  nombre: string;
  apellidos: string;
  telefono: string;
  email: string;
  pais: string;
  estado_general: string;
  inversion_total: number;
  importe_pendiente: number;
  fecha_compra: string;
  curso: string;
  notas?: string;
}

export type Section = 'analytics' | 'leads' | 'alumnos';

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
