
import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import StatCard from './components/StatCard';
import SalesDynamicsChart from './components/SalesDynamicsChart';
import LeadsTable from './components/LeadsTable';
import LeadDetailModal from './components/LeadDetailModal';
import { Lead, DashboardStats, Section } from './types';
import { fetchLeads } from './services/supabase';
import { 
  Users, 
  MapPin, 
  Target, 
  Calendar, 
  Search,
  Filter,
  BarChart2,
  PieChart
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart as RePieChart, Pie
} from 'recharts';

const App: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [activeSection, setActiveSection] = useState<Section>('analytics');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('Todos');

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const data = await fetchLeads();
      setLeads(data);
      setIsLoading(false);
    };
    loadData();
  }, []);

  const stats = useMemo<DashboardStats>(() => {
    const total = leads.length;
    const mesActual = new Date().getMonth();
    const leadsMes = leads.filter(l => new Date(l.fecha_registro).getMonth() === mesActual).length;
    
    const countMap = (arr: string[]) => arr.reduce((acc, curr) => {
      acc[curr] = (acc[curr] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const paises = countMap(leads.map(l => l.pais));
    const intereses = countMap(leads.map(l => l.interes));
    const estados = countMap(leads.map(l => l.estado));

    const getTop = (map: Record<string, number>) => 
      Object.entries(map).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    return {
      totalLeads: total,
      leadsMes,
      leadsPorEstado: estados,
      topPais: getTop(paises),
      interesComun: getTop(intereses)
    };
  }, [leads]);

  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      const matchesSearch = l.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          l.telefono.includes(searchTerm) || 
                          l.pais.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterEstado === 'Todos' || l.estado === filterEstado;
      return matchesSearch && matchesFilter;
    });
  }, [leads, searchTerm, filterEstado]);

  const chartDataInteres = useMemo(() => {
    const counts = leads.reduce((acc, l) => {
      acc[l.interes] = (acc[l.interes] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [leads]);

  const chartDataPais = useMemo(() => {
    const counts = leads.reduce((acc, l) => {
      acc[l.pais] = (acc[l.pais] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts).map(([name, count]) => ({ name, count })).slice(0, 5);
  }, [leads]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 font-bold">Iniciando SetterFlow CRM...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#F3F4F6] overflow-hidden">
      <Sidebar 
        activeSection={activeSection} 
        setActiveSection={(s: any) => setActiveSection(s)} 
      />
      
      <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            {activeSection === 'analytics' ? 'Dashboard de Analíticas' : 'Gestión de Leads'}
          </h1>
          <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-2">
            <Calendar size={16} className="text-blue-600" />
            <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Junio 2024</span>
          </div>
        </header>

        {activeSection === 'analytics' ? (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Total Leads" value={stats.totalLeads} icon={<Users size={20} />} trend={15} />
              <StatCard title="Leads del Mes" value={stats.leadsMes} icon={<Calendar size={20} />} trend={5} />
              <StatCard title="Top País" value={stats.topPais} icon={<MapPin size={20} />} />
              <StatCard title="Interés Común" value={stats.interesComun} icon={<Target size={20} />} />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 lg:col-span-8 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 min-h-[400px]">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="font-black text-gray-800 flex items-center gap-2">
                    <BarChart2 size={20} className="text-blue-600" /> Distribución por País
                  </h3>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartDataPais}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 11}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 11}} />
                      <Tooltip cursor={{fill: '#F9FAFB'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                      <Bar dataKey="count" fill="#3B82F6" radius={[6, 6, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="col-span-12 lg:col-span-4 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col items-center">
                <h3 className="font-black text-gray-800 self-start mb-8 flex items-center gap-2">
                  <PieChart size={20} className="text-violet-600" /> Por Interés
                </h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={chartDataInteres}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {chartDataInteres.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#3B82F6', '#8B5CF6', '#F59E0B', '#10B981'][index % 4]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4 w-full">
                  {chartDataInteres.slice(0, 4).map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{backgroundColor: ['#3B82F6', '#8B5CF6', '#F59E0B', '#10B981'][i]}}></div>
                      <span className="text-[10px] font-bold text-gray-500 uppercase truncate">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            {/* Filtros */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[300px] relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Buscar por nombre, teléfono o país..." 
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3">
                <Filter size={18} className="text-gray-400" />
                <select 
                  className="bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-bold text-gray-600 outline-none focus:ring-2 focus:ring-blue-500"
                  value={filterEstado}
                  onChange={(e) => setFilterEstado(e.target.value)}
                >
                  <option value="Todos">Todos los estados</option>
                  <option value="Calificado">Calificado</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="Contactado">Contactado</option>
                  <option value="No apto">No apto</option>
                </select>
              </div>
            </div>

            {/* Tabla de Leads */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-100">
                      <th className="px-8 py-5">Lead</th>
                      <th className="px-8 py-5">País</th>
                      <th className="px-8 py-5">Interés</th>
                      <th className="px-8 py-5">Estado</th>
                      <th className="px-8 py-5 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredLeads.map((lead, idx) => (
                      <tr key={idx} className="hover:bg-blue-50/30 transition-colors group cursor-pointer" onClick={() => setSelectedLead(lead)}>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-bold">
                              {lead.nombre.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900">{lead.nombre}</p>
                              <p className="text-xs text-gray-400">{lead.telefono}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-sm font-medium text-gray-600">{lead.pais}</td>
                        <td className="px-8 py-5 text-sm font-medium text-gray-600">{lead.interes}</td>
                        <td className="px-8 py-5">
                          <span className={`px-3 py-1 text-[10px] font-black rounded-full uppercase ${
                            lead.estado === 'Calificado' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {lead.estado}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <button className="text-xs bg-gray-100 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-xl font-bold text-gray-600 transition-all opacity-0 group-hover:opacity-100">
                            Ver Ficha
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      <LeadDetailModal 
        lead={selectedLead} 
        onClose={() => setSelectedLead(null)} 
      />
    </div>
  );
};

export default App;
