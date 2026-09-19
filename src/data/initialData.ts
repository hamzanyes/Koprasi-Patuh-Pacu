import { Member, SavingsTransaction, Loan, CashTransaction, CooperativeProfile } from '../types';

export const INITIAL_MEMBERS: Member[] = [
  {
    id: 'mem-1',
    memberNo: 'PP-001',
    name: 'Haji Mansyur Efendi',
    phone: '0812-8821-4431',
    nik: '320114098200001',
    address: 'Jl. Melati No. 14, Dusun Pacu, RT 02/RW 03',
    role: 'Ketua',
    status: 'Pengurus',
    joinedDate: '2023-01-10',
    simpananPokok: 200000,
    simpananWajib: 450000,
    simpananSukarela: 1500000,
  },
  {
    id: 'mem-2',
    memberNo: 'PP-002',
    name: 'Siti Nurhaliza Dewi',
    phone: '0857-1928-3344',
    nik: '320114098500002',
    address: 'Jl. Anggrek Indah Blok B2 No. 8',
    role: 'Bendahara',
    status: 'Pengurus',
    joinedDate: '2023-01-15',
    simpananPokok: 200000,
    simpananWajib: 450000,
    simpananSukarela: 2250000,
  },
  {
    id: 'mem-3',
    memberNo: 'PP-003',
    name: 'Budi Santoso Wibowo',
    phone: '0813-7765-9988',
    nik: '320114097800003',
    address: 'Kompleks Niaga Patuh Kav. 5',
    role: 'Sekretaris',
    status: 'Pengurus',
    joinedDate: '2023-02-01',
    simpananPokok: 200000,
    simpananWajib: 425000,
    simpananSukarela: 850000,
  },
  {
    id: 'mem-4',
    memberNo: 'PP-004',
    name: 'Ahmad Fauzi Rahman',
    phone: '0821-9988-1122',
    nik: '320114099000004',
    address: 'Desa Pacu Makmur RT 04/RW 01',
    role: 'Anggota',
    status: 'Aktif',
    joinedDate: '2023-03-12',
    simpananPokok: 100000,
    simpananWajib: 350000,
    simpananSukarela: 600000,
  },
  {
    id: 'mem-5',
    memberNo: 'PP-005',
    name: 'Rina Kusuma Wardhani',
    phone: '0878-3344-5566',
    nik: '320114099400005',
    address: 'Jl. Dahlia No. 27, Pacu Timur',
    role: 'Anggota',
    status: 'Aktif',
    joinedDate: '2023-05-20',
    simpananPokok: 100000,
    simpananWajib: 300000,
    simpananSukarela: 450000,
  },
  {
    id: 'mem-6',
    memberNo: 'PP-006',
    name: 'Supardi Hendrawan',
    phone: '0852-6677-8899',
    nik: '320114098000006',
    address: 'Sentra Pertanian Pacu Raya RT 01/RW 02',
    role: 'Anggota',
    status: 'Aktif',
    joinedDate: '2023-07-08',
    simpananPokok: 100000,
    simpananWajib: 275000,
    simpananSukarela: 1200000,
  },
  {
    id: 'mem-7',
    memberNo: 'PP-007',
    name: 'Dewi Lestari Safitri',
    phone: '0819-2233-4455',
    nik: '320114099600007',
    address: 'Perumahan Patuh Hijau Asri Blok C-12',
    role: 'Anggota',
    status: 'Aktif',
    joinedDate: '2023-09-14',
    simpananPokok: 100000,
    simpananWajib: 225000,
    simpananSukarela: 300000,
  },
  {
    id: 'mem-8',
    memberNo: 'PP-008',
    name: 'Bambang Tri Utomo',
    phone: '0812-3322-1100',
    nik: '320114097500008',
    address: 'Jl. Veteran No. 89, Patuh Utara',
    role: 'Anggota',
    status: 'Aktif',
    joinedDate: '2024-01-05',
    simpananPokok: 100000,
    simpananWajib: 175000,
    simpananSukarela: 500000,
  }
];

export const INITIAL_SAVINGS_TRANSACTIONS: SavingsTransaction[] = [
  {
    id: 'trx-101',
    receiptNo: 'KPP-SMP-202409-001',
    date: '2024-09-02',
    memberId: 'mem-1',
    memberName: 'Haji Mansyur Efendi',
    memberNo: 'PP-001',
    type: 'Wajib',
    action: 'Setor',
    amount: 50000,
    note: 'Simpanan wajib bulan September 2024',
    officer: 'Siti Nurhaliza (Bendahara)',
  },
  {
    id: 'trx-102',
    receiptNo: 'KPP-SMP-202409-002',
    date: '2024-09-03',
    memberId: 'mem-4',
    memberName: 'Ahmad Fauzi Rahman',
    memberNo: 'PP-004',
    type: 'Sukarela',
    action: 'Setor',
    amount: 300000,
    note: 'Tabungan hasil panen jagung',
    officer: 'Siti Nurhaliza (Bendahara)',
  },
  {
    id: 'trx-103',
    receiptNo: 'KPP-SMP-202409-003',
    date: '2024-09-05',
    memberId: 'mem-6',
    memberName: 'Supardi Hendrawan',
    memberNo: 'PP-006',
    type: 'Wajib',
    action: 'Setor',
    amount: 25000,
    note: 'Iuran wajib bulanan rutin',
    officer: 'Budi Santoso (Sekretaris)',
  },
  {
    id: 'trx-104',
    receiptNo: 'KPP-SMP-202409-010',
    date: '2024-09-10',
    memberId: 'mem-2',
    memberName: 'Siti Nurhaliza Dewi',
    memberNo: 'PP-002',
    type: 'Sukarela',
    action: 'Setor',
    amount: 500000,
    note: 'Penambahan simpanan sukarela hari raya',
    officer: 'Haji Mansyur (Ketua)',
  },
  {
    id: 'trx-105',
    receiptNo: 'KPP-SMP-202409-012',
    date: '2024-09-12',
    memberId: 'mem-5',
    memberName: 'Rina Kusuma Wardhani',
    memberNo: 'PP-005',
    type: 'Sukarela',
    action: 'Tarik',
    amount: 150000,
    note: 'Penarikan sukarela untuk belanja warung',
    officer: 'Siti Nurhaliza (Bendahara)',
  },
  {
    id: 'trx-106',
    receiptNo: 'KPP-SMP-202409-15',
    date: '2024-09-15',
    memberId: 'mem-8',
    memberName: 'Bambang Tri Utomo',
    memberNo: 'PP-008',
    type: 'Wajib',
    action: 'Setor',
    amount: 25000,
    note: 'Simpanan wajib reguler',
    officer: 'Siti Nurhaliza (Bendahara)',
  }
];

export const INITIAL_LOANS: Loan[] = [
  {
    id: 'loan-201',
    loanNo: 'PINJ-2024-001',
    memberId: 'mem-4',
    memberName: 'Ahmad Fauzi Rahman',
    memberNo: 'PP-004',
    applicationDate: '2024-06-10',
    amount: 2000000,
    interestRate: 20, // 20% per semester (6 bulan)
    tenorMonths: 10,
    purpose: 'Modal pengadaan bibit dan pupuk pertanian Pacu',
    status: 'Berjalan',
    monthlyInstallment: 266667, // Pokok 200.000 + Jasa 66.667 (2.000.000 * 20% / 6)
    remainingPrincipal: 1400000,
    paidInstallmentsCount: 3,
    payments: [
      {
        id: 'pay-1',
        date: '2024-07-10',
        installmentNo: 1,
        amountPokok: 200000,
        amountJasa: 66667,
        totalPaid: 266667,
        officer: 'Siti Nurhaliza Dewi',
      },
      {
        id: 'pay-2',
        date: '2024-08-10',
        installmentNo: 2,
        amountPokok: 200000,
        amountJasa: 66667,
        totalPaid: 266667,
        officer: 'Siti Nurhaliza Dewi',
      },
      {
        id: 'pay-3',
        date: '2024-09-10',
        installmentNo: 3,
        amountPokok: 200000,
        amountJasa: 66667,
        totalPaid: 266667,
        officer: 'Siti Nurhaliza Dewi',
      }
    ]
  },
  {
    id: 'loan-202',
    loanNo: 'PINJ-2024-002',
    memberId: 'mem-5',
    memberName: 'Rina Kusuma Wardhani',
    memberNo: 'PP-005',
    applicationDate: '2024-07-01',
    amount: 3000000,
    interestRate: 20, // 20% per semester
    tenorMonths: 6,
    purpose: 'Renovasi etalase toko sembako kelontong',
    status: 'Berjalan',
    monthlyInstallment: 600000, // Pokok 500.000 + Jasa 100.000 (3.000.000 * 20% / 6)
    remainingPrincipal: 2000000,
    paidInstallmentsCount: 2,
    payments: [
      {
        id: 'pay-201',
        date: '2024-08-01',
        installmentNo: 1,
        amountPokok: 500000,
        amountJasa: 100000,
        totalPaid: 600000,
        officer: 'Siti Nurhaliza Dewi',
      },
      {
        id: 'pay-202',
        date: '2024-09-01',
        installmentNo: 2,
        amountPokok: 500000,
        amountJasa: 100000,
        totalPaid: 600000,
        officer: 'Siti Nurhaliza Dewi',
      }
    ]
  },
  {
    id: 'loan-203',
    loanNo: 'PINJ-2024-003',
    memberId: 'mem-7',
    memberName: 'Dewi Lestari Safitri',
    memberNo: 'PP-007',
    applicationDate: '2024-09-12',
    amount: 1500000,
    interestRate: 20, // 20% per semester
    tenorMonths: 6,
    purpose: 'Biaya perlengkapan sekolah anak tahun ajaran baru',
    status: 'Menunggu',
    monthlyInstallment: 300000, // Pokok 250.000 + Jasa 50.000 (1.500.000 * 20% / 6)
    remainingPrincipal: 1500000,
    paidInstallmentsCount: 0,
    payments: []
  },
  {
    id: 'loan-204',
    loanNo: 'PINJ-2024-004',
    memberId: 'mem-6',
    memberName: 'Supardi Hendrawan',
    memberNo: 'PP-006',
    applicationDate: '2024-01-15',
    amount: 1000000,
    interestRate: 20, // 20% per semester
    tenorMonths: 6,
    purpose: 'Perbaikan pompa irigasi sawah kelompok',
    status: 'Lunas',
    monthlyInstallment: 200000, // Pokok 166.667 + Jasa 33.333
    remainingPrincipal: 0,
    paidInstallmentsCount: 6,
    payments: []
  }
];

