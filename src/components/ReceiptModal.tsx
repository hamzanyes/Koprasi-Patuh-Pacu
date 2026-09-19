import React from 'react';
import { Printer, X, Building2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { SavingsTransaction } from '../types';
import { formatRupiah, formatDateIndo } from '../data/initialData';

interface ReceiptModalProps {
  transaction: SavingsTransaction | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  transaction,
  onClose,
}) => {
  if (!transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Action Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 print:hidden">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Bukti Transaksi Sah Koperasi
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              id="btn-print-receipt"
              className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              Cetak / Simpan PDF
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Print Receipt Paper */}
        <div id="printable-receipt" className="mt-4 p-6 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50/50 space-y-4 text-slate-800 font-sans">
          {/* Header Kop Koperasi */}
          <div className="text-center pb-3 border-b border-slate-300">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                KOPERASI PATUH PACU
              </h2>
            </div>
            <p className="text-[11px] text-slate-600">
              Unit Simpan Pinjam &amp; Pemberdayaan Anggota &bull; Berbadan Hukum
            </p>
            <p className="text-[10px] text-slate-500">
              Jl. Niaga Patuh No. 01, Pacu Raya &bull; Telp / WA: 0812-8821-4431
            </p>
          </div>

          {/* Judul Dokumen */}
          <div className="text-center">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-emerald-900">
              KUITANSI {transaction.action.toUpperCase()} SIMPANAN
            </h3>
            <div className="font-mono text-xs text-slate-600">
              No: {transaction.receiptNo}
            </div>
          </div>

          {/* Rincian Transaksi */}
          <div className="space-y-2 text-xs border-y border-slate-200 py-3">
            <div className="flex justify-between">
              <span className="text-slate-500">Tanggal:</span>
              <span className="font-semibold">{formatDateIndo(transaction.date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Telah Diterima Dari:</span>
              <span className="font-bold text-slate-900">{transaction.memberName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Nomor Anggota:</span>
              <span className="font-mono font-semibold">{transaction.memberNo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Jenis Transaksi:</span>
              <span className="font-semibold text-emerald-800">
                {transaction.action} Simpanan {transaction.type}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Keterangan:</span>
              <span className="text-slate-700">{transaction.note || '-'}</span>
            </div>
          </div>

          {/* Nominal Box */}
          <div className="p-3 bg-white rounded-lg border border-slate-300 text-center shadow-xs">
            <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              Jumlah Uang
            </span>
            <div className="text-2xl font-black text-emerald-800 font-mono mt-0.5">
              {formatRupiah(transaction.amount)}
            </div>
          </div>

          {/* Tanda Tangan */}
          <div className="grid grid-cols-2 gap-4 pt-4 text-center text-xs">
            <div>
              <p className="text-slate-500 text-[11px] mb-12">Penyetor / Anggota,</p>
              <p className="font-bold border-t border-slate-400 pt-1 text-slate-900">
                {transaction.memberName}
              </p>
            </div>
            <div>
              <p className="text-slate-500 text-[11px] mb-12">Kasir / Petugas Koperasi,</p>
              <p className="font-bold border-t border-slate-400 pt-1 text-slate-900">
                {transaction.officer}
              </p>
            </div>
          </div>

          <div className="text-center pt-2 text-[10px] text-slate-400 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Dokumen kuitansi ini sah dicatat dalam buku kas Koperasi Patuh Pacu.
          </div>
        </div>
      </div>
    </div>
  );
};
