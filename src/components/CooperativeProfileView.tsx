import React, { useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Edit3, 
  Save, 
  X, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Users, 
  CreditCard, 
  FileText, 
  CheckCircle2, 
  Sparkles, 
  Printer, 
  Copy, 
  Check, 
  Compass, 
  Target,
  Award,
  Landmark,
  FileCheck2
} from 'lucide-react';
import { CooperativeProfile } from '../types';

interface CooperativeProfileViewProps {
  profile: CooperativeProfile;
  onUpdateProfile: (updatedProfile: CooperativeProfile) => void;
  totalMembersCount?: number;
  totalKasAmount?: number;
}

export const CooperativeProfileView: React.FC<CooperativeProfileViewProps> = ({
  profile,
  onUpdateProfile,
  totalMembersCount = 0,
  totalKasAmount = 0,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<CooperativeProfile>(profile);
  const [copiedAccount, setCopiedAccount] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData(profile);
    setIsEditing(false);
  };

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(formData.bankAccountNumber);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner Profil Koperasi */}
      <div className="relative bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl overflow-hidden border border-emerald-700/50">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <Building2 className="w-96 h-96 text-white" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4 sm:gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-950/40 border-2 border-emerald-300/40 shrink-0">
              <Building2 className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-200 border border-emerald-400/40 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                  Badan Hukum Resmi
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-500/20 text-teal-200 border border-teal-400/40">
                  Unit Simpan Pinjam (USP)
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                {profile.name}
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-xl">
                {profile.address}, {profile.village}, {profile.subDistrict}, {profile.regency}, {profile.province} {profile.postalCode}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
            {!isEditing ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  id="btn-edit-profile"
                  className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-md flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Profil Koperasi
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  id="btn-print-profile"
                  className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm transition-all border border-white/20 flex items-center gap-2"
                  title="Cetak Profil Lembaga"
                >
                  <Printer className="w-4 h-4" />
                  <span className="hidden sm:inline">Cetak</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition border border-white/20 flex items-center gap-1.5"
                >
                  <X className="w-4 h-4" />
                  Batal
                </button>
                <button
                  type="button"
                  onClick={(e) => handleSave(e as any)}
                  id="btn-save-profile-top"
                  className="px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs transition shadow-md flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  Simpan Perubahan
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Highlights Bar */}
        <div className="mt-6 pt-5 border-t border-emerald-700/60 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-emerald-300 text-[11px] block">No. Badan Hukum</span>
            <strong className="text-white font-mono text-xs truncate block">{profile.legalNumber}</strong>
          </div>
          <div>
            <span className="text-emerald-300 text-[11px] block">Nomor Induk Berusaha (NIB)</span>
            <strong className="text-white font-mono text-xs">{profile.nib}</strong>
          </div>
          <div>
            <span className="text-emerald-300 text-[11px] block">Tanggal Pendirian</span>
            <strong className="text-white text-xs">{profile.establishedDate}</strong>
          </div>
          <div>
            <span className="text-emerald-300 text-[11px] block">Total Anggota Aktif</span>
            <strong className="text-amber-300 font-bold text-xs">{totalMembersCount} Orang Terdaftar</strong>
          </div>
        </div>
      </div>

      {/* Mode EDIT Profil Koperasi */}
      {isEditing ? (
        <form onSubmit={handleSave} className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <Edit3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Formulir Perubahan Profil Koperasi
                </h3>
                <p className="text-xs text-slate-500">
                  Perbarui identitas legalitas, alamat kantor, kontak pengurus, dan ketentuan koperasi
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold">
              Mode Edit Aktif
            </span>
          </div>

          {/* 1. Legalitas & Identitas Lembaga */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-emerald-600" />
              1. Identitas &amp; Legalitas Lembaga
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap Koperasi *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Singkat / Populer *
                </label>
                <input
                  type="text"
                  value={formData.shortName}
                  onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tanggal Pendirian *
                </label>
                <input
                  type="date"
                  value={formData.establishedDate}
                  onChange={(e) => setFormData({ ...formData, establishedDate: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor Badan Hukum Kemenkumham *
                </label>
                <input
                  type="text"
                  value={formData.legalNumber}
                  onChange={(e) => setFormData({ ...formData, legalNumber: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor Induk Berusaha (NIB) / Izin USP *
                </label>
                <input
                  type="text"
                  value={formData.nib}
                  onChange={(e) => setFormData({ ...formData, nib: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 font-mono"
                  required
                />
              </div>
            </div>
          </div>

          {/* 2. Alamat & Kontak Resmi */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-600" />
              2. Alamat Kantor &amp; Kontak Operasional
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alamat Jalan / Dusun / RT / RW *
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Desa / Kelurahan *
                </label>
                <input
                  type="text"
                  value={formData.village}
                  onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kecamatan *
                </label>
                <input
                  type="text"
                  value={formData.subDistrict}
                  onChange={(e) => setFormData({ ...formData, subDistrict: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kabupaten / Kota *
                </label>
                <input
                  type="text"
                  value={formData.regency}
                  onChange={(e) => setFormData({ ...formData, regency: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Provinsi *
                </label>
                <input
                  type="text"
                  value={formData.province}
                  onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kode Pos
                </label>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  No. Telepon / WhatsApp *
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value, whatsapp: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 font-mono"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Resmi Koperasi *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  required
                />
              </div>
            </div>
          </div>

          {/* 3. Susunan Pengurus & Rekening Bank */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-600" />
              3. Susunan Dewan Pengurus &amp; Rekening Bank
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ketua Koperasi *
                </label>
                <input
                  type="text"
                  value={formData.leaderName}
                  onChange={(e) => setFormData({ ...formData, leaderName: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sekretaris Koperasi *
                </label>
                <input
                  type="text"
                  value={formData.secretaryName}
                  onChange={(e) => setFormData({ ...formData, secretaryName: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bendahara Koperasi *
                </label>
                <input
                  type="text"
                  value={formData.treasurerName}
                  onChange={(e) => setFormData({ ...formData, treasurerName: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ketua Pengawas *
                </label>
                <input
                  type="text"
                  value={formData.supervisorName}
                  onChange={(e) => setFormData({ ...formData, supervisorName: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Bank Resmi *
                </label>
                <input
                  type="text"
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor Rekening Bank *
                </label>
                <input
                  type="text"
                  value={formData.bankAccountNumber}
                  onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 font-mono font-bold"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Atas Nama Rekening Bank *
                </label>
                <input
                  type="text"
                  value={formData.bankAccountHolder}
                  onChange={(e) => setFormData({ ...formData, bankAccountHolder: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 font-semibold"
                  required
                />
              </div>
            </div>
          </div>

          {/* 4. Visi & Misi Lembaga */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-emerald-600" />
              4. Visi &amp; Misi Koperasi
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Visi Lembaga *
                </label>
                <textarea
                  rows={2}
                  value={formData.vision}
                  onChange={(e) => setFormData({ ...formData, vision: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Misi Lembaga (Tulis per poin dengan nomor atau baris baru) *
                </label>
                <textarea
                  rows={4}
                  value={formData.mission}
                  onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 font-mono text-xs"
                  required
                />
              </div>
            </div>
          </div>

          {/* Tombol Simpan Form */}
          <div className="pt-5 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition"
            >
              Batal
            </button>
            <button
              type="submit"
              id="btn-save-coop-profile"
              className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition shadow-md flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Simpan Perubahan Profil
            </button>
          </div>
        </form>
      ) : (
        /* Mode DISPLAY Profil Koperasi */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Kolom Kiri: Informasi Lembaga & Kontak (2 Kolom) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Visi & Misi Koperasi */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-base">
                <Target className="w-5 h-5 text-emerald-600" />
                Visi &amp; Misi Koperasi Patuh Pacu
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-100">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 block mb-1">
                  Visi
                </span>
                <p className="text-sm font-medium text-slate-800 italic leading-relaxed">
                  "{profile.vision}"
                </p>
              </div>

              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 block mb-2">
                  Misi Koperasi
                </span>
                <div className="space-y-2 text-xs sm:text-sm text-slate-700">
                  {profile.mission.split('\n').filter(Boolean).map((line, idx) => (
                    <div key={idx} className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <p className="leading-relaxed">{line.replace(/^\d+\.\s*/, '')}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Susunan Dewan Pengurus & Pengawas */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                  <Users className="w-5 h-5 text-emerald-600" />
                  Susunan Dewan Pengurus &amp; Pengawas
                </div>
                <span className="text-xs text-slate-500 font-medium">Periode Aktif Berjalan</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Ketua */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:border-emerald-300 transition">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Ketua Koperasi
                    </span>
                    <Award className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="font-bold text-slate-900 text-sm sm:text-base">
                    {profile.leaderName}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Penanggung Jawab Kebijakan &amp; Hubungan Eksternal
                  </p>
                </div>

                {/* Sekretaris */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:border-teal-300 transition">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">
                      Sekretaris
                    </span>
                    <FileText className="w-4 h-4 text-teal-600" />
                  </div>
                  <div className="font-bold text-slate-900 text-sm sm:text-base">
                    {profile.secretaryName}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Administrasi Keanggotaan &amp; Persuratan Lembaga
                  </p>
                </div>

                {/* Bendahara */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:border-amber-300 transition">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                      Bendahara
                    </span>
                    <CreditCard className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="font-bold text-slate-900 text-sm sm:text-base">
                    {profile.treasurerName}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Pengelolaan Kas, Pembukuan Simpanan &amp; Pinjaman
                  </p>
                </div>

                {/* Pengawas */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:border-purple-300 transition">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                      Ketua Pengawas
                    </span>
                    <ShieldCheck className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="font-bold text-slate-900 text-sm sm:text-base">
                    {profile.supervisorName}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Pemeriksa Kepatuhan AD/ART &amp; Akuntabilitas Keuangan
                  </p>
                </div>
              </div>
            </div>

            {/* Rekening Bank Resmi Koperasi */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-md border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                    <Landmark className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">
                      Rekening Bank Operasional Resmi Koperasi
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Untuk setoran simpanan anggota dan pembayaran angsuran pinjaman transfer
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-900/60 text-emerald-300 text-[11px] font-mono font-bold border border-emerald-500/40">
                  {profile.bankName}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/90 border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] text-slate-400">Nomor Rekening Koperasi:</div>
                  <div className="text-xl sm:text-2xl font-extrabold font-mono text-emerald-400 tracking-wider">
                    {profile.bankAccountNumber}
                  </div>
                  <div className="text-xs text-slate-300 mt-0.5">
                    Atas Nama: <strong className="text-white">{profile.bankAccountHolder}</strong>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCopyAccount}
                  className="px-3.5 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold transition flex items-center justify-center gap-1.5 shrink-0 border border-slate-600"
                >
                  {copiedAccount ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Salin No. Rekening</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Rincian Legalitas, Ketentuan Simpan Pinjam, Kontak (1 Kolom) */}
          <div className="space-y-6">
            {/* Legalitas & Keabsahan */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-emerald-600" />
                Legalitas &amp; Izin Lembaga
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block mb-0.5 text-[11px]">Badan Hukum Kemenkumham RI</span>
                  <strong className="text-slate-900 font-mono text-xs break-all">{profile.legalNumber}</strong>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block mb-0.5 text-[11px]">Nomor Induk Berusaha (NIB)</span>
                  <strong className="text-slate-900 font-mono text-xs">{profile.nib}</strong>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block mb-0.5 text-[11px]">Status Koperasi</span>
                  <strong className="text-emerald-700 font-semibold text-xs flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Koperasi Primer Tingkat Desa / Kecamatan
                  </strong>
                </div>
              </div>
            </div>

            {/* Ketentuan Simpan Pinjam Patuh Pacu */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                Ketentuan Simpan Pinjam
              </h3>

              <div className="space-y-2.5 text-xs text-slate-700">
                <div className="flex justify-between items-start pb-2 border-b border-slate-100">
                  <span className="text-slate-500">Suku Bunga Pinjaman:</span>
                  <strong className="text-emerald-700 text-right">20% / Semester (3,33%/bln)</strong>
                </div>
                <div className="flex justify-between items-start pb-2 border-b border-slate-100">
                  <span className="text-slate-500">Plafon Pinjaman:</span>
                  <strong className="text-slate-900 text-right">Rp 250rb s/d Rp 3 Juta</strong>
                </div>
                <div className="flex justify-between items-start pb-2 border-b border-slate-100">
                  <span className="text-slate-500">Simpanan Pokok:</span>
                  <strong className="text-slate-900 text-right">{profile.simpananPokokDesc}</strong>
                </div>
                <div className="flex justify-between items-start pb-2 border-b border-slate-100">
                  <span className="text-slate-500">Simpanan Wajib:</span>
                  <strong className="text-slate-900 text-right">{profile.simpananWajibDesc}</strong>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-slate-500">Simpanan Sukarela:</span>
                  <strong className="text-slate-900 text-right">Bebas nominal &amp; dapat ditarik</strong>
                </div>
              </div>
            </div>

            {/* Kontak & Lokasi Kantor */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3 text-xs">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                Sekretariat Koperasi
              </h3>

              <div className="flex items-start gap-2.5 text-slate-600">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span>
                  {profile.address}, {profile.village}, {profile.subDistrict}, {profile.regency}, {profile.province} ({profile.postalCode})
                </span>
              </div>

              <div className="flex items-center gap-2.5 text-slate-600">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="font-mono">{profile.phone}</span>
              </div>

              <div className="flex items-center gap-2.5 text-slate-600">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="font-mono">{profile.email}</span>
              </div>

              <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                Pelayanan Operasional Kas Koperasi: <br />
                <strong className="text-slate-800">Senin - Sabtu: 08.00 - 15.00 WIB</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
