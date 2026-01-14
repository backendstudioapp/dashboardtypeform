
import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  HeadphonesIcon 
} from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, setActiveSection }) => {
  const navItems = [
    { id: 'analytics', label: 'Analytics', icon: LayoutDashboard },
    { id: 'leads', label: 'Leads', icon: Users },
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
                  ? 'bg-blue-50 text-blue-600 font-semibold' 
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-blue-600' : 'text-gray-400'} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto p-4 bg-blue-50 rounded-2xl relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-xs font-medium text-blue-600 mb-1">Centro de ayuda</p>
          <p className="text-xs text-gray-600 mb-4">¿Tienes dudas con la gestión de leads?</p>
          <button className="bg-blue-600 text-white text-xs py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors w-full">
            Contactar Soporte
          </button>
        </div>
        <div className="absolute -bottom-2 -right-2 opacity-10">
          <HeadphonesIcon size={60} />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
