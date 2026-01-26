
import { Lead } from '../types';

// Datos de prueba (Mock Data) locales para el frontend
const MOCK_LEADS: Lead[] = [
  {
    nombre: "Juan Pérez",
    telefono: "+34 600 000 001",
    pais: "España",
    interes: "Setter High Ticket",
    perfil: "Ventas",
    desafios: "Falta de leads cualificados",
    presupuesto: "1000€",
    disponibilidad: "Inmediata",
    compromiso: "Alto",
    antiguedad: "2 años",
    fecha_registro: "2024-05-15",
    hora_registro: "10:30",
    estado: "Formulario completo"
  },
  {
    nombre: "Maria García",
    telefono: "+34 600 000 002",
    pais: "México",
    interes: "Cerrador de Ventas",
    perfil: "Atención al cliente",
    desafios: "Poca experiencia en cierre",
    presupuesto: "500€",
    disponibilidad: "Tardes",
    compromiso: "Medio",
    antiguedad: "1 año",
    fecha_registro: "2024-05-15",
    hora_registro: "11:15",
    estado: "Formulario incompleto"
  },
  {
    nombre: "Carlos Ruiz",
    telefono: "+34 600 000 003",
    pais: "Colombia",
    interes: "Setter High Ticket",
    perfil: "Emprendedor",
    desafios: "Escalabilidad",
    presupuesto: "2000€",
    disponibilidad: "Completa",
    compromiso: "Total",
    antiguedad: "3 años",
    fecha_registro: "2024-05-14",
    hora_registro: "09:00",
    estado: "Contactado"
  },
  {
    nombre: "Elena Torres",
    telefono: "+34 600 000 004",
    pais: "España",
    interes: "Setter High Ticket",
    perfil: "Estudiante",
    desafios: "Primer empleo",
    presupuesto: "300€",
    disponibilidad: "Fines de semana",
    compromiso: "Alto",
    antiguedad: "6 meses",
    fecha_registro: "2024-05-14",
    hora_registro: "14:20",
    estado: "Formulario completo"
  },
  {
    nombre: "Roberto Gómez",
    telefono: "+34 600 000 005",
    pais: "Argentina",
    interes: "Setter High Ticket",
    perfil: "Freelance",
    desafios: "Gestión del tiempo",
    presupuesto: "800€",
    disponibilidad: "Mañanas",
    compromiso: "Medio",
    antiguedad: "4 años",
    fecha_registro: "2024-05-13",
    hora_registro: "16:45",
    estado: "Formulario incompleto"
  },
  {
    nombre: "Lucía Méndez",
    telefono: "+34 600 000 006",
    pais: "Chile",
    interes: "Cerrador de Ventas",
    perfil: "Administrativo",
    desafios: "Bajo salario actual",
    presupuesto: "1200€",
    disponibilidad: "Inmediata",
    compromiso: "Alto",
    antiguedad: "5 años",
    fecha_registro: "2024-05-13",
    hora_registro: "12:10",
    estado: "Calificado"
  },
  {
    nombre: "Fernando Soria",
    telefono: "+34 600 000 007",
    pais: "España",
    interes: "Setter High Ticket",
    perfil: "Comercial",
    desafios: "Quema profesional",
    presupuesto: "1500€",
    disponibilidad: "Noches",
    compromiso: "Alto",
    antiguedad: "10 años",
    fecha_registro: "2024-05-12",
    hora_registro: "19:30",
    estado: "Contactado"
  }
];

// Funciones simuladas (solo frontend)
export const fetchLeads = async (): Promise<Lead[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve([...MOCK_LEADS]), 400);
  });
};

export const updateLead = async (telefono: string, updates: Partial<Lead>): Promise<boolean> => {
  console.log(`[FRONTEND-ONLY] Actualizando lead localmente: ${telefono}`, updates);
  return new Promise((resolve) => {
    setTimeout(() => resolve(true), 300);
  });
};
