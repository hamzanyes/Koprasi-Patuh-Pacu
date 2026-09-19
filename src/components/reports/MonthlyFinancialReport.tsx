import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  ArrowDownLeft, 
  ArrowUpRight, 
  FileSpreadsheet, 
  Printer, 
  Building2, 
  Wallet, 
  Coins, 
  CreditCard,
  Filter,
  CheckCircle2,
  TrendingUp
} from 'lucide-react';
import { CashTransaction, SavingsTransaction, Loan, CooperativeProfile } from '../../types';
import { formatRupiah, formatDateIndo } from '../../data/initialData';

interface MonthlyFinancialReportProps {
  cashMovements: CashTransaction[];
  savings: SavingsTransaction[];
  loans: Loan[];
  totalKas: number;
  profile: CooperativeProfile;
}

const MONTH_NAMES = [
  { value: '01', label: 'Januari' },
  { value: '02', label: 'Februari' },
  { value: '03', label: 'Maret' },
  { value: '04', label: 'April' },
  { value: '05', label: 'Mei' },
  { value: '06', label: 'Juni' },
  { value: '07', label: 'Juli' },
  { value: '08', label: 'Agustus' },
  { value: '09', label: 'September' },
  { value: '10', label: 'Oktober' },
  { value: '11', label: 'November' },
  { value: '12', label: 'Desember' },
];

