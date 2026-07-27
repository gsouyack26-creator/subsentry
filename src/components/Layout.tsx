import { ReactNode } from 'react';
import { CreditCard, LayoutDashboard, Settings, Shield } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Layout = ({ children, currentPage, onNavigate }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-[#0f0f11] font-sans flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-56 bg-[#0f0f11] border-r border-[#2a2a32] shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-[#2a2a32]">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Shield size={16} className="text-white" />
          </div>
          <span className="font-bold text-white text-lg">SubSentry</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const active = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/20'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon size={16} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-[#2a2a32]">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <CreditCard size={12} />
            <span>All data stored locally</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between px-4 py-4 border-b border-[#2a2a32] bg-[#0f0f11]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <Shield size={14} className="text-white" />
            </div>
            <span className="font-bold text-white">SubSentry</span>
          </div>
          {/* Mobile nav tabs */}
          <div className="flex gap-1">
            {NAV_ITEMS.map(item => {
              const Icon = item.icon;
              const active = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    active ? 'text-blue-400 bg-blue-600/15' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Icon size={18} />
                </button>
              );
            })}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-5 md:p-6 overflow-y-auto">
          {/* Page title */}
          <div className="mb-6 hidden md:block">
            <h1 className="text-xl font-bold text-white capitalize">
              {currentPage === 'dashboard' ? 'My Subscriptions' : currentPage}
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {currentPage === 'dashboard' ? 'Track and manage all your recurring bills' : 'Configure app preferences'}
            </p>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
};
