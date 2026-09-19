export type MemberStatus = 'Aktif' | 'Non-Aktif' | 'Pengurus';

export interface Member {
  id: string;
  memberNo: string; // e.g., PP-001
  name: string;
  phone: string;
  nik: string;
  address: string;
  role: 'Anggota' | 'Ketua' | 'Sekretaris' | 'Bendahara' | 'Pengawas';
  status: MemberStatus;
  joinedDate: string;
  simpananPokok: number;
  simpananWajib: number;
  simpananSukarela: number;
}

export type SavingsType = 'Pokok' | 'Wajib' | 'Sukarela';
export type TransactionType = 'Setor' | 'Tarik';

export interface SavingsTransaction {
  id: string;
  receiptNo: string;
  date: string;
  memberId: string;
  memberName: string;
  memberNo: string;
  type: SavingsType;
  action: TransactionType;
  amount: number;
  note?: string;
  officer: string;
}

export type LoanStatus = 'Menunggu' | 'Berjalan' | 'Lunas' | 'Ditolak';

export interface LoanPayment {
  id: string;
  date: string;
  installmentNo: number;
  amountPokok: number;
  amountJasa: number;
  totalPaid: number;
  officer: string;
}

export interface Loan {
  id: string;
  loanNo: string;
  memberId: string;
  memberName: string;
  memberNo: string;
  applicationDate: string;
  amount: number; // Plafon pinjaman
  interestRate: number; // % jasa per bulan, misal 1.2%
  tenorMonths: number;
  purpose: string;
  status: LoanStatus;
  monthlyInstallment: number;
  remainingPrincipal: number;
  paidInstallmentsCount: number;
  payments: LoanPayment[];
}

export interface CashTransaction {
  id: string;
  date: string;
  type: 'Masuk' | 'Keluar';
  category: 'Simpanan' | 'Angsuran Pinjaman' | 'Pencairan Pinjaman' | 'Penarikan Simpanan' | 'Operasional' | 'Pendapatan Jasa' | 'Lainnya';
  amount: number;
  description: string;
  referenceNo: string;
  officer: string;
}

export interface AppScriptConfig {
  webAppUrl: string;
  isConnected: boolean;
  lastSyncTime: string | null;
  autoSync: boolean;
}

export interface CooperativeStats {
  totalKas: number;
  totalSimpananPokok: number;
  totalSimpananWajib: number;
  totalSimpananSukarela: number;
  totalSimpananSemua: number;
  totalPinjamanAktif: number;
  totalSisaPinjaman: number;
  totalJasaPendapatan: number;
  totalAnggota: number;
}

export interface CooperativeProfile {
  name: string;
  shortName: string;
  legalNumber: string;
  nib: string;
  establishedDate: string;
  address: string;
  village: string;
  subDistrict: string;
  regency: string;
  province: string;
  postalCode: string;
  phone: string;
  whatsapp: string;
  email: string;
  leaderName: string;
  secretaryName: string;
  treasurerName: string;
  supervisorName: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountHolder: string;
  vision: string;
  mission: string;
  interestRateDesc: string;
  simpananPokokDesc: string;
  simpananWajibDesc: string;
}
