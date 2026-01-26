
import React from 'react';
import { Lead, LeadStatus } from '../types';
import { ChevronLeft, ChevronRight, ArrowUp, ArrowDown } from 'lucide-react';

interface LeadsTableProps {
  leads: Lead[];
  onSelectLead?: (lead: Lead) => void;
  currentPage: number;
  totalLeads: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  sortOrder: 'asc' | 'desc';
  onToggleSort: () => void;
}

const LeadsTable: React.FC<LeadsTableProps> = ({
  leads,
  onSelectLead,
  currentPage,
  totalLeads,
  pageSize,
  onPageChange,
  sortOrder,
  onToggleSort
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case LeadStatus.INCOMPLETE:
        return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-[10px] font-black uppercase tracking-wider">Formulario incompleto</span>;
      case LeadStatus.CONTACTED:
        return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-black uppercase tracking-wider">Contactado</span>;
      case LeadStatus.COMPLETE:
        return <span className="px-3 py-1 bg-sky-100 text-sky-700 rounded-full text-[10px] font-black uppercase tracking-wider">Formulario completo</span>;
      case LeadStatus.QUALIFIED:
        return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-wider">Calificado</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-[10px] font-black uppercase tracking-wider">{status}</span>;
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      return dateStr;
    } catch (e) {
      return dateStr;
    }
  };

  const totalPages = Math.ceil(totalLeads / pageSize);

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-100">
              <th className="px-6 py-5">Nombre</th>
              <th className="px-6 py-5">Teléfono</th>
              <th className="px-6 py-5">Origen</th>
              <th className="px-6 py-5">Estado</th>
              <th className="px-6 py-5">Cualifica</th>
              <th className="px-6 py-5">Closer</th>
              <th
                className="px-6 py-5 cursor-pointer hover:bg-gray-100 transition-colors group select-none"
                onClick={onToggleSort}
              >
                <div className="flex items-center gap-2">
                  <span>Fecha</span>
                  <div className="p-1 bg-gray-100 rounded-lg group-hover:bg-blue-50 transition-colors">
                    {sortOrder === 'asc' ? (
                      <ArrowUp size={14} className="text-blue-500" />
                    ) : (
                      <ArrowDown size={14} className="text-blue-500" />
                    )}
                  </div>
                </div>
              </th>
              <th className="px-6 py-5 text-right flex justify-end">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {leads.map((lead) => (
              <tr
                key={lead.telefono}
                className="hover:bg-blue-50/30 transition-colors group cursor-pointer"
                onClick={() => onSelectLead?.(lead)}
              >
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-bold flex-shrink-0">
                      {lead.nombre.charAt(0)}
                    </div>
                    <p className="text-sm font-bold text-gray-900 truncate max-w-[150px]" title={lead.nombre}>{lead.nombre}</p>
                  </div>
                </td>
                <td className="px-6 py-5 text-sm font-medium text-gray-600">
                  {lead.telefono.startsWith('+') ? lead.telefono : `+${lead.telefono}`}
                </td>
                <td className="px-6 py-5 text-sm font-medium text-gray-600 truncate max-w-[120px]" title={lead.origen}>{lead.origen}</td>
                <td className="px-6 py-5">
                  {getStatusBadge(lead.estado)}
                </td>
                <td className="px-6 py-5 text-sm font-black text-gray-700">{lead.cualifica}</td>
                <td className="px-6 py-5 text-sm font-medium text-gray-600 truncate max-w-[100px]" title={lead.closer}>{lead.closer}</td>
                <td className="px-6 py-5 text-sm font-medium text-gray-600 whitespace-nowrap">
                  {formatDate(lead.fecha_registro)}
                </td>
                <td className="px-6 py-5 text-right">
                  <button className="text-xs bg-gray-100 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-xl font-bold text-gray-600 transition-all opacity-0 group-hover:opacity-100 active:scale-95">
                    Detalles
                  </button>
                </td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr>
                <td colSpan={6} className="px-8 py-20 text-center text-gray-400 font-medium">
                  No hay datos disponibles en este momento.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="p-6 bg-gray-50/30 border-t border-gray-100 flex items-center justify-between">
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Mostrando {leads.length} de {totalLeads} leads
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => onPageChange(currentPage - 1)}
              className="p-2 border border-gray-200 rounded-xl text-gray-400 hover:bg-white hover:text-blue-600 disabled:opacity-30 disabled:hover:bg-transparent transition-all active:scale-90"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-700 shadow-sm">
              Página {currentPage} de {totalPages}
            </div>
            <button
              disabled={currentPage === totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              className="p-2 border border-gray-200 rounded-xl text-gray-400 hover:bg-white hover:text-blue-600 disabled:opacity-30 disabled:hover:bg-transparent transition-all active:scale-90"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadsTable;