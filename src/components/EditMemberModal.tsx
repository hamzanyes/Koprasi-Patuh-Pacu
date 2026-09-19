import React, { useState, useEffect } from 'react';
import { 
  X, 
  UserCheck, 
  Phone, 
  MapPin, 
  Shield, 
  CreditCard, 
  Save, 
  AlertCircle,
  Calendar,
  Coins
} from 'lucide-react';
import { Member, MemberStatus } from '../types';

interface EditMemberModalProps {
  isOpen: boolean;
  member: Member | null;
  onClose: () => void;
  onSave: (updatedMember: Member) => void;
}

export const EditMemberModal: React.FC<EditMemberModalProps> = ({
  isOpen,
  member,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [nik, setNik] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [role, setRole] = useState<'Anggota' | 'Ketua' | 'Sekretaris' | 'Bendahara' | 'Pengawas'>('Anggota');
  const [status, setStatus] = useState<MemberStatus>('Aktif');
  const [joinedDate, setJoinedDate] = useState('');
  const [simpananPokok, setSimpananPokok] = useState<number>(0);
  const [simpananWajib, setSimpananWajib] = useState<number>(0);
  const [simpananSukarela, setSimpananSukarela] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [showSavingsAdjustment, setShowSavingsAdjustment] = useState(false);

  // Sync state with selected member
  useEffect(() => {
    if (member) {
      setName(member.name || '');
      setNik(member.nik || '');
      setPhone(member.phone || '');
      setAddress(member.address || '');
      setRole(member.role || 'Anggota');
      setStatus(member.status || 'Aktif');
      setJoinedDate(member.joinedDate || new Date().toISOString().split('T')[0]);
      setSimpananPokok(member.simpananPokok || 0);
      setSimpananWajib(member.simpananWajib || 0);
      setSimpananSukarela(member.simpananSukarela || 0);
      setErrorMsg('');
      setShowSavingsAdjustment(false);
    }
  }, [member]);

  if (!isOpen || !member) return null;

  const handleRoleChange = (newRole: 'Anggota' | 'Ketua' | 'Sekretaris' | 'Bendahara' | 'Pengawas') => {
    setRole(newRole);
    if (newRole !== 'Anggota' && status !== 'Non-Aktif') {
      setStatus('Pengurus');
    } else if (newRole === 'Anggota' && status === 'Pengurus') {
      setStatus('Aktif');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Nama lengkap wajib diisi');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('Nomor telepon / WhatsApp wajib diisi');
      return;
    }

    const updated: Member = {
      ...member,
      name: name.trim(),
      nik: nik.trim() || member.nik,
      phone: phone.trim(),
      address: address.trim() || 'Alamat Belum Terdaftar',
      role,
      status,
      joinedDate: joinedDate || member.joinedDate,
      simpananPokok: Number(simpananPokok) || 0,
      simpananWajib: Number(simpananWajib) || 0,
      simpananSukarela: Number(simpananSukarela) || 0,
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Header Modal */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">
                  Edit Data Anggota
                </h3>
                <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                  {member.memberNo}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Perbarui biodata resmi dan informasi keanggotaan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Edit */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Nama Lengkap */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Lengkap Sesuai KTP *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Muhammad Ilham Pratama"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              required
            />
          </div>

          {/* NIK & No HP */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nomor NIK KTP
              </label>
              <input
                type="text"
                maxLength={16}
                value={nik}
                onChange={(e) => setNik(e.target.value)}
                placeholder="16 digit NIK"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                No. WhatsApp / HP *
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0812-xxxx-xxxx"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                required
              />
            </div>
          </div>

          {/* Alamat Domisili */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Alamat Domisili Lengkap
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Dusun, RT/RW, Desa/Kelurahan"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          {/* Jabatan & Status Keanggotaan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-slate-400" />
                Jabatan di Koperasi
              </label>
              <select
                value={role}
                onChange={(e) => handleRoleChange(e.target.value as any)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 bg-white"
              >
                <option value="Anggota">Anggota Biasa</option>
                <option value="Ketua">Ketua Pengurus</option>
                <option value="Sekretaris">Sekretaris</option>
                <option value="Bendahara">Bendahara</option>
                <option value="Pengawas">Pengawas Koperasi</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status Keanggotaan
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as MemberStatus)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 bg-white"
              >
                <option value="Aktif">Aktif</option>
                <option value="Pengurus">Pengurus</option>
                <option value="Non-Aktif">Non-Aktif</option>
              </select>
            </div>
          </div>

          {/* Tanggal Bergabung */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Tanggal Bergabung Resmi
            </label>
            <input
              type="date"
              value={joinedDate}
              onChange={(e) => setJoinedDate(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          {/* Penyesuaian Saldo Simpanan (Collapsible) */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowSavingsAdjustment(!showSavingsAdjustment)}
              className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-left transition"
            >
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-emerald-700" />
                <span className="text-xs font-bold text-slate-800">
                  Koreksi Saldo Simpanan (Khusus Pembukuan)
                </span>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700">
                {showSavingsAdjustment ? 'Sembunyikan' : 'Buka Penyesuaian'}
              </span>
            </button>

            {showSavingsAdjustment && (
              <div className="p-3 bg-white space-y-3 border-t border-slate-200 text-xs">
                <p className="text-[11px] text-slate-500">
                  Ubah angka berikut jika terdapat koreksi administratif pada pembukuan simpanan anggota:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="text-slate-600 block mb-1 font-medium">Simpanan Pokok (Rp):</label>
                    <input
                      type="number"
                      min={0}
                      value={simpananPokok}
                      onChange={(e) => setSimpananPokok(Number(e.target.value))}
                      className="w-full p-2 rounded-lg border border-slate-200 font-semibold focus:outline-hidden focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-1 font-medium">Simpanan Wajib (Rp):</label>
                    <input
                      type="number"
                      min={0}
                      value={simpananWajib}
                      onChange={(e) => setSimpananWajib(Number(e.target.value))}
                      className="w-full p-2 rounded-lg border border-slate-200 font-semibold focus:outline-hidden focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-1 font-medium">Simpanan Sukarela (Rp):</label>
                    <input
                      type="number"
                      min={0}
                      value={simpananSukarela}
                      onChange={(e) => setSimpananSukarela(Number(e.target.value))}
                      className="w-full p-2 rounded-lg border border-slate-200 font-semibold focus:outline-hidden focus:border-emerald-600"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tombol Aksi */}
          <div className="flex gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-2.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              id="btn-save-edit-anggota"
              className="w-1/2 py-2.5 text-xs font-semibold rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition flex items-center justify-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
