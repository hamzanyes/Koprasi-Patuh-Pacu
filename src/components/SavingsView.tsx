import React, { useState } from 'react';
import { 
  Coins, 
  Plus, 
  Search, 
  Filter, 
  Receipt, 
  ArrowDownLeft, 
  ArrowUpRight, 
  CheckCircle2, 
  X,
  UserCheck
} from 'lucide-react';
import { Member, SavingsTransaction, SavingsType, TransactionType } from '../types';
import { formatRupiah, formatDateIndo } from '../data/initialData';

interface SavingsViewProps {
  members: Member[];
  savings: SavingsTransaction[];
  onAddSavings: (trx: Omit<SavingsTransaction, 'id' | 'receiptNo'>) => void;
  onViewReceipt: (trx: SavingsTransaction) => void;
}

export const SavingsView: React.FC<SavingsViewProps> = ({
  members,
  savings,
  onAddSavings,
  onViewReceipt,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [savingsType, setSavingsType] = useState<SavingsType>('Wajib');
  const [actionType, setActionType] = useState<TransactionType>('Setor');
  const [amount, setAmount] = useState<number>(25000);
  const [note, setNote] = useState('');
  const [officer, setOfficer] = useState('Siti Nurhaliza (Bendahara)');
  const [errorMsg, setErrorMsg] = useState('');

  // Hitung total
  const totalPokok = members.reduce((sum, m) => sum + (m.simpananPokok || 0), 0);
  const totalWajib = members.reduce((sum, m) => sum + (m.simpananWajib || 0), 0);
  const totalSukarela = members.reduce((sum, m) => sum + (m.simpananSukarela || 0), 0);

  // Filter list
  const filteredSavings = savings.filter((item) => {
    const matchesSearch = 
      item.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.memberNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.receiptNo.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'ALL' || item.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedMemberId) {
      setErrorMsg('Pilih anggota terlebih dahulu');
      return;
    }
    if (amount <= 0) {
      setErrorMsg('Nominal simpanan harus lebih dari 0');
      return;
    }

    const member = members.find((m) => m.id === selectedMemberId);
    if (!member) {
      setErrorMsg('Data anggota tidak ditemukan');
      return;
    }

    // Validasi penarikan
    if (actionType === 'Tarik') {
      if (savingsType !== 'Sukarela') {
        setErrorMsg('Simpanan Pokok dan Wajib tidak dapat ditarik selama masih menjadi anggota aktif.');
        return;
      }
      if (amount > (member.simpananSukarela || 0)) {
        setErrorMsg(`Saldo Simpanan Sukarela ${member.name} hanya ${formatRupiah(member.simpananSukarela || 0)}`);
        return;
      }
    }

    onAddSavings({
      date: new Date().toISOString().split('T')[0],
      memberId: member.id,
      memberName: member.name,
      memberNo: member.memberNo,
      type: savingsType,
      action: actionType,
      amount: Number(amount),
      note: note.trim() || (actionType === 'Setor' ? `Setoran ${savingsType}` : `Penarikan ${savingsType}`),
      officer: officer.trim() || 'Petugas Koperasi',
    });

    setIsModalOpen(false);
    setSelectedMemberId('');
    setAmount(25000);
    setNote('');
  };

  const selectedMember = members.find((m) => m.id === selectedMemberId);

  return (
    <div className="space-y-6">
      {/* Header & Quick Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Buku Simpanan Anggota
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Pencatatan tertib Simpanan Pokok, Wajib, dan Sukarela Koperasi Patuh Pacu
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          id="btn-catat-simpanan"
          className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm transition shadow-xs flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Catat Transaksi Simpanan
        </button>
      </div>

      {/* 3 Kartu Saldo Simpanan */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            Simpanan Pokok
          </div>
          <div className="text-xl font-bold text-slate-900">{formatRupiah(totalPokok)}</div>
          <p className="text-[11px] text-slate-500 mt-1">Dibayar sekali saat awal pendaftaran</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-teal-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-teal-500"></span>
            Simpanan Wajib
          </div>
          <div className="text-xl font-bold text-slate-900">{formatRupiah(totalWajib)}</div>
          <p className="text-[11px] text-slate-500 mt-1">Iuran bulanan rutin seluruh anggota</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-amber-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            Simpanan Sukarela
          </div>
          <div className="text-xl font-bold text-slate-900">{formatRupiah(totalSukarela)}</div>
          <p className="text-[11px] text-slate-500 mt-1">Tabungan fleksibel &amp; dapat ditarik</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari anggota, no kuitansi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Tipe:
          </span>
          {['ALL', 'Pokok', 'Wajib', 'Sukarela'].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                typeFilter === t
                  ? 'bg-emerald-100 text-emerald-800 font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t === 'ALL' ? 'Semua' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Tabel Riwayat Simpanan */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-slate-700">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[11px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">No Kuitansi</th>
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Anggota</th>
                <th className="py-3 px-4">Tipe Simpanan</th>
                <th className="py-3 px-4 text-right">Nominal</th>
                <th className="py-3 px-4">Keterangan</th>
                <th className="py-3 px-4">Petugas</th>
                <th className="py-3 px-4 text-center">Bukti</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSavings.length > 0 ? (
                filteredSavings.map((trx) => (
                  <tr key={trx.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-800">
                      {trx.receiptNo}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                      {formatDateIndo(trx.date)}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{trx.memberName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{trx.memberNo}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        trx.action === 'Setor' 
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}>
                        {trx.action === 'Setor' ? (
                          <ArrowDownLeft className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <ArrowUpRight className="w-3 h-3 text-rose-600" />
                        )}
                        {trx.type} &bull; {trx.action}
                      </span>
                    </td>
                    <td className={`py-3.5 px-4 text-right font-bold whitespace-nowrap ${
                      trx.action === 'Setor' ? 'text-emerald-700' : 'text-rose-600'
                    }`}>
                      {trx.action === 'Setor' ? '+' : '-'}{formatRupiah(trx.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">
                      {trx.note || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-xs whitespace-nowrap">
                      {trx.officer}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => onViewReceipt(trx)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 font-medium text-xs transition"
                        title="Cetak Kuitansi Transaksi"
                      >
                        <Receipt className="w-3.5 h-3.5 text-emerald-700" />
                        Kuitansi
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400 text-sm">
                    Tidak ada catatan transaksi simpanan yang cocok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form Catat Simpanan Baru */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Coins className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">
                  Catat Transaksi Simpanan
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
                  {errorMsg}
                </div>
              )}

              {/* Pilih Anggota */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pilih Anggota Koperasi *
                </label>
                <select
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-hidden focus:border-emerald-600"
                  required
                >
                  <option value="">-- Pilih Nama Anggota --</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.memberNo} - {m.name} ({m.role})
                    </option>
                  ))}
                </select>
              </div>

              {/* Info saldo anggota terpilih */}
              {selectedMember && (
                <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-100 text-xs space-y-1">
                  <div className="font-semibold text-emerald-900">
                    Saldo Simpanan {selectedMember.name}:
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Pokok: {formatRupiah(selectedMember.simpananPokok)}</span>
                    <span>Wajib: {formatRupiah(selectedMember.simpananWajib)}</span>
                    <span className="font-semibold text-emerald-800">
                      Sukarela: {formatRupiah(selectedMember.simpananSukarela)}
                    </span>
                  </div>
                </div>
              )}

              {/* Tipe Transaksi (Setor / Tarik) */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActionType('Setor');
                    setErrorMsg('');
                  }}
                  className={`py-2 text-xs font-semibold rounded-lg border transition ${
                    actionType === 'Setor'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  + Setor Simpanan
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActionType('Tarik');
                    setSavingsType('Sukarela');
                    setErrorMsg('');
                  }}
                  className={`py-2 text-xs font-semibold rounded-lg border transition ${
                    actionType === 'Tarik'
                      ? 'bg-rose-600 text-white border-rose-600'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  - Tarik Sukarela
                </button>
              </div>

              {/* Jenis Simpanan */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jenis Simpanan *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Pokok', 'Wajib', 'Sukarela'] as SavingsType[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      disabled={actionType === 'Tarik' && t !== 'Sukarela'}
                      onClick={() => setSavingsType(t)}
                      className={`py-2 text-xs font-semibold rounded-lg border transition ${
                        savingsType === t
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-400'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                {actionType === 'Tarik' && (
                  <p className="text-[11px] text-amber-700 mt-1">
                    *Hanya simpanan sukarela yang dapat ditarik oleh anggota.
                  </p>
                )}
              </div>

              {/* Nominal */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nominal (Rp) *
                </label>
                <input
                  type="number"
                  min="5000"
                  step="5000"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-hidden focus:border-emerald-600 font-semibold"
                  required
                />
                <div className="flex gap-2 mt-2">
                  {[25000, 50000, 100000, 500000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAmount(preset)}
                      className="px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-[11px] text-slate-700 font-medium"
                    >
                      {formatRupiah(preset)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Keterangan */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Keterangan / Berita Transaksi
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Iuran wajib bulan berjalan"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-hidden focus:border-emerald-600"
                />
              </div>

              {/* Petugas */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Petugas Penerima / Kasir
                </label>
                <input
                  type="text"
                  value={officer}
                  onChange={(e) => setOfficer(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-hidden focus:border-emerald-600 text-slate-700"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  id="btn-simpan-transaksi"
                  className="w-1/2 py-2 text-xs font-semibold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white transition shadow-xs"
                >
                  Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
