import React, { useState, useEffect } from 'react';
import { X, User, Calendar, Clock, Briefcase, Target, Wallet, Save, Loader2, MessageSquare, Plus, Send, Pencil, Trash2, CheckCircle2 } from 'lucide-react';
import { Lead, LeadStatus, Note } from '../types';
import { updateLead } from '../services/leads';
import { fetchNotes, createNote, updateNote, deleteNote } from '../services/notes';

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
      // Load notes
      if (lead.id) {
        fetchNotes(lead.id).then(setNotes);
      } else {
        // If no ID (legacy data), maybe clear notes or try to fetch by something else?
        // Assuming for now lead.id exists as per recent updates.
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-hidden">
      <div className="bg-white w-full h-full max-w-[98%] max-h-[95%] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/80 shrink-0">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-violet-600 rounded-3xl flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-blue-100/50">
              {editedLead.nombre.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-1">{editedLead.nombre}</h2>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-500 bg-white px-2 py-1 rounded-lg border border-gray-200">
                  {editedLead.telefono}
                </span>
                <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider ${editedLead.estado === LeadStatus.COMPLETE ? 'bg-emerald-100 text-emerald-700' :
                  editedLead.estado === LeadStatus.CONTACTED ? 'bg-violet-100 text-violet-700' :
                    'bg-gray-200 text-gray-600'
                  }`}>
                  {editedLead.estado}
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-white border border-gray-200 hover:bg-gray-50 rounded-2xl text-gray-400 hover:text-red-500 transition-all active:scale-90 shadow-sm">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          {/* Main Form Fields - Scrollable */}
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar border-r border-gray-100">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold mb-8 border border-red-100 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500" /> {error}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Column 1: Personal & Profile Info */}
              <div className="space-y-6">
                <div>
                  <SectionTitle title="Información Personal" icon={User} />
                  <div className="space-y-3">
                    <EditableField label="Nombre completo" value={editedLead.nombre} onChange={(val) => handleFieldChange('nombre', val)} />
                    <div className="grid grid-cols-2 gap-3">
                      <EditableField label="Teléfono" value={editedLead.telefono} onChange={(val) => handleFieldChange('telefono', val)} />
                      <EditableField label="País" value={editedLead.pais} onChange={(val) => handleFieldChange('pais', val)} />
                    </div>
                    <EditableField label="Origen" value={editedLead.origen} onChange={(val) => handleFieldChange('origen', val)} />
                  </div>
                </div>

                <div>
                  <SectionTitle title="Perfil & Antecedentes" icon={Briefcase} />
                  <div className="space-y-3">
                    <EditableField label="Perfil Profesional" value={editedLead.perfil} onChange={(val) => handleFieldChange('perfil', val)} />
                    <EditableField label="Antigüedad" value={editedLead.antiguedad} onChange={(val) => handleFieldChange('antiguedad', val)} />
                    <div className="col-span-2">
                      <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1 block">Terapias Anteriores</label>
                      <textarea
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all min-h-[60px]"
                        value={editedLead.terapias_anteriores || ''}
                        onChange={(e) => handleFieldChange('terapias_anteriores', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Column 2: Qualify & Needs */}
              <div className="space-y-6">
                <div>
                  <SectionTitle title="Cualificación & Interés" icon={Target} />
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <EditableField label="Interés Principal" value={editedLead.interes} onChange={(val) => handleFieldChange('interes', val)} />
                      <EditableField label="Cualifica" value={editedLead.cualifica} onChange={(val) => handleFieldChange('cualifica', val)} />
                    </div>
                    <EditableField label="Compromiso" value={editedLead.compromiso} onChange={(val) => handleFieldChange('compromiso', val)} />
                    <div>
                      <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1 block">Desafíos / Dolor</label>
                      <textarea
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all min-h-[100px]"
                        value={editedLead.desafios}
                        onChange={(e) => handleFieldChange('desafios', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <SectionTitle title="Logística" icon={Clock} />
                  <div className="grid grid-cols-2 gap-3">
                    <EditableField label="Presupuesto" value={editedLead.presupuesto} onChange={(val) => handleFieldChange('presupuesto', val)} />
                    <EditableField label="Disponibilidad" value={editedLead.disponibilidad} onChange={(val) => handleFieldChange('disponibilidad', val)} />
                  </div>
                </div>
              </div>

              {/* Column 3: CRM & Sales Data */}
              <div className="space-y-6 bg-gray-50/50 p-5 rounded-[2rem] border border-gray-100">
                <div>
                  <SectionTitle title="Gestión de Venta (CRM)" icon={Wallet} />
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <EditableField label="Estado" value={editedLead.estado} type="select" options={Object.values(LeadStatus)} onChange={(val) => handleFieldChange('estado', val)} />
                      <EditableField label="Closer Asignado" value={editedLead.closer} onChange={(val) => handleFieldChange('closer', val)} />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <EditableField label="Fecha Llamada" value={editedLead.fecha_llamada || ''} type="text" onChange={(val) => handleFieldChange('fecha_llamada', val)} />
                      <EditableField label="Fecha Cierre" value={editedLead.fecha_cierre || ''} type="date" onChange={(val) => handleFieldChange('fecha_cierre', val)} />
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200">
                      <EditableField label="Cash Collected" value={editedLead.cash_collected?.toString() || '0'} type="text" onChange={(val) => handleFieldChange('cash_collected', parseFloat(val))} />
                      <EditableField label="Comisión" value={editedLead.comision?.toString() || '0'} type="text" onChange={(val) => handleFieldChange('comision', parseFloat(val))} />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <EditableField label="Cuotas" value={editedLead.cuotas?.toString() || '1'} type="text" onChange={(val) => handleFieldChange('cuotas', parseInt(val))} />
                      <EditableField label="Plataforma Pago" value={editedLead.plataforma || ''} onChange={(val) => handleFieldChange('plataforma', val)} />
                    </div>
                  </div>
                </div>

                <div>
                  <SectionTitle title="Metadatos Registro" icon={Calendar} />
                  <div className="grid grid-cols-2 gap-3 text-gray-500">
                    <div className="bg-white p-2 rounded-xl border border-gray-100">
                      <span className="block text-[10px] uppercase font-black tracking-widest mb-1">Fecha</span>
                      <span className="font-mono text-xs font-bold">{editedLead.fecha_registro}</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-gray-100">
                      <span className="block text-[10px] uppercase font-black tracking-widest mb-1">Hora</span>
                      <span className="font-mono text-xs font-bold">{editedLead.hora_registro}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes Section - Fixed Width on Right */}
          <div className="w-full lg:w-96 bg-gray-50 border-l border-gray-200 flex flex-col shrink-0">
            <div className="p-6 border-b border-gray-200 bg-white">
              <h4 className="flex items-center gap-2 font-black text-gray-800 uppercase tracking-widest text-sm">
                <MessageSquare size={16} className="text-blue-500" />
                Seguimiento y Notas
              </h4>
            </div>

            {/* Timeline */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              {notes.length === 0 ? (
                <div className="text-center py-10 opacity-50">
                  <MessageSquare size={32} className="mx-auto mb-2 text-gray-400" />
                  <p className="text-sm font-bold text-gray-400">No hay notas registradas</p>
                </div>
              ) : (
                <div className="relative pl-4 space-y-6">
                  {/* Vertical Line */}
                  <div className="absolute left-0 top-2 bottom-0 w-0.5 bg-gray-200"></div>

                  {notes.map((note) => (
                    <div key={note.id} className="relative pl-6 animate-in slide-in-from-right-4 duration-500 group">
                      {/* Dot */}
                      <div className="absolute left-[-5px] top-1 w-3 h-3 rounded-full bg-blue-500 border-2 border-white ring-2 ring-blue-100"></div>

                      <div className={`bg-white p-4 rounded-xl shadow-sm border ${editingNoteId === note.id ? 'border-blue-500 ring-2 ring-blue-50' : 'border-gray-200 hover:border-blue-300'} transition-all`}>
                        {editingNoteId === note.id ? (
                          <div className="space-y-3">
                            <textarea
                              className="w-full text-sm text-gray-700 font-medium bg-gray-50 p-2 rounded-lg outline-none resize-none focus:bg-white focus:ring-1 focus:ring-blue-400"
                              value={editingNoteContent}
                              onChange={(e) => setEditingNoteContent(e.target.value)}
                              autoFocus
                              rows={3}
                            />
                            <div className="flex justify-end gap-2">
                              <button onClick={cancelEditingNote} className="p-1 px-3 text-xs font-bold text-gray-500 hover:text-gray-700 bg-gray-100 rounded-lg">Cancelar</button>
                              <button onClick={saveEditedNote} className="p-1 px-3 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-1">
                                <CheckCircle2 size={12} /> Guardar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="text-sm text-gray-700 font-medium whitespace-pre-wrap">{note.content}</p>
                            <div className="flex items-center justify-between mt-2">
                              <p className="text-[10px] font-bold text-gray-400">
                                {new Date(note.created_at).toLocaleString()}
                              </p>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => startEditingNote(note)}
                                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Editar nota"
                                >
                                  <Pencil size={12} />
                                </button>
                                <button
                                  onClick={() => handleDeleteNote(note.id)}
                                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Eliminar nota"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add Note Input */}
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="relative">
                <textarea
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-4 pr-12 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none h-24 custom-scrollbar"
                  placeholder="Añadir nota de seguimiento..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAddNote();
                    }
                  }}
                />
                <button
                  onClick={handleAddNote}
                  disabled={!newNote.trim() || isAddingNote}
                  className="absolute right-2 bottom-2 p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 disabled:hover:bg-blue-600 shadow-md"
                >
                  {isAddingNote ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-white flex justify-end gap-4 shadow-lg shrink-0">
          <button
            onClick={onClose}
            className="px-8 py-3 border border-gray-200 text-gray-600 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-gray-50 transition-all active:scale-95"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-10 py-3 bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center gap-3 active:scale-95 disabled:opacity-70 disabled:scale-100"
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
