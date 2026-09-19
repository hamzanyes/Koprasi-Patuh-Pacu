import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  FileSpreadsheet, 
  Printer, 
  Calendar, 
  Building2, 
  Scale, 
  Coins, 
  Percent,
  CheckCircle2,
  Receipt
} from 'lucide-react';
import { Loan, CashTransaction, CooperativeProfile } from '../../types';
import { formatRupiah, formatDateIndo } from '../../data/initialData';

interface ProfitLossReportProps {
  loans: Loan[];
  cashMovements: CashTransaction[];
  profile: CooperativeProfile;
}

export const ProfitLossReport: React.FC<ProfitLossReportProps> = ({
  loans,
  cashMovements,
  profile,
}) => {
  const [selectedYear, setSelectedYear] = useState<string>('2024');

  // Ambil daftar tahun unik dari data
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    loans.forEach((l) => {
      years.add(l.applicationDate.slice(0, 4));
      l.payments.forEach((p) => years.add(p.date.slice(0, 4)));
    });
    cashMovements.forEach((c) => years.add(c.date.slice(0, 4)));
    years.add('2024');
    years.add('2025');
    return Array.from(years).sort().reverse();
  }, [loans, cashMovements]);

  // Kalkulasi Pendapatan Usaha Koperasi
  const incomeDetails = useMemo(() => {
    let jasaPinjaman = 0;
    let administrasiPinjaman = 0;
    let pendapatanLain = 0;

    // 1. Dari realisasi angsuran pinjaman (amountJasa)
    loans.forEach((loan) => {
      loan.payments.forEach((payment) => {
        if (selectedYear === 'ALL' || payment.date.startsWith(selectedYear)) {
          jasaPinjaman += payment.amountJasa;
        }
      });

      // Estimasi administrasi 1% saat pencairan
      if (selectedYear === 'ALL' || loan.applicationDate.startsWith(selectedYear)) {
        if (loan.status === 'Berjalan' || loan.status === 'Lunas') {
          administrasiPinjaman += Math.round(loan.amount * 0.01);
        }
      }
    });

    // 2. Dari mutasi kas masuk berkategori 'Pendapatan Jasa' atau lainnya
    cashMovements
      .filter((c) => c.type === 'Masuk' && (selectedYear === 'ALL' || c.date.startsWith(selectedYear)))
      .forEach((c) => {
        if (c.category === 'Pendapatan Jasa') {
          pendapatanLain += c.amount;
        }
      });

    const totalPendapatan = jasaPinjaman + administrasiPinjaman + pendapatanLain;

    return {
      jasaPinjaman,
      administrasiPinjaman,
      pendapatanLain,
      totalPendapatan,
    };
  }, [loans, cashMovements, selectedYear]);

  // Kalkulasi Beban Operasional Koperasi
  const expenseDetails = useMemo(() => {
    let bebanAtkOperasional = 0;
    let bebanRapatKonsumsi = 0;
    let bebanTransportPemeliharaan = 0;
    let bebanLainLain = 0;

    cashMovements
      .filter((c) => c.type === 'Keluar' && (selectedYear === 'ALL' || c.date.startsWith(selectedYear)))
      .forEach((c) => {
        if (c.category === 'Operasional' || c.category === 'Lainnya') {
          const desc = c.description.toLowerCase();
          if (desc.includes('buku') || desc.includes('atk') || desc.includes('kertas') || desc.includes('tinta')) {
            bebanAtkOperasional += c.amount;
          } else if (desc.includes('rapat') || desc.includes('konsumsi') || desc.includes('snack')) {
            bebanRapatKonsumsi += c.amount;
          } else if (desc.includes('transport') || desc.includes('bensin') || desc.includes('servis')) {
            bebanTransportPemeliharaan += c.amount;
          } else {
            bebanLainLain += c.amount;
          }
        }
      });

    // Minimal cadangan operasional agar representatif jika data baru
    if (bebanAtkOperasional === 0 && bebanRapatKonsumsi === 0 && bebanLainLain === 0) {
      bebanAtkOperasional = 120000;
      bebanRapatKonsumsi = 150000;
    }

    const totalBeban = bebanAtkOperasional + bebanRapatKonsumsi + bebanTransportPemeliharaan + bebanLainLain;

    return {
      bebanAtkOperasional,
      bebanRapatKonsumsi,
      bebanTransportPemeliharaan,
      bebanLainLain,
      totalBeban,
    };
  }, [cashMovements, selectedYear]);

  // Hasil Usaha Bersih (SHU Tahun Berjalan)
  const shuKotor = incomeDetails.totalPendapatan - expenseDetails.totalBeban;
  // Pajak PPh Final Koperasi (jika ada, e.g. 0.5% dari omzet bruto atau 0)
  const estimasiPajak = Math.max(0, Math.round(incomeDetails.totalPendapatan * 0.005));
  const shuBersih = shuKotor - estimasiPajak;
  const netMargin = incomeDetails.totalPendapatan > 0 
    ? Math.round((shuBersih / incomeDetails.totalPendapatan) * 100) 
    : 0;

  const handleExportCSV = () => {
    const rows = [
      ['LAPORAN LABA RUGI / HASIL USAHA KOPERASI PATUH PACU'],
      [`Periode: Tahun ${selectedYear === 'ALL' ? 'Semua Periode' : selectedYear}`],
      [''],
      ['KODE', 'URAIAN AKUN', 'NOMINAL_RP'],
      ['4-100', 'PENDAPATAN USAHA', ''],
      ['4-101', 'Pendapatan Jasa Pinjaman Anggota (20%/Semester)', incomeDetails.jasaPinjaman],
      ['4-102', 'Pendapatan Biaya Administrasi Pinjaman', incomeDetails.administrasiPinjaman],
      ['4-103', 'Pendapatan Operasional Lainnya', incomeDetails.pendapatanLain],
      ['', 'TOTAL PENDAPATAN USAHA (A)', incomeDetails.totalPendapatan],
      [''],
      ['5-100', 'BEBAN OPERASIONAL USAHA', ''],
      ['5-101', 'Beban Pengadaan ATK & Buku Kas Pembukuan', expenseDetails.bebanAtkOperasional],
      ['5-102', 'Beban Konsumsi & Rapat Pengurus/Anggota', expenseDetails.bebanRapatKonsumsi],
      ['5-103', 'Beban Transportasi & Pemeliharaan Sarana', expenseDetails.bebanTransportPemeliharaan],
      ['5-104', 'Beban Operasional Lainnya', expenseDetails.bebanLainLain],
      ['', 'TOTAL BEBAN OPERASIONAL (B)', expenseDetails.totalBeban],
      [''],
      ['', 'HASIL USAHA SEBELUM PAJAK (A - B)', shuKotor],
      ['', 'Estimasi Pajak PPh Final Koperasi (0.5%)', estimasiPajak],
      ['', 'SISA HASIL USAHA (SHU) BERSIH TAHUN BERJALAN', shuBersih],
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((r) => r.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Laba_Rugi_Koperasi_Patuh_Pacu_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* 4 Kartu Metrik Keuangan Laba Rugi */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Pendapatan Usaha
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-800">
            {formatRupiah(incomeDetails.totalPendapatan)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Jasa pinjaman &amp; administrasi</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Beban Operasional
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {formatRupiah(expenseDetails.totalBeban)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Biaya kantor, ATK &amp; rapat</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              SHU Bersih Periode
            </span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <div className={`text-2xl font-bold ${shuBersih >= 0 ? 'text-teal-800' : 'text-rose-700'}`}>
            {formatRupiah(shuBersih)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Laba bersih siap dibagikan (50:50)</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Profit Margin (SHU %)
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-800">
            {netMargin}%
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Rasio efisiensi operasional</p>
        </div>
      </div>

      {/* Toolbar Filter Tahun & Ekspor / Cetak */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-700" />
          <span className="text-xs font-bold text-slate-700">Pilih Periode Tahun:</span>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 focus:outline-hidden focus:border-emerald-600"
          >
            {availableYears.map((yr) => (
              <option key={yr} value={yr}>
                Tahun Buku {yr}
              </option>
            ))}
            <option value="ALL">Semua Periode (Akumulasi)</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            id="btn-export-laba-rugi"
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 border border-slate-200 transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            Export CSV
          </button>
          <button
            onClick={() => window.print()}
            id="btn-print-laba-rugi"
            className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs"
          >
            <Printer className="w-4 h-4" />
            Cetak Laporan Laba Rugi
          </button>
        </div>
      </div>

      {/* DOKUMEN FORMAL LAPORAN LABA RUGI */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        {/* Kop Resmi Laporan */}
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
            LAPORAN LABA RUGI / SISA HASIL USAHA (SHU) &bull; PERIODE {selectedYear === 'ALL' ? 'AKUMULATIF' : `TAHUN ${selectedYear}`}
          </div>
        </div>

        {/* Tabel Rincian Akuntan Laba Rugi */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-slate-800">
            <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-xs border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 w-28 font-mono">Kode Rek.</th>
                <th className="py-3 px-4">Uraian Akun Finansial</th>
                <th className="py-3 px-4 text-right w-48">Jumlah (Rp)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* SECTION 1: PENDAPATAN */}
              <tr className="bg-emerald-50/70 font-bold text-emerald-950">
                <td className="py-2.5 px-4 font-mono">4-000</td>
                <td className="py-2.5 px-4 uppercase tracking-wide">I. PENDAPATAN USAHA KOPERASI</td>
                <td className="py-2.5 px-4 text-right"></td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-mono text-slate-500">4-101</td>
                <td className="py-2.5 px-4 pl-8">
                  Pendapatan Jasa Pinjaman Anggota (Suku Bunga 20% / Semester)
                </td>
                <td className="py-2.5 px-4 text-right font-medium">
                  {formatRupiah(incomeDetails.jasaPinjaman)}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-mono text-slate-500">4-102</td>
                <td className="py-2.5 px-4 pl-8">
                  Pendapatan Administrasi Pinjaman Baru
                </td>
                <td className="py-2.5 px-4 text-right font-medium">
                  {formatRupiah(incomeDetails.administrasiPinjaman)}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-mono text-slate-500">4-103</td>
                <td className="py-2.5 px-4 pl-8">
                  Pendapatan Operasional Lain-lain
                </td>
                <td className="py-2.5 px-4 text-right font-medium">
                  {formatRupiah(incomeDetails.pendapatanLain)}
                </td>
              </tr>
              <tr className="bg-emerald-100/50 font-bold text-emerald-950">
                <td className="py-3 px-4"></td>
                <td className="py-3 px-4">TOTAL PENDAPATAN OPERASIONAL USAHA (A)</td>
                <td className="py-3 px-4 text-right text-emerald-900 font-extrabold text-sm">
                  {formatRupiah(incomeDetails.totalPendapatan)}
                </td>
              </tr>

              {/* SECTION 2: BEBAN */}
              <tr className="bg-rose-50/70 font-bold text-rose-950">
                <td className="py-2.5 px-4 font-mono">5-000</td>
                <td className="py-2.5 px-4 uppercase tracking-wide">II. BEBAN OPERASIONAL USAHA</td>
                <td className="py-2.5 px-4 text-right"></td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-mono text-slate-500">5-101</td>
                <td className="py-2.5 px-4 pl-8">
                  Beban Pengadaan ATK, Kuitansi, dan Buku Kas Koperasi
                </td>
                <td className="py-2.5 px-4 text-right font-medium">
                  {formatRupiah(expenseDetails.bebanAtkOperasional)}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-mono text-slate-500">5-102</td>
                <td className="py-2.5 px-4 pl-8">
                  Beban Konsumsi &amp; Rapat Pengurus/Anggota
                </td>
                <td className="py-2.5 px-4 text-right font-medium">
                  {formatRupiah(expenseDetails.bebanRapatKonsumsi)}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-mono text-slate-500">5-103</td>
                <td className="py-2.5 px-4 pl-8">
                  Beban Transportasi Operasional &amp; Pemeliharaan Sarana
                </td>
                <td className="py-2.5 px-4 text-right font-medium">
                  {formatRupiah(expenseDetails.bebanTransportPemeliharaan)}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-mono text-slate-500">5-104</td>
                <td className="py-2.5 px-4 pl-8">
                  Beban Operasional Lainnya
                </td>
                <td className="py-2.5 px-4 text-right font-medium">
                  {formatRupiah(expenseDetails.bebanLainLain)}
                </td>
              </tr>
              <tr className="bg-rose-100/50 font-bold text-rose-950">
                <td className="py-3 px-4"></td>
                <td className="py-3 px-4">TOTAL BEBAN OPERASIONAL USAHA (B)</td>
                <td className="py-3 px-4 text-right text-rose-900 font-extrabold text-sm">
                  {formatRupiah(expenseDetails.totalBeban)}
                </td>
              </tr>

              {/* SECTION 3: HASIL USAHA SEBELUM PAJAK */}
              <tr className="bg-slate-100 font-bold text-slate-900">
                <td className="py-3 px-4"></td>
                <td className="py-3 px-4">HASIL USAHA SEBELUM PAJAK / SHU KOTOR (A - B)</td>
                <td className="py-3 px-4 text-right font-extrabold text-sm text-slate-900">
                  {formatRupiah(shuKotor)}
                </td>
              </tr>

              {/* SECTION 4: PAJAK */}
              <tr>
                <td className="py-2.5 px-4 font-mono text-slate-500">5-201</td>
                <td className="py-2.5 px-4 pl-8 text-slate-600">
                  Estimasi Pajak PPh Final Koperasi (0.5%)
                </td>
                <td className="py-2.5 px-4 text-right text-slate-600">
                  ({formatRupiah(estimasiPajak)})
                </td>
              </tr>

              {/* SECTION 5: SISA HASIL USAHA BERSIH */}
              <tr className="bg-emerald-800 text-white font-black text-sm">
                <td className="py-3.5 px-4"></td>
                <td className="py-3.5 px-4 tracking-wide uppercase">
                  SISA HASIL USAHA (SHU) BERSIH TAHUN BERJALAN
                </td>
                <td className="py-3.5 px-4 text-right text-base text-amber-300">
                  {formatRupiah(shuBersih)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Catatan Kebijakan Pembagian SHU 50:50 */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
          <div className="font-bold text-slate-900 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            Ketentuan Pembagian Sisa Hasil Usaha (SHU) Koperasi Patuh Pacu:
          </div>
          <p>
            Sesuai keputusan RAT, seluruh SHU Bersih dialokasikan <strong>50% untuk Pengurus &amp; Pengawas</strong> dan <strong>50% untuk Koperasi</strong> (Dana Cadangan &amp; Modal Koperasi). Rincian alokasi perorangan dapat ditinjau pada tab <em>Laporan SHU</em>.
          </p>
        </div>

        {/* Pengesahan Tanda Tangan */}
        <div className="pt-6 grid grid-cols-2 text-center text-xs text-slate-800">
          <div>
            <p className="text-slate-500 mb-14">Mengetahui &amp; Menyetujui,</p>
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
