
import React from 'react';
// Fix: Import LeadStatus which was previously missing
import { Lead, LeadStatus } from '../types';

interface LeadsTableProps {
  leads: Lead[];
}

const LeadsTable: React.FC<LeadsTableProps> = ({ leads }) => {
  // Fix: handle string statuses using the LeadStatus enum mapping
  const getStatusBadge = (status: string) => {
    switch (status) {
      case LeadStatus.QUALIFIED:
        return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Calificado</span>;
      case LeadStatus.IN_PROCESS:
      case LeadStatus.CONTACTED:
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">En proceso</span>;
      case LeadStatus.NOT_FIT:
        return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">No apto</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">Pendiente</span>;
    }
  };

  const getPriorityColor = (score: number) => {
    if (score >= 80) return 'text-violet-600';
    if (score >= 50) return 'text-blue-600';
    return 'text-gray-400';
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mt-6">
      <div className="flex justify-between items-center mb-6 px-2">
        <h3 className="font-bold text-gray-800 text-lg">Leads Operations</h3>
        <button className="text-gray-400 hover:text-gray-600">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/><path d="M22 2v6h-6"/><path d="M12 2v6"/></svg>
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-400 text-xs font-semibold uppercase tracking-wider border-b border-gray-50">
              <th className="px-4 py-4">Lead Name</th>
              <th className="px-4 py-4">Key Response</th>
              <th className="px-4 py-4">Priority Score</th>
              <th className="px-4 py-4">Status</th>
              <th className="px-4 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {leads.map((lead) => (
              // Fix: Use telefono as key since id is not present on Lead
              <tr key={lead.telefono} className="hover:bg-gray-50 transition-colors group">
                <td className="px-4 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-violet-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                      {/* Fix: Use nombre instead of full_name */}
                      {lead.nombre.charAt(0)}
                    </div>
                    <div>
                      {/* Fix: Use nombre and telefono instead of full_name/email */}
                      <p className="text-sm font-semibold text-gray-800">{lead.nombre}</p>
                      <p className="text-xs text-gray-400">{lead.telefono}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-5 max-w-xs">
                  {/* Fix: Use interes instead of key_answer */}
                  <p className="text-xs text-gray-600 line-clamp-1 italic">"{lead.interes}"</p>
                </td>
                <td className="px-4 py-5">
                  <div className={`text-sm font-bold ${getPriorityColor(lead.score || 0)}`}>
                    {lead.score || 0}%
                  </div>
                </td>
                <td className="px-4 py-5">
                  {/* Fix: Use estado instead of status */}
                  {getStatusBadge(lead.estado)}
                </td>
                <td className="px-4 py-5 text-right">
                  <button className="text-xs bg-gray-100 hover:bg-blue-600 hover:text-white px-4 py-1.5 rounded-lg font-bold text-gray-600 transition-all">
                    Contact
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeadsTable;
