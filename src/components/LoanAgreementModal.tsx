import React from 'react';
import { Printer, X, FileText, CheckCircle2, ShieldCheck, Building2 } from 'lucide-react';
import { Loan, Member } from '../types';
import { formatRupiah, formatDateIndo, terbilang } from '../data/initialData';

interface LoanAgreementModalProps {
  loan: Loan;
  member?: Member;
  onClose: () => void;
}

export const LoanAgreementModal: React.FC<LoanAgreementModalProps> = ({
  loan,
  member,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  // Perhitungan Angsuran & Suku Bunga 20% Per Semester
  // Bunga 20% per semester (6 bulan) = 20% / 6 = 3.33% per bulan
  const semesterRate = 20; // 20% per semester
  const monthlyJasa = Math.round((loan.amount * 0.20) / 6);
  const monthlyPokok = Math.round(loan.amount / loan.tenorMonths);
  const monthlyInstallment = loan.monthlyInstallment || (monthlyPokok + monthlyJasa);
  const totalRepayment = monthlyInstallment * loan.tenorMonths;
  const totalInterest = monthlyJasa * loan.tenorMonths;

  const agreementNo = `SPP/KPP/${new Date(loan.applicationDate).getFullYear() || '2024'}/${loan.loanNo.replace('PINJ-', '')}`;
  const receiptNo = `KPP-KCR-${loan.loanNo.replace('PINJ-', '')}`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 my-4 overflow-hidden flex flex-col max-h-[95vh]">
        {/* Header Modal (Tersembunyi saat Cetak) */}
        <div className="print:hidden px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">
                Surat Perjanjian Pinjaman &amp; Kuitansi Pencairan
              </h3>
              <p className="text-xs text-slate-300">
                Dokumen akad sah pembiayaan &bull; Suku Bunga 20% per semester
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              id="btn-print-agreement"
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Konten Cetak Resmi (Printable Area) */}
        <div id="printable-agreement" className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-900 text-xs sm:text-sm bg-white leading-relaxed">
          {/* 1. KOP SURAT RESMI KOPERASI */}
          <div className="border-b-4 border-double border-slate-800 pb-4 text-center relative">
            <div className="flex items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0">
                <Building2 className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-black tracking-wide text-slate-900 uppercase">
                  Koperasi Simpan Pinjam Patuh Pacu
                </h1>
                <p className="text-xs font-semibold text-emerald-800 tracking-wider">
                  BADAN HUKUM: AHU-0003412.AH.01.26.TAHUN 2021 &bull; IZIN USP: 518/024/BH/PAD/PACU/X/2021
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Jl. Niaga Patuh No. 01, Pacu Raya, Kec. Patuh Pacu &bull; Telp / WA: 0812-8821-4431
                </p>
              </div>
            </div>
          </div>

          {/* 2. JUDUL SURAT PERJANJIAN */}
          <div className="text-center space-y-1">
            <h2 className="text-base sm:text-lg font-extrabold uppercase underline decoration-2 underline-offset-4 text-slate-900">
              Surat Perjanjian Pinjaman Anggota (SPPA)
            </h2>
            <p className="font-mono text-xs font-semibold text-slate-600">
              Nomor Registrasi: {agreementNo}
            </p>
          </div>

          {/* Keterangan Pembuka */}
          <p className="text-justify text-xs sm:text-[13px] text-slate-700">
            Pada hari ini, tanggal <strong>{formatDateIndo(loan.applicationDate)}</strong>, bertempat di Kantor Koperasi Patuh Pacu, kami yang bertanda tangan di bawah ini telah sepakat mengadakan Perjanjian Pinjaman Pembiayaan Anggota:
          </p>

          {/* Identitas Para Pihak */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs sm:text-[13px]">
            <div className="space-y-1">
              <div className="font-bold text-slate-900 text-xs uppercase tracking-wider text-emerald-800">
                1. PIHAK PERTAMA (Pemberi Fasilitas Pinjaman / Koperasi):
              </div>
              <div className="grid grid-cols-3 gap-1 pl-4 text-slate-700">
                <span className="text-slate-500">Nama Lembaga</span>
                <span className="col-span-2 font-semibold text-slate-900">: KOPERASI SIMPAN PINJAM PATUH PACU</span>
                <span className="text-slate-500">Diwakili Oleh</span>
                <span className="col-span-2 font-semibold text-slate-900">: Pengurus / Bendahara Koperasi Patuh Pacu</span>
                <span className="text-slate-500">Alamat Kantor</span>
                <span className="col-span-2">: Jl. Niaga Patuh No. 01, Pacu Raya</span>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-2 space-y-1">
              <div className="font-bold text-slate-900 text-xs uppercase tracking-wider text-emerald-800">
                2. PIHAK KEDUA (Penerima Pinjaman / Anggota):
              </div>
              <div className="grid grid-cols-3 gap-1 pl-4 text-slate-700">
                <span className="text-slate-500">Nama Lengkap</span>
                <span className="col-span-2 font-bold text-slate-900">: {loan.memberName}</span>
                <span className="text-slate-500">Nomor Anggota</span>
                <span className="col-span-2 font-mono font-semibold text-slate-900">: {loan.memberNo}</span>
                <span className="text-slate-500">NIK (KTP)</span>
                <span className="col-span-2 font-mono">: {member?.nik || '-'}</span>
                <span className="text-slate-500">No. Handphone / WA</span>
                <span className="col-span-2">: {member?.phone || '-'}</span>
                <span className="text-slate-500">Alamat Domisili</span>
                <span className="col-span-2">: {member?.address || '-'}</span>
              </div>
            </div>
          </div>

          {/* Pasal-Pasal Perjanjian */}
          <div className="space-y-3.5 text-xs sm:text-[13px] text-justify text-slate-800">
            <div>
              <div className="font-bold text-slate-900">
                PASAL 1: JUMLAH PLAFON PINJAMAN &amp; TUJUAN
              </div>
              <p className="mt-0.5 text-slate-700">
                PIHAK PERTAMA menyetujui memberikan fasilitas pinjaman pembiayaan kepada PIHAK KEDUA, dan PIHAK KEDUA menyatakan telah menerima fasilitas pinjaman sebesar:
              </p>
              <div className="my-2 p-2.5 bg-emerald-50/80 border border-emerald-300 rounded-lg text-center">
                <span className="text-base sm:text-lg font-black font-mono text-emerald-900">
                  {formatRupiah(loan.amount)}
                </span>
                <p className="text-xs font-semibold italic text-emerald-800 mt-0.5">
                  (Terbilang: {terbilang(loan.amount)} Rupiah)
                </p>
              </div>
              <p className="text-slate-700">
                Pinjaman ini diperuntukkan secara khusus guna keperluan: <strong>{loan.purpose}</strong>.
              </p>
            </div>

            <div>
              <div className="font-bold text-slate-900">
                PASAL 2: KETENTUAN SUKU BUNGA (20% PER SEMESTER)
              </div>
              <p className="mt-0.5 text-slate-700">
                Sesuai dengan Anggaran Dasar/Anggaran Rumah Tangga (AD/ART) Koperasi Patuh Pacu, suku bunga/jasa pinjaman disepakati sebesar <strong>20% (dua puluh persen) per semester (6 bulan)</strong>, atau setara dengan <strong>3,33% per bulan</strong> yang dihitung secara proporsional terhadap pokok pinjaman.
              </p>
            </div>

            <div>
              <div className="font-bold text-slate-900">
                PASAL 3: JANGKA WAKTU &amp; RINCIAN ANGSURAN
              </div>
              <p className="mt-0.5 text-slate-700">
                Kedua belah pihak menyetujui jangka waktu pengembalian pinjaman selama <strong>{loan.tenorMonths} ({terbilang(loan.tenorMonths)}) bulan</strong> dengan rincian kewajiban angsuran sebagai berikut:
              </p>
              <div className="mt-2 border border-slate-300 rounded-lg overflow-hidden text-xs">
                <table className="w-full text-left border-collapse">
                  <tbody className="divide-y divide-slate-200">
                    <tr className="bg-slate-50">
                      <td className="p-2 text-slate-600">Angsuran Pokok per Bulan:</td>
                      <td className="p-2 font-mono font-semibold text-right text-slate-900">{formatRupiah(monthlyPokok)}</td>
                    </tr>
                    <tr>
                      <td className="p-2 text-slate-600">Jasa Koperasi per Bulan (20% / semester):</td>
                      <td className="p-2 font-mono font-semibold text-right text-emerald-700">{formatRupiah(monthlyJasa)}</td>
                    </tr>
                    <tr className="bg-emerald-50/70 font-bold">
                      <td className="p-2 text-emerald-950">Total Angsuran Wajib per Bulan:</td>
                      <td className="p-2 font-mono text-right text-emerald-900 text-sm">{formatRupiah(monthlyInstallment)}</td>
                    </tr>
                    <tr>
                      <td className="p-2 text-slate-600">Total Akumulasi Jasa Koperasi ({loan.tenorMonths} bln):</td>
                      <td className="p-2 font-mono font-semibold text-right text-slate-800">{formatRupiah(totalInterest)}</td>
                    </tr>
                    <tr className="bg-slate-100 font-bold">
                      <td className="p-2 text-slate-900">Total Pengembalian Keseluruhan:</td>
                      <td className="p-2 font-mono text-right text-slate-900">{formatRupiah(totalRepayment)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-1 text-[11px] text-slate-500 italic">
                * Pembayaran angsuran bulanan wajib disetorkan paling lambat tanggal 10 pada setiap bulannya melalui Bendahara Koperasi Patuh Pacu.
              </p>
            </div>

            <div>
              <div className="font-bold text-slate-900">
                PASAL 4: HAK, KEWAJIBAN &amp; JAMINAN
              </div>
              <p className="mt-0.5 text-slate-700">
                PIHAK KEDUA berjanji dengan sungguh-sungguh melunasi seluruh kewajiban pinjaman secara tertib. Apabila terjadi keterlambatan atau kelalaian, PIHAK PERTAMA berhak melakukan penagihan secara kekeluargaan dan/atau memperhitungkan saldo simpanan sukarela dan simpanan wajib PIHAK KEDUA sesuai AD/ART Koperasi Patuh Pacu.
              </p>
            </div>
          </div>

          {/* 3. KUITANSI PENERIMAAN DANA PINJAMAN */}
          <div className="pt-2">
            <div className="border-2 border-dashed border-emerald-700 rounded-xl p-4 sm:p-5 bg-emerald-50/30 space-y-3">
              <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center text-xs font-bold">
                    PP
                  </div>
                  <div>
                    <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                      Kuitansi Penerimaan Dana Pinjaman
                    </h3>
                    <p className="text-[10px] text-slate-500">Unit Simpan Pinjam Koperasi Patuh Pacu</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                    No: {receiptNo}
                  </span>
                  <p className="text-[10px] text-slate-500 mt-0.5">{formatDateIndo(loan.applicationDate)}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-1.5 text-xs text-slate-800">
                <span className="text-slate-500">Sudah Diterima Dari:</span>
                <span className="col-span-2 font-bold text-slate-900">Bendahara Koperasi Patuh Pacu</span>

                <span className="text-slate-500">Diserahkan Kepada:</span>
                <span className="col-span-2 font-bold text-slate-900">
                  {loan.memberName} <span className="font-mono font-medium text-slate-600">({loan.memberNo})</span>
                </span>

                <span className="text-slate-500">Jumlah Uang:</span>
                <span className="col-span-2 font-black font-mono text-emerald-900 text-sm sm:text-base">
                  {formatRupiah(loan.amount)}
                </span>

                <span className="text-slate-500">Terbilang:</span>
                <span className="col-span-2 italic font-semibold text-emerald-800 bg-white p-1.5 rounded border border-emerald-200">
                  &ldquo;{terbilang(loan.amount)} Rupiah&rdquo;
                </span>

                <span className="text-slate-500">Untuk Pembayaran:</span>
                <span className="col-span-2 text-slate-700">
                  Pencairan dana pinjaman modal pembiayaan Koperasi Patuh Pacu sesuai Perjanjian No. <strong>{agreementNo}</strong> ({loan.purpose}).
                </span>
              </div>
            </div>
          </div>

          {/* 4. TANDA TANGAN LENGKAP PARA PIHAK */}
          <div className="pt-4 border-t border-slate-200">
            <p className="text-center text-xs text-slate-600 mb-4">
              Dibuat dan ditandatangani di Pacu Raya pada tanggal <strong>{formatDateIndo(loan.applicationDate)}</strong> dalam keadaan sadar dan tanpa paksaan dari pihak manapun.
            </p>

            <div className="grid grid-cols-3 gap-4 text-center text-xs">
              {/* Peminjam */}
              <div className="flex flex-col justify-between items-center h-44 p-2 bg-slate-50/80 rounded-lg border border-slate-200">
                <div className="font-semibold text-slate-700">
                  PIHAK KEDUA<br />
                  <span className="text-[11px] text-slate-500">(Peminjam / Anggota)</span>
                </div>
                <div className="text-[10px] text-slate-400 border border-dashed border-slate-300 px-3 py-1 rounded">
                  [Materai Rp 10.000 &amp; Ttd]
                </div>
                <div>
                  <div className="font-bold text-slate-900 underline underline-offset-2">
                    {loan.memberName}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    NIK: {member?.nik || '-'}
                  </div>
                </div>
              </div>

              {/* Bendahara / Petugas */}
              <div className="flex flex-col justify-between items-center h-44 p-2 bg-slate-50/80 rounded-lg border border-slate-200">
                <div className="font-semibold text-slate-700">
                  PIHAK PERTAMA<br />
                  <span className="text-[11px] text-slate-500">(Petugas / Bendahara)</span>
                </div>
                <div className="w-16 h-10 flex items-center justify-center text-[10px] text-slate-400 italic">
                  [Tanda Tangan]
                </div>
                <div>
                  <div className="font-bold text-slate-900 underline underline-offset-2">
                    Siti Nurhaliza Dewi
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    NIP: KPP-BEN-002
                  </div>
                </div>
              </div>

              {/* Mengetahui Ketua Koperasi */}
              <div className="flex flex-col justify-between items-center h-44 p-2 bg-slate-50/80 rounded-lg border border-slate-200">
                <div className="font-semibold text-slate-700">
                  MENGETAHUI<br />
                  <span className="text-[11px] text-slate-500">(Ketua Koperasi Patuh Pacu)</span>
                </div>
                <div className="w-16 h-10 flex items-center justify-center text-[10px] text-emerald-800 font-semibold text-center border border-emerald-300 rounded bg-emerald-50/50">
                  [CAP RESMI]
                </div>
                <div>
                  <div className="font-bold text-slate-900 underline underline-offset-2">
                    Haji Mansyur Efendi
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    NIP: KPP-KTA-001
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Modal (Tersembunyi saat Cetak) */}
        <div className="print:hidden px-6 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500">
            * Gunakan dialog cetak browser untuk menyimpan dokumen sebagai berkas PDF.
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-white hover:bg-slate-200 text-slate-700 border border-slate-300 transition"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              Cetak Dokumen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
