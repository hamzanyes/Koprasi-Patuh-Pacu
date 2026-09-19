import React, { useState, useMemo } from 'react';
import { 
  AlertTriangle, 
  Clock, 
  Phone, 
  MessageCircle, 
  Printer, 
  FileSpreadsheet, 
  Search, 
  Filter, 
  CheckCircle2, 
  Calendar, 
  X,
  CreditCard,
  User,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { Loan, Member, CooperativeProfile } from '../../types';
import { formatRupiah, formatDateIndo } from '../../data/initialData';

interface OverdueLoansReportProps {
  loans: Loan[];
  members: Member[];
  profile: CooperativeProfile;
}

export interface OverdueItem {
  loan: Loan;
  member?: Member;
  pokokPerMonth: number;
  jasaPerMonth: number;
  monthlyTotal: number;
  expectedInstallments: number;
  unpaidInstallments: number;
  nextDueDate: string;
  daysLate: number;
  tunggakanPokok: number;
  tunggakanJasa: number;
  totalTunggakan: number;
  statusKeterlambatan: 'Lancar' | 'Jatuh Tempo Mendekati' | 'Lewat Jatuh Tempo (1-30 Hari)' | 'Menunggak Sedang (31-60 Hari)' | 'Menunggak Berat (>60 Hari)';
}

export const OverdueLoansReport: React.FC<OverdueLoansReportProps> = ({
  loans,
  members,
  profile,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'OVERDUE_ONLY' | 'BERAT' | 'LANCAR'>('ALL');
  const [selectedOverdueForLetter, setSelectedOverdueForLetter] = useState<OverdueItem | null>(null);

  // Perhitungan status tunggakan untuk semua pinjaman berjalan
  const overdueData: OverdueItem[] = useMemo(() => {
    const today = new Date();

    return loans
      .filter((l) => l.status === 'Berjalan')
      .map((loan) => {
        const member = members.find((m) => m.id === loan.memberId || m.memberNo === loan.memberNo);
        const pokokPerMonth = Math.round(loan.amount / loan.tenorMonths);
        const jasaPerMonth = Math.round((loan.amount * 0.20) / 6); // 20% / semester (6 bln)
        const monthlyTotal = pokokPerMonth + jasaPerMonth;

        // Hitung berapa bulan telah berjalan sejak tanggal pengajuan/pencairan
        const appDate = new Date(loan.applicationDate);
        let monthsDiff = (today.getFullYear() - appDate.getFullYear()) * 12 + (today.getMonth() - appDate.getMonth());
        if (today.getDate() >= appDate.getDate()) {
          monthsDiff += 1;
        }
        
        // Minimal 1 jika sudah melewati hari H
        const expectedInstallments = Math.min(Math.max(monthsDiff, 1), loan.tenorMonths);
        const unpaidInstallments = Math.max(0, expectedInstallments - loan.paidInstallmentsCount);

        // Tanggal jatuh tempo angsuran berikutnya
        const nextInstallmentNum = loan.paidInstallmentsCount + 1;
        const nextDueObj = new Date(appDate);
        nextDueObj.setMonth(nextDueObj.getMonth() + nextInstallmentNum);
        const nextDueDate = nextDueObj.toISOString().split('T')[0];

        // Hitung selisih hari keterlambatan terhadap tanggal jatuh tempo berikutnya
        const diffTime = today.getTime() - nextDueObj.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const daysLate = Math.max(0, diffDays);

        // Tunggakan nominal
        const tunggakanPokok = unpaidInstallments * pokokPerMonth;
        const tunggakanJasa = unpaidInstallments * jasaPerMonth;
        const totalTunggakan = unpaidInstallments * monthlyTotal;

        // Status Kategori Keterlambatan
        let statusKeterlambatan: OverdueItem['statusKeterlambatan'] = 'Lancar';
        if (unpaidInstallments > 0 || daysLate > 0) {
          if (daysLate > 60 || unpaidInstallments >= 3) {
            statusKeterlambatan = 'Menunggak Berat (>60 Hari)';
          } else if (daysLate > 30 || unpaidInstallments >= 2) {
            statusKeterlambatan = 'Menunggak Sedang (31-60 Hari)';
          } else if (daysLate > 0 || unpaidInstallments >= 1) {
            statusKeterlambatan = 'Lewat Jatuh Tempo (1-30 Hari)';
          } else {
            statusKeterlambatan = 'Jatuh Tempo Mendekati';
          }
        } else if (daysLate <= 0 && daysLate >= -7) {
          statusKeterlambatan = 'Jatuh Tempo Mendekati';
        }

        return {
          loan,
          member,
          pokokPerMonth,
          jasaPerMonth,
          monthlyTotal,
          expectedInstallments,
          unpaidInstallments,
          nextDueDate,
          daysLate,
          tunggakanPokok,
          tunggakanJasa,
          totalTunggakan,
          statusKeterlambatan,
        };
      });
  }, [loans, members]);

  // Filter & Pencarian
  const filteredList = useMemo(() => {
    return overdueData.filter((item) => {
      const matchSearch = 
        item.loan.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.loan.memberNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.loan.loanNo.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchSearch) return false;

      if (filterSeverity === 'OVERDUE_ONLY') {
        return item.statusKeterlambatan.startsWith('Menunggak') || item.statusKeterlambatan.startsWith('Lewat');
      }
      if (filterSeverity === 'BERAT') {
        return item.statusKeterlambatan.includes('>60 Hari');
      }
      if (filterSeverity === 'LANCAR') {
        return item.statusKeterlambatan === 'Lancar';
      }
      return true;
    });
  }, [overdueData, searchTerm, filterSeverity]);

  // Statistik Agregat Tunggakan
  const totalMenunggakAnggota = overdueData.filter(
    (i) => i.statusKeterlambatan.startsWith('Menunggak') || i.statusKeterlambatan.startsWith('Lewat')
  ).length;
  const totalNominalTunggakan = overdueData.reduce((sum, i) => sum + i.totalTunggakan, 0);
  const totalNominalPokokTertunggak = overdueData.reduce((sum, i) => sum + i.tunggakanPokok, 0);
  const totalNominalJasaTertunggak = overdueData.reduce((sum, i) => sum + i.tunggakanJasa, 0);

  // Template Pesan WhatsApp
  const handleSendWhatsApp = (item: OverdueItem) => {
    const rawPhone = item.member?.phone || '';
    let cleanPhone = rawPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '62' + cleanPhone.slice(1);
    }

    const message = encodeURIComponent(
      `Halo Yth. Bapak/Ibu ${item.loan.memberName} (${item.loan.memberNo}),\n\n` +
      `Kami dari Pengurus Koperasi Patuh Pacu menginformasikan terkait pinjaman No. ${item.loan.loanNo}.\n` +
      `Berdasarkan data pembukuan, terdapat angsuran jatuh tempo pada tanggal ${formatDateIndo(item.nextDueDate)} sebesar ${formatRupiah(item.totalTunggakan > 0 ? item.totalTunggakan : item.monthlyTotal)}.\n\n` +
      `Rincian:\n` +
      `- Pokok: ${formatRupiah(item.tunggakanPokok > 0 ? item.tunggakanPokok : item.pokokPerMonth)}\n` +
      `- Jasa (20%/Semester): ${formatRupiah(item.tunggakanJasa > 0 ? item.tunggakanJasa : item.jasaPerMonth)}\n` +
      `- Status: ${item.statusKeterlambatan}\n\n` +
      `Pembayaran dapat disetorkan langsung ke Kantor Koperasi Patuh Pacu atau transfer ke Rekening Bank ${profile.bankName} No. ${profile.bankAccountNumber} a/n ${profile.bankAccountHolder}.\n\n` +
      `Terima kasih atas kerjasamanya.\n` +
      `Salam hangat,\nPengurus Koperasi Patuh Pacu.`
    );

    window.open(`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${message}`, '_blank');
  };

  const handleExportCSV = () => {
    const headers = [
      'No_Pinjaman',
      'No_Anggota',
      'Nama_Anggota',
      'No_HP',
      'Plafon_Pinjaman',
      'Sisa_Pokok',
      'Angsuran_Bulanan',
      'Jatuh_Tempo_Berikutnya',
      'Hari_Terlambat',
      'Bulan_Menunggak',
      'Tunggakan_Pokok',
      'Tunggakan_Jasa',
      'Total_Tunggakan',
      'Status_Keterlambatan'
    ];

    const rows = filteredList.map((i) => [
      i.loan.loanNo,
      i.loan.memberNo,
      `"${i.loan.memberName.replace(/"/g, '""')}"`,
      `"${i.member?.phone || '-'}"`,
      i.loan.amount,
      i.loan.remainingPrincipal,
      i.monthlyTotal,
      i.nextDueDate,
      i.daysLate,
      i.unpaidInstallments,
      i.tunggakanPokok,
      i.tunggakanJasa,
      i.totalTunggakan,
      `"${i.statusKeterlambatan}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Daftar_Tunggakan_Pinjaman_Patuh_Pacu_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* 4 Kartu Metrik Ringkasan Tunggakan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Anggota Menunggak
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-rose-700">
            {totalMenunggakAnggota} <span className="text-sm font-normal text-slate-500">Orang</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Dari total {overdueData.length} pinjaman berjalan</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Tunggakan (Pokok + Jasa)
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-800">
            {formatRupiah(totalNominalTunggakan)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Piutang terlambat siap ditagih</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Tunggakan Pokok
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {formatRupiah(totalNominalPokokTertunggak)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Pengembalian pokok tertahan</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Tunggakan Jasa (20%/Sem)
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-800">
            {formatRupiah(totalNominalJasaTertunggak)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Potensi pendapatan jasa koperasi</p>
        </div>
      </div>

      {/* Toolbar & Filter */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama atau No. Anggota..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-600"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Status */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setFilterSeverity('ALL')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filterSeverity === 'ALL' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua ({overdueData.length})
            </button>
            <button
              onClick={() => setFilterSeverity('OVERDUE_ONLY')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
                filterSeverity === 'OVERDUE_ONLY' ? 'bg-rose-600 text-white shadow-2xs font-bold' : 'text-rose-700 hover:bg-rose-50'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Menunggak ({totalMenunggakAnggota})
            </button>
            <button
              onClick={() => setFilterSeverity('BERAT')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filterSeverity === 'BERAT' ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Macet &gt;60 Hari
            </button>
            <button
              onClick={() => setFilterSeverity('LANCAR')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filterSeverity === 'LANCAR' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              Lancar
            </button>
          </div>
        </div>

        {/* Action Button: Export CSV */}
        <button
          onClick={handleExportCSV}
          id="btn-export-tunggakan"
          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-2 border border-slate-200 transition"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
          Export Daftar Tunggakan (CSV)
        </button>
      </div>

      {/* Tabel Daftar Tunggakan Anggota */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[11px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Peminjam</th>
                <th className="py-3.5 px-4">No. Pinjaman</th>
                <th className="py-3.5 px-4 text-right">Plafon &amp; Sisa</th>
                <th className="py-3.5 px-4">Progres Angsuran</th>
                <th className="py-3.5 px-4">Jatuh Tempo</th>
                <th className="py-3.5 px-4 text-right">Total Tunggakan</th>
                <th className="py-3.5 px-4">Status &amp; Keterlambatan</th>
                <th className="py-3.5 px-4 text-center">Tindakan Penagihan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.length > 0 ? (
                filteredList.map((item) => {
                  const isLate = item.statusKeterlambatan.startsWith('Menunggak') || item.statusKeterlambatan.startsWith('Lewat');
                  return (
                    <tr key={item.loan.id} className={`hover:bg-slate-50/80 transition-colors ${isLate ? 'bg-rose-50/20' : ''}`}>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          {item.loan.memberName}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {item.loan.memberNo} &bull; {item.member?.phone || 'No HP tidak tercatat'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-medium text-slate-800">
                        {item.loan.loanNo}
                        <span className="block text-[10px] text-slate-400 font-sans">
                          Cair: {formatDateIndo(item.loan.applicationDate)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="font-bold text-slate-900">{formatRupiah(item.loan.amount)}</div>
                        <div className="text-[11px] text-amber-700 font-medium">
                          Sisa: {formatRupiah(item.loan.remainingPrincipal)}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-slate-800">
                            {item.loan.paidInstallmentsCount} / {item.loan.tenorMonths} bln
                          </span>
                          <span className="text-[10px] text-slate-500">
                            ({Math.round((item.loan.paidInstallmentsCount / item.loan.tenorMonths) * 100)}%)
                          </span>
                        </div>
                        <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            style={{ width: `${(item.loan.paidInstallmentsCount / item.loan.tenorMonths) * 100}%` }}
                            className="h-full bg-emerald-600 rounded-full"
                          />
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-900 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {formatDateIndo(item.nextDueDate)}
                        </div>
                        {item.daysLate > 0 ? (
                          <span className="text-[11px] font-bold text-rose-600 block mt-0.5">
                            Lewat {item.daysLate} hari ({item.unpaidInstallments} angsuran)
                          </span>
                        ) : (
                          <span className="text-[11px] text-emerald-600 block mt-0.5">
                            Tepat waktu
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right font-bold">
                        <div className={item.totalTunggakan > 0 ? 'text-rose-700 font-extrabold text-sm' : 'text-slate-500'}>
                          {item.totalTunggakan > 0 ? formatRupiah(item.totalTunggakan) : formatRupiah(item.monthlyTotal)}
                        </div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          Pokok: {formatRupiah(item.tunggakanPokok > 0 ? item.tunggakanPokok : item.pokokPerMonth)}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          item.statusKeterlambatan.includes('>60 Hari')
                            ? 'bg-rose-100 text-rose-900 border border-rose-200'
                            : item.statusKeterlambatan.includes('31-60')
                            ? 'bg-orange-100 text-orange-900 border border-orange-200'
                            : item.statusKeterlambatan.includes('1-30')
                            ? 'bg-amber-100 text-amber-900 border border-amber-200'
                            : item.statusKeterlambatan === 'Jatuh Tempo Mendekati'
                            ? 'bg-blue-50 text-blue-800 border border-blue-200'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}>
                          {isLate ? <AlertTriangle className="w-3 h-3 text-rose-600" /> : <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                          {item.statusKeterlambatan}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* WhatsApp Reminder */}
                          <button
                            onClick={() => handleSendWhatsApp(item)}
                            id={`btn-wa-${item.loan.id}`}
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition"
                            title="Kirim Pesan Pengingat WhatsApp Resmi"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>

                          {/* Cetak Surat Tagihan / Kuitansi Tunggakan */}
                          <button
                            onClick={() => setSelectedOverdueForLetter(item)}
                            id={`btn-surat-tagihan-${item.loan.id}`}
                            className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition"
                            title="Cetak Surat Pemberitahuan Tunggakan Resmi"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
                    Tidak ada data tunggakan anggota untuk kriteria filter yang dipilih.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL CETAK SURAT TAGIHAN / PEMBERITAHUAN JATUH TEMPO */}
      {selectedOverdueForLetter && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 print:hidden">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Pratinjau Surat Pemberitahuan Tunggakan
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  id="btn-print-surat"
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Cetak Surat Resmi
                </button>
                <button
                  onClick={() => setSelectedOverdueForLetter(null)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Dokumen Surat Resmi Berkop */}
            <div className="mt-4 p-6 border-2 border-slate-300 rounded-2xl bg-white text-slate-900 font-sans space-y-4 text-xs sm:text-sm">
              {/* KOP RESMI */}
              <div className="text-center pb-3 border-b-2 border-slate-800">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-emerald-950 uppercase">
                  {profile.name}
                </h2>
                <p className="text-[11px] text-slate-600 font-medium">
                  {profile.address}, {profile.village}, {profile.subDistrict}, {profile.regency}, {profile.province}
                </p>
                <p className="text-[10px] text-slate-500">
                  Badan Hukum No: {profile.legalNumber} &bull; NIB: {profile.nib} &bull; Telp: {profile.phone}
                </p>
              </div>

              {/* Judul Surat */}
              <div className="text-center pt-2">
                <h3 className="font-extrabold text-sm uppercase tracking-wide underline">
                  SURAT PEMBERITAHUAN JATUH TEMPO PINJAMAN
                </h3>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                  Nomor: {selectedOverdueForLetter.loan.loanNo}/SP-KPP/{new Date().getFullYear()}
                </p>
              </div>

              {/* Kepada */}
              <div className="pt-2 text-xs space-y-1">
                <div>Kepada Yth,</div>
                <div className="font-bold text-slate-900">{selectedOverdueForLetter.loan.memberName} ({selectedOverdueForLetter.loan.memberNo})</div>
                <div className="text-slate-600">{selectedOverdueForLetter.member?.address || 'Alamat terdaftar pada buku anggota'}</div>
                <div className="text-slate-600">No. HP/WA: {selectedOverdueForLetter.member?.phone || '-'}</div>
              </div>

              <p className="text-justify text-xs leading-relaxed text-slate-700">
                Dengan hormat, berdasarkan catatan pembukuan administrasi simpan pinjam Koperasi Patuh Pacu, kami memberitahukan bahwa fasilitas pembiayaan produktif atas nama Saudara/i telah memasuki tanggal jatuh tempo dengan rincian sebagai berikut:
              </p>

              {/* Rincian Finansial */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span className="text-slate-600">Nomor Perjanjian Pinjaman:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedOverdueForLetter.loan.loanNo}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span className="text-slate-600">Plafon Awal Pinjaman:</span>
                  <span className="font-semibold text-slate-900">{formatRupiah(selectedOverdueForLetter.loan.amount)}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span className="text-slate-600">Sisa Pokok Pinjaman Berjalan:</span>
                  <span className="font-bold text-amber-800">{formatRupiah(selectedOverdueForLetter.loan.remainingPrincipal)}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span className="text-slate-600">Angsuran Ke:</span>
                  <span className="font-medium text-slate-900">
                    Ke-{selectedOverdueForLetter.loan.paidInstallmentsCount + 1} dari total {selectedOverdueForLetter.loan.tenorMonths} bulan
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span className="text-slate-600">Tanggal Jatuh Tempo:</span>
                  <span className="font-bold text-rose-700">{formatDateIndo(selectedOverdueForLetter.nextDueDate)}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span className="text-slate-600">Keterlambatan:</span>
                  <span className="font-semibold text-slate-900">{selectedOverdueForLetter.daysLate} Hari ({selectedOverdueForLetter.statusKeterlambatan})</span>
                </div>
                <div className="flex justify-between pt-1 text-sm font-extrabold text-emerald-950">
                  <span>Total Tagihan Tertunggak:</span>
                  <span className="text-rose-700">
                    {formatRupiah(selectedOverdueForLetter.totalTunggakan > 0 ? selectedOverdueForLetter.totalTunggakan : selectedOverdueForLetter.monthlyTotal)}
                  </span>
                </div>
              </div>

              <p className="text-justify text-xs leading-relaxed text-slate-700">
                Sehubungan dengan hal tersebut di atas, kami mengharapkan kehadiran Saudara/i atau melakukan konfirmasi pembayaran selambat-lambatnya 7 (tujuh) hari sejak surat ini diterbitkan melalui rekening resmi Koperasi Patuh Pacu ({profile.bankName} No. Rek: {profile.bankAccountNumber} a/n {profile.bankAccountHolder}).
              </p>

              {/* Tanda Tangan */}
              <div className="pt-4 flex justify-between text-xs text-center">
                <div>
                  <div className="text-slate-500 mb-12">Diserahkan oleh Petugas,</div>
                  <div className="font-bold underline text-slate-900">Kolektor / Bagian Pinjaman</div>
                </div>
                <div>
                  <div className="text-slate-500 mb-12">{profile.regency}, {formatDateIndo(new Date().toISOString().split('T')[0])}</div>
                  <div className="font-bold underline text-slate-900">{profile.treasurerName}</div>
                  <div className="text-[11px] text-slate-600">Bendahara Koperasi Patuh Pacu</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