export const MonthlyFinancialReport: React.FC<MonthlyFinancialReportProps> = ({
  cashMovements,
  savings,
  loans,
  totalKas,
  profile,
}) => {
  const currentDate = new Date();
  const currentYearStr = '2024'; // Default ke data aktif awal 2024
  const currentMonthStr = '09';

  const [selectedYear, setSelectedYear] = useState<string>(currentYearStr);
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthStr);

  const monthYearKey = `${selectedYear}-${selectedMonth}`;

  // 1. Rekap Transaksi Kas & Mutasi pada Bulan Terpilih
  const monthlyCashTransactions = useMemo(() => {
    return cashMovements.filter((c) => c.date.startsWith(monthYearKey));
  }, [cashMovements, monthYearKey]);

  // 2. Rekap Setoran & Penarikan Simpanan pada Bulan Terpilih
  const monthlySavings = useMemo(() => {
    return savings.filter((s) => s.date.startsWith(monthYearKey));
  }, [savings, monthYearKey]);

  // 3. Rekap Pinjaman yang Cair pada Bulan Terpilih
  const monthlyDisbursedLoans = useMemo(() => {
    return loans.filter((l) => (l.status === 'Berjalan' || l.status === 'Lunas') && l.applicationDate.startsWith(monthYearKey));
  }, [loans, monthYearKey]);

  // 4. Rekap Angsuran Pinjaman yang Masuk pada Bulan Terpilih
  const monthlyLoanPayments = useMemo(() => {
    const list: { loanNo: string; memberName: string; amountPokok: number; amountJasa: number; totalPaid: number; date: string }[] = [];
    loans.forEach((l) => {
      l.payments.forEach((p) => {
        if (p.date.startsWith(monthYearKey)) {
          list.push({
            loanNo: l.loanNo,
            memberName: l.memberName,
            amountPokok: p.amountPokok,
            amountJasa: p.amountJasa,
            totalPaid: p.totalPaid,
            date: p.date,
          });
        }
      });
    });
    return list;
  }, [loans, monthYearKey]);

  // Hitung Kas Masuk Rinci
  const totalSimpananMasuk = monthlySavings
    .filter((s) => s.action === 'Setor')
    .reduce((sum, s) => sum + s.amount, 0);

  const totalAngsuranPokokMasuk = monthlyLoanPayments.reduce((sum, p) => sum + p.amountPokok, 0);
  const totalAngsuranJasaMasuk = monthlyLoanPayments.reduce((sum, p) => sum + p.amountJasa, 0);

  const totalKasMasukLain = monthlyCashTransactions
    .filter((c) => c.type === 'Masuk' && c.category !== 'Simpanan' && c.category !== 'Angsuran Pinjaman')
    .reduce((sum, c) => sum + c.amount, 0);

  const grandTotalKasMasuk = totalSimpananMasuk + totalAngsuranPokokMasuk + totalAngsuranJasaMasuk + totalKasMasukLain;

  // Hitung Kas Keluar Rinci
  const totalPencairanPinjaman = monthlyDisbursedLoans.reduce((sum, l) => sum + l.amount, 0);
  const totalPenarikanSimpanan = monthlySavings
    .filter((s) => s.action === 'Tarik')
    .reduce((sum, s) => sum + s.amount, 0);

  const totalBebanOperasionalKeluar = monthlyCashTransactions
    .filter((c) => c.type === 'Keluar' && c.category !== 'Penarikan Simpanan' && c.category !== 'Pencairan Pinjaman')
    .reduce((sum, c) => sum + c.amount, 0);

  const grandTotalKasKeluar = totalPencairanPinjaman + totalPenarikanSimpanan + totalBebanOperasionalKeluar;

  const surplusDefisitBulanIni = grandTotalKasMasuk - grandTotalKasKeluar;

  // Saldo Awal Estimasi
  const saldoAkhirBulanIni = totalKas;
  const saldoAwalBulanIni = Math.max(0, saldoAkhirBulanIni - surplusDefisitBulanIni);

  const monthLabel = MONTH_NAMES.find((m) => m.value === selectedMonth)?.label || selectedMonth;

  const handleExportCSV = () => {
    const rows = [
      [`LAPORAN KEUANGAN BULANAN KOPERASI PATUH PACU`],
      [`Periode: ${monthLabel} ${selectedYear}`],
      [''],
      ['URAIAN REKAPITULASI', 'NOMINAL_RP'],
      ['Saldo Kas Awal Bulan', saldoAwalBulanIni],
      [''],
      ['PENERIMAAN KAS MASUK:', ''],
      ['- Penerimaan Setoran Simpanan Anggota', totalSimpananMasuk],
      ['- Penerimaan Angsuran Pokok Pinjaman', totalAngsuranPokokMasuk],
      ['- Penerimaan Pendapatan Jasa Pinjaman (20%/Sem)', totalAngsuranJasaMasuk],
      ['- Penerimaan Kas Lainnya', totalKasMasukLain],
      ['TOTAL KAS MASUK', grandTotalKasMasuk],
      [''],
      ['PENGELUARAN KAS KELUAR:', ''],
      ['- Pencairan Pinjaman Produktif Anggota', totalPencairanPinjaman],
      ['- Penarikan Simpanan Sukarela Anggota', totalPenarikanSimpanan],
      ['- Beban Operasional, ATK, dan Konsumsi Rapat', totalBebanOperasionalKeluar],
      ['TOTAL KAS KELUAR', grandTotalKasKeluar],
      [''],
      ['SURPLUS / DEFISIT BERSIH BULAN INI', surplusDefisitBulanIni],
      ['SALDO KAS AKHIR BULAN', saldoAkhirBulanIni],
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((r) => r.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Bulanan_Koperasi_Patuh_Pacu_${selectedYear}_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* 4 Kartu Indikator Finansial Bulanan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Saldo Awal Bulan
            </span>
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {formatRupiah(saldoAwalBulanIni)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Posisi kas per 1 {monthLabel} {selectedYear}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Penerimaan Kas Masuk
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-800">
            {formatRupiah(grandTotalKasMasuk)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Simpanan, pokok &amp; jasa pinjaman</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pengeluaran Kas Keluar
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-rose-800">
            {formatRupiah(grandTotalKasKeluar)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Pencairan pinjaman &amp; biaya operasional</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Arus Kas Bersih (Net)
            </span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className={`text-2xl font-bold ${surplusDefisitBulanIni >= 0 ? 'text-teal-800' : 'text-rose-700'}`}>
            {surplusDefisitBulanIni >= 0 ? '+' : ''}{formatRupiah(surplusDefisitBulanIni)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {surplusDefisitBulanIni >= 0 ? 'Surplus likuiditas' : 'Defisit kas bulan berjalan'}
          </p>
        </div>
      </div>

      {/* Toolbar Pemilih Bulan & Tahun + Export/Cetak */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <Calendar className="w-4 h-4 text-emerald-700" />
            <span>Periode Laporan:</span>
          </div>

          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 focus:outline-hidden focus:border-emerald-600"
          >
            {MONTH_NAMES.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 focus:outline-hidden focus:border-emerald-600"
          >
            <option value="2024">Tahun 2024</option>
            <option value="2025">Tahun 2025</option>
            <option value="2026">Tahun 2026</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            id="btn-export-bulanan"
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 border border-slate-200 transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            Export CSV
          </button>
          <button
            onClick={() => window.print()}
            id="btn-print-bulanan"
            className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs"
          >
            <Printer className="w-4 h-4" />
            Cetak Laporan Bulanan
          </button>
        </div>
      </div>

      {/* DOKUMEN LAPORAN BULANAN RESMI */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        {/* Header Kop Surat */}
        <div className="text-center pb-5 border-b-2 border-slate-900">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Building2 className="w-6 h-6 text-emerald-700" />
            <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">
              {profile.name}
            </h2>
          </div>
          <p className="text-xs text-slate-600 font-medium">
            Badan Hukum No: {profile.legalNumber} &bull; NIB: {profile.nib}
          </p>
          <p className="text-xs text-slate-500">
            {profile.address}, {profile.village}, {profile.subDistrict}, {profile.regency}
          </p>
          <div className="mt-3 inline-block px-4 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold uppercase tracking-wider">
            LAPORAN BULANAN PERTANGGUNGJAWABAN KAS &bull; PERIODE {monthLabel.toUpperCase()} {selectedYear}
          </div>
        </div>

        {/* Tabel Ringkasan Rekapitulasi Arus Kas */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-slate-800">
            <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-xs border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Uraian Aliran Kas Finansial</th>
                <th className="py-3 px-4 text-right w-48">Jumlah (Rp)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Saldo Awal */}
              <tr className="bg-slate-50/80 font-bold text-slate-900">
                <td className="py-3 px-4">I. SALDO KAS AWAL BULAN (01 {monthLabel} {selectedYear})</td>
                <td className="py-3 px-4 text-right font-extrabold text-slate-900">
                  {formatRupiah(saldoAwalBulanIni)}
                </td>
              </tr>

              {/* Kas Masuk */}
              <tr className="bg-emerald-50/80 font-bold text-emerald-950">
                <td className="py-2.5 px-4 uppercase">II. PENERIMAAN KAS MASUK BULANAN</td>
                <td className="py-2.5 px-4 text-right"></td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 pl-8 text-slate-700">
                  a. Penerimaan Simpanan Anggota (Pokok, Wajib, Sukarela)
                </td>
                <td className="py-2.5 px-4 text-right font-medium text-slate-900">
                  {formatRupiah(totalSimpananMasuk)}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 pl-8 text-slate-700">
                  b. Penerimaan Angsuran Pokok Pinjaman Anggota
                </td>
                <td className="py-2.5 px-4 text-right font-medium text-slate-900">
                  {formatRupiah(totalAngsuranPokokMasuk)}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 pl-8 text-slate-700">
                  c. Penerimaan Jasa Pinjaman Anggota (Suku Bunga 20% / Semester)
                </td>
                <td className="py-2.5 px-4 text-right font-medium text-slate-900">
                  {formatRupiah(totalAngsuranJasaMasuk)}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 pl-8 text-slate-700">
                  d. Penerimaan Kas Lainnya
                </td>
                <td className="py-2.5 px-4 text-right font-medium text-slate-900">
                  {formatRupiah(totalKasMasukLain)}
                </td>
              </tr>
              <tr className="bg-emerald-100/40 font-bold text-emerald-950">
                <td className="py-3 px-4">SUB TOTAL PENERIMAAN KAS MASUK (A)</td>
                <td className="py-3 px-4 text-right text-emerald-900 font-extrabold">
                  +{formatRupiah(grandTotalKasMasuk)}
                </td>
              </tr>

              {/* Kas Keluar */}
              <tr className="bg-rose-50/80 font-bold text-rose-950">
                <td className="py-2.5 px-4 uppercase">III. PENGELUARAN KAS KELUAR BULANAN</td>
                <td className="py-2.5 px-4 text-right"></td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 pl-8 text-slate-700">
                  a. Pencairan Fasilitas Pinjaman Produktif Anggota
                </td>
                <td className="py-2.5 px-4 text-right font-medium text-slate-900">
                  {formatRupiah(totalPencairanPinjaman)}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 pl-8 text-slate-700">
                  b. Penarikan Simpanan Sukarela Anggota
                </td>
                <td className="py-2.5 px-4 text-right font-medium text-slate-900">
                  {formatRupiah(totalPenarikanSimpanan)}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 pl-8 text-slate-700">
                  c. Beban Operasional Kantor, ATK &amp; Rapat Pengurus
                </td>
                <td className="py-2.5 px-4 text-right font-medium text-slate-900">
                  {formatRupiah(totalBebanOperasionalKeluar)}
                </td>
              </tr>
              <tr className="bg-rose-100/40 font-bold text-rose-950">
                <td className="py-3 px-4">SUB TOTAL PENGELUARAN KAS KELUAR (B)</td>
                <td className="py-3 px-4 text-right text-rose-900 font-extrabold">
                  -{formatRupiah(grandTotalKasKeluar)}
                </td>
              </tr>

              {/* Surplus / Defisit */}
              <tr className="bg-slate-100 font-bold text-slate-900">
                <td className="py-3 px-4">IV. ARUS KAS BERSIH / SURPLUS (DEFISIT) BULAN INI (A - B)</td>
                <td className={`py-3 px-4 text-right font-extrabold ${surplusDefisitBulanIni >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {surplusDefisitBulanIni >= 0 ? '+' : ''}{formatRupiah(surplusDefisitBulanIni)}
                </td>
              </tr>

              {/* Saldo Akhir */}
              <tr className="bg-emerald-800 text-white font-black text-sm">
                <td className="py-3.5 px-4 uppercase">
                  V. SALDO KAS AKHIR BULAN (POSISI PENUTUPAN BUKU KAS)
                </td>
                <td className="py-3.5 px-4 text-right text-base text-amber-300">
                  {formatRupiah(saldoAkhirBulanIni)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Tabel Rekap Transaksi Rinci Bulan Terpilih */}
        <div className="space-y-3 pt-4">
          <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
            <Coins className="w-4 h-4 text-emerald-700" />
            Jurnal Mutasi Transaksi Terverifikasi ({monthLabel} {selectedYear})
          </h4>

          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Tanggal</th>
                  <th className="py-2.5 px-3">Tipe</th>
                  <th className="py-2.5 px-3">Kategori</th>
                  <th className="py-2.5 px-3">Keterangan</th>
                  <th className="py-2.5 px-3 text-right">Nominal</th>
                  <th className="py-2.5 px-3">Petugas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {monthlyCashTransactions.length > 0 ? (
                  monthlyCashTransactions.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/70">
                      <td className="py-2 px-3 whitespace-nowrap">{formatDateIndo(t.date)}</td>
                      <td className="py-2 px-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          t.type === 'Masuk' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {t.type}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-semibold text-slate-800">{t.category}</td>
                      <td className="py-2 px-3 text-slate-600 max-w-xs truncate">{t.description}</td>
                      <td className={`py-2 px-3 text-right font-bold whitespace-nowrap ${
                        t.type === 'Masuk' ? 'text-emerald-700' : 'text-rose-600'
                      }`}>
                        {t.type === 'Masuk' ? '+' : '-'}{formatRupiah(t.amount)}
                      </td>
                      <td className="py-2 px-3 text-[11px] text-slate-500">{t.officer}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-400">
                      Tidak ada mutasi kas langsung yang tercatat pada periode ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Lembar Pengesahan */}
        <div className="pt-6 grid grid-cols-2 text-center text-xs text-slate-800">
          <div>
            <p className="text-slate-500 mb-14">Mengetahui &amp; Memverifikasi,</p>
            <p className="font-bold underline text-slate-950 text-sm">{profile.leaderName}</p>
            <p className="text-slate-600">Ketua Koperasi Patuh Pacu</p>
          </div>
          <div>
            <p className="text-slate-500 mb-14">
              {profile.regency}, {formatDateIndo(new Date().toISOString().split('T')[0])}
            </p>
            <p className="font-bold underline text-slate-950 text-sm">{profile.treasurerName}</p>
            <p className="text-slate-600">Bendahara Koperasi Patuh Pacu</p>
          </div>
        </div>
      </div>
    </div>
  );
};
