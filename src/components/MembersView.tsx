import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  CreditCard, 
  Phone, 
  MapPin, 
  Shield, 
  Coins, 
  CheckCircle, 
  X,
  Printer,
  Pencil,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { Member, Loan } from '../types';
import { formatRupiah, formatDateIndo } from '../data/initialData';
import { EditMemberModal } from './EditMemberModal';

interface MembersViewProps {
  members: Member[];
  loans: Loan[];
  onAddMember: (newMember: Omit<Member, 'id' | 'memberNo'>) => void;
  onEditMember: (updatedMember: Member) => void;
  onDeleteMember: (memberId: string) => void;
  onViewMemberCard: (member: Member) => void;
}

export const MembersView: React.FC<MembersViewProps> = ({
  members,
  loans,
  onAddMember,
  onEditMember,
  onDeleteMember,
  onViewMemberCard,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [nik, setNik] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [role, setRole] = useState<'Anggota' | 'Ketua' | 'Sekretaris' | 'Bendahara' | 'Pengawas'>('Anggota');
  const [initialPokok, setInitialPokok] = useState<number>(100000);
  const [initialWajib, setInitialWajib] = useState<number>(25000);
  const [initialSukarela, setInitialSukarela] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState('');

  const handleOpenEdit = (member: Member) => {
    setEditingMember(member);
    setIsEditModalOpen(true);
  };

  const filteredMembers = members.filter((m) => {
    return (
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.memberNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.phone.includes(searchTerm)
    );
  });

  const handleFormSubmit = (e: React.FormEvent) => {
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

    onAddMember({
      name: name.trim(),
      nik: nik.trim() || '3201000000000000',
      phone: phone.trim(),
      address: address.trim() || 'Alamat Belum Terdaftar',
      role: role,
      status: role === 'Anggota' ? 'Aktif' : 'Pengurus',
      joinedDate: new Date().toISOString().split('T')[0],
      simpananPokok: Number(initialPokok),
      simpananWajib: Number(initialWajib),
      simpananSukarela: Number(initialSukarela),
    });

    setIsModalOpen(false);
    setName('');
    setNik('');
    setPhone('');
    setAddress('');
    setRole('Anggota');
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Buku Induk Anggota Koperasi
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Data keanggotaan resmi Koperasi Patuh Pacu dan penerbitan Kartu Tanda Anggota (KTA)
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          id="btn-tambah-anggota"
          className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm transition shadow-xs flex items-center justify-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          Registrasi Anggota Baru
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama anggota, no ID (PP-001)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
          />
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span>Total Anggota: <strong className="text-slate-900 font-bold">{members.length} Orang</strong></span>
          <span>Pengurus: <strong className="text-emerald-700 font-bold">{members.filter(m => m.status === 'Pengurus').length} Orang</strong></span>
        </div>
      </div>

      {/* Grid Kartu Anggota */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMembers.map((member) => {
          const totalSimpanan = (member.simpananPokok || 0) + (member.simpananWajib || 0) + (member.simpananSukarela || 0);
          const activeLoan = loans.find((l) => l.memberId === member.id && l.status === 'Berjalan');

          return (
            <div
              key={member.id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs hover:border-emerald-400 transition-all p-5 flex flex-col justify-between"
            >
              <div>
                {/* Header Anggota */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-600 to-teal-800 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                      {member.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm leading-tight">
                        {member.name}
                      </h4>
                      <span className="font-mono text-[11px] font-semibold text-emerald-700">
                        {member.memberNo}
                      </span>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    member.status === 'Pengurus'
                      ? 'bg-purple-100 text-purple-800 border border-purple-200'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}>
                    {member.role}
                  </span>
                </div>

                {/* Info Detail */}
                <div className="space-y-1.5 text-xs text-slate-600 mb-4">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{member.phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{member.address}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 pt-0.5">
                    Bergabung sejak: {formatDateIndo(member.joinedDate)}
                  </div>
                </div>

                {/* Rekap Finansial Anggota */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Total Simpanan:</span>
                    <span className="font-bold text-slate-900">{formatRupiah(totalSimpanan)}</span>
                  </div>
                  {activeLoan && (
                    <div className="flex justify-between items-center text-amber-800 pt-1 border-t border-slate-200/60">
                      <span>Pinjaman Aktif:</span>
                      <span className="font-semibold">{formatRupiah(activeLoan.remainingPrincipal)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Tombol KTA Digital, Edit & Hapus Anggota */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5">
                <button
                  onClick={() => onViewMemberCard(member)}
                  id={`btn-kta-${member.id}`}
                  className="flex-1 py-2 px-2.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold transition border border-emerald-200 flex items-center justify-center gap-1.5"
                  title="Lihat KTA Digital"
                >
                  <CreditCard className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>KTA</span>
                </button>
                <button
                  onClick={() => handleOpenEdit(member)}
                  id={`btn-edit-${member.id}`}
                  className="py-2 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition border border-slate-200 flex items-center justify-center gap-1"
                  title="Edit Data Anggota"
                >
                  <Pencil className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => setMemberToDelete(member)}
                  id={`btn-delete-${member.id}`}
                  className="py-2 px-2.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 text-xs font-semibold transition border border-rose-200 flex items-center justify-center gap-1"
                  title="Hapus Anggota"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>Hapus</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Pendaftaran Anggota Baru */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">
                  Registrasi Anggota Koperasi Patuh Pacu
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="mt-4 space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap Sesuai KTP *
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Muhammad Ilham Pratama"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-hidden focus:border-emerald-600"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nomor NIK KTP
                  </label>
                  <input
                    type="text"
                    maxLength={16}
                    placeholder="16 digit NIK"
                    value={nik}
                    onChange={(e) => setNik(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-hidden focus:border-emerald-600 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    No. WhatsApp / HP *
                  </label>
                  <input
                    type="tel"
                    placeholder="0812-xxxx-xxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-hidden focus:border-emerald-600"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alamat Domisili Lengkap
                </label>
                <input
                  type="text"
                  placeholder="Dusun, RT/RW, Desa/Kelurahan"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-hidden focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jabatan / Status Dalam Koperasi
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-hidden focus:border-emerald-600"
                >
                  <option value="Anggota">Anggota Biasa</option>
                  <option value="Ketua">Ketua Pengurus</option>
                  <option value="Sekretaris">Sekretaris</option>
                  <option value="Bendahara">Bendahara</option>
                  <option value="Pengawas">Pengawas Koperasi</option>
                </select>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="text-xs font-bold text-slate-800">
                  Setoran Awal Registrasi (Opsional)
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-slate-500 block mb-1">Simpanan Pokok (Rp):</label>
                    <input
                      type="number"
                      value={initialPokok}
                      onChange={(e) => setInitialPokok(Number(e.target.value))}
                      className="w-full p-1.5 rounded border border-slate-200 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1">Simpanan Wajib (Rp):</label>
                    <input
                      type="number"
                      value={initialWajib}
                      onChange={(e) => setInitialWajib(Number(e.target.value))}
                      className="w-full p-1.5 rounded border border-slate-200 font-semibold"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  id="btn-submit-anggota"
                  className="w-1/2 py-2 text-xs font-semibold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs"
                >
                  Simpan Anggota
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Data Anggota */}
      <EditMemberModal
        isOpen={isEditModalOpen}
        member={editingMember}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingMember(null);
        }}
        onSave={onEditMember}
      />

      {/* Modal Konfirmasi Hapus Anggota */}
      {memberToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Konfirmasi Hapus Anggota
                </h3>
                <p className="text-xs text-slate-500">
                  Tindakan ini akan menghapus data keanggotaan
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Nomor Anggota:</span>
                  <span className="font-mono font-bold text-slate-900">{memberToDelete.memberNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Nama Anggota:</span>
                  <span className="font-semibold text-slate-900">{memberToDelete.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Jabatan:</span>
                  <span className="font-medium text-slate-700">{memberToDelete.role}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Simpanan:</span>
                  <span className="font-bold text-emerald-700">
                    {formatRupiah((memberToDelete.simpananPokok || 0) + (memberToDelete.simpananWajib || 0) + (memberToDelete.simpananSukarela || 0))}
                  </span>
                </div>
              </div>

              {/* Peringatan jika anggota memiliki pinjaman berjalan */}
              {(() => {
                const activeLoan = loans.find(
                  (l) => l.memberId === memberToDelete.id && l.status !== 'Lunas'
                );
                if (activeLoan) {
                  return (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-amber-900">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        Peringatan: Pinjaman Aktif Ditemukan
                      </div>
                      <p className="text-[11px] leading-relaxed">
                        Anggota ini memiliki pinjaman berjalan <strong>{activeLoan.loanNo}</strong> dengan sisa pokok <strong>{formatRupiah(activeLoan.remainingPrincipal)}</strong> ({activeLoan.status}).
                      </p>
                    </div>
                  );
                }
                return null;
              })()}

              <p className="text-xs text-slate-600 leading-relaxed">
                Apakah Anda yakin ingin menghapus data anggota <strong>{memberToDelete.name}</strong> dari sistem Koperasi Patuh Pacu?
              </p>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setMemberToDelete(null)}
                className="w-1/2 py-2.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              >
                Batal
              </button>
              <button
                type="button"
                id="btn-confirm-delete-member"
                onClick={() => {
                  onDeleteMember(memberToDelete.id);
                  setMemberToDelete(null);
                }}
                className="w-1/2 py-2.5 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Hapus Anggota
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
