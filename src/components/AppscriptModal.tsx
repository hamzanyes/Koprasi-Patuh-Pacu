import React, { useState } from 'react';
import { 
  Code2, 
  Copy, 
  Check, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  FileSpreadsheet, 
  ArrowRight, 
  Sparkles,
  X,
  RefreshCw
} from 'lucide-react';
import { AppScriptConfig } from '../types';
import { APPSCRIPT_CODE } from '../data/appscriptCode';
import { testAppscriptConnection } from '../services/appscriptService';

interface AppscriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AppScriptConfig;
  onSaveConfig: (config: AppScriptConfig) => void;
  onSyncNow?: () => void;
}

export const AppscriptModal: React.FC<AppscriptModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  onSyncNow,
}) => {
  const [activeTab, setActiveTab] = useState<'panduan' | 'kode' | 'koneksi'>('koneksi');
  const [urlInput, setUrlInput] = useState(config.webAppUrl || '');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleTestAndSave = async () => {
    setIsTesting(true);
    setTestResult(null);

    const result = await testAppscriptConnection(urlInput.trim());
    setIsTesting(false);
    setTestResult(result);

    if (result.success) {
      onSaveConfig({
        ...config,
        webAppUrl: urlInput.trim(),
        isConnected: true,
        lastSyncTime: new Date().toLocaleTimeString('id-ID'),
      });
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(APPSCRIPT_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">
                Pusat Integrasi Google Apps Script
              </h3>
              <p className="text-xs text-slate-500">
                Hubungkan Koperasi Patuh Pacu dengan Google Sheets sebagai database utama
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 mt-4 shrink-0 text-xs sm:text-sm font-semibold">
          <button
            onClick={() => setActiveTab('koneksi')}
            className={`pb-2.5 px-4 border-b-2 transition ${
              activeTab === 'koneksi'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            1. Koneksi Web App URL
          </button>
          <button
            onClick={() => setActiveTab('kode')}
            className={`pb-2.5 px-4 border-b-2 transition ${
              activeTab === 'kode'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            2. Salin Script (Code.gs)
          </button>
          <button
            onClick={() => setActiveTab('panduan')}
            className={`pb-2.5 px-4 border-b-2 transition ${
              activeTab === 'panduan'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            3. Panduan Google Sheets
          </button>
        </div>

        {/* Content Area */}
        <div className="py-4 overflow-y-auto grow space-y-4">
          {activeTab === 'koneksi' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-700" />
                  Mode Operasional Koperasi Patuh Pacu
                </div>
                <p className="text-emerald-800 leading-relaxed">
                  Aplikasi ini dapat berjalan dalam <strong>Mode Lokal</strong> (data tersimpan di browser) maupun 
                  <strong> Mode Google Apps Script</strong> (data disinkronkan secara langsung ke Google Spreadsheet organisasi Anda).
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  URL Web App Google Apps Script (berakhiran /exec)
                </label>
                <div className="relative">
                  <input
                    type="url"
                    placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 font-mono"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Didapatkan dari menu Penerapan (Deploy) &gt; Penerapan Baru (New Deployment) di Google Apps Script.
                </p>
              </div>

              {testResult && (
                <div
                  className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                    testResult.success
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      : 'bg-amber-50 border-amber-300 text-amber-800'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-bold">
                      {testResult.success ? 'Koneksi Berhasil!' : 'Koneksi Belum Terhubung'}
                    </div>
                    <div className="mt-0.5">{testResult.message}</div>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleTestAndSave}
                  disabled={isTesting || !urlInput.trim()}
                  className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isTesting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Sedang Menghubungkan...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Uji &amp; Simpan URL AppScript
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'kode' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">
                  File: <code className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono">Code.gs</code>
                </span>
                <button
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-xs"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Tersalin ke Clipboard!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Salin Seluruh Kode Script
                    </>
                  )}
                </button>
              </div>

              <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-900 text-slate-100 text-xs font-mono p-4 max-h-72 overflow-y-auto">
                <pre>{APPSCRIPT_CODE}</pre>
              </div>
              <p className="text-[11px] text-slate-500">
                *Kode ini mencakup fungsi otomatis pembuatan 4 sheet: <code>ANGGOTA</code>, <code>SIMPANAN</code>, <code>PINJAMAN</code>, dan <code>MUTASI_KAS</code>.
              </p>
            </div>
          )}

          {activeTab === 'panduan' && (
            <div className="space-y-3 text-xs text-slate-700">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                  Langkah 1: Siapkan Spreadsheet Baru
                </span>
                <p className="text-slate-600">
                  Buka Google Sheets di browser Anda, beri nama: <strong>"DATABASE KOPERASI PATUH PACU"</strong>.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-emerald-700" />
                  Langkah 2: Buka Apps Script &amp; Tempel Kode
                </span>
                <p className="text-slate-600">
                  Di Google Sheets, klik menu <strong>Ekstensi &gt; Apps Script</strong>. Hapus kode default, lalu tempelkan kode dari tab <em>"Salin Script (Code.gs)"</em>.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-700" />
                  Langkah 3: Jalankan Inisialisasi Tabel
                </span>
                <p className="text-slate-600">
                  Pilih fungsi <code>inisialisasiSpreadsheet</code> di toolbar atas Apps Script, lalu klik <strong>Jalankan (Run)</strong>. Ini akan membuat header tabel otomatis dengan format warna hijau Koperasi Patuh Pacu.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <ExternalLink className="w-4 h-4 text-emerald-700" />
                  Langkah 4: Deploy Sebagai Aplikasi Web
                </span>
                <p className="text-slate-600">
                  Klik <strong>Terapkan (Deploy) &gt; Penerapan Baru</strong>. Pilih jenis <strong>Aplikasi Web</strong>. Atur:
                  <br />&bull; <em>Jalankan sebagai:</em> Saya
                  <br />&bull; <em>Siapa yang memiliki akses:</em> <strong>Siapa saja (Anyone)</strong>.
                  <br />Salin URL web app dan tempelkan ke tab <em>"Koneksi Web App URL"</em> di aplikasi ini!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
