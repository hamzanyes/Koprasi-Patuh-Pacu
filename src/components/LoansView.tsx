import React, { useState } from 'react';
import { 
  Calculator, 
  CreditCard, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Calendar, 
  DollarSign, 
  Check, 
  X,
  ArrowRight,
  Sparkles,
  Receipt,
  FileText
} from 'lucide-react';
import { Member, Loan, LoanStatus } from '../types';
import { formatRupiah, formatDateIndo, LOAN_CEILINGS, SEMESTER_INTEREST_RATE } from '../data/initialData';

interface LoansViewProps {
  members: Member[];
  loans: Loan[];
  onApplyLoan: (loanData: Omit<Loan, 'id' | 'loanNo' | 'payments' | 'remainingPrincipal' | 'paidInstallmentsCount' | 'monthlyInstallment'>) => void;
  onPayInstallment: (loanId: string, amountPokok: number, amountJasa: number, officer: string) => void;
  onApproveLoan: (loanId: string) => void;
  onViewAgreement: (loan: Loan) => void;
}

export const LoansView: React.FC<LoansViewProps> = ({
  members,
  loans,
  onApplyLoan,
  onPayInstallment,
  onApproveLoan,
  onViewAgreement,
}) => {
  // Plafon Pinjaman: 250.000 s/d 3.000.000
  // Suku Bunga: 20% per semester (6 bulan) = 3,33% per bulan
  const [calcAmount, setCalcAmount] = useState<number>(1000000);
  const [calcTenor, setCalcTenor] = useState<number>(10);

  // Form Application Modal State
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [applyPurpose, setApplyPurpose] = useState('');
  const [applyAmount, setApplyAmount] = useState<number>(1000000);
  const [applyTenor, setApplyTenor] = useState<number>(10);
  const [errorMsg, setErrorMsg] = useState('');

  // Pay Installment Modal State
  const [payModalLoan, setPayModalLoan] = useState<Loan | null>(null);
  const [payOfficer, setPayOfficer] = useState('Siti Nurhaliza (Bendahara)');

  // Kalkulasi Simulator (Bunga 20% per semester = 20% / 6 bln = 3.33% / bln)
  const monthlyPokok = Math.round(calcAmount / calcTenor);
  const monthlyJasa = Math.round((calcAmount * 0.20) / 6);
  const totalMonthlyInstallment = monthlyPokok + monthlyJasa;
  const totalRepayment = totalMonthlyInstallment * calcTenor;
  const totalJasa = monthlyJasa * calcTenor;

  const handleOpenApplyWithCalc = () => {
    setApplyAmount(calcAmount);
    setApplyTenor(calcTenor);
    setIsApplyModalOpen(true);
  };

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedMemberId) {
      setErrorMsg('Pilih anggota peminjam');
      return;
    }
    if (applyAmount <= 0) {
      setErrorMsg('Nominal pinjaman harus lebih dari 0');
      return;
    }
    if (!applyPurpose.trim()) {
      setErrorMsg('Isi tujuan atau keperluan pinjaman');
      return;
    }

    const member = members.find((m) => m.id === selectedMemberId);
    if (!member) {
      setErrorMsg('Data anggota tidak valid');
      return;
    }

    onApplyLoan({
      memberId: member.id,
      memberName: member.name,
      memberNo: member.memberNo,
      applicationDate: new Date().toISOString().split('T')[0],
      amount: Number(applyAmount),
      interestRate: SEMESTER_INTEREST_RATE, // 20% per semester
      tenorMonths: Number(applyTenor),
      purpose: applyPurpose.trim(),
      status: 'Menunggu',
    });

    setIsApplyModalOpen(false);
    setSelectedMemberId('');
    setApplyPurpose('');
  };

  const handleConfirmPay = () => {
    if (!payModalLoan) return;
    const loan = payModalLoan;
    const pokok = Math.round(loan.amount / loan.tenorMonths);
    const jasa = Math.round((loan.amount * 0.20) / 6);

    onPayInstallment(loan.id, pokok, jasa, payOfficer);
    setPayModalLoan(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Pinjaman &amp; Pembiayaan Produktif
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Simulasi transparan dan pengelolaan angsuran Koperasi Patuh Pacu
          </p>
        </div>
        <button
          onClick={() => setIsApplyModalOpen(true)}
          id="btn-ajukan-pinjaman"
          className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm transition shadow-xs flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Formulir Pengajuan Pinjaman
        </button>
      </div>

      {/* Kalkulator Interaktif Pinjaman Patuh Pacu */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 rounded-2xl p-6 text-white shadow-md border border-slate-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">
                Kalkulator Simulasi Pinjaman Patuh Pacu
              </h3>
              <p className="text-xs text-slate-300">
                Plafon standar Rp 250.000 s/d Rp 3.000.000 &bull; Suku bunga 20% per semester
              </p>
            </div>
          </div>
          <div className="px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold self-start sm:self-auto">
            Suku Bunga: 20% / Semester (3,33% / bln)
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Controls Form */}
          <div className="lg:col-span-7 space-y-5">
            {/* Pilihan Plafon Pinjaman */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold text-slate-300">
                  Pilihan Plafon Pinjaman:
                </label>
                <span className="text-lg font-extrabold text-emerald-400 font-mono">
                  {formatRupiah(calcAmount)}
                </span>
              </div>

              {/* Grid 7 Pilihan Plafon Resmi */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {LOAN_CEILINGS.map((plafon) => (
                  <button
                    key={plafon}
                    type="button"
                    onClick={() => setCalcAmount(plafon)}
                    className={`py-2 px-2.5 rounded-lg text-xs font-bold transition border text-center ${
                      calcAmount === plafon
                        ? 'bg-emerald-600 text-white border-emerald-400 shadow-md ring-2 ring-emerald-500/30'
                        : 'bg-slate-800/90 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    {formatRupiah(plafon)}
                  </button>
                ))}
              </div>
            </div>

            {/* Jangka Waktu (Tenor) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Jangka Waktu (Tenor Pinjaman):
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {[3, 6, 10, 12, 18, 24].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setCalcTenor(t)}
                    className={`py-2 px-3 text-xs font-bold rounded-lg border transition ${
                      calcTenor === t
                        ? 'bg-emerald-600 text-white border-emerald-400 shadow-sm'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                    }`}
                  >
                    {t} Bulan
                  </button>
                ))}
              </div>
            </div>

            {/* Informasi Suku Bunga Resmi */}
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400">Ketentuan Suku Bunga Koperasi:</span>
                <div className="font-bold text-emerald-400 text-sm">
                  20% Per Semester (6 Bulan)
                </div>
              </div>
              <div className="text-right text-[11px] text-slate-300">
                Setara: <strong className="text-white">3,33% / bulan</strong>
                <br />
                <span className="text-slate-400">Dihitung proporsional</span>
              </div>
            </div>
          </div>

          {/* Rincian Hasil Kalkulator */}
          <div className="lg:col-span-5 bg-slate-800/90 rounded-xl p-5 border border-slate-700 space-y-4">
            <div className="text-center pb-3 border-b border-slate-700">
              <span className="text-xs text-slate-400 uppercase tracking-wider">
                Total Angsuran per Bulan
              </span>
              <div className="text-3xl font-extrabold text-white mt-1 text-emerald-400 font-mono">
                {formatRupiah(totalMonthlyInstallment)}
              </div>
              <span className="text-[11px] text-slate-400">
                Dicicil selama {calcTenor} bulan &bull; Suku Bunga 20% / semester
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Angsuran Pokok / bln:</span>
                <span className="font-semibold text-white">{formatRupiah(monthlyPokok)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Jasa Koperasi (20% / semester) / bln:</span>
                <span className="font-semibold text-emerald-300">{formatRupiah(monthlyJasa)}</span>
              </div>
              <div className="flex justify-between text-slate-300 pt-2 border-t border-slate-700/60">
                <span>Total Jasa Selama {calcTenor} Bln:</span>
                <span className="font-semibold text-slate-200">{formatRupiah(totalJasa)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Total Estimasi Pengembalian:</span>
                <span className="font-bold text-emerald-400">{formatRupiah(totalRepayment)}</span>
              </div>
            </div>

            <button
              onClick={handleOpenApplyWithCalc}
              id="btn-use-calc"
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              Gunakan Simulasi Ini untuk Pengajuan
            </button>
          </div>
        </div>
      </div>

      {/* Daftar Pinjaman Anggota */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Daftar Pinjaman Anggota
            </h3>
            <p className="text-xs text-slate-500">
              Monitoring angsuran, sisa pokok, dan status pembayaran
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            Total {loans.length} Pinjaman
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {loans.map((loan) => {
            const isCompleted = loan.status === 'Lunas';
            const isPending = loan.status === 'Menunggu';
            const progressPercent = Math.round((loan.paidInstallmentsCount / loan.tenorMonths) * 100);

            return (
              <div key={loan.id} className="p-4 sm:p-5 hover:bg-slate-50/70 transition">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  {/* Info Pinjaman */}
                  <div className="space-y-1 max-w-md">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm sm:text-base">
                        {loan.memberName}
                      </span>
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {loan.memberNo}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        isCompleted ? 'bg-emerald-100 text-emerald-800' :
                        isPending ? 'bg-amber-100 text-amber-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {loan.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600">
                      Keperluan: <strong className="text-slate-800">{loan.purpose}</strong>
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                      <span>No: <strong className="font-mono">{loan.loanNo}</strong></span>
                      <span>&bull;</span>
                      <span>Diajukan: {formatDateIndo(loan.applicationDate)}</span>
                      <span>&bull;</span>
                      <span>Plafon: <strong className="text-slate-900">{formatRupiah(loan.amount)}</strong></span>
                    </div>
                  </div>

                  {/* Ringkasan Angsuran & Aksi */}
                  <div className="flex flex-col sm:items-end gap-2">
                    <div className="text-right">
                      <div className="text-xs text-slate-500">Angsuran per Bulan:</div>
                      <div className="text-base font-extrabold text-slate-900">
                        {formatRupiah(loan.monthlyInstallment)}
                      </div>
                      <div className="text-xs text-slate-500">
                        Sisa Pokok: <strong className="text-emerald-700">{formatRupiah(loan.remainingPrincipal)}</strong>
                      </div>
                    </div>

                    {/* Tombol Aksi */}
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      {/* Tombol Surat Perjanjian & Kuitansi */}
                      <button
                        onClick={() => onViewAgreement(loan)}
                        id={`btn-agreement-${loan.id}`}
                        className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold transition flex items-center gap-1.5"
                        title="Lihat & Cetak Surat Perjanjian Pinjaman serta Kuitansi"
                      >
                        <FileText className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Surat Perjanjian &amp; Kuitansi</span>
                      </button>

                      {isPending && (
                        <button
                          onClick={() => onApproveLoan(loan.id)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Setujui Pinjaman
                        </button>
                      )}

                      {loan.status === 'Berjalan' && (
                        <button
                          onClick={() => setPayModalLoan(loan)}
                          className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-xs"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          Bayar Angsuran
                        </button>
                      )}

                      {isCompleted && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-md">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Lunas Sempurna
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Progress Bar Angsuran */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="flex justify-between items-center text-xs text-slate-500 mb-1">
                    <span>
                      Kemajuan Pelunasan: <strong>{loan.paidInstallmentsCount} dari {loan.tenorMonths} Angsuran</strong> ({progressPercent}%)
                    </span>
                    <span>Tenor {loan.tenorMonths} Bulan (Bunga 20% / semester)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        isCompleted ? 'bg-emerald-600' : 'bg-blue-600'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Form Pengajuan Pinjaman */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">
                  Formulir Pengajuan Pinjaman Patuh Pacu
                </h3>
              </div>
              <button
                onClick={() => setIsApplyModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplySubmit} className="mt-4 space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
                  {errorMsg}
                </div>
              )}

              {/* Anggota */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pilih Anggota Pemohon *
                </label>
                <select
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-hidden focus:border-emerald-600"
                  required
                >
                  <option value="">-- Pilih Anggota --</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.memberNo} - {m.name} ({m.role})
                    </option>
                  ))}
                </select>
              </div>

              {/* Plafon Pinjaman: 250k, 500k, 1M, 1.5M, 2M, 2.5M, 3M */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Plafon Pinjaman *
                  </label>
                  <span className="text-xs font-bold text-emerald-700">
                    Pilihan Standar Koperasi
                  </span>
                </div>
                <select
                  value={applyAmount}
                  onChange={(e) => setApplyAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-hidden focus:border-emerald-600 font-bold text-slate-900 bg-white"
                  required
                >
                  {LOAN_CEILINGS.map((plafon) => (
                    <option key={plafon} value={plafon}>
                      {formatRupiah(plafon)}
                    </option>
                  ))}
                </select>

                {/* Tombol Cepat Pilihan Plafon */}
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-1 mt-2">
                  {LOAN_CEILINGS.map((plafon) => (
                    <button
                      key={plafon}
                      type="button"
                      onClick={() => setApplyAmount(plafon)}
                      className={`py-1 px-1 rounded text-[11px] font-semibold transition border text-center ${
                        applyAmount === plafon
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {plafon >= 1000000 ? `${plafon / 1000000} Jt` : `${plafon / 1000} Rb`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tenor & Bunga */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tenor (Bulan) *
                  </label>
                  <select
                    value={applyTenor}
                    onChange={(e) => setApplyTenor(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-hidden focus:border-emerald-600"
                  >
                    {[3, 6, 10, 12, 18, 24].map((t) => (
                      <option key={t} value={t}>
                        {t} Bulan
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Suku Bunga Koperasi
                  </label>
                  <div className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-slate-200 bg-slate-50 text-emerald-800 flex items-center justify-between">
                    <span>20% / Semester</span>
                    <span className="text-[10px] text-slate-500 font-normal">3,33% / bln</span>
                  </div>
                </div>
              </div>

              {/* Keperluan */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Keperluan / Rencana Penggunaan Pinjaman *
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Tambahan modal usaha warung sembako, pembelian bibit pertanian Pacu"
                  value={applyPurpose}
                  onChange={(e) => setApplyPurpose(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-hidden focus:border-emerald-600"
                  required
                />
              </div>

              {/* Estimasi Cicilan Preview */}
              {(() => {
                const estPokok = Math.round(applyAmount / applyTenor);
                const estJasa = Math.round((applyAmount * 0.20) / 6);
                const estTotal = estPokok + estJasa;

                return (
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs space-y-1">
                    <div className="flex justify-between items-center font-bold text-emerald-900">
                      <span>Estimasi Angsuran Bulanan:</span>
                      <span className="text-sm font-extrabold text-emerald-800 font-mono">
                        {formatRupiah(estTotal)} / bulan
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600">
                      Pokok: {formatRupiah(estPokok)} &bull; Jasa (20% / semester): {formatRupiah(estJasa)}
                    </div>
                    <div className="text-[10px] text-emerald-700 pt-1 border-t border-emerald-200/60 flex items-center gap-1 font-medium">
                      <FileText className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>Surat Perjanjian &amp; Kuitansi lengkap tanda tangan diterbitkan otomatis setelah disimpan.</span>
                    </div>
                  </div>
                );
              })()}

              {/* Tombol Aksi */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  className="w-1/2 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  id="btn-submit-pinjaman"
                  className="w-1/2 py-2 text-xs font-semibold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white transition shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Kirim &amp; Terbitkan Akad
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Bayar Angsuran */}
      {payModalLoan && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-700" />
                <h3 className="font-bold text-slate-900 text-base">
                  Bayar Angsuran Pinjaman
                </h3>
              </div>
              <button
                onClick={() => setPayModalLoan(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Peminjam:</span>
                  <span className="font-bold text-slate-900">{payModalLoan.memberName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">No. Pinjaman:</span>
                  <span className="font-mono font-medium">{payModalLoan.loanNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Angsuran Ke:</span>
                  <span className="font-bold text-emerald-700">
                    {payModalLoan.paidInstallmentsCount + 1} dari {payModalLoan.tenorMonths}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
                <span className="text-xs text-emerald-800 font-medium uppercase tracking-wider">
                  Total Tagihan Bulan Ini
                </span>
                <div className="text-2xl font-extrabold text-emerald-900 font-mono mt-0.5">
                  {formatRupiah(payModalLoan.monthlyInstallment)}
                </div>
                <div className="text-[11px] text-emerald-700 mt-1">
                  Pokok: {formatRupiah(Math.round(payModalLoan.amount / payModalLoan.tenorMonths))} &bull; 
                  Jasa: {formatRupiah(Math.round((payModalLoan.amount * (payModalLoan.interestRate / 100)) / 6))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Petugas Penerima Angsuran:
                </label>
                <input
                  type="text"
                  value={payOfficer}
                  onChange={(e) => setPayOfficer(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-emerald-600"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setPayModalLoan(null)}
                  className="w-1/2 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPay}
                  id="btn-confirm-pay"
                  className="w-1/2 py-2 text-xs font-semibold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs"
                >
                  Konfirmasi Pembayaran
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
