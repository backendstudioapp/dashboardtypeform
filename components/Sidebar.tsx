
import React from 'react';
import { 
  LayoutDashboard, 
  Users,
  GraduationCap
} from 'lucide-react';
import { Section } from '../types';

interface SidebarProps {
  activeSection: Section;
  setActiveSection: (section: Section) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, setActiveSection }) => {
  const navItems = [
    { id: 'analytics' as Section, label: 'Analytics', icon: LayoutDashboard },
    { id: 'leads' as Section, label: 'Leads', icon: Users },
    { id: 'alumnos' as Section, label: 'Alumnos', icon: GraduationCap },
  ];

  return (
    <div className="w-64 bg-white h-full border-r border-gray-100 flex flex-col p-6 overflow-y-auto custom-scrollbar">
      <div className="flex items-center gap-2 mb-10 px-2">
        <div className="w-8 h-8 bg-gradient-to-tr from-violet-600 to-blue-500 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold">S</span>
        </div>
        <span className="text-xl font-bold text-gray-800">SetterFlow</span>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-blue-50 text-blue-600 font-semibold shadow-sm shadow-blue-50' 
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-blue-600' : 'text-gray-400'} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
