
import React, { useState, useEffect } from 'react';
import { X, User, Calendar, Clock, Briefcase, Target, Wallet, Save, Loader2 } from 'lucide-react';
import { Lead, LeadStatus } from '../types';
import { updateLead } from '../services/supabase';

interface LeadDetailModalProps {
  lead: Lead | null;
  onClose: () => void;
  onUpdateSuccess?: () => void;
}

const SectionTitle = ({ title, icon: Icon }: { title: string, icon: any }) => (
  <div className="flex items-center gap-2 mb-4 mt-8 first:mt-0">
    <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
      <Icon size={18} />
    </div>
    <h4 className="text-sm font-black text-gray-800 uppercase tracking-widest">{title}</h4>
  </div>
);

const EditableField = ({ 
  label, 
  value, 
  onChange, 
  type = "text", 
  options 
}: { 
  label: string, 
  value: string, 
  onChange: (val: string) => void, 
  type?: "text" | "select" | "date" | "time", 
  options?: string[] 
}) => {
  const isTimeOrDate = type === 'date' || type === 'time';
  
  return (
    <div className="mb-4">
      <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1 block">{label}</label>
      {type === "select" ? (
        <select 
          className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2 text-sm font-semibold text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      ) : (
        <input 
          type={type}
          className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2 text-sm font-semibold text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={isTimeOrDate ? (e) => e.preventDefault() : undefined}
          step={type === 'time' ? 60 : undefined}
        />
      )}
    </div>
  );
};

const LeadDetailModal: React.FC<LeadDetailModalProps> = ({ lead, onClose, onUpdateSuccess }) => {
  const [editedLead, setEditedLead] = useState<Lead | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (lead) {
      setEditedLead({ ...lead });
      setError(null);
    } else {
      setEditedLead(null);
    }
  }, [lead]);

  if (!editedLead) return null;

  const handleFieldChange = (field: keyof Lead, value: any) => {
    setEditedLead(prev => prev ? ({ ...prev, [field]: value }) : null);
  };

  const handleSave = async () => {
    if (!editedLead) return;
    setIsSaving(true);
    setError(null);
    
    const success = await updateLead(editedLead.telefono, editedLead);
    
    if (success) {
      onUpdateSuccess?.();
      onClose();
    } else {
      setError("No se pudo guardar los cambios. Intenta de nuevo.");
    }
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm transition-opacity">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-violet-600 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-blue-100">
              {editedLead.nombre.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">{editedLead.nombre}</h2>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{editedLead.telefono}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white hover:shadow-sm rounded-2xl text-gray-400 transition-all active:scale-90">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-2">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold mb-6 border border-red-100">
              {error}
            </div>
          )}

          <SectionTitle title="Información Básica" icon={User} />
          <div className="grid grid-cols-2 gap-6">
            <EditableField label="Nombre completo" value={editedLead.nombre} onChange={(val) => handleFieldChange('nombre', val)} />
            <EditableField label="Teléfono" value={editedLead.telefono} onChange={(val) => handleFieldChange('telefono', val)} />
            <EditableField 
              label="Estado" 
              value={editedLead.estado} 
              type="select" 
              options={Object.values(LeadStatus)} 
              onChange={(val) => handleFieldChange('estado', val)}
            />
            <EditableField label="País" value={editedLead.pais} onChange={(val) => handleFieldChange('pais', val)} />
          </div>

          <SectionTitle title="Registro" icon={Calendar} />
          <div className="grid grid-cols-2 gap-6">
            <EditableField label="Fecha de registro" value={editedLead.fecha_registro} type="date" onChange={(val) => handleFieldChange('fecha_registro', val)} />
            <EditableField label="Hora de registro" value={editedLead.hora_registro} type="time" onChange={(val) => handleFieldChange('hora_registro', val)} />
          </div>

          <SectionTitle title="Perfil Profesional" icon={Briefcase} />
          <div className="grid grid-cols-2 gap-6">
            <EditableField label="Perfil" value={editedLead.perfil} onChange={(val) => handleFieldChange('perfil', val)} />
            <EditableField label="Antigüedad" value={editedLead.antiguedad} onChange={(val) => handleFieldChange('antiguedad', val)} />
            <EditableField label="Interés principal" value={editedLead.interes} onChange={(val) => handleFieldChange('interes', val)} />
          </div>

          <SectionTitle title="Necesidades y Situación" icon={Target} />
          <div className="space-y-4">
            <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1 block">Desafíos actuales</label>
            <textarea 
              className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-4 text-sm font-semibold text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all min-h-[100px]"
              value={editedLead.desafios}
              onChange={(e) => handleFieldChange('desafios', e.target.value)}
            />
          </div>

          <SectionTitle title="Logística y Compromiso" icon={Wallet} />
          <div className="grid grid-cols-3 gap-6">
            <EditableField label="Presupuesto" value={editedLead.presupuesto} onChange={(val) => handleFieldChange('presupuesto', val)} />
            <EditableField label="Disponibilidad" value={editedLead.disponibilidad} onChange={(val) => handleFieldChange('disponibilidad', val)} />
            <EditableField label="Compromiso" value={editedLead.compromiso} onChange={(val) => handleFieldChange('compromiso', val)} />
          </div>
        </div>

        <div className="p-8 border-t border-gray-100 bg-gray-50/50 flex gap-4">
          <button 
            onClick={onClose}
            className="flex-1 px-6 py-4 border border-gray-200 text-gray-600 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-white transition-all active:scale-95"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 px-6 py-4 bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-70 disabled:scale-100"
          >
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeadDetailModal;
