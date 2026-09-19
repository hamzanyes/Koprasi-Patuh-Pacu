import React, { useState, useEffect } from 'react';
import { Navbar, NavTabType } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { SavingsView } from './components/SavingsView';
import { LoansView } from './components/LoansView';
import { MembersView } from './components/MembersView';
import { CashFlowView } from './components/CashFlowView';
import { CooperativeProfileView } from './components/CooperativeProfileView';
import { AppscriptModal } from './components/AppscriptModal';
import { ReceiptModal } from './components/ReceiptModal';
import { MemberCardModal } from './components/MemberCardModal';
import { LoanAgreementModal } from './components/LoanAgreementModal';

import { 
  Member, 
  SavingsTransaction, 
  Loan, 
  CashTransaction, 
  AppScriptConfig,
  CooperativeProfile 
} from './types';

import { 
  INITIAL_MEMBERS, 
  INITIAL_SAVINGS_TRANSACTIONS, 
  INITIAL_LOANS, 
  INITIAL_CASH_TRANSACTIONS,
  INITIAL_KAS_POKOK,
  INITIAL_COOPERATIVE_PROFILE,
  formatRupiah
} from './data/initialData';

import { 
  getSavedConfig, 
  saveConfig, 
  pushToAppscript 
} from './services/appscriptService';