export const INITIAL_CASH_TRANSACTIONS: CashTransaction[] = [
  {
    id: 'csh-1',
    date: '2024-09-01',
    type: 'Masuk',
    category: 'Angsuran Pinjaman',
    amount: 536000,
    description: 'Angsuran ke-2 Rina Kusuma Wardhani (PP-005)',
    referenceNo: 'PINJ-2024-002',
    officer: 'Siti Nurhaliza Dewi',
  },
  {
    id: 'csh-2',
    date: '2024-09-02',
    type: 'Masuk',
    category: 'Simpanan',
    amount: 50000,
    description: 'Setoran Simpanan Wajib H. Mansyur Efendi',
    referenceNo: 'KPP-SMP-202409-001',
    officer: 'Siti Nurhaliza Dewi',
  },
  {
    id: 'csh-3',
    date: '2024-09-03',
    type: 'Masuk',
    category: 'Simpanan',
    amount: 300000,
    description: 'Setoran Simpanan Sukarela Ahmad Fauzi Rahman',
    referenceNo: 'KPP-SMP-202409-002',
    officer: 'Siti Nurhaliza Dewi',
  },
  {
    id: 'csh-4',
    date: '2024-09-05',
    type: 'Keluar',
    category: 'Operasional',
    amount: 120000,
    description: 'Pembelian buku kas, map arsip, dan tinta stempel Koperasi',
    referenceNo: 'BKK-09-001',
    officer: 'Budi Santoso Wibowo',
  },
  {
    id: 'csh-5',
    date: '2024-09-10',
    type: 'Masuk',
    category: 'Angsuran Pinjaman',
    amount: 560000,
    description: 'Angsuran ke-3 Ahmad Fauzi Rahman (PP-004)',
    referenceNo: 'PINJ-2024-001',
    officer: 'Siti Nurhaliza Dewi',
  },
  {
    id: 'csh-6',
    date: '2024-09-12',
    type: 'Keluar',
    category: 'Penarikan Simpanan',
    amount: 150000,
    description: 'Penarikan simpanan sukarela Rina Kusuma Wardhani',
    referenceNo: 'KPP-SMP-202409-012',
    officer: 'Siti Nurhaliza Dewi',
  }
];

export const LOAN_CEILINGS = [
  250000,
  500000,
  1000000,
  1500000,
  2000000,
  2500000,
  3000000,
] as const;

export const SEMESTER_INTEREST_RATE = 20; // 20% per semester (6 bulan)
export const MONTHLY_INTEREST_RATE = 20 / 6; // 3.3333333% per bulan (20% / 6 bulan)

