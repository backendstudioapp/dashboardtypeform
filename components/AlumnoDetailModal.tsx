
import React, { useState, useEffect } from 'react';
import { X, User, Calendar, CreditCard, BookOpen, MapPin, Save, Loader2, MessageSquare } from 'lucide-react';
import { Alumno, AlumnoStatus } from '../types';
import { updateAlumno } from '../services/supabase';

interface AlumnoDetailModalProps {
  alumno: Alumno | null;
  onClose: () => void;
  onUpdateSuccess?: () => void;
}

const SectionTitle = ({ title, icon: Icon, colorClass = "bg-violet-50 text-violet-600" }: { title: string, icon: any, colorClass?: string }) => (
  <div className="flex items-center gap-2 mb-4 mt-8 first:mt-0">
    <div className={`p-2 ${colorClass} rounded-xl`}>
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
  value: string | number, 
  onChange: (val: string) => void, 
  type?: "text" | "select" | "date" | "number", 
  options?: string[] 
}) => {
  return (
    <div className="mb-4">
      <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1 block">{label}</label>
      {type === "select" ? (
        <select 
          className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2 text-sm font-semibold text-gray-700 focus:ring-2 focus:ring-violet-500 outline-none transition-all appearance-none cursor-pointer"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      ) : (
        <input 
          type={type}
          className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2 text-sm font-semibold text-gray-700 focus:ring-2 focus:ring-violet-500 outline-none transition-all"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          {...( (type === 'date') && { onKeyDown: (e) => e.preventDefault() } )}
        />
      )}
    </div>
  );
};

const AlumnoDetailModal: React.FC<AlumnoDetailModalProps> = ({ alumno, onClose, onUpdateSuccess }) => {
  const [edited, setEdited] = useState<Alumno | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (alumno) {
      setEdited({ ...alumno });
      setError(null);
    } else {
      setEdited(null);
    }
  }, [alumno]);

  if (!edited) return null;

  const handleFieldChange = (field: keyof Alumno, value: any) => {
    setEdited(prev => prev ? ({ ...prev, [field]: value }) : null);
  };

  const handleSave = async () => {
    if (!edited || !edited.telefono) return;
    setIsSaving(true);
    setError(null);
    
    // El objeto 'edited' ahora contiene 'notas', que mapea a la columna correcta en Supabase
    const success = await updateAlumno(edited.telefono, edited);
    
    if (success) {
      onUpdateSuccess?.();
      onClose();
    } else {
      setError("No se pudo guardar la información del alumno. Intenta de nuevo.");
    }
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm transition-opacity">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-violet-100">
              {edited.nombre?.charAt(0) || '?'}
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">{edited.nombre} {edited.apellidos}</h2>
              <div className="flex items-center gap-2 text-xs text-gray-400 font-bold uppercase tracking-wider">
                <span className="bg-violet-100 text-violet-600 px-2 py-0.5 rounded-lg">{edited.curso || 'Sin curso'}</span>
                <span>•</span>
                <span>ID: {edited.id || 'NUEVO'}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white hover:shadow-sm rounded-2xl text-gray-400 transition-all active:scale-90">
            <X size={24} />
          </button>
        </div>

        {/* Formulario */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-2">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold mb-6 border border-red-100">
              {error}
            </div>
          )}

          <SectionTitle title="Datos Personales" icon={User} />
          <div className="grid grid-cols-2 gap-6">
            <EditableField label="Nombre" value={edited.nombre} onChange={(val) => handleFieldChange('nombre', val)} />
            <EditableField label="Apellidos" value={edited.apellidos} onChange={(val) => handleFieldChange('apellidos', val)} />
            <EditableField label="Teléfono" value={edited.telefono} onChange={(val) => handleFieldChange('telefono', val)} />
            <EditableField label="Email" value={edited.email} onChange={(val) => handleFieldChange('email', val)} />
            <EditableField label="País" value={edited.pais} onChange={(val) => handleFieldChange('pais', val)} />
            <EditableField 
              label="Estado General" 
              value={edited.estado_general} 
              type="select" 
              options={['', ...Object.values(AlumnoStatus)]} 
              onChange={(val) => handleFieldChange('estado_general', val)}
            />
          </div>

          <SectionTitle title="Información Académica" icon={BookOpen} />
          <div className="grid grid-cols-2 gap-6">
            <EditableField label="Curso / Programa" value={edited.curso} onChange={(val) => handleFieldChange('curso', val)} />
            <EditableField label="Fecha de Compra" value={edited.fecha_compra} type="date" onChange={(val) => handleFieldChange('fecha_compra', val)} />
          </div>

          <SectionTitle title="Estado Financiero" icon={CreditCard} colorClass="bg-orange-50 text-orange-600" />
          <div className="grid grid-cols-2 gap-6">
            <EditableField label="Inversión Total (€)" value={edited.inversion_total} type="number" onChange={(val) => handleFieldChange('inversion_total', Number(val))} />
            <EditableField label="Importe Pendiente (€)" value={edited.importe_pendiente} type="number" onChange={(val) => handleFieldChange('importe_pendiente', Number(val))} />
          </div>

          <SectionTitle title="Desafíos y Situación" icon={MessageSquare} />
          <div className="space-y-4">
            <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1 block">Notas del alumno</label>
            <textarea 
              className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-4 text-sm font-semibold text-gray-700 focus:ring-2 focus:ring-violet-500 outline-none transition-all min-h-[150px]"
              placeholder="Escribe aquí los desafíos, situaciones o notas relevantes sobre el alumno..."
              value={edited.notas || ''}
              onChange={(e) => handleFieldChange('notas', e.target.value)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-gray-100 bg-gray-50/50 flex gap-4">
          <button 
            onClick={onClose}
            className="flex-1 px-6 py-4 border border-gray-200 text-gray-600 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-white transition-all active:scale-95"
          >
            Cerrar
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 px-6 py-4 bg-violet-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-violet-700 transition-all shadow-lg shadow-violet-200 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-70 disabled:scale-100"
          >
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {isSaving ? 'Actualizando...' : 'Guardar Ficha'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlumnoDetailModal;