import { 
  Building2, 
  Sparkles, 
  FileSpreadsheet, 
  ShieldCheck, 
  Phone, 
  Mail, 
  CheckCircle 
} from 'lucide-react';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<NavTabType>('dashboard');

  // AppScript & Persistence
  const [appScriptConfig, setAppScriptConfig] = useState<AppScriptConfig>(() => getSavedConfig());
  const [isAppscriptModalOpen, setIsAppscriptModalOpen] = useState(false);

  // Active Modals
  const [receiptTrx, setReceiptTrx] = useState<SavingsTransaction | null>(null);
  const [memberCard, setMemberCard] = useState<Member | null>(null);
  const [agreementLoan, setAgreementLoan] = useState<Loan | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // State Profil Koperasi (Dapat diedit & tersimpan)
  const [cooperativeProfile, setCooperativeProfile] = useState<CooperativeProfile>(() => {
    try {
      const saved = localStorage.getItem('kpp_coop_profile_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_COOPERATIVE_PROFILE;
  });

  // State Data Koperasi (Memuat dari LocalStorage atau Sample Awal)
  const [members, setMembers] = useState<Member[]>(() => {
    try {
      const saved = localStorage.getItem('kpp_members_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_MEMBERS;
  });

  const [savings, setSavings] = useState<SavingsTransaction[]>(() => {
    try {
      const saved = localStorage.getItem('kpp_savings_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_SAVINGS_TRANSACTIONS;
  });

  const [loans, setLoans] = useState<Loan[]>(() => {
    try {
      const saved = localStorage.getItem('kpp_loans_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_LOANS;
  });

  const [cashMovements, setCashMovements] = useState<CashTransaction[]>(() => {
    try {
      const saved = localStorage.getItem('kpp_cash_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_CASH_TRANSACTIONS;
  });

  // Hitung Saldo Kas Dinamis
  const totalKas = React.useMemo(() => {
    const totalMasuk = cashMovements
      .filter((c) => c.type === 'Masuk')
      .reduce((sum, c) => sum + c.amount, 0);
    const totalKeluar = cashMovements
      .filter((c) => c.type === 'Keluar')
      .reduce((sum, c) => sum + c.amount, 0);
    return INITIAL_KAS_POKOK + totalMasuk - totalKeluar;
  }, [cashMovements]);

  // Simpan ke LocalStorage setiap ada mutasi data
  useEffect(() => {
    localStorage.setItem('kpp_members_v1', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem('kpp_savings_v1', JSON.stringify(savings));
  }, [savings]);

  useEffect(() => {
    localStorage.setItem('kpp_loans_v1', JSON.stringify(loans));
  }, [loans]);

  useEffect(() => {
    localStorage.setItem('kpp_cash_v1', JSON.stringify(cashMovements));
  }, [cashMovements]);

  useEffect(() => {
    localStorage.setItem('kpp_coop_profile_v1', JSON.stringify(cooperativeProfile));
  }, [cooperativeProfile]);

  // Handler: Update Profil Koperasi
  const handleUpdateCooperativeProfile = (updated: CooperativeProfile) => {
    setCooperativeProfile(updated);
    if (appScriptConfig.webAppUrl) {
      pushToAppscript(appScriptConfig.webAppUrl, 'UPDATE_PROFIL_KOPERASI', updated);
    }
    showToast('Profil Koperasi Patuh Pacu berhasil diperbarui dan disimpan!');
  };

  // Handler: Catat Transaksi Simpanan Baru
  const handleAddSavings = (trxData: Omit<SavingsTransaction, 'id' | 'receiptNo'>) => {
    const nextNum = savings.length + 1;
    const padNum = String(nextNum).padStart(3, '0');
    const now = new Date();
    const ym = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const receiptNo = `KPP-SMP-${ym}-${padNum}`;

    const newTrx: SavingsTransaction = {
      ...trxData,
      id: `trx-${Date.now()}`,
      receiptNo,
    };

    // 1. Tambah riwayat simpanan
    setSavings((prev) => [newTrx, ...prev]);

    // 2. Update saldo anggota
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id !== trxData.memberId) return m;
        const multiplier = trxData.action === 'Setor' ? 1 : -1;
        const amount = trxData.amount * multiplier;

        if (trxData.type === 'Pokok') {
          return { ...m, simpananPokok: Math.max(0, (m.simpananPokok || 0) + amount) };
        } else if (trxData.type === 'Wajib') {
          return { ...m, simpananWajib: Math.max(0, (m.simpananWajib || 0) + amount) };
        } else {
          return { ...m, simpananSukarela: Math.max(0, (m.simpananSukarela || 0) + amount) };
        }
      })
    );

    // 3. Catat di Buku Kas
    const cashType = trxData.action === 'Setor' ? 'Masuk' : 'Keluar';
    const newCashTrx: CashTransaction = {
      id: `csh-${Date.now()}`,
      date: trxData.date,
      type: cashType,
      category: trxData.action === 'Setor' ? 'Simpanan' : 'Penarikan Simpanan',
      amount: trxData.amount,
      description: `${trxData.action} Simpanan ${trxData.type} an. ${trxData.memberName}`,
      referenceNo: receiptNo,
      officer: trxData.officer,
    };
    setCashMovements((prev) => [newCashTrx, ...prev]);

    // 4. Sinkronisasi ke Google Apps Script jika terhubung
    if (appScriptConfig.webAppUrl) {
      pushToAppscript(appScriptConfig.webAppUrl, 'SIMPANAN', newTrx);
      pushToAppscript(appScriptConfig.webAppUrl, 'MUTASI_KAS', newCashTrx);
    }

    // Tampilkan notifikasi & kuitansi langsung
    showToast(`Transaksi Simpanan ${receiptNo} berhasil dibukukan!`);
    setReceiptTrx(newTrx);
  };

  // Handler: Pengajuan Pinjaman Baru (Suku Bunga 20% per semester)
  const handleApplyLoan = (loanData: Omit<Loan, 'id' | 'loanNo' | 'payments' | 'remainingPrincipal' | 'paidInstallmentsCount' | 'monthlyInstallment'>) => {
    const loanNum = `PINJ-${new Date().getFullYear()}-${String(loans.length + 1).padStart(3, '0')}`;
    const monthlyPokok = Math.round(loanData.amount / loanData.tenorMonths);
    // Bunga 20% per semester (6 bulan) = 20% / 6 = 3.33% per bulan
    const monthlyJasa = Math.round((loanData.amount * 0.20) / 6);
    const monthlyInstallment = monthlyPokok + monthlyJasa;

    const newLoan: Loan = {
      ...loanData,
      id: `loan-${Date.now()}`,
      loanNo: loanNum,
      interestRate: 20, // 20% per semester
      monthlyInstallment,
      remainingPrincipal: loanData.amount,
      paidInstallmentsCount: 0,
      payments: [],
    };

    setLoans((prev) => [newLoan, ...prev]);

    if (appScriptConfig.webAppUrl) {
      pushToAppscript(appScriptConfig.webAppUrl, 'AJUKAN_PINJAMAN', newLoan);
    }

    // Buka Surat Perjanjian & Kuitansi otomatis
    setAgreementLoan(newLoan);
    showToast(`Pengajuan Pinjaman ${loanNum} disimpan. Surat Perjanjian & Kuitansi diterbitkan.`);
  };

  // Handler: Setujui Pinjaman
  const handleApproveLoan = (loanId: string) => {
    const targetLoan = loans.find((l) => l.id === loanId);
    if (!targetLoan) return;

    setLoans((prev) =>
      prev.map((l) => (l.id === loanId ? { ...l, status: 'Berjalan' } : l))
    );

    // Kas keluar untuk pencairan dana pinjaman
    const cashTrx: CashTransaction = {
      id: `csh-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      type: 'Keluar',
      category: 'Pencairan Pinjaman',
      amount: targetLoan.amount,
      description: `Pencairan pembiayaan ${targetLoan.loanNo} an. ${targetLoan.memberName}`,
      referenceNo: targetLoan.loanNo,
      officer: 'Siti Nurhaliza (Bendahara)',
    };
    setCashMovements((prev) => [cashTrx, ...prev]);

    if (appScriptConfig.webAppUrl) {
      pushToAppscript(appScriptConfig.webAppUrl, 'MUTASI_KAS', cashTrx);
    }

    showToast(`Pinjaman ${targetLoan.loanNo} disetujui & dana sebesar ${formatRupiah(targetLoan.amount)} dicairkan.`);
  };

  // Handler: Bayar Angsuran Pinjaman
  const handlePayInstallment = (
    loanId: string,
    amountPokok: number,
    amountJasa: number,
    officer: string
  ) => {
    const targetLoan = loans.find((l) => l.id === loanId);
    if (!targetLoan) return;

    const newPaidCount = targetLoan.paidInstallmentsCount + 1;
    const newRemaining = Math.max(0, targetLoan.remainingPrincipal - amountPokok);
    const isCompleted = newPaidCount >= targetLoan.tenorMonths || newRemaining === 0;

    const paymentRecord = {
      id: `pay-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      installmentNo: newPaidCount,
      amountPokok,
      amountJasa,
      totalPaid: amountPokok + amountJasa,
      officer,
    };

    setLoans((prev) =>
      prev.map((l) => {
        if (l.id !== loanId) return l;
        return {
          ...l,
          paidInstallmentsCount: newPaidCount,
          remainingPrincipal: newRemaining,
          status: isCompleted ? 'Lunas' : 'Berjalan',
          payments: [paymentRecord, ...l.payments],
        };
      })
    );

    // Catat kas masuk dari angsuran
    const cashTrx: CashTransaction = {
      id: `csh-${Date.now()}`,
      date: paymentRecord.date,
      type: 'Masuk',
      category: 'Angsuran Pinjaman',
      amount: paymentRecord.totalPaid,
      description: `Angsuran ke-${newPaidCount} ${targetLoan.loanNo} an. ${targetLoan.memberName} (Pokok: ${formatRupiah(amountPokok)}, Jasa: ${formatRupiah(amountJasa)})`,
      referenceNo: targetLoan.loanNo,
      officer,
    };
    setCashMovements((prev) => [cashTrx, ...prev]);

    if (appScriptConfig.webAppUrl) {
      pushToAppscript(appScriptConfig.webAppUrl, 'MUTASI_KAS', cashTrx);
    }

    showToast(`Angsuran ke-${newPaidCount} ${targetLoan.memberName} berhasil dibayar!`);
  };

  // Handler: Tambah Anggota Baru
  const handleAddMember = (newMemberData: Omit<Member, 'id' | 'memberNo'>) => {
    const nextNo = `PP-${String(members.length + 1).padStart(3, '0')}`;
    const newMember: Member = {
      ...newMemberData,
      id: `mem-${Date.now()}`,
      memberNo: nextNo,
    };

    setMembers((prev) => [...prev, newMember]);

    // Jika ada setoran awal, bukukan langsung
    const totalSetoranAwal = (newMember.simpananPokok || 0) + (newMember.simpananWajib || 0);
    if (totalSetoranAwal > 0) {
      const cashTrx: CashTransaction = {
        id: `csh-${Date.now()}`,
        date: newMember.joinedDate,
        type: 'Masuk',
        category: 'Simpanan',
        amount: totalSetoranAwal,
        description: `Setoran awal anggota baru ${newMember.name} (${newMember.memberNo})`,
        referenceNo: `KPP-REG-${nextNo}`,
        officer: 'Siti Nurhaliza (Bendahara)',
      };
      setCashMovements((prev) => [cashTrx, ...prev]);
    }

    if (appScriptConfig.webAppUrl) {
      pushToAppscript(appScriptConfig.webAppUrl, 'TAMBAH_ANGGOTA', newMember);
    }

    showToast(`Anggota baru ${newMember.name} (${nextNo}) berhasil didaftarkan!`);
    setMemberCard(newMember);
  };

  // Handler: Update / Edit Data Anggota
  const handleUpdateMember = (updatedMember: Member) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === updatedMember.id ? updatedMember : m))
    );

    // Perbarui nama & no anggota pada pinjaman aktif jika diubah
    setLoans((prev) =>
      prev.map((l) =>
        l.memberId === updatedMember.id
          ? { ...l, memberName: updatedMember.name, memberNo: updatedMember.memberNo }
          : l
      )
    );

    // Perbarui nama & no anggota pada riwayat simpanan jika diubah
    setSavings((prev) =>
      prev.map((s) =>
        s.memberId === updatedMember.id
          ? { ...s, memberName: updatedMember.name, memberNo: updatedMember.memberNo }
          : s
      )
    );

    if (appScriptConfig.webAppUrl) {
      pushToAppscript(appScriptConfig.webAppUrl, 'EDIT_ANGGOTA', updatedMember);
    }

    showToast(`Data anggota ${updatedMember.name} (${updatedMember.memberNo}) berhasil diperbarui!`);
  };

  // Handler: Hapus Anggota
  const handleDeleteMember = (memberId: string) => {
    const target = members.find((m) => m.id === memberId);
    if (!target) return;

    setMembers((prev) => prev.filter((m) => m.id !== memberId));

    if (appScriptConfig.webAppUrl) {
      pushToAppscript(appScriptConfig.webAppUrl, 'HAPUS_ANGGOTA', {
        id: target.id,
        memberNo: target.memberNo,
      });
    }

    showToast(`Anggota ${target.name} (${target.memberNo}) berhasil dihapus.`);
  };

  // Handler: Catat Kas Manual
  const handleAddCashMovement = (trx: Omit<CashTransaction, 'id'>) => {
    const newTrx: CashTransaction = {
      ...trx,
      id: `csh-${Date.now()}`,
    };
    setCashMovements((prev) => [newTrx, ...prev]);

    if (appScriptConfig.webAppUrl) {
      pushToAppscript(appScriptConfig.webAppUrl, 'MUTASI_KAS', newTrx);
    }

    showToast(`Catatan kas sebesar ${formatRupiah(trx.amount)} berhasil disimpan.`);
  };

  // Handler: Simpan Konfigurasi Appscript
  const handleSaveConfig = (cfg: AppScriptConfig) => {
    setAppScriptConfig(cfg);
    saveConfig(cfg);
    showToast('Konfigurasi Google Apps Script diperbarui!');
  };

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs sm:text-sm border border-slate-700 animate-fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        appScriptConfig={appScriptConfig}
        onOpenAppscriptModal={() => setIsAppscriptModalOpen(true)}
        pendingLoansCount={loans.filter((l) => l.status === 'Menunggu').length}
        membersCount={members.length}
      />

      {/* Main View Container */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 grow">
        {activeTab === 'dashboard' && (
          <DashboardView
            members={members}
            savings={savings}
            loans={loans}
            cashMovements={cashMovements}
            totalKas={totalKas}
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenAppscript={() => setIsAppscriptModalOpen(true)}
            onViewReceipt={(trx) => setReceiptTrx(trx)}
          />
        )}

        {activeTab === 'simpanan' && (
          <SavingsView
            members={members}
            savings={savings}
            onAddSavings={handleAddSavings}
            onViewReceipt={(trx) => setReceiptTrx(trx)}
          />
        )}

        {activeTab === 'pinjaman' && (
          <LoansView
            members={members}
            loans={loans}
            onApplyLoan={handleApplyLoan}
            onPayInstallment={handlePayInstallment}
            onApproveLoan={handleApproveLoan}
            onViewAgreement={(loan) => setAgreementLoan(loan)}
          />
        )}

        {activeTab === 'anggota' && (
          <MembersView
            members={members}
            loans={loans}
            onAddMember={handleAddMember}
            onEditMember={handleUpdateMember}
            onDeleteMember={handleDeleteMember}
            onViewMemberCard={(m) => setMemberCard(m)}
          />
        )}

        {activeTab === 'kas' && (
          <CashFlowView
            cashMovements={cashMovements}
            totalKas={totalKas}
            onAddCashMovement={handleAddCashMovement}
            members={members}
            loans={loans}
            savings={savings}
            profile={cooperativeProfile}
          />
        )}

        {activeTab === 'profil' && (
          <CooperativeProfileView
            profile={cooperativeProfile}
            onUpdateProfile={handleUpdateCooperativeProfile}
            totalMembersCount={members.length}
            totalKasAmount={totalKas}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-10 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-emerald-700 text-white flex items-center justify-center font-bold text-[10px]">
              PP
            </div>
            <span className="font-semibold text-slate-700">
              Koperasi Patuh Pacu &copy; {new Date().getFullYear()}
            </span>
            <span>&bull; Transparan &bull; Akuntabel &bull; Terpercaya</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsAppscriptModalOpen(true)}
              className="text-emerald-700 hover:underline flex items-center gap-1 font-medium"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Backend Google Apps Script
            </button>
            <span>&bull;</span>
            <span className="flex items-center gap-1 text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Sistem Buku Kas Terverifikasi
            </span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AppscriptModal
        isOpen={isAppscriptModalOpen}
        onClose={() => setIsAppscriptModalOpen(false)}
        config={appScriptConfig}
        onSaveConfig={handleSaveConfig}
      />

      <ReceiptModal
        transaction={receiptTrx}
        onClose={() => setReceiptTrx(null)}
      />

      <MemberCardModal
        member={memberCard}
        onClose={() => setMemberCard(null)}
      />

      {agreementLoan && (
        <LoanAgreementModal
          loan={agreementLoan}
          member={members.find((m) => m.id === agreementLoan.memberId)}
          onClose={() => setAgreementLoan(null)}
        />
      )}
    </div>
  );
}
