import React from 'react';
import { CreditCard, Printer, X, ShieldCheck, Building2, QrCode } from 'lucide-react';
import { Member } from '../types';
import { formatDateIndo } from '../data/initialData';

interface MemberCardModalProps {
  member: Member | null;
  onClose: () => void;
}

export const MemberCardModal: React.FC<MemberCardModalProps> = ({
  member,
  onClose,
}) => {
  if (!member) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
        {/* Header Action */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 print:hidden">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-700" />
            <h3 className="font-bold text-slate-900 text-sm">
              Kartu Tanda Anggota (KTA) Digital
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              id="btn-print-kta"
              className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              Cetak KTA
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* KTA Card Design */}
        <div className="mt-4">
          <div 
            id="printable-kta"
            className="w-full aspect-[1.586/1] rounded-2xl bg-gradient-to-br from-emerald-900 via-teal-900 to-emerald-950 p-5 text-white shadow-xl relative overflow-hidden flex flex-col justify-between border-2 border-amber-400/40"
          >
            {/* Background watermarks & pattern */}
            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-6 translate-y-6">
              <Building2 className="w-48 h-48 text-white" />
            </div>
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-400/10 rounded-full blur-xl pointer-events-none" />

            {/* Header KTA */}
            <div className="relative z-10 flex items-center justify-between border-b border-emerald-700/60 pb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-amber-400 text-emerald-950 flex items-center justify-center font-extrabold shadow-sm">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-xs sm:text-sm tracking-wider uppercase text-amber-300">
                    KOPERASI PATUH PACU
                  </h4>
                  <p className="text-[9px] text-emerald-200 tracking-tight font-medium">
                    KARTU TANDA ANGGOTA RESMI
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40">
                {member.role.toUpperCase()}
              </span>
            </div>

            {/* Body Info */}
            <div className="relative z-10 grid grid-cols-12 gap-3 items-center my-auto py-2">
              <div className="col-span-8 space-y-1">
                <div className="text-[10px] text-emerald-300 uppercase tracking-wider font-semibold">
                  Nama Anggota
                </div>
                <div className="font-extrabold text-sm sm:text-base text-white truncate tracking-tight">
                  {member.name}
                </div>
                <div className="font-mono text-xs text-amber-300 font-bold">
                  ID: {member.memberNo}
                </div>
                <div className="text-[10px] text-emerald-200 truncate">
                  NIK: {member.nik}
                </div>
              </div>

              {/* QR Simulation */}
              <div className="col-span-4 flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-white p-1.5 rounded-lg shadow-md flex items-center justify-center">
                  <QrCode className="w-full h-full text-slate-900" />
                </div>
                <span className="text-[8px] text-emerald-300 font-mono mt-1">VERIFIED</span>
              </div>
            </div>

            {/* Footer KTA */}
            <div className="relative z-10 flex items-center justify-between pt-2 border-t border-emerald-700/60 text-[9px] text-emerald-200">
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Anggota Resmi &bull; Bergabung {formatDateIndo(member.joinedDate)}</span>
              </div>
              <span className="font-mono text-amber-300/80">KPP-VALID</span>
            </div>
          </div>
        </div>

        <p className="text-center text-slate-400 text-xs mt-4">
          Kartu digital ini dapat dicetak dan dilaminating sebagai identitas resmi keanggotaan Koperasi Patuh Pacu.
        </p>
      </div>
    </div>
  );
};
