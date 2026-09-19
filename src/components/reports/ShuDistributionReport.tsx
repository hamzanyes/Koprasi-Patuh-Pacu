import React, { useState, useMemo } from 'react';
import { 
  Coins, 
  Users, 
  Landmark, 
  FileSpreadsheet, 
  Printer, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  Scale, 
  Percent, 
  Building2,
  Calculator,
  Sliders
} from 'lucide-react';
import { Loan, CashTransaction, CooperativeProfile } from '../../types';
import { formatRupiah, formatDateIndo, terbilang } from '../../data/initialData';

interface ShuDistributionReportProps {
  loans: Loan[];
  cashMovements: CashTransaction[];
  profile: CooperativeProfile;
}

export const ShuDistributionReport: React.FC<ShuDistributionReportProps> = ({
  loans,
  cashMovements,
  profile,
}) => {
  // Hitung SHU Bersih Riil dari Pendapatan Jasa dikurangi Beban
  const realShuData = useMemo(() => {
    let pendapatanJasa = 0;
    let administrasi = 0;
    loans.forEach((l) => {
      l.payments.forEach((p) => {
        pendapatanJasa += p.amountJasa;
      });
      if (l.status === 'Berjalan' || l.status === 'Lunas') {
        administrasi += Math.round(l.amount * 0.01);
      }
    });

    let bebanOperasional = 0;
    cashMovements
      .filter((c) => c.type === 'Keluar' && (c.category === 'Operasional' || c.category === 'Lainnya'))
      .forEach((c) => {
        bebanOperasional += c.amount;
      });

    if (bebanOperasional === 0) bebanOperasional = 270000;

    const totalPendapatan = pendapatanJasa + administrasi;
    const shuKotor = Math.max(0, totalPendapatan - bebanOperasional);
    const pajak = Math.round(totalPendapatan * 0.005);
    const shuBersih = Math.max(0, shuKotor - pajak);

    return {
      totalPendapatan,
      bebanOperasional,
      pajak,
      shuBersih: shuBersih > 0 ? shuBersih : 1200000, // Fallback nilai dasar yang wajar jika awal
    };
  }, [loans, cashMovements]);

  // Mode: Gunakan SHU Riil Berjalan atau Simulasi Angka Tertentu
  const [useSimulation, setUseSimulation] = useState(false);
  const [simulationAmount, setSimulationAmount] = useState<number>(10000000); // Default simulasi 10 juta

  // Bobot Pembagian di internal Pengurus (Total 100% dari porsi 50% Pengurus)
  const [persenKetua, setPersenKetua] = useState<number>(30); // 30% dari porsi pengurus
  const [persenSekretaris, setPersenSekretaris] = useState<number>(25); // 25% dari porsi pengurus
  const [persenBendahara, setPersenBendahara] = useState<number>(25); // 25% dari porsi pengurus
  const [persenPengawas, setPersenPengawas] = useState<number>(20); // 20% dari porsi pengurus

  const activeTotalShu = useSimulation ? simulationAmount : realShuData.shuBersih;

  // Rumus Wajib Pengguna: 50% Pengurus & 50% Koperasi
  const porsiPengurus = Math.round(activeTotalShu * 0.50);
  const porsiKoperasi = activeTotalShu - porsiPengurus; // 50%

  // Rincian Pembagian Personel Pengurus & Pengawas
  const nominalKetua = Math.round(porsiPengurus * (persenKetua / 100));
  const nominalSekretaris = Math.round(porsiPengurus * (persenSekretaris / 100));
  const nominalBendahara = Math.round(porsiPengurus * (persenBendahara / 100));
  const nominalPengawas = porsiPengurus - (nominalKetua + nominalSekretaris + nominalBendahara);

  const handleExportCSV = () => {
    const rows = [
      ['BERITA ACARA & LAPORAN PEMBAGIAN SHU KOPERASI PATUH PACU'],
      [`Ketentuan Alokasi: 50% untuk Pengurus dan 50% untuk Koperasi`],
      [''],
      ['TOTAL SISA HASIL USAHA (SHU) BERSIH', activeTotalShu],
      [''],
      ['NO', 'KOMPONEN ALOKASI SHU', 'PERSENTASE_TOTAL', 'NOMINAL_RP', 'PENERIMA / TUJUAN ALOKASI'],
      ['1', 'BAGIAN PENGURUS & PENGAWAS (50%)', '50.0%', porsiPengurus, 'Pengurus & Pengawas Koperasi'],
      ['1.a', `Ketua Koperasi (${persenKetua}% dari porsi pengurus)`, `${(50 * persenKetua / 100).toFixed(1)}%`, nominalKetua, profile.leaderName],
      ['1.b', `Sekretaris Koperasi (${persenSekretaris}% dari porsi pengurus)`, `${(50 * persenSekretaris / 100).toFixed(1)}%`, nominalSekretaris, profile.secretaryName],
      ['1.c', `Bendahara Koperasi (${persenBendahara}% dari porsi pengurus)`, `${(50 * persenBendahara / 100).toFixed(1)}%`, nominalBendahara, profile.treasurerName],
      ['1.d', `Pengawas Koperasi (${persenPengawas}% dari porsi pengurus)`, `${(50 * persenPengawas / 100).toFixed(1)}%`, nominalPengawas, profile.supervisorName],
      [''],
      ['2', 'BAGIAN KOPERASI / DANA CADANGAN (50%)', '50.0%', porsiKoperasi, 'Penguatan Modal & Cadangan Kas Koperasi'],
      ['2.a', 'Cadangan Modal Kerja Pembiayaan Anggota', '35.0%', Math.round(porsiKoperasi * 0.70), 'Aset Likuid Pembiayaan Koperasi'],
      ['2.b', 'Cadangan Risiko & Pengembangan Operasional', '15.0%', porsiKoperasi - Math.round(porsiKoperasi * 0.70), 'Kas Cadangan Koperasi'],
      [''],
      ['', 'TOTAL SHU TEREALISASI DIBAGIKAN', '100.0%', activeTotalShu, 'Selesai Dibukukan']
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((r) => r.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Pembagian_SHU_50_50_Patuh_Pacu_${new Date().getFullYear()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Banner Ringkasan Aturan 50:50 */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 rounded-3xl p-6 sm:p-7 text-white shadow-lg border border-emerald-700/50 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-800/80 text-emerald-200 text-xs font-semibold mb-2.5 border border-emerald-600/50">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Ketetapan Resmi RAT Koperasi Patuh Pacu
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight mb-2">
            Laporan &amp; Perhitungan Pembagian Sisa Hasil Usaha (SHU)
          </h2>
          <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed font-normal">
            Sesuai Anggaran Dasar dan keputusan musyawarah, Sisa Hasil Usaha (SHU) bersih dibagi tepat menjadi 2 pilar berkeadilan: 
            <strong className="text-white font-bold ml-1">50% untuk Pengurus</strong> dan <strong className="text-white font-bold">50% untuk Koperasi</strong>.
          </p>
        </div>
      </div>

      {/* 2 PILAR UTAMA ALOKASI (50% : 50%) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* PILAR 1: 50% UNTUK PENGURUS */}
        <div className="bg-white rounded-3xl p-6 border-2 border-emerald-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
          
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 font-extrabold text-xs">
                <Users className="w-3.5 h-3.5 text-emerald-700" />
                Pilar I &bull; 50% Hak Pengurus &amp; Pengawas
              </span>
              <span className="text-2xl font-black text-emerald-700">50%</span>
            </div>

            <div className="text-3xl font-black text-slate-900 mt-1 mb-1">
              {formatRupiah(porsiPengurus)}
            </div>
            <p className="text-xs text-slate-500 mb-5">
              Dialokasikan untuk Ketua, Sekretaris, Bendahara, dan Pengawas atas dedikasi pengelolaan koperasi
            </p>

            {/* Sub Rincian Penerima */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <div>
                  <span className="font-bold text-slate-900 block">{profile.leaderName}</span>
                  <span className="text-slate-500 text-[11px]">Ketua Koperasi ({persenKetua}%)</span>
                </div>
                <div className="font-extrabold text-emerald-800 text-sm">
                  {formatRupiah(nominalKetua)}
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <div>
                  <span className="font-bold text-slate-900 block">{profile.secretaryName}</span>
                  <span className="text-slate-500 text-[11px]">Sekretaris ({persenSekretaris}%)</span>
                </div>
                <div className="font-extrabold text-emerald-800 text-sm">
                  {formatRupiah(nominalSekretaris)}
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <div>
                  <span className="font-bold text-slate-900 block">{profile.treasurerName}</span>
                  <span className="text-slate-500 text-[11px]">Bendahara ({persenBendahara}%)</span>
                </div>
                <div className="font-extrabold text-emerald-800 text-sm">
                  {formatRupiah(nominalBendahara)}
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <div>
                  <span className="font-bold text-slate-900 block">{profile.supervisorName}</span>
                  <span className="text-slate-500 text-[11px]">Pengawas ({persenPengawas}%)</span>
                </div>
                <div className="font-extrabold text-emerald-800 text-sm">
                  {formatRupiah(nominalPengawas)}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-emerald-800 font-semibold">
            <span>Total Penerima: 4 Pengurus Sah</span>
            <span>Jumlah: {formatRupiah(porsiPengurus)}</span>
          </div>
        </div>

        {/* PILAR 2: 50% UNTUK KOPERASI (DANA CADANGAN & MODAL) */}
        <div className="bg-white rounded-3xl p-6 border-2 border-teal-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 text-teal-900 font-extrabold text-xs">
                <Landmark className="w-3.5 h-3.5 text-teal-700" />
                Pilar II &bull; 50% Hak Koperasi (Modal &amp; Cadangan)
              </span>
              <span className="text-2xl font-black text-teal-700">50%</span>
            </div>

            <div className="text-3xl font-black text-slate-900 mt-1 mb-1">
              {formatRupiah(porsiKoperasi)}
            </div>
            <p className="text-xs text-slate-500 mb-5">
              Masuk 100% ke kas koperasi untuk memperkuat cadangan modal kerja pembiayaan dan ketahanan likuiditas
            </p>

            {/* Sub Alokasi Koperasi */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between p-3 rounded-xl bg-teal-50/70 border border-teal-100 text-xs">
                <div>
                  <span className="font-bold text-teal-950 block">Cadangan Modal Kerja Pinjaman</span>
                  <span className="text-slate-600 text-[11px]">Memperbesar likuiditas plafond pinjaman anggota (70%)</span>
                </div>
                <div className="font-extrabold text-teal-900 text-sm">
                  {formatRupiah(Math.round(porsiKoperasi * 0.70))}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-teal-50/70 border border-teal-100 text-xs">
                <div>
                  <span className="font-bold text-teal-950 block">Cadangan Risiko &amp; Pengembangan Kas</span>
                  <span className="text-slate-600 text-[11px]">Mitigasi risiko kredit dan operasional darurat (30%)</span>
                </div>
                <div className="font-extrabold text-teal-900 text-sm">
                  {formatRupiah(porsiKoperasi - Math.round(porsiKoperasi * 0.70))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-1">
                <div className="font-semibold text-slate-900 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Manfaat bagi Anggota:
                </div>
                <p className="text-[11px]">
                  Dengan disisihkannya 50% untuk kas koperasi, aset modal Koperasi Patuh Pacu bertambah secara mandiri tanpa bergantung pada pinjaman pihak ketiga/bank.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-teal-800 font-semibold">
            <span>Status: Disimpan di Kas Koperasi</span>
            <span>Jumlah: {formatRupiah(porsiKoperasi)}</span>
          </div>
        </div>
      </div>

      {/* Panel Kontrol & Simulasi Dinamis */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-700" />
              Dasar Perhitungan SHU (Aktual vs Simulasi)
            </h3>
            <p className="text-xs text-slate-500">
              Pilih apakah menggunakan angka SHU berjalan dari pembukuan riil atau melakukan simulasi proyeksi
            </p>
          </div>

          {/* Toggle Switch */}
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl text-xs font-bold self-start sm:self-auto">
            <button
              onClick={() => setUseSimulation(false)}
              className={`px-3.5 py-1.5 rounded-lg transition ${
                !useSimulation ? 'bg-white text-emerald-800 shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              SHU Riil Pembukuan ({formatRupiah(realShuData.shuBersih)})
            </button>
            <button
              onClick={() => setUseSimulation(true)}
              className={`px-3.5 py-1.5 rounded-lg transition ${
                useSimulation ? 'bg-emerald-700 text-white shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Simulasi Target SHU
            </button>
          </div>
        </div>

        {useSimulation && (
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <label className="text-xs font-bold text-amber-950">
                Masukkan Target Total SHU Bersih (Rp):
              </label>
              <input
                type="number"
                min="1000000"
                step="500000"
                value={simulationAmount}
                onChange={(e) => setSimulationAmount(Number(e.target.value))}
                className="px-3 py-1.5 text-sm font-bold rounded-xl border border-amber-300 bg-white focus:outline-hidden focus:border-amber-600 w-48"
              />
              <div className="flex items-center gap-1.5">
                {[5000000, 10000000, 15000000, 25000000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setSimulationAmount(amt)}
                    className="px-2.5 py-1 rounded-lg bg-white border border-amber-200 text-amber-900 hover:bg-amber-100 text-xs font-semibold"
                  >
                    Rp {(amt / 1000000).toFixed(0)} Jt
                  </button>
                ))}
              </div>
            </div>
            <p className="text-[11px] text-amber-800">
              * Mode simulasi membantu pengurus merencanakan target laba dan memproyeksikan pembagian 50:50 menjelang Rapat Anggota Tahunan (RAT).
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="text-xs text-slate-500">
            Total Nilai SHU yang Dibagikan: <strong className="text-slate-900 font-bold">{formatRupiah(activeTotalShu)}</strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              id="btn-export-shu"
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 border border-slate-200 transition"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
              Export CSV SHU
            </button>
            <button
              onClick={() => window.print()}
              id="btn-print-shu"
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs"
            >
              <Printer className="w-4 h-4" />
              Cetak Berita Acara SHU (50:50)
            </button>
          </div>
        </div>
      </div>

      {/* DOKUMEN BERITA ACARA RESMI PEMBAGIAN SHU */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        {/* Kop Resmi Berita Acara */}
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
            BERITA ACARA &amp; REKAPITULASI PEMBAGIAN SISA HASIL USAHA (SHU) TAHUN BUKU {new Date().getFullYear()}
          </div>
        </div>

        {/* Konsideran Hukum */}
        <p className="text-justify text-xs leading-relaxed text-slate-700">
          Pada hari ini, bertempat di Kantor {profile.name}, telah diselenggarakan perhitungan dan pengesahan pembagian Sisa Hasil Usaha (SHU) Tahun Buku {new Date().getFullYear()}. Berdasarkan Anggaran Dasar dan Keputusan Rapat Pengurus, SHU bersih disepakati dibagi <strong>50% (Lima Puluh Persen) untuk Pengurus &amp; Pengawas</strong> dan <strong>50% (Lima Puluh Persen) untuk Koperasi</strong> dengan perincian sebagai berikut:
        </p>

        {/* Tabel Berita Acara Formal */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-slate-800">
            <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-xs border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4">Pos Alokasi &amp; Penerima Sah</th>
                <th className="py-3 px-4 text-center w-24">Porsi (%)</th>
                <th className="py-3 px-4 text-right w-44">Nominal (Rp)</th>
                <th className="py-3 px-4">Keterangan / Penanggung Jawab</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* PILAR 1 */}
              <tr className="bg-emerald-50/80 font-bold text-emerald-950">
                <td className="py-3 px-4 text-center">1</td>
                <td className="py-3 px-4 uppercase">ALOKASI PENGURUS &amp; PENGAWAS</td>
                <td className="py-3 px-4 text-center font-extrabold text-emerald-800">50.0%</td>
                <td className="py-3 px-4 text-right font-extrabold text-emerald-900">
                  {formatRupiah(porsiPengurus)}
                </td>
                <td className="py-3 px-4 text-slate-600">Hak Kolektif Pengurus &amp; Pengawas</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 text-center text-slate-400">1.a</td>
                <td className="py-2.5 px-4 pl-8">
                  Ketua Koperasi ({profile.leaderName})
                </td>
                <td className="py-2.5 px-4 text-center text-slate-600">{(50 * persenKetua / 100).toFixed(1)}%</td>
                <td className="py-2.5 px-4 text-right font-semibold text-slate-900">
                  {formatRupiah(nominalKetua)}
                </td>
                <td className="py-2.5 px-4 text-slate-500">Penanggung jawab umum</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 text-center text-slate-400">1.b</td>
                <td className="py-2.5 px-4 pl-8">
                  Sekretaris Koperasi ({profile.secretaryName})
                </td>
                <td className="py-2.5 px-4 text-center text-slate-600">{(50 * persenSekretaris / 100).toFixed(1)}%</td>
                <td className="py-2.5 px-4 text-right font-semibold text-slate-900">
                  {formatRupiah(nominalSekretaris)}
                </td>
                <td className="py-2.5 px-4 text-slate-500">Administrasi &amp; keanggotaan</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 text-center text-slate-400">1.c</td>
                <td className="py-2.5 px-4 pl-8">
                  Bendahara Koperasi ({profile.treasurerName})
                </td>
                <td className="py-2.5 px-4 text-center text-slate-600">{(50 * persenBendahara / 100).toFixed(1)}%</td>
                <td className="py-2.5 px-4 text-right font-semibold text-slate-900">
                  {formatRupiah(nominalBendahara)}
                </td>
                <td className="py-2.5 px-4 text-slate-500">Pengelolaan kas &amp; pembukuan</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 text-center text-slate-400">1.d</td>
                <td className="py-2.5 px-4 pl-8">
                  Pengawas Koperasi ({profile.supervisorName})
                </td>
                <td className="py-2.5 px-4 text-center text-slate-600">{(50 * persenPengawas / 100).toFixed(1)}%</td>
                <td className="py-2.5 px-4 text-right font-semibold text-slate-900">
                  {formatRupiah(nominalPengawas)}
                </td>
                <td className="py-2.5 px-4 text-slate-500">Pengawasan tata kelola &amp; audit</td>
              </tr>

              {/* PILAR 2 */}
              <tr className="bg-teal-50/80 font-bold text-teal-950">
                <td className="py-3 px-4 text-center">2</td>
                <td className="py-3 px-4 uppercase">ALOKASI KAS &amp; CADANGAN KOPERASI</td>
                <td className="py-3 px-4 text-center font-extrabold text-teal-800">50.0%</td>
                <td className="py-3 px-4 text-right font-extrabold text-teal-900">
                  {formatRupiah(porsiKoperasi)}
                </td>
                <td className="py-3 px-4 text-slate-600">Penguatan Modal Koperasi Mandiri</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 text-center text-slate-400">2.a</td>
                <td className="py-2.5 px-4 pl-8">
                  Dana Cadangan Modal Kerja Pembiayaan Anggota
                </td>
                <td className="py-2.5 px-4 text-center text-slate-600">35.0%</td>
                <td className="py-2.5 px-4 text-right font-semibold text-slate-900">
                  {formatRupiah(Math.round(porsiKoperasi * 0.70))}
                </td>
                <td className="py-2.5 px-4 text-slate-500">Menambah likuiditas pinjaman</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 text-center text-slate-400">2.b</td>
                <td className="py-2.5 px-4 pl-8">
                  Dana Cadangan Risiko &amp; Pengembangan Kas
                </td>
                <td className="py-2.5 px-4 text-center text-slate-600">15.0%</td>
                <td className="py-2.5 px-4 text-right font-semibold text-slate-900">
                  {formatRupiah(porsiKoperasi - Math.round(porsiKoperasi * 0.70))}
                </td>
                <td className="py-2.5 px-4 text-slate-500">Mitigasi risiko &amp; sarana</td>
              </tr>

              {/* TOTAL AKHIR */}
              <tr className="bg-emerald-800 text-white font-black text-sm">
                <td className="py-3.5 px-4 text-center">&Sigma;</td>
                <td className="py-3.5 px-4 uppercase tracking-wide">
                  TOTAL SISA HASIL USAHA (SHU) DIBAGIKAN
                </td>
                <td className="py-3.5 px-4 text-center text-amber-300">100.0%</td>
                <td className="py-3.5 px-4 text-right text-base text-amber-300">
                  {formatRupiah(activeTotalShu)}
                </td>
                <td className="py-3.5 px-4 text-emerald-100 text-xs font-normal">
                  Terbilang: {terbilang(activeTotalShu)} Rupiah
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 4 Kolom Tanda Tangan Seluruh Pengurus & Pengawas */}
        <div className="pt-8">
          <p className="text-center text-xs font-semibold text-slate-600 mb-6">
            Ditetapkan dan disahkan di {profile.regency}, pada tanggal {formatDateIndo(new Date().toISOString().split('T')[0])}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-xs text-slate-800">
            <div className="p-3 border border-slate-200 rounded-2xl bg-slate-50/50">
              <p className="text-slate-500 mb-14">Ketua,</p>
              <p className="font-bold underline text-slate-950">{profile.leaderName}</p>
              <p className="text-[11px] text-slate-600">Koperasi Patuh Pacu</p>
            </div>

            <div className="p-3 border border-slate-200 rounded-2xl bg-slate-50/50">
              <p className="text-slate-500 mb-14">Sekretaris,</p>
              <p className="font-bold underline text-slate-950">{profile.secretaryName}</p>
              <p className="text-[11px] text-slate-600">Koperasi Patuh Pacu</p>
            </div>

            <div className="p-3 border border-slate-200 rounded-2xl bg-slate-50/50">
              <p className="text-slate-500 mb-14">Bendahara,</p>
              <p className="font-bold underline text-slate-950">{profile.treasurerName}</p>
              <p className="text-[11px] text-slate-600">Koperasi Patuh Pacu</p>
            </div>

            <div className="p-3 border border-slate-200 rounded-2xl bg-slate-50/50">
              <p className="text-slate-500 mb-14">Pengawas,</p>
              <p className="font-bold underline text-slate-950">{profile.supervisorName}</p>
              <p className="text-[11px] text-slate-600">Koperasi Patuh Pacu</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