export const INITIAL_KAS_POKOK = 25000000; // Modal awal kas koperasi

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function terbilang(angka: number): string {
  const bilangan = [
    '',
    'Satu',
    'Dua',
    'Tiga',
    'Empat',
    'Lima',
    'Enam',
    'Tujuh',
    'Delapan',
    'Sembilan',
    'Sepuluh',
    'Sebelas',
  ];

  const num = Math.floor(Math.abs(angka));

  if (num === 0) return 'Nol';
  if (num < 12) {
    return bilangan[num];
  } else if (num < 20) {
    return `${terbilang(num - 10)} Belas`;
  } else if (num < 100) {
    const sisa = num % 10;
    return `${terbilang(Math.floor(num / 10))} Puluh${sisa ? ' ' + terbilang(sisa) : ''}`.trim();
  } else if (num < 200) {
    const sisa = num - 100;
    return `Seratus${sisa ? ' ' + terbilang(sisa) : ''}`.trim();
  } else if (num < 1000) {
    const sisa = num % 100;
    return `${terbilang(Math.floor(num / 100))} Ratus${sisa ? ' ' + terbilang(sisa) : ''}`.trim();
  } else if (num < 2000) {
    const sisa = num - 1000;
    return `Seribu${sisa ? ' ' + terbilang(sisa) : ''}`.trim();
  } else if (num < 1000000) {
    const sisa = num % 1000;
    return `${terbilang(Math.floor(num / 1000))} Ribu${sisa ? ' ' + terbilang(sisa) : ''}`.trim();
  } else if (num < 1000000000) {
    const sisa = num % 1000000;
    return `${terbilang(Math.floor(num / 1000000))} Juta${sisa ? ' ' + terbilang(sisa) : ''}`.trim();
  } else if (num < 1000000000000) {
    const sisa = num % 1000000000;
    return `${terbilang(Math.floor(num / 1000000000))} Miliar${sisa ? ' ' + terbilang(sisa) : ''}`.trim();
  }
  return String(num);
}

export function formatDateIndo(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateStr;
  }
}

export const INITIAL_COOPERATIVE_PROFILE: CooperativeProfile = {
  name: 'Koperasi Simpan Pinjam Patuh Pacu',
  shortName: 'Koperasi Patuh Pacu',
  legalNumber: 'AHU-0012948.AH.01.26.TAHUN 2023',
  nib: '9120003481231',
  establishedDate: '2023-01-05',
  address: 'Jl. Raya Pacu Makmur No. 12, RT 02 / RW 03',
  village: 'Desa Pacu Makmur',
  subDistrict: 'Kecamatan Pacu',
  regency: 'Kabupaten Pacu',
  province: 'Jawa Barat',
  postalCode: '41251',
  phone: '0812-8821-4431',
  whatsapp: '0812-8821-4431',
  email: 'koperasi.patuhpacu@gmail.com',
  leaderName: 'Haji Mansyur Efendi',
  secretaryName: 'Budi Santoso Wibowo',
  treasurerName: 'Siti Nurhaliza Dewi',
  supervisorName: 'Drs. H. Subarkah',
  bankName: 'Bank BRI (Bank Rakyat Indonesia)',
  bankAccountNumber: '4129-01-002341-53-8',
  bankAccountHolder: 'KSP PATUH PACU PUSAT',
  vision: 'Menjadi koperasi simpan pinjam terpercaya, amanah, mandiri, dan berdaya saing tinggi dalam meningkatkan taraf hidup ekonomi dan kesejahteraan anggota serta masyarakat Pacu.',
  mission: '1. Menyelenggarakan tata kelola simpan pinjam yang adil, transparan, tertib, dan berbasis kekeluargaan gotong royong.\n2. Mengembangkan digitalisasi administrasi dan literasi keuangan inklusif bagi seluruh anggota.\n3. Memberikan pembiayaan produktif dengan skema yang terjangkau bagi usaha mikro, petani, dan pedagang.\n4. Membangun sinergi kemitraan usaha yang berkelanjutan untuk meningkatkan Sisa Hasil Usaha (SHU).',
  interestRateDesc: '20% per semester (flat, setara 3,33% / bulan)',
  simpananPokokDesc: 'Rp 100.000 (sekali pada awal pendaftaran)',
  simpananWajibDesc: 'Rp 25.000 / bulan (disetor setiap bulan)',
};
