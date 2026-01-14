
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import StatCard from './components/StatCard';
import LeadsTable from './components/LeadsTable';
import AlumnosTable from './components/AlumnosTable';
import LeadDetailModal from './components/LeadDetailModal';
import AlumnoDetailModal from './components/AlumnoDetailModal';
import DateRangePicker from './components/DateRangePicker';
import { Lead, Alumno, Section, LeadStatus, AlumnoStatus, DateRange } from './types';
import { fetchLeads, fetchAlumnos } from './services/supabase';
import { 
  Users, 
  Target, 
  Search,
  RotateCw,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  FileText,
  Globe,
  Ban
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  AreaChart, Area
} from 'recharts';

const PAGE_SIZE = 20;

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<Section>('analytics');
  const [isLoading, setIsLoading] = useState(true);

  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [leadSearch, setLeadSearch] = useState('');
  const [leadStatusFilter, setLeadStatusFilter] = useState('Todos');
  const [leadSortOrder, setLeadSortOrder] = useState<'asc' | 'desc'>('desc');
  const [leadPage, setLeadPage] = useState(1);

  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [selectedAlumno, setSelectedAlumno] = useState<Alumno | null>(null);
  const [alumnoSearch, setAlumnoSearch] = useState('');
  const [alumnoStatusFilter, setAlumnoStatusFilter] = useState('Todos');
  const [alumnoSortOrder, setAlumnoSortOrder] = useState<'asc' | 'desc'>('desc');
  const [alumnoPage, setAlumnoPage] = useState(1);

  const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const [leadsData, alumnosData] = await Promise.all([
      fetchLeads(),
      fetchAlumnos()
    ]);
    setLeads(leadsData);
    setAlumnos(alumnosData);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // --- ANALYTICS ENGINE ---
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    
    const filteredLeads = leads.filter(l => {
      if (!dateRange.start) return true;
      const d = new Date(l.fecha_registro);
      const start = new Date(dateRange.start);
      if (dateRange.end) {
        const end = new Date(dateRange.end);
        return d >= start && d <= end;
      }
      return d.toDateString() === start.toDateString();
    });

    const total = filteredLeads.length;
    const todayLeads = leads.filter(l => l.fecha_registro === today).length;
    
    const completeCount = filteredLeads.filter(l => l.estado === 'Formulario completo').length;
    const incompleteCount = filteredLeads.filter(l => l.estado === 'Formulario incompleto').length;
    const contacted = filteredLeads.filter(l => l.estado === 'Contactado').length;
    
    // Gráficos básicos
    const statusChart = Object.entries(filteredLeads.reduce((acc, l) => {
      acc[l.estado] = (acc[l.estado] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)).map(([name, value]) => ({ name, value }));

    const hourlyData = Array.from({ length: 24 }, (_, i) => ({ hour: `${i}:00`, count: 0 }));
    filteredLeads.forEach(l => {
      if (l.hora_registro) {
        const hour = parseInt(l.hora_registro.split(':')[0]);
        if (!isNaN(hour)) hourlyData[hour].count++;
      }
    });

    const temporalChart = Object.entries(filteredLeads.reduce((acc, l) => {
      acc[l.fecha_registro] = (acc[l.fecha_registro] || 0) + 1;
      return acc;
    }, {} as Record<string, number>))
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // TABLA DINÁMICA POR PAÍS (Enfoque Completos/Incompletos)
    const countryDataMap = filteredLeads.reduce((acc, l) => {
      const country = l.pais || 'Desconocido';
      if (!acc[country]) acc[country] = { total: 0, contacted: 0, complete: 0, incomplete: 0 };
      acc[country].total++;
      if (l.estado === 'Contactado') acc[country].contacted++;
      if (l.estado === 'Formulario completo') acc[country].complete++;
      if (l.estado === 'Formulario incompleto') acc[country].incomplete++;
      return acc;
    }, {} as Record<string, { total: number, contacted: number, complete: number, incomplete: number }>);

    const countryMatrix = (Object.entries(countryDataMap) as [string, { total: number, contacted: number, complete: number, incomplete: number }][])
      .map(([name, s]) => ({
        name,
        total: s.total,
        contacted: s.contacted,
        complete: s.complete,
        incomplete: s.incomplete,
        completionRate: s.total > 0 ? (s.complete / s.total) * 100 : 0
      }))
      .sort((a, b) => b.total - a.total);

    return {
      total,
      todayLeads,
      completeCount,
      incompleteCount,
      contactRate: total > 0 ? (contacted / total) * 100 : 0,
      statusChart,
      countryMatrix,
      hourlyData,
      temporalChart
    };
  }, [leads, dateRange]);

  const processedLeads = useMemo(() => {
    return leads.filter(l => {
      const matchesSearch = l.nombre.toLowerCase().includes(leadSearch.toLowerCase());
      const matchesStatus = leadStatusFilter === 'Todos' || l.estado === leadStatusFilter;
      return matchesSearch && matchesStatus;
    }).sort((a, b) => {
      const dateA = new Date(a.fecha_registro).getTime();
      const dateB = new Date(b.fecha_registro).getTime();
      return leadSortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
  }, [leads, leadSearch, leadStatusFilter, leadSortOrder]);

  const processedAlumnos = useMemo(() => {
    return alumnos.filter(a => {
      const fullName = `${a.nombre} ${a.apellidos}`.toLowerCase();
      const matchesSearch = fullName.includes(alumnoSearch.toLowerCase());
      const matchesStatus = alumnoStatusFilter === 'Todos' || a.estado_general === alumnoStatusFilter;
      return matchesSearch && matchesStatus;
    }).sort((a, b) => {
      const dateA = new Date(a.fecha_compra).getTime();
      const dateB = new Date(b.fecha_compra).getTime();
      return alumnoSortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
  }, [alumnos, alumnoSearch, alumnoStatusFilter, alumnoSortOrder]);

  const availableLeadStatuses = useMemo(() => Array.from(new Set(leads.map(l => l.estado))).sort(), [leads]);
  const availableAlumnoStatuses = useMemo(() => Array.from(new Set(alumnos.map(a => a.estado_general))).sort(), [alumnos]);

  if (isLoading && leads.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 font-black uppercase tracking-widest text-xs">Sincronizando Leads...</p>
        </div>
      </div>
    );
  }

  const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#6366F1', '#EC4899', '#14B8A6'];

  return (
    <div className="flex h-screen w-full bg-[#F3F4F6] overflow-hidden">
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      
      <main className="flex-1 overflow-y-auto p-8 custom-scrollbar relative">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
              {activeSection === 'analytics' ? 'Control de Conversión' : 
               activeSection === 'leads' ? 'Base de Datos Leads' : 'Panel de Alumnos'}
            </h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
              {activeSection === 'analytics' ? 'Rendimiento de Formularios y Tráfico' : 'Gestión Operativa'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={loadData} className="p-2.5 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-blue-600 transition-all hover:shadow-sm active:scale-90">
              <RotateCw size={18} className={isLoading ? 'animate-spin' : ''} />
            </button>
            <DateRangePicker onApply={setDateRange} />
          </div>
        </header>

        {activeSection === 'analytics' && (
          <div className="space-y-8 animate-in fade-in duration-700">
            {/* KPIs Principales - Sin Cualificados */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <StatCard title="Total Leads" value={stats.total} icon={<Users size={18} />} trend={stats.todayLeads > 0 ? stats.todayLeads : undefined} trendLabel="hoy" />
              <StatCard title="Completos" value={stats.completeCount} icon={<CheckCircle2 size={18} className="text-emerald-500" />} />
              <StatCard title="Incompletos" value={stats.incompleteCount} icon={<Ban size={18} className="text-red-500" />} />
              <StatCard title="% Contactados" value={`${stats.contactRate.toFixed(1)}%`} icon={<Target size={18} className="text-violet-500" />} />
              <StatCard title="Nuevos Hoy" value={stats.todayLeads} icon={<TrendingUp size={18} className="text-blue-500" />} />
            </div>

            {/* Evolución y Distribución de Estados */}
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 lg:col-span-8 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                  <TrendingUp size={16} className="text-blue-500" /> Flujo de entrada (Leads)
                </h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.temporalChart}>
                      <defs>
                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 10}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 10}} />
                      <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                      <Area type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={4} fillOpacity={1} fill="url(#colorCount)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="col-span-12 lg:col-span-4 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                  <FileText size={16} className="text-violet-500" /> Pipeline Actual
                </h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.statusChart} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f1f1" />
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#4B5563', fontSize: 9, fontWeight: 700}} width={120} />
                      <Tooltip contentStyle={{borderRadius: '12px'}} />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                        {stats.statusChart.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Distribución Horaria */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                <Clock size={16} className="text-orange-500" /> Horarios de mayor actividad (UTC)
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                    <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 9}} interval={2} />
                    <YAxis hide />
                    <Tooltip />
                    <Bar dataKey="count" fill="#F59E0B" radius={[6, 6, 0, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* MATRIZ DE CALIDAD POR PAÍS (Ajustada a Completos/Incompletos) */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                <Globe size={16} className="text-blue-600" /> Rendimiento de Formularios por País
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                      <th className="pb-4">País</th>
                      <th className="pb-4 text-center">Total Leads</th>
                      <th className="pb-4 text-center">Contactados</th>
                      <th className="pb-4 text-center text-emerald-600">Completos</th>
                      <th className="pb-4 text-center text-red-500">Incompletos</th>
                      <th className="pb-4 text-right">% Éxito Form</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {stats.countryMatrix.map((item) => (
                      <tr key={item.name} className="group hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 text-sm font-bold text-gray-900">{item.name}</td>
                        <td className="py-4 text-sm font-semibold text-gray-600 text-center">{item.total}</td>
                        <td className="py-4 text-sm font-semibold text-violet-600 text-center">{item.contacted}</td>
                        <td className="py-4 text-sm font-semibold text-emerald-600 text-center">{item.complete}</td>
                        <td className="py-4 text-sm font-semibold text-red-500 text-center">{item.incomplete}</td>
                        <td className="py-4 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-500 rounded-full" 
                                style={{ width: `${item.completionRate}%` }}
                              />
                            </div>
                            <span className="text-sm font-black text-gray-900">{item.completionRate.toFixed(1)}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'leads' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[300px] relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input 
                  type="text" placeholder="Buscar lead..." 
                  className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-100 outline-none transition-all font-semibold text-gray-800"
                  value={leadSearch} onChange={(e) => setLeadSearch(e.target.value)}
                />
              </div>
              <select 
                className="bg-gray-50 border border-transparent rounded-2xl px-6 py-4 text-xs font-black text-gray-600 outline-none transition-all uppercase tracking-widest cursor-pointer"
                value={leadStatusFilter} onChange={(e) => setLeadStatusFilter(e.target.value)}
              >
                <option value="Todos">Todos los estados</option>
                {availableLeadStatuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <LeadsTable 
              leads={processedLeads.slice((leadPage-1)*PAGE_SIZE, leadPage*PAGE_SIZE)} 
              onSelectLead={setSelectedLead}
              currentPage={leadPage} totalLeads={processedLeads.length}
              pageSize={PAGE_SIZE} onPageChange={setLeadPage}
              sortOrder={leadSortOrder} onToggleSort={() => setLeadSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            />
          </div>
        )}

        {activeSection === 'alumnos' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[300px] relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-violet-500 transition-colors" size={18} />
                <input 
                  type="text" placeholder="Buscar alumno..." 
                  className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-violet-100 outline-none transition-all font-semibold text-gray-800"
                  value={alumnoSearch} onChange={(e) => setAlumnoSearch(e.target.value)}
                />
              </div>
              <select 
                className="bg-gray-50 border border-transparent rounded-2xl px-6 py-4 text-xs font-black text-gray-600 outline-none transition-all uppercase tracking-widest cursor-pointer"
                value={alumnoStatusFilter} onChange={(e) => setAlumnoStatusFilter(e.target.value)}
              >
                <option value="Todos">Todos los estados</option>
                {availableAlumnoStatuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <AlumnosTable 
              alumnos={processedAlumnos.slice((alumnoPage-1)*PAGE_SIZE, alumnoPage*PAGE_SIZE)} 
              onSelectAlumno={setSelectedAlumno}
              currentPage={alumnoPage} totalAlumnos={processedAlumnos.length}
              pageSize={PAGE_SIZE} onPageChange={setAlumnoPage}
              sortOrder={alumnoSortOrder} onToggleSort={() => setAlumnoSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            />
          </div>
        )}
      </main>

      <LeadDetailModal lead={selectedLead} onClose={() => setSelectedLead(null)} onUpdateSuccess={loadData} />
      <AlumnoDetailModal alumno={selectedAlumno} onClose={() => setSelectedAlumno(null)} onUpdateSuccess={loadData} />
    </div>
  );
};

export default App;
