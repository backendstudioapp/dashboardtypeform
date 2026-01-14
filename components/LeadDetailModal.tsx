
import React from 'react';
import { X, User, MapPin, Calendar, Clock, Briefcase, Target, Wallet, Zap } from 'lucide-react';
import { Lead } from '../types';

interface LeadDetailModalProps {
  lead: Lead | null;
  onClose: () => void;
}

const LeadDetailModal: React.FC<LeadDetailModalProps> = ({ lead, onClose }) => {
  if (!lead) return null;

  const SectionTitle = ({ title, icon: Icon }: { title: string, icon: any }) => (
    <div className="flex items-center gap-2 mb-4 mt-6 first:mt-0">
      <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
        <Icon size={16} />
      </div>
      <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider">{title}</h4>
    </div>
  );

  const DataItem = ({ label, value }: { label: string, value: string }) => (
    <div className="mb-3">
      <p className="text-[10px] text-gray-400 font-bold uppercase">{label}</p>
      <p className="text-sm text-gray-700 font-medium">{value || 'N/A'}</p>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-sm transition-opacity">
      <div className="bg-white w-full max-w-lg h-full shadow-2xl overflow-y-auto animate-slide-in p-8">
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-violet-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
              {lead.nombre.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{lead.nombre}</h2>
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                lead.estado === 'Calificado' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {lead.estado}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
            <SectionTitle title="Datos Personales" icon={User} />
            <div className="grid grid-cols-2 gap-4">
              <DataItem label="Nombre completo" value={lead.nombre} />
              <DataItem label="Teléfono / WhatsApp" value={lead.telefono} />
              <DataItem label="País" value={lead.pais} />
              <div className="flex gap-4">
                <DataItem label="Fecha" value={lead.fecha_registro} />
                <DataItem label="Hora" value={lead.hora_registro} />
              </div>
            </div>

            <SectionTitle title="Perfil y Contexto" icon={Briefcase} />
            <div className="grid grid-cols-2 gap-4">
              <DataItem label="Perfil" value={lead.perfil} />
              <DataItem label="Antigüedad" value={lead.antiguedad} />
              <DataItem label="Interés principal" value={lead.interes} />
            </div>

            <SectionTitle title="Situación" icon={Target} />
            <DataItem label="Desafíos" value={lead.desafios} />
            
            <SectionTitle title="Condiciones" icon={Wallet} />
            <div className="grid grid-cols-2 gap-4">
              <DataItem label="Presupuesto" value={lead.presupuesto} />
              <DataItem label="Disponibilidad" value={lead.disponibilidad} />
              <DataItem label="Compromiso" value={lead.compromiso} />
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
              <Zap size={18} /> Contactar Lead
            </button>
            <button className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold py-3 rounded-xl transition-all">
              Editar Estado
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDetailModal;
