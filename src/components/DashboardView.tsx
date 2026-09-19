import React, { useState, useMemo } from 'react';
import { 
  Wallet, 
  Coins, 
  CreditCard, 
  TrendingUp, 
  Users, 
  Calculator, 
  ArrowUpRight, 
  ShieldCheck,
  CheckCircle2, 
  Sparkles, 
  Receipt,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  ArrowDownRight,
  Landmark
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { Member, SavingsTransaction, Loan, CashTransaction } from '../types';
import { formatRupiah, formatDateIndo } from '../data/initialData';

interface DashboardViewProps {
  members: Member[];
  savings: SavingsTransaction[];
  loans: Loan[];
  cashMovements: CashTransaction[];
  totalKas: number;
  onNavigate: (tab: 'simpanan' | 'pinjaman' | 'anggota' | 'kas' | 'profil') => void;
  onOpenAppscript: () => void;
  onViewReceipt: (trx: SavingsTransaction) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  members,
  savings,
  loans,
  cashMovements,
  totalKas,
  onNavigate,
  onOpenAppscript,
  onViewReceipt,
}) => {
  const [activeChartTab, setActiveChartTab] = useState<'arusKas' | 'pinjaman' | 'komposisi'>('arusKas');

  // Hitung agregat simpanan
  const totalPokok = members.reduce((sum, m) => sum + (m.simpananPokok || 0), 0);
  const totalWajib = members.reduce((sum, m) => sum + (m.simpananWajib || 0), 0);
  const totalSukarela = members.reduce((sum, m) => sum + (m.simpananSukarela || 0), 0);
  const grandTotalSimpanan = totalPokok + totalWajib + totalSukarela;

  // Hitung agregat pinjaman
  const activeLoans = loans.filter((l) => l.status === 'Berjalan');
  const totalSisaPokokPinjaman = activeLoans.reduce((sum, l) => sum + l.remainingPrincipal, 0);

  // Estimasi SHU dari total jasa angsuran yang terbayar
  let totalPendapatanJasa = 0;
  loans.forEach((l) => {
    l.payments.forEach((p) => {
      totalPendapatanJasa += p.amountJasa;
    });
  });

  const pendingLoans = loans.filter((l) => l.status === 'Menunggu');

  // --- DATA GRAFIK 1: Komposisi Simpanan (Donut Chart) ---
  const pieDataSimpanan = useMemo(() => {
    return [
      { name: 'Simpanan Pokok', value: totalPokok, color: '#059669' }, // emerald-600
      { name: 'Simpanan Wajib', value: totalWajib, color: '#0d9488' }, // teal-600
      { name: 'Simpanan Sukarela', value: totalSukarela, color: '#f59e0b' }, // amber-500
    ];
  }, [totalPokok, totalWajib, totalSukarela]);

  // --- DATA GRAFIK 2: Tren Arus Kas & Mutasi Finansial per Bulan ---
  const monthlyCashflowData = useMemo(() => {
    const monthsMap: Record<string, { month: string; masuk: number; keluar: number; jasa: number }> = {
      '01': { month: 'Jan', masuk: 2000000, keluar: 1000000, jasa: 33333 },
      '02': { month: 'Feb', masuk: 1800000, keluar: 500000, jasa: 33333 },
      '03': { month: 'Mar', masuk: 2500000, keluar: 1200000, jasa: 33333 },
      '04': { month: 'Apr', masuk: 2200000, keluar: 800000, jasa: 33333 },
      '05': { month: 'Mei', masuk: 2700000, keluar: 1500000, jasa: 33333 },
      '06': { month: 'Jun', masuk: 3200000, keluar: 2000000, jasa: 33333 },
      '07': { month: 'Jul', masuk: 4500000, keluar: 3000000, jasa: 166667 },
      '08': { month: 'Agu', masuk: 3800000, keluar: 1200000, jasa: 166667 },
      '09': { month: 'Sep', masuk: 4200000, keluar: 1800000, jasa: 166667 },
    };

    // Ambil dari mutasi kas riil bila tersedia
    cashMovements.forEach((cm) => {
      const parts = cm.date.split('-');
      if (parts.length >= 2) {
        const mm = parts[1];
        if (monthsMap[mm]) {
          if (cm.type === 'Masuk') {
            monthsMap[mm].masuk += cm.amount;
          } else {
            monthsMap[mm].keluar += cm.amount;
          }
        }
      }
    });

    return Object.values(monthsMap);
  }, [cashMovements]);

  // --- DATA GRAFIK 3: Portofolio Pinjaman Anggota ---
  const loanPortfolioData = useMemo(() => {
    return loans.map((l) => {
      const paidPrincipal = l.amount - l.remainingPrincipal;
      return {
        nama: l.memberName.split(' ')[0] + ' (' + l.memberNo + ')',
        plafon: l.amount,
        terbayar: paidPrincipal,
        sisa: l.remainingPrincipal,
        status: l.status,
      };
    });
  }, [loans]);

  // Custom tooltip formatter
  const formatTooltipCurrency = (val: any) => {
    return [formatRupiah(Number(val)), ''];
  };

  return (
    <div className="space-y-6">
      {/* Banner Sapaan & Nilai Koperasi Patuh Pacu */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-emerald-600/40">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-center">
          <ShieldCheck className="w-80 h-80 text-white transform translate-x-12" />
        </div>
        
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/60 backdrop-blur-xs text-emerald-200 text-xs font-semibold mb-3 border border-emerald-500/50">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Koperasi Patuh Pacu &bull; Amanah, Tertib &amp; Berkah
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
            Selamat Datang di Sistem Informasi Koperasi
          </h2>
          <p className="text-emerald-100 text-sm sm:text-base leading-relaxed mb-6 font-normal">
            Mendukung transparansi pembukuan simpanan dan pembiayaan produktif anggota untuk memudahkan anggota dalam melaukan transaksi dan pengelolaan keuangan secara digital
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('simpanan')}
              id="btn-quick-simpanan"
              className="px-4 py-2.5 rounded-xl bg-white text-emerald-900 font-bold text-xs sm:text-sm hover:bg-emerald-50 transition shadow-sm flex items-center gap-2"
            >
              <Coins className="w-4 h-4 text-emerald-700" />
              Catat Simpanan
            </button>
            <button
              onClick={() => onNavigate('pinjaman')}
              id="btn-quick-pinjaman"
              className="px-4 py-2.5 rounded-xl bg-emerald-900/70 hover:bg-emerald-900/90 text-white font-bold text-xs sm:text-sm transition border border-emerald-500/50 flex items-center gap-2 shadow-sm"
            >
              <Calculator className="w-4 h-4 text-amber-300" />
              Simulasi Pinjaman (20%/Semester)
            </button>
            <button
              onClick={() => onNavigate('profil')}
              id="btn-quick-profil"
              className="px-4 py-2.5 rounded-xl bg-teal-950/50 hover:bg-teal-950/70 text-emerald-200 font-semibold text-xs sm:text-sm transition border border-teal-500/40 flex items-center gap-2"
            >
              <Landmark className="w-4 h-4 text-emerald-300" />
              Profil Koperasi
            </button>
          </div>
        </div>
      </div>

      {/* 4 Kartu Metrik Finansial */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* 1. Kas Koperasi */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-emerald-300 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Saldo Kas Koperasi
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mb-1">
            {formatRupiah(totalKas)}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Kas likuid siap operasional</span>
          </div>
        </div>

        {/* 2. Total Simpanan Anggota */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-emerald-300 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Simpanan
            </span>
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mb-1">
            {formatRupiah(grandTotalSimpanan)}
          </div>
          <div className="text-xs text-slate-500 truncate">
            Pokok: {formatRupiah(totalPokok)} &bull; Wajib: {formatRupiah(totalWajib)}
          </div>
        </div>

        {/* 3. Pembiayaan / Pinjaman Aktif */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-emerald-300 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pinjaman Berjalan
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mb-1">
            {formatRupiah(totalSisaPokokPinjaman)}
          </div>
          <div className="text-xs text-slate-500">
            {activeLoans.length} pinjaman aktif ({pendingLoans.length} antrean)
          </div>
        </div>

        {/* 4. Pendapatan Jasa / SHU */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-emerald-300 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Jasa Koperasi (SHU)
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mb-1">
            {formatRupiah(totalPendapatanJasa)}
          </div>
          <div className="text-xs text-slate-500">
            Pendapatan jasa angsuran terealisasi
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION GRAFIK VISUALISASI DATA DASHBOARD */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg">
                Grafik Analitik &amp; Kinerja Keuangan Koperasi
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Visualisasi interaktif arus kas bulanan, komposisi simpanan anggota, dan portofolio pinjaman
            </p>
          </div>

          {/* Tab Selector Grafik */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl self-start sm:self-auto text-xs font-semibold">
            <button
              onClick={() => setActiveChartTab('arusKas')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeChartTab === 'arusKas'
                  ? 'bg-white text-emerald-800 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Arus Kas Bulanan</span>
            </button>
            <button
              onClick={() => setActiveChartTab('pinjaman')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeChartTab === 'pinjaman'
                  ? 'bg-white text-emerald-800 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Portofolio Pinjaman</span>
            </button>
            <button
              onClick={() => setActiveChartTab('komposisi')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeChartTab === 'komposisi'
                  ? 'bg-white text-emerald-800 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PieChartIcon className="w-3.5 h-3.5" />
              <span>Komposisi Simpanan</span>
            </button>
          </div>
        </div>

        {/* 1. Tampilan Grafik Arus Kas */}
        {activeChartTab === 'arusKas' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">
                Penerimaan Dana Masuk (Simpanan &amp; Angsuran) vs Pengeluaran (Pencairan Pinjaman &amp; Penarikan)
              </span>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 font-medium text-emerald-700">
                  <span className="w-3 h-3 rounded-xs bg-emerald-600"></span>
                  Pemasukan Kas
                </span>
                <span className="flex items-center gap-1.5 font-medium text-rose-600">
                  <span className="w-3 h-3 rounded-xs bg-rose-500"></span>
                  Pengeluaran Kas
                </span>
              </div>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyCashflowData} margin={{ top: 10, right: 10, left: 15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMasuk" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#059669" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="colorKeluar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis 
                    stroke="#94a3b8" 
                    fontSize={11} 
                    tickFormatter={(val) => `Rp ${(val / 1000000).toFixed(1)}Jt`} 
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    formatter={formatTooltipCurrency} 
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', border: 'none', fontSize: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="masuk" 
                    name="Pemasukan Kas" 
                    stroke="#059669" 
                    strokeWidth={2.5} 
                    fillOpacity={1} 
                    fill="url(#colorMasuk)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="keluar" 
                    name="Pengeluaran Kas" 
                    stroke="#f43f5e" 
                    strokeWidth={2} 
                    fillOpacity={1} 
                    fill="url(#colorKeluar)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* 2. Tampilan Grafik Portofolio Pinjaman */}
        {activeChartTab === 'pinjaman' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">
                Plafon Pinjaman vs Realisasi Pokok Terbayar &amp; Sisa Pokok Berjalan
              </span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 font-medium text-slate-700">
                  <span className="w-3 h-3 rounded-xs bg-slate-400"></span>
                  Plafon
                </span>
                <span className="flex items-center gap-1.5 font-medium text-emerald-700">
                  <span className="w-3 h-3 rounded-xs bg-emerald-600"></span>
                  Terbayar
                </span>
                <span className="flex items-center gap-1.5 font-medium text-amber-600">
                  <span className="w-3 h-3 rounded-xs bg-amber-500"></span>
                  Sisa Pokok
                </span>
              </div>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={loanPortfolioData} margin={{ top: 10, right: 10, left: 15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="nama" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis 
                    stroke="#94a3b8" 
                    fontSize={11} 
                    tickFormatter={(val) => `Rp ${(val / 1000000).toFixed(1)}Jt`} 
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    formatter={formatTooltipCurrency} 
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', border: 'none', fontSize: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="plafon" name="Plafon Pinjaman" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="terbayar" name="Pokok Terbayar" fill="#059669" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="sisa" name="Sisa Pokok" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* 3. Tampilan Grafik Komposisi Simpanan */}
        {activeChartTab === 'komposisi' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieDataSimpanan}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieDataSimpanan.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={formatTooltipCurrency}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', border: 'none', fontSize: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="text-xs text-slate-500 font-medium">Total Akumulasi Simpanan:</div>
                <div className="text-2xl font-extrabold text-slate-900 mt-1">
                  {formatRupiah(grandTotalSimpanan)}
                </div>
                <div className="text-xs text-emerald-700 font-semibold mt-1">
                  Dana kelolaan mandiri milik {members.length} anggota
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 text-xs">
                {pieDataSimpanan.map((item) => (
                  <div key={item.name} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-white">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="font-semibold text-slate-800">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <strong className="text-slate-900 block">{formatRupiah(item.value)}</strong>
                      <span className="text-[11px] text-slate-500">
                        {grandTotalSimpanan ? Math.round((item.value / grandTotalSimpanan) * 100) : 0}% porsi
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Grid: Analisis Komposisi Simpanan & Antrean Pinjaman */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Komposisi Dana Simpanan Quick View */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Rincian Simpanan Anggota Koperasi
              </h3>
              <p className="text-xs text-slate-500">
                Distribusi simpanan pokok, wajib bulanan, dan sukarela
              </p>
            </div>
            <button
              onClick={() => onNavigate('simpanan')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              Lihat Detail
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Visual Progress Bar */}
          <div className="space-y-4">
            <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex">
              <div 
                style={{ width: `${grandTotalSimpanan ? (totalPokok / grandTotalSimpanan) * 100 : 0}%` }} 
                className="bg-emerald-600 transition-all" 
                title="Simpanan Pokok"
              />
              <div 
                style={{ width: `${grandTotalSimpanan ? (totalWajib / grandTotalSimpanan) * 100 : 0}%` }} 
                className="bg-teal-500 transition-all" 
                title="Simpanan Wajib"
              />
              <div 
                style={{ width: `${grandTotalSimpanan ? (totalSukarela / grandTotalSimpanan) * 100 : 0}%` }} 
                className="bg-amber-400 transition-all" 
                title="Simpanan Sukarela"
              />
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2 text-center">
              <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-100">
                <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-800 font-semibold mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                  Simpanan Pokok
                </div>
                <div className="text-sm font-bold text-slate-900">
                  {formatRupiah(totalPokok)}
                </div>
                <div className="text-[11px] text-slate-500">
                  {grandTotalSimpanan ? Math.round((totalPokok / grandTotalSimpanan) * 100) : 0}% dari total
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-teal-50/80 border border-teal-100">
                <div className="flex items-center justify-center gap-1.5 text-xs text-teal-800 font-semibold mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
                  Simpanan Wajib
                </div>
                <div className="text-sm font-bold text-slate-900">
                  {formatRupiah(totalWajib)}
                </div>
                <div className="text-[11px] text-slate-500">
                  {grandTotalSimpanan ? Math.round((totalWajib / grandTotalSimpanan) * 100) : 0}% dari total
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-100">
                <div className="flex items-center justify-center gap-1.5 text-xs text-amber-800 font-semibold mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                  Simpanan Sukarela
                </div>
                <div className="text-sm font-bold text-slate-900">
                  {formatRupiah(totalSukarela)}
                </div>
                <div className="text-[11px] text-slate-500">
                  {grandTotalSimpanan ? Math.round((totalSukarela / grandTotalSimpanan) * 100) : 0}% dari total
                </div>
              </div>
            </div>
          </div>

          {/* Quick info row */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
            <span>Total Anggota Terdaftar: <strong className="text-slate-900">{members.length} Orang</strong></span>
            <span className="text-emerald-700 font-medium">Buku Pembukuan Periode Tahun Berjalan</span>
          </div>
        </div>

        {/* Antrean / Status Pengajuan Pinjaman */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-base">
                Status Pinjaman
              </h3>
              <button
                onClick={() => onNavigate('pinjaman')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
              >
                Kelola
              </button>
            </div>

            <div className="space-y-3">
              {pendingLoans.length > 0 ? (
                pendingLoans.map((pl) => (
                  <div key={pl.id} className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-start justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900">{pl.memberName}</div>
                      <div className="text-[11px] text-slate-600">{pl.memberNo} &bull; {pl.purpose}</div>
                      <div className="text-xs font-semibold text-amber-800 mt-1">{formatRupiah(pl.amount)} ({pl.tenorMonths} bln)</div>
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-200 text-amber-900">
                      Menunggu
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-400 text-xs">
                  <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400 mb-2" />
                  Semua pengajuan pinjaman telah diverifikasi.
                </div>
              )}

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-1.5">
                <div className="flex justify-between">
                  <span>Pinjaman Disetujui/Aktif:</span>
                  <span className="font-bold text-slate-900">{activeLoans.length} Berkas</span>
                </div>
                <div className="flex justify-between">
                  <span>Pinjaman Lunas:</span>
                  <span className="font-bold text-emerald-700">{loans.filter(l => l.status === 'Lunas').length} Berkas</span>
                </div>
                <div className="flex justify-between">
                  <span>Suku Bunga Berlaku:</span>
                  <span className="font-bold text-emerald-700">20% / Semester (3,33%/bln)</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('pinjaman')}
            id="btn-go-to-loans"
            className="w-full mt-4 py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition border border-emerald-200 flex items-center justify-center gap-1.5"
          >
            <Calculator className="w-3.5 h-3.5" />
            Buka Kalkulator Pinjaman Patuh Pacu
          </button>
        </div>
      </div>

      {/* Mutasi Simpanan Terkini */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Transaksi Simpanan Terakhir
            </h3>
            <p className="text-xs text-slate-500">
              Catatan mutasi setoran dan penarikan simpanan anggota
            </p>
          </div>
          <button
            onClick={() => onNavigate('simpanan')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            Lihat Semua Transaksi
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-3">No. Kuitansi</th>
                <th className="py-3 px-3">Tanggal</th>
                <th className="py-3 px-3">Nama Anggota</th>
                <th className="py-3 px-3">Jenis Simpanan</th>
                <th className="py-3 px-3 text-right">Jumlah</th>
                <th className="py-3 px-3">Keterangan</th>
                <th className="py-3 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {savings.slice(0, 5).map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 font-mono font-medium text-slate-800">{s.receiptNo}</td>
                  <td className="py-3 px-3 text-slate-500">{formatDateIndo(s.date)}</td>
                  <td className="py-3 px-3 font-medium text-slate-900">
                    {s.memberName}
                    <span className="block text-[11px] text-slate-500">{s.memberNo}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      s.type === 'Pokok' ? 'bg-emerald-100 text-emerald-800' :
                      s.type === 'Wajib' ? 'bg-teal-100 text-teal-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {s.type} ({s.action})
                    </span>
                  </td>
                  <td className={`py-3 px-3 text-right font-bold ${
                    s.action === 'Setor' ? 'text-emerald-700' : 'text-rose-600'
                  }`}>
                    {s.action === 'Setor' ? '+' : '-'}{formatRupiah(s.amount)}
                  </td>
                  <td className="py-3 px-3 text-slate-500 max-w-xs truncate">{s.note || '-'}</td>
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => onViewReceipt(s)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 font-semibold transition"
                      title="Lihat Kuitansi Resmi"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      Struk
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
