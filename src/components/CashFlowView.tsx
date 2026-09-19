import React, { useState, useMemo } from 'react';
import { 
  Wallet, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Plus, 
  FileSpreadsheet, 
  Filter, 
  X,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Coins,
  FileText,
  BookOpen
} from 'lucide-react';
import { CashTransaction, Member, Loan, SavingsTransaction, CooperativeProfile } from '../types';
import { formatRupiah, formatDateIndo } from '../data/initialData';
import { OverdueLoansReport } from './reports/OverdueLoansReport';
import { ProfitLossReport } from './reports/ProfitLossReport';
import { MonthlyFinancialReport } from './reports/MonthlyFinancialReport';
import { ShuDistributionReport } from './reports/ShuDistributionReport';

interface CashFlowViewProps {
  cashMovements: CashTransaction[];
  totalKas: number;
  onAddCashMovement: (trx: Omit<CashTransaction, 'id'>) => void;
  members: Member[];
  loans: Loan[];
  savings: SavingsTransaction[];
  profile: CooperativeProfile;
}

type ReportSubTab = 'kas' | 'tunggakan' | 'labarugi' | 'bulanan' | 'shu';

export const CashFlowView: React.FC<CashFlowViewProps> = ({
  cashMovements,
  totalKas,
  onAddCashMovement,
  members,
  loans,
  savings,
  profile,
}) => {
  const [activeReportTab, setActiveReportTab] = useState<ReportSubTab>('kas');
  const [filterType, setFilterType] = useState<'ALL' | 'Masuk' | 'Keluar'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State Catat Mutasi Kas Manual
  const [type, setType] = useState<'Masuk' | 'Keluar'>('Keluar');
  const [category, setCategory] = useState<CashTransaction['category']>('Operasional');
  const [amount, setAmount] = useState<number>(100000);
  const [description, setDescription] = useState('');
  const [officer, setOfficer] = useState(profile.treasurerName ? `${profile.treasurerName} (Bendahara)` : 'Siti Nurhaliza (Bendahara)');

  // Hitung jumlah pinjaman yang jatuh tempo/menunggak untuk lencana indikator
  const overdueCount = useMemo(() => {
    const today = new Date();
    return loans.filter((l) => {
      if (l.status !== 'Berjalan') return false;
      const appDate = new Date(l.applicationDate);
      let monthsDiff = (today.getFullYear() - appDate.getFullYear()) * 12 + (today.getMonth() - appDate.getMonth());
      if (today.getDate() >= appDate.getDate()) monthsDiff += 1;
      const expected = Math.min(Math.max(monthsDiff, 1), l.tenorMonths);
      return expected > l.paidInstallmentsCount;
    }).length;
  }, [loans]);

  const totalMasuk = cashMovements
    .filter((c) => c.type === 'Masuk')
    .reduce((sum, c) => sum + c.amount, 0);

  const totalKeluar = cashMovements
    .filter((c) => c.type === 'Keluar')
    .reduce((sum, c) => sum + c.amount, 0);

  const filteredList = cashMovements.filter((c) => {
    if (filterType === 'ALL') return true;
    return c.type === filterType;
  });

  const handleExportCSV = () => {
    const headers = ['ID', 'Tanggal', 'Tipe', 'Kategori', 'Jumlah_Rp', 'Keterangan', 'No_Referensi', 'Petugas'];
    const rows = cashMovements.map((c) => [
      c.id,
      c.date,
      c.type,
      c.category,
      c.amount,
      `"${c.description.replace(/"/g, '""')}"`,
      c.referenceNo,
      `"${c.officer.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Kas_Koperasi_Patuh_Pacu_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 || !description.trim()) return;

    onAddCashMovement({
      date: new Date().toISOString().split('T')[0],
      type,
      category,
      amount: Number(amount),
      description: description.trim(),
      referenceNo: `KPP-MANUAL-${Date.now().toString().slice(-4)}`,
      officer: officer.trim() || 'Petugas Koperasi',
    });

    setIsModalOpen(false);
    setDescription('');
    setAmount(100000);
  };

  return (
    <div className="space-y-6">
      {/* Header Utama Modul */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Buku Kas &amp; Pusat Laporan Keuangan
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold">
              {profile.name}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Pembukuan Kas Umum, Daftar Tunggakan Jatuh Tempo, Laporan Laba Rugi, Rekap Bulanan, dan Pembagian SHU (50:50)
          </p>
        </div>

        {activeReportTab === 'kas' && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              id="btn-export-csv"
              className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm transition flex items-center gap-1.5 border border-slate-200"
              title="Download file CSV untuk Excel / Google Sheets"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
              Export CSV Mutasi
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              id="btn-catat-kas"
              className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs sm:text-sm transition shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Catat Mutasi Kas
            </button>
          </div>
        )}
      </div>

      {/* Segmented Sub-Navbar Tab Menu Laporan */}
      <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-1.5">
        {/* Tab 1: Buku Kas Umum */}
        <button
          onClick={() => setActiveReportTab('kas')}
          id="tab-laporan-kas"
          className={`flex-1 min-w-[140px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-2 ${
            activeReportTab === 'kas'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>Buku Kas Umum</span>
        </button>

        {/* Tab 2: Daftar Tunggakan Anggota (Jatuh Tempo) */}
        <button
          onClick={() => setActiveReportTab('tunggakan')}
          id="tab-laporan-tunggakan"
          className={`flex-1 min-w-[160px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-2 relative ${
            activeReportTab === 'tunggakan'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <AlertTriangle className={`w-4 h-4 ${activeReportTab === 'tunggakan' ? 'text-amber-300' : 'text-rose-500'}`} />
          <span>Daftar Tunggakan</span>
          {overdueCount > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
              activeReportTab === 'tunggakan' ? 'bg-amber-400 text-slate-950' : 'bg-rose-100 text-rose-800'
            }`}>
              {overdueCount}
            </span>
          )}
        </button>

        {/* Tab 3: Laporan Laba Rugi */}
        <button
          onClick={() => setActiveReportTab('labarugi')}
          id="tab-laporan-labarugi"
          className={`flex-1 min-w-[140px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-2 ${
            activeReportTab === 'labarugi'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Laba Rugi</span>
        </button>

        {/* Tab 4: Laporan Bulanan */}
        <button
          onClick={() => setActiveReportTab('bulanan')}
          id="tab-laporan-bulanan"
          className={`flex-1 min-w-[140px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-2 ${
            activeReportTab === 'bulanan'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Laporan Bulanan</span>
        </button>

        {/* Tab 5: Laporan SHU (50% Pengurus : 50% Koperasi) */}
        <button
          onClick={() => setActiveReportTab('shu')}
          id="tab-laporan-shu"
          className={`flex-1 min-w-[150px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-2 ${
            activeReportTab === 'shu'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Coins className={`w-4 h-4 ${activeReportTab === 'shu' ? 'text-amber-300' : 'text-amber-600'}`} />
          <span>Laporan SHU (50:50)</span>
        </button>
      </div>

      {/* KONTEN TAB SESUAI PILIHAN */}
      {activeReportTab === 'kas' && (
        <div className="space-y-6">
          {/* 3 Kartu Saldo Kas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Saldo Kas Berjalan
              </span>
              <div className="text-2xl font-bold text-emerald-800 mt-1">
                {formatRupiah(totalKas)}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Total likuiditas yang siap digunakan</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                <ArrowDownLeft className="w-3.5 h-3.5" />
                Total Kas Masuk
              </span>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                {formatRupiah(totalMasuk)}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Dari simpanan &amp; angsuran pinjaman</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5" />
                Total Kas Keluar
              </span>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                {formatRupiah(totalKeluar)}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Pencairan pinjaman &amp; biaya operasional</p>
            </div>
          </div>

          {/* Filter Tipe Mutasi */}
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" />
                Filter Tipe:
              </span>
              {(['ALL', 'Masuk', 'Keluar'] as const).map((ft) => (
                <button
                  key={ft}
                  onClick={() => setFilterType(ft)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    filterType === ft
                      ? 'bg-emerald-100 text-emerald-800 font-semibold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {ft === 'ALL' ? 'Semua Mutasi' : ft === 'Masuk' ? 'Kas Masuk' : 'Kas Keluar'}
                </button>
              ))}
            </div>
            <span className="text-xs text-slate-500 hidden sm:inline">
              Menampilkan <strong>{filteredList.length}</strong> mutasi kas
            </span>
          </div>

          {/* Tabel Mutasi Kas */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm text-slate-700">
                <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[11px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Tanggal</th>
                    <th className="py-3 px-4">Tipe</th>
                    <th className="py-3 px-4">Kategori</th>
                    <th className="py-3 px-4">Keterangan</th>
                    <th className="py-3 px-4">No. Ref</th>
                    <th className="py-3 px-4 text-right">Nominal</th>
                    <th className="py-3 px-4">Petugas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredList.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        {formatDateIndo(c.date)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          c.type === 'Masuk'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                        }`}>
                          {c.type === 'Masuk' ? (
                            <ArrowDownLeft className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <ArrowUpRight className="w-3 h-3 text-rose-600" />
                          )}
                          {c.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-900 whitespace-nowrap">
                        {c.category}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-sm">
                        {c.description}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-500 whitespace-nowrap">
                        {c.referenceNo}
                      </td>
                      <td className={`py-3.5 px-4 text-right font-bold whitespace-nowrap ${
                        c.type === 'Masuk' ? 'text-emerald-700' : 'text-rose-600'
                      }`}>
                        {c.type === 'Masuk' ? '+' : '-'}{formatRupiah(c.amount)}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                        {c.officer}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DAFTAR TUNGGAKAN ANGGOTA (JATUH TEMPO) */}
      {activeReportTab === 'tunggakan' && (
        <OverdueLoansReport
          loans={loans}
          members={members}
          profile={profile}
        />
      )}

      {/* TAB 3: LAPORAN LABA RUGI */}
      {activeReportTab === 'labarugi' && (
        <ProfitLossReport
          loans={loans}
          cashMovements={cashMovements}
          profile={profile}
        />
      )}

      {/* TAB 4: LAPORAN BULANAN */}
      {activeReportTab === 'bulanan' && (
        <MonthlyFinancialReport
          cashMovements={cashMovements}
          savings={savings}
          loans={loans}
          totalKas={totalKas}
          profile={profile}
        />
      )}

      {/* TAB 5: LAPORAN SHU (50% PENGURUS : 50% KOPERASI) */}
      {activeReportTab === 'shu' && (
        <ShuDistributionReport
          loans={loans}
          cashMovements={cashMovements}
          profile={profile}
        />
      )}

      {/* Modal Catat Mutasi Kas Manual */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                Catat Mutasi Kas Manual
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jenis Arus Kas
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setType('Masuk')}
                    className={`py-2 text-xs font-bold rounded-xl border transition ${
                      type === 'Masuk'
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-800'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Kas Masuk (+)
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('Keluar')}
                    className={`py-2 text-xs font-bold rounded-xl border transition ${
                      type === 'Keluar'
                        ? 'bg-rose-50 border-rose-600 text-rose-800'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Kas Keluar (-)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kategori
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-emerald-600"
                >
                  <option value="Operasional">Operasional Kantor &amp; ATK</option>
                  <option value="Simpanan">Simpanan Anggota</option>
                  <option value="Angsuran Pinjaman">Angsuran Pinjaman</option>
                  <option value="Pencairan Pinjaman">Pencairan Pinjaman</option>
                  <option value="Penarikan Simpanan">Penarikan Simpanan</option>
                  <option value="Lainnya">Lain-lain</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nominal (Rp)
                </label>
                <input
                  type="number"
                  min="1000"
                  step="1000"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Keterangan Transaksi
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Contoh: Pembelian buku kas, konsumsi rapat..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Petugas Penanggung Jawab
                </label>
                <input
                  type="text"
                  value={officer}
                  onChange={(e) => setOfficer(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-600"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs transition"
                >
                  Simpan Mutasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
