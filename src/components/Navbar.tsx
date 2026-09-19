import React from 'react';
import { 
  Building2, 
  Wallet, 
  Users, 
  CreditCard, 
  Coins, 
  Code2, 
  CheckCircle2, 
  AlertCircle,
  LayoutDashboard,
  Landmark,
  Sparkles
} from 'lucide-react';
import { AppScriptConfig } from '../types';

export type NavTabType = 'dashboard' | 'simpanan' | 'pinjaman' | 'anggota' | 'kas' | 'profil';

interface NavbarProps {
  activeTab: NavTabType;
  setActiveTab: (tab: NavTabType) => void;
  appScriptConfig: AppScriptConfig;
  onOpenAppscriptModal: () => void;
  pendingLoansCount?: number;
  membersCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  appScriptConfig,
  onOpenAppscriptModal,
  pendingLoansCount = 0,
  membersCount = 0,
}) => {
  const navItems = [
    { 
      id: 'dashboard' as const, 
      label: 'Dashboard', 
      icon: LayoutDashboard,
      badge: null 
    },
    { 
      id: 'simpanan' as const, 
      label: 'Simpanan', 
      icon: Coins,
      badge: null 
    },
    { 
      id: 'pinjaman' as const, 
      label: 'Pinjaman & Simulasi', 
      icon: CreditCard,
      badge: pendingLoansCount > 0 ? `${pendingLoansCount} Antrean` : null,
      badgeColor: 'bg-amber-100 text-amber-800'
    },
    { 
      id: 'anggota' as const, 
      label: 'Buku Anggota', 
      icon: Users,
      badge: membersCount > 0 ? `${membersCount}` : null,
      badgeColor: 'bg-emerald-100 text-emerald-800'
    },
    { 
      id: 'kas' as const, 
      label: 'Buku Kas & Laporan', 
      icon: Wallet,
      badge: null 
    },
    { 
      id: 'profil' as const, 
      label: 'Profil Koperasi', 
      icon: Landmark,
      badge: 'Resmi',
      badgeColor: 'bg-teal-100 text-teal-800'
    },
  ];

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/90 sticky top-0 z-40 shadow-xs transition-all">
      {/* Top Brand Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 py-2">
          {/* Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="relative group cursor-pointer" onClick={() => setActiveTab('dashboard')}>
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 flex items-center justify-center text-white shadow-md shadow-emerald-700/25 border border-emerald-400/40 transform group-hover:scale-105 transition-transform duration-200">
                <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-lg sm:text-xl tracking-tight text-slate-900 leading-none">
                  KOPERASI <span className="text-emerald-700">PATUH PACU</span>
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                  <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                  Sistem Digital
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium tracking-normal mt-0.5">
                Simpan Pinjam Terpadu &bull; Suku Bunga 20% / Semester
              </p>
            </div>
          </div>

          {/* Right Action: Google Apps Script Indicator */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onOpenAppscriptModal}
              id="btn-appscript-config"
              className={`group flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-semibold transition-all border shadow-2xs ${
                appScriptConfig.isConnected
                  ? 'bg-emerald-50/90 border-emerald-300 text-emerald-900 hover:bg-emerald-100/90'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
              }`}
              title="Kelola Koneksi Google Apps Script & Spreadsheet"
            >
              <div className="relative">
                <Code2 className="w-3.5 h-3.5 text-emerald-700 group-hover:rotate-12 transition-transform" />
                {appScriptConfig.isConnected && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                )}
              </div>
              <span className="hidden md:inline text-slate-600 font-medium">Google Apps Script:</span>
              <span className="flex items-center gap-1">
                {appScriptConfig.isConnected ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-800">Terhubung</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                    <span>Lokal / Standalone</span>
                  </>
                )}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Modern Segmented Navigation Bar */}
      <div className="border-t border-slate-200/70 bg-slate-50/60">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 no-scrollbar scroll-smooth" aria-label="Menu Utama">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`tab-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 whitespace-nowrap select-none ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-700 via-emerald-700 to-teal-700 text-white shadow-sm shadow-emerald-900/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200/70'
                  }`}
                >
                  <Icon className={`w-4 h-4 transition-transform ${
                    isActive ? 'text-emerald-200 scale-110' : 'text-slate-400 group-hover:text-slate-600'
                  }`} />
                  <span>{item.label}</span>

                  {item.badge && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full transition-colors ${
                      isActive 
                        ? 'bg-white/20 text-white border border-white/30' 
                        : (item.badgeColor || 'bg-slate-200 text-slate-700')
                    }`}>
                      {item.badge}
                    </span>
                  )}

                  {isActive && (
                    <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-emerald-500 rounded-full hidden sm:block"></span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
