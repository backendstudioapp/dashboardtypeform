
import React from 'react';
import { Alumno, AlumnoStatus } from '../types';
import { ChevronLeft, ChevronRight, ArrowUp, ArrowDown } from 'lucide-react';

interface AlumnosTableProps {
  alumnos: Alumno[];
  onSelectAlumno?: (alumno: Alumno) => void;
  currentPage: number;
  totalAlumnos: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  sortOrder: 'asc' | 'desc';
  onToggleSort: () => void;
}

const AlumnosTable: React.FC<AlumnosTableProps> = ({ 
  alumnos, 
  onSelectAlumno, 
  currentPage, 
  totalAlumnos, 
  pageSize, 
  onPageChange,
  sortOrder,
  onToggleSort
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case AlumnoStatus.ACTIVE:
        return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-black uppercase tracking-wider">Activo</span>;
      case AlumnoStatus.INACTIVE:
        return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-[10px] font-black uppercase tracking-wider">Inactivo</span>;
      case AlumnoStatus.PAID:
        return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-wider">Pagado</span>;
      case AlumnoStatus.PENDING:
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-[10px] font-black uppercase tracking-wider">Pendiente</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-[10px] font-black uppercase tracking-wider">{status || 'Sin estado'}</span>;
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    try {
      const parts = dateStr.split('-');
      return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateStr;
    } catch (e) {
      return dateStr;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount || 0);
  };

  const totalPages = Math.ceil(totalAlumnos / pageSize);

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-100">
              <th className="px-8 py-5">Alumno</th>
              <th className="px-8 py-5">Estado</th>
              <th className="px-8 py-5 text-right">Inversión Total</th>
              <th className="px-8 py-5 text-right text-orange-600">Pendiente</th>
              <th 
                className="px-8 py-5 cursor-pointer hover:bg-gray-100 transition-colors group select-none"
                onClick={onToggleSort}
              >
                <div className="flex items-center gap-2">
                  <span>Fecha Compra</span>
                  <div className="p-1 bg-gray-100 rounded-lg group-hover:bg-blue-50 transition-colors">
                    {sortOrder === 'asc' ? <ArrowUp size={14} className="text-blue-500" /> : <ArrowDown size={14} className="text-blue-500" />}
                  </div>
                </div>
              </th>
              <th className="px-8 py-5 text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {alumnos.map((alumno, idx) => (
              <tr 
                key={`${alumno.email}-${idx}`} 
                className="hover:bg-blue-50/30 transition-colors group cursor-pointer" 
                onClick={() => onSelectAlumno?.(alumno)}
              >
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-violet-100 text-violet-600 rounded-xl flex items-center justify-center font-bold">
                      {alumno.nombre?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{alumno.nombre} {alumno.apellidos}</p>
                      <p className="text-[10px] text-gray-400 font-medium">{alumno.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">{getStatusBadge(alumno.estado_general)}</td>
                <td className="px-8 py-5 text-sm font-bold text-gray-900 text-right">{formatCurrency(alumno.inversion_total)}</td>
                <td className="px-8 py-5 text-sm font-bold text-orange-600 text-right">{formatCurrency(alumno.importe_pendiente)}</td>
                <td className="px-8 py-5 text-sm font-medium text-gray-600">{formatDate(alumno.fecha_compra)}</td>
                <td className="px-8 py-5 text-right">
                  <button className="text-xs bg-gray-100 hover:bg-violet-600 hover:text-white px-4 py-2 rounded-xl font-bold text-gray-600 transition-all opacity-0 group-hover:opacity-100 active:scale-95">
                    Ficha
                  </button>
                </td>
              </tr>
            ))}
            {alumnos.length === 0 && (
              <tr>
                <td colSpan={6} className="px-8 py-20 text-center text-gray-400 font-medium italic">
                  No se encontraron alumnos registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="p-6 bg-gray-50/30 border-t border-gray-100 flex items-center justify-between">
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Mostrando {alumnos.length} de {totalAlumnos} alumnos
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

export default AlumnosTable;
