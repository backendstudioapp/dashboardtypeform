import React, { useState, useEffect } from 'react';
import { X, User, Calendar, Clock, Briefcase, Target, Wallet, Save, Loader2, MessageSquare, Send, Pencil, Trash2, CheckCircle2 } from 'lucide-react';
import SingleDatePicker from './SingleDatePicker';
import { Lead, LeadStatus, Note } from '../types';
import { updateLead } from '../services/leads';
import { fetchNotes, createNote, updateNote, deleteNote } from '../services/notes';

interface LeadDetailModalProps {
  lead: Lead | null;
  onClose: () => void;
  onUpdateSuccess?: () => void;
}

const TabButton = ({
  active,
  onClick,
  children
}: {
  active: boolean,
  onClick: () => void,
  children: React.ReactNode
}) => (
  <button
    onClick={onClick}
    className={`px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap
      ${active
        ? 'bg-black text-white shadow-xl'
        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}
  >
    {children}
  </button>
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
      <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2 block">{label}</label>
      {type === "select" ? (
        <select
          className="w-full bg-white border border-gray-400 rounded-xl px-4 py-3 text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-black/5 outline-none transition-all appearance-none cursor-pointer"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      ) : (
        <input
          type={type}
          className="w-full bg-white border border-gray-400 rounded-xl px-4 py-3 text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-black/5 outline-none transition-all placeholder:text-gray-300"
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
  const [activeTab, setActiveTab] = useState<'profile' | 'qualification' | 'crm' | 'notes'>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Notes State
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteContent, setEditingNoteContent] = useState('');

  useEffect(() => {
    if (lead) {
      setEditedLead({ ...lead });
      setError(null);
      if (lead.id) {
        fetchNotes(lead.id).then(setNotes);
      } else {
        setNotes([]);
      }
    } else {
      setEditedLead(null);
      setNotes([]);
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

    // Using ID if available
    const success = await updateLead(editedLead.id || editedLead.telefono, editedLead);

    if (success) {
      onUpdateSuccess?.();
      onClose();
    } else {
      setError("No se pudo guardar los cambios. Intenta de nuevo.");
    }
    setIsSaving(false);
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !editedLead.id) return;
    setIsAddingNote(true);

    const note = await createNote(editedLead.id, newNote);
    if (note) {
      setNotes(prev => [note, ...prev]);
      setNewNote('');
    }
    setIsAddingNote(false);
  };

  const startEditingNote = (note: Note) => {
    setEditingNoteId(note.id);
    setEditingNoteContent(note.content);
  };

  const cancelEditingNote = () => {
    setEditingNoteId(null);
    setEditingNoteContent('');
  };

  const saveEditedNote = async () => {
    if (!editingNoteId || !editingNoteContent.trim()) return;

    const success = await updateNote(editingNoteId, editingNoteContent);
    if (success) {
      setNotes(prev => prev.map(n => n.id === editingNoteId ? { ...n, content: editingNoteContent } : n));
      setEditingNoteId(null);
      setEditingNoteContent('');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta nota?')) {
      const success = await deleteNote(noteId);
      if (success) {
        setNotes(prev => prev.filter(n => n.id !== noteId));
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 overflow-hidden">
      <div className="bg-white w-full h-full max-w-5xl h-[96%] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">

        {/* Header Section */}
        <div className="p-8 pb-4 shrink-0">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-black text-white rounded-[1.5rem] flex items-center justify-center text-4xl font-black shadow-2xl shadow-gray-200">
                {editedLead.nombre.charAt(0)}
              </div>
              <div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tighter mb-2">{editedLead.nombre}</h2>
                <div className="flex items-center gap-2">
                  <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-gray-200">
                    ID: {editedLead.telefono}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${editedLead.estado === LeadStatus.SALE ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                    editedLead.estado === LeadStatus.CONTACTED ? 'bg-violet-50 text-violet-600 border-violet-100' :
                      editedLead.estado === LeadStatus.NEGATIVE ? 'bg-red-50 text-red-600 border-red-100' :
                        'bg-gray-50 text-gray-500 border-gray-100'
                    }`}>
                    {editedLead.estado}
                  </span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-3 bg-gray-50 rounded-full text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all">
              <X size={24} />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <TabButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')}>Perfil del Contacto</TabButton>
            <TabButton active={activeTab === 'qualification'} onClick={() => setActiveTab('qualification')}>Cualificación</TabButton>
            <TabButton active={activeTab === 'crm'} onClick={() => setActiveTab('crm')}>Ventas</TabButton>
            <TabButton active={activeTab === 'notes'} onClick={() => setActiveTab('notes')}>Notas</TabButton>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-gray-50/50 p-8 pt-6">
          <div className="max-w-4xl mx-auto bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 min-h-[400px]">

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold mb-6 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500" /> {error}
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <EditableField label="Nombre Completo" value={editedLead.nombre} onChange={(val) => handleFieldChange('nombre', val)} />
                  <EditableField label="Teléfono / WhatsApp" value={editedLead.telefono} onChange={(val) => handleFieldChange('telefono', val)} />
                  <EditableField label="País" value={editedLead.pais} onChange={(val) => handleFieldChange('pais', val)} />
                  <EditableField label="Origen del Lead" value={editedLead.origen} type="select" options={['Setter IA', 'VSL 1', 'VSL 2']} onChange={(val) => handleFieldChange('origen', val)} />
                  <div className="p-6 bg-gray-50 rounded-2xl col-span-full mt-4">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Metadatos de Registro</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="block text-[10px] text-gray-400 font-bold uppercase mb-1">Fecha</span>
                        <span className="font-mono text-sm font-bold text-gray-800">
                          {editedLead.fecha_registro ? new Date(editedLead.fecha_registro).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-'}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-gray-400 font-bold uppercase mb-1">Hora</span>
                        <span className="font-mono text-sm font-bold text-gray-800">{editedLead.hora_registro}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'qualification' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <EditableField label="Interés Principal" value={editedLead.interes} onChange={(val) => handleFieldChange('interes', val)} />
                  <div>
                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2 block">¿Cualifica?</label>
                    <div className="flex gap-4">
                      <button
                        onClick={() => handleFieldChange('cualifica', 'si')}
                        className={`flex-1 py-3 rounded-xl border-2 font-bold text-sm transition-all flex items-center justify-center gap-2
                          ${editedLead.cualifica?.toLowerCase() === 'si'
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                            : 'border-gray-200 bg-white text-gray-400 hover:border-emerald-200 hover:text-emerald-500'}`}
                      >
                        <CheckCircle2 size={18} /> Sí
                      </button>
                      <button
                        onClick={() => handleFieldChange('cualifica', 'no')}
                        className={`flex-1 py-3 rounded-xl border-2 font-bold text-sm transition-all flex items-center justify-center gap-2
                          ${editedLead.cualifica?.toLowerCase() === 'no'
                            ? 'border-red-500 bg-red-50 text-red-700'
                            : 'border-gray-200 bg-white text-gray-400 hover:border-red-200 hover:text-red-500'}`}
                      >
                        <X size={18} /> No
                      </button>
                    </div>
                  </div>
                  <EditableField label="Presupuesto / Inversión" value={editedLead.presupuesto} onChange={(val) => handleFieldChange('presupuesto', val)} />
                </div>

                <div className="border-t border-gray-100 pt-8">
                  <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Briefcase size={16} /> Perfil Profesional
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                    <EditableField label="Perfil" value={editedLead.perfil} onChange={(val) => handleFieldChange('perfil', val)} />
                    <EditableField label="Antigüedad" value={editedLead.antiguedad} onChange={(val) => handleFieldChange('antiguedad', val)} />
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2 block">Terapias Anteriores</label>
                      <textarea
                        className="w-full bg-white border border-gray-400 rounded-xl px-4 py-3 text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-black/5 outline-none transition-all placeholder:text-gray-300 min-h-[80px]"
                        value={editedLead.terapias_anteriores || ''}
                        onChange={(e) => handleFieldChange('terapias_anteriores', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2 block">Principales Desafíos y Dolores</label>
                      <textarea
                        className="w-full bg-white border border-gray-400 rounded-xl px-4 py-3 text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-black/5 outline-none transition-all placeholder:text-gray-300 min-h-[100px]"
                        value={editedLead.desafios || ''}
                        onChange={(e) => handleFieldChange('desafios', e.target.value)}
                      />
                    </div>
                    <EditableField label="Disponibilidad Horaria" value={editedLead.disponibilidad} onChange={(val) => handleFieldChange('disponibilidad', val)} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'crm' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <EditableField label="Estado del Lead" value={editedLead.estado} type="select" options={Object.values(LeadStatus)} onChange={(val) => handleFieldChange('estado', val)} />
                  <EditableField label="Closer Asignado" value={editedLead.closer} type="select" options={['-', 'Lucem', 'Albert', 'Natalia', 'Daniel']} onChange={(val) => handleFieldChange('closer', val)} />
                  <SingleDatePicker label="Fecha de Llamada" value={editedLead.fecha_llamada} onChange={(val) => handleFieldChange('fecha_llamada', val)} />
                  <SingleDatePicker label="Fecha de Cierre" value={editedLead.fecha_cierre} onChange={(val) => handleFieldChange('fecha_cierre', val)} />
                </div>

                <div className="bg-gray-900 rounded-[2rem] p-8 text-white">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-white/10 rounded-lg"><Wallet className="text-emerald-400" /></div>
                    <h4 className="font-bold text-lg">Información Financiera</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cash Collected</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400 font-bold">€</span>
                        <input
                          type="text"
                          className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white font-mono font-bold focus:bg-white/10 outline-none transition-all"
                          value={editedLead.cash_collected === undefined || editedLead.cash_collected === null ? '' : editedLead.cash_collected.toString()}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === '') handleFieldChange('cash_collected', undefined);
                            else {
                              const num = parseFloat(val);
                              if (!isNaN(num)) handleFieldChange('cash_collected', num);
                            }
                          }}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Comisión</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400 font-bold">€</span>
                        <input
                          type="text"
                          className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white font-mono font-bold focus:bg-white/10 outline-none transition-all"
                          value={editedLead.comision === undefined || editedLead.comision === null ? '' : editedLead.comision.toString()}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === '') handleFieldChange('comision', undefined);
                            else {
                              const num = parseFloat(val);
                              if (!isNaN(num)) handleFieldChange('comision', num);
                            }
                          }}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cuotas</label>
                      <input
                        type="number"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-mono font-bold focus:bg-white/10 outline-none transition-all"
                        value={editedLead.cuotas?.toString() || '1'}
                        onChange={(e) => handleFieldChange('cuotas', parseInt(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Plataforma</label>
                      <select
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-bold focus:bg-white/10 outline-none transition-all appearance-none cursor-pointer"
                        value={editedLead.plataforma || ''}
                        onChange={(e) => handleFieldChange('plataforma', e.target.value)}
                      >
                        {['-', 'Stripe', 'Transferencia bancaria', 'Hotmart', 'Paypal'].map(opt => (
                          <option key={opt} value={opt} className="bg-gray-900 text-white">{opt}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-[500px] flex flex-col">
                {/* Create Note */}
                <div className="mb-6 relative">
                  <textarea
                    className="w-full bg-white border border-gray-400 rounded-2xl p-4 pr-14 text-sm focus:ring-2 focus:ring-black/5 outline-none transition-all resize-none shadow-sm"
                    placeholder="Escribe una nota de seguimiento..."
                    rows={3}
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleAddNote())}
                  />
                  <button
                    onClick={handleAddNote}
                    disabled={!newNote.trim() || isAddingNote}
                    className="absolute right-3 bottom-3 p-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-all disabled:opacity-50 shadow-lg"
                  >
                    {isAddingNote ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  </button>
                </div>

                {/* Timeline */}
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                  {notes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <MessageSquare size={48} className="mb-4 opacity-20" />
                      <p className="font-bold text-sm">No hay notas todavía</p>
                    </div>
                  ) : (
                    notes.map((note) => (
                      <div key={note.id} className="group relative pl-8 py-2">
                        {/* Timeline line */}
                        <div className="absolute left-[11px] top-0 bottom-0 w-0.5 bg-gray-100 group-last:bottom-auto group-last:h-1/2"></div>
                        {/* Dot */}
                        <div className="absolute left-[7px] top-6 w-2.5 h-2.5 rounded-full bg-gray-300 border-2 border-white group-hover:bg-black transition-colors z-10"></div>

                        <div className={`bg-white border rounded-2xl p-5 transition-all
                                ${editingNoteId === note.id ? 'border-blue-500 ring-2 ring-blue-50 shadow-lg' : 'border-gray-300 hover:border-gray-400 hover:shadow-md'}
                              `}>
                          {editingNoteId === note.id ? (
                            <div className="space-y-3">
                              <textarea
                                className="w-full text-sm font-medium text-gray-800 bg-gray-50 rounded-xl p-3 outline-none resize-none"
                                value={editingNoteContent}
                                onChange={(e) => setEditingNoteContent(e.target.value)}
                                rows={3}
                                autoFocus
                              />
                              <div className="flex justify-end gap-2">
                                <button onClick={cancelEditingNote} className="px-3 py-1.5 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-lg">Cancelar</button>
                                <button onClick={saveEditedNote} className="px-3 py-1.5 text-xs font-bold text-white bg-black rounded-lg flex items-center gap-1">
                                  <CheckCircle2 size={12} /> Guardar
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex justify-between items-start mb-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                  {new Date(note.created_at).toLocaleString()}
                                </span>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => startEditingNote(note)} className="p-1 hover:bg-gray-100 rounded-md text-gray-400 hover:text-black"><Pencil size={12} /></button>
                                  <button onClick={() => handleDeleteNote(note.id)} className="p-1 hover:bg-red-50 rounded-md text-gray-400 hover:text-red-500"><Trash2 size={12} /></button>
                                </div>
                              </div>
                              <p className="text-sm font-medium text-gray-700 leading-relaxed whitespace-pre-wrap">{note.content}</p>
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-100 bg-white flex justify-end gap-4 shrink-0">
          <button onClick={onClose} className="px-8 py-3 rounded-xl font-bold text-sm text-gray-500 hover:bg-gray-50 transition-all">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-8 py-3 rounded-xl font-bold text-sm text-white bg-black hover:bg-gray-800 transition-all shadow-lg shadow-gray-200 flex items-center gap-2 disabled:opacity-70"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Guardar Cambios
          </button>
        </div>

      </div>
    </div>
  );
};

export default LeadDetailModal;
