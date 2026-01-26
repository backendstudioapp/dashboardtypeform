
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import StatCard from './components/StatCard';
import LeadsTable from './components/LeadsTable';
import LeadDetailModal from './components/LeadDetailModal';
import DateRangePicker from './components/DateRangePicker';
import Login from './components/Login';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Lead, Section, DateRange } from './types';
import { fetchLeads } from './services/leads';
import {
  Users,
  Search,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  Globe,
  FileText,
  RotateCw,
  Wallet
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  AreaChart, Area, Legend, PieChart, Pie
} from 'recharts';

const PAGE_SIZE = 20;

const Dashboard: React.FC = () => {
  const { signOut, profile } = useAuth();
  const [activeSection, setActiveSection] = useState<Section>('analytics');
  const [isLoading, setIsLoading] = useState(true);

  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [leadSearch, setLeadSearch] = useState('');
  const [leadStatusFilter, setLeadStatusFilter] = useState('Todos');
  const [leadCloserFilter, setLeadCloserFilter] = useState('Todos');
  const [leadSortOrder, setLeadSortOrder] = useState<'asc' | 'desc'>('desc');
  const [leadPage, setLeadPage] = useState(1);

  const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    // Pass user role and name to filter the leads server-side (or pre-query)
    // We derive the Display Name from the user handle (e.g. 'daniel' -> 'Daniel') because DB Closer column is Capitalized
    const closerName = profile?.user ? profile.user.charAt(0).toUpperCase() + profile.user.slice(1).toLowerCase() : undefined;

    const leadsData = await fetchLeads(profile?.role, closerName);
    setLeads(leadsData);
    setIsLoading(false);
  }, [profile]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Helper to get local YYYY-MM-DD string to avoid timezone issues
  const getLocalDateStr = (d: Date) => {
    return [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, '0'),
      String(d.getDate()).padStart(2, '0')
    ].join('-');
  };

  // --- ANALYTICS ENGINE ---
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];

    const filteredLeads = leads.filter(l => {
      // Use string comparison for dates to be strictly matching the selected days
      if (!dateRange.start) return true;

      const leadDateStr = l.fecha_registro; // YYYY-MM-DD
      const startDateStr = getLocalDateStr(new Date(dateRange.start));

      if (dateRange.end) {
        const endDateStr = getLocalDateStr(new Date(dateRange.end));
        return leadDateStr >= startDateStr && leadDateStr <= endDateStr;
      }
      return leadDateStr === startDateStr;
    });

    const total = filteredLeads.length;
    const todayLeads = leads.filter(l => l.fecha_registro === today).length;

    const contacted = filteredLeads.filter(l => l.estado === 'Contactado').length;
    // Removed old status specific counts logic for cleaner dynamic approach if needed, but keeping chart logic

    const statusChart = Object.entries(filteredLeads.reduce((acc, l) => {
      const state = l.estado || 'Desconocido';
      acc[state] = (acc[state] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)).map(([name, value]) => ({ name, value }));

    const hourlyData = Array.from({ length: 24 }, (_, i) => ({ hour: `${i}:00`, count: 0 }));
    filteredLeads.forEach(l => {
      if (l.hora_registro) {
        const hour = parseInt(l.hora_registro.split(':')[0]);
        if (!isNaN(hour)) hourlyData[hour].count++;
      }
    });

    const temporalDataMap = filteredLeads.reduce((acc, l) => {
      const date = l.fecha_registro;
      if (!acc[date]) acc[date] = { date, cualificados: 0, no_cualificados: 0 };
      const cualifica = l.cualifica?.toLowerCase().trim();
      if (cualifica === 'si') acc[date].cualificados++;
      else if (cualifica === 'no') acc[date].no_cualificados++;
      return acc;
    }, {} as Record<string, { date: string, cualificados: number, no_cualificados: number }>);

    let temporalChart: { date: string; cualificados: number; no_cualificados: number }[] = [];

    if (dateRange.start && dateRange.end) {
      const current = new Date(dateRange.start);
      const end = new Date(dateRange.end);
      // Reset times to avoid infinite loops if time parts differ
      current.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      while (current <= end) {
        const dateStr = getLocalDateStr(current);
        temporalChart.push(temporalDataMap[dateStr] || { date: dateStr, cualificados: 0, no_cualificados: 0 });
        current.setDate(current.getDate() + 1);
      }
    } else {
      temporalChart = (Object.values(temporalDataMap) as { date: string, cualificados: number, no_cualificados: number }[])
        .sort((a, b) => a.date.localeCompare(b.date));
    }

    const countryDataMap = filteredLeads.reduce((acc, l) => {
      const country = l.pais || 'Desconocido';
      if (!acc[country]) acc[country] = { total: 0, qualified: 0, not_qualified: 0 };
      acc[country].total++;
      const cualifica = l.cualifica?.toLowerCase().trim();
      if (cualifica === 'si') acc[country].qualified++;
      if (cualifica === 'no') acc[country].not_qualified++;
      return acc;
    }, {} as Record<string, { total: number, qualified: number, not_qualified: number }>);

    const countryMatrix = (Object.entries(countryDataMap) as [string, { total: number, qualified: number, not_qualified: number }][])
      .map(([name, s]) => ({
        name,
        total: s.total,
        qualified: s.qualified,
        not_qualified: s.not_qualified,
        successRate: s.total > 0 ? (s.qualified / s.total) * 100 : 0
      }))
      .sort((a, b) => b.total - a.total);

    const qualifiedCount = filteredLeads.filter(l => l.cualifica?.toLowerCase().trim() === 'si').length;
    const notQualifiedCount = filteredLeads.filter(l => l.cualifica?.toLowerCase().trim() === 'no').length;
    const cashCollected = filteredLeads.reduce((sum, lead) => sum + (lead.cash_collected || 0), 0);

    return {
      total,
      todayLeads,
      contactRate: total > 0 ? (contacted / total) * 100 : 0,
      statusChart,
      countryMatrix,
      hourlyData,
      temporalChart,
      qualifiedCount,
      notQualifiedCount,
      cashCollected
    };
  }, [leads, dateRange]);

  const processedLeads = useMemo(() => {
    return leads.filter(l => {
      const matchesSearch = l.nombre.toLowerCase().includes(leadSearch.toLowerCase());
      const matchesStatus = leadStatusFilter === 'Todos' || l.estado === leadStatusFilter;
      const matchesCloser = leadCloserFilter === 'Todos' || l.closer === leadCloserFilter;

      let matchesDate = true;
      if (dateRange.start) {
        const leadDateStr = l.fecha_registro;
        const startDateStr = getLocalDateStr(new Date(dateRange.start));

        if (dateRange.end) {
          const endDateStr = getLocalDateStr(new Date(dateRange.end));
          matchesDate = leadDateStr >= startDateStr && leadDateStr <= endDateStr;
        } else {
          matchesDate = leadDateStr === startDateStr;
        }
      }

      return matchesSearch && matchesStatus && matchesCloser && matchesDate;
    }).sort((a, b) => {
      const dateA = new Date(a.fecha_registro).getTime();
      const dateB = new Date(b.fecha_registro).getTime();
      return leadSortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
  }, [leads, leadSearch, leadStatusFilter, leadCloserFilter, leadSortOrder, dateRange]);

  const availableLeadStatuses = useMemo(() => Array.from(new Set(leads.map(l => l.estado))).sort(), [leads]);
  const availableClosers = useMemo(() => Array.from(new Set(leads.map(l => l.closer))).filter((c): c is string => typeof c === 'string' && c !== '-' && c.trim() !== '').sort(), [leads]);

  const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#6366F1', '#EC4899', '#14B8A6'];

  return (
    <div className="flex h-screen w-full bg-[#F3F4F6] overflow-hidden">
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} onLogout={signOut} userName={profile?.user || profile?.name} />

      <main className="flex-1 overflow-y-auto p-8 custom-scrollbar relative">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
              {activeSection === 'analytics' ? 'Métricas' : 'Base de Datos Leads'}
            </h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
              Bienvenido, {profile?.user || profile?.name || 'Usuario'} | {activeSection === 'analytics' ? 'Rendimiento de Ventas' : 'Gestión Operativa de Leads'}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <StatCard title="Total Leads" value={stats.total} icon={<Users size={18} />} trend={stats.todayLeads > 0 ? stats.todayLeads : undefined} trendLabel="hoy" />
              <StatCard title="Cualificados" value={stats.qualifiedCount} icon={<CheckCircle2 size={18} className="text-emerald-500" />} />
              <StatCard title="No Cualificados" value={stats.notQualifiedCount} icon={<XCircle size={18} className="text-red-500" />} />
              <StatCard title="Cash Collected" value={`$${stats.cashCollected.toLocaleString()}`} icon={<Wallet size={18} className="text-green-600" />} />
              <StatCard title="Nuevos Hoy" value={stats.todayLeads} icon={<TrendingUp size={18} className="text-blue-500" />} />
            </div>

            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 lg:col-span-8 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                  <TrendingUp size={16} className="text-blue-500" /> Flujo de entrada (Cualificados vs No Cualificados)
                </h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.temporalChart}>
                      <defs>
                        <linearGradient id="colorCualificados" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorNoCualificados" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#EF4444" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                      <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#9CA3AF', fontSize: 10 }}
                        dy={10}
                        tickFormatter={(value) => {
                          if (!value) return '';
                          const [y, m, d] = value.split('-');
                          return `${d}-${m}-${y}`;
                        }}
                      />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 10 }} />
                      <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                      <Legend verticalAlign="top" height={36} />
                      <Area name="Cualificados" type="monotone" dataKey="cualificados" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorCualificados)" />
                      <Area name="No Cualificados" type="monotone" dataKey="no_cualificados" stroke="#EF4444" strokeWidth={3} fillOpacity={1} fill="url(#colorNoCualificados)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="col-span-12 lg:col-span-4 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                  <FileText size={16} className="text-violet-500" /> Pipeline de Estados
                </h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.statusChart}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {stats.statusChart.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '12px' }} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                <Clock size={16} className="text-orange-500" /> Horarios de mayor actividad
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                    <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 9 }} interval={2} />
                    <YAxis hide />
                    <Tooltip />
                    <Bar dataKey="count" fill="#F59E0B" radius={[6, 6, 0, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                <Globe size={16} className="text-blue-600" /> Rendimiento por País
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                      <th className="pb-4">País</th>
                      <th className="pb-4 text-center">Total Leads</th>
                      <th className="pb-4 text-center text-emerald-600">Cualificados</th>
                      <th className="pb-4 text-center text-red-500">No Cualificados</th>
                      <th className="pb-4 text-right">% Conversión</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {stats.countryMatrix.map((item) => (
                      <tr key={item.name} className="group hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 text-sm font-bold text-gray-900">{item.name}</td>
                        <td className="py-4 text-sm font-semibold text-gray-600 text-center">{item.total}</td>
                        <td className="py-4 text-sm font-semibold text-emerald-600 text-center">{item.qualified}</td>
                        <td className="py-4 text-sm font-semibold text-red-500 text-center">{item.not_qualified}</td>
                        <td className="py-4 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500 rounded-full"
                                style={{ width: `${item.successRate}%` }}
                              />
                            </div>
                            <span className="text-sm font-black text-gray-900">{item.successRate.toFixed(1)}%</span>
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
              <select
                className="bg-gray-50 border border-transparent rounded-2xl px-6 py-4 text-xs font-black text-gray-600 outline-none transition-all uppercase tracking-widest cursor-pointer"
                value={leadCloserFilter} onChange={(e) => setLeadCloserFilter(e.target.value)}
              >
                <option value="Todos">Todos los closers</option>
                {availableClosers.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <LeadsTable
              leads={processedLeads.slice((leadPage - 1) * PAGE_SIZE, leadPage * PAGE_SIZE)}
              onSelectLead={setSelectedLead}
              currentPage={leadPage} totalLeads={processedLeads.length}
              pageSize={PAGE_SIZE} onPageChange={setLeadPage}
              sortOrder={leadSortOrder} onToggleSort={() => setLeadSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            />
          </div>
        )}
      </main>

      <LeadDetailModal lead={selectedLead} onClose={() => setSelectedLead(null)} onUpdateSuccess={loadData} />
    </div>
  );
};

const MainApp = () => {
  const { session, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!session && !profile) {
    return <Login />;
  }

  return <Dashboard />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
};

export default App;
