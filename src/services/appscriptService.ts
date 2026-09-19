import { AppScriptConfig } from '../types';

const STORAGE_KEY_CONFIG = 'koperasi_patuh_pacu_config';
const STORAGE_KEY_MEMBERS = 'koperasi_patuh_pacu_members';
const STORAGE_KEY_SAVINGS = 'koperasi_patuh_pacu_savings';
const STORAGE_KEY_LOANS = 'koperasi_patuh_pacu_loans';
const STORAGE_KEY_CASH = 'koperasi_patuh_pacu_cash';

export function getSavedConfig(): AppScriptConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading config', e);
  }
  return {
    webAppUrl: '',
    isConnected: false,
    lastSyncTime: null,
    autoSync: false,
  };
}

export function saveConfig(config: AppScriptConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
  } catch (e) {
    console.error('Error saving config', e);
  }
}

/**
 * Tes koneksi ke Google Apps Script Web App
 */
export async function testAppscriptConnection(webAppUrl: string): Promise<{ success: boolean; message: string; data?: any }> {
  if (!webAppUrl || !webAppUrl.startsWith('https://script.google.com/macros/s/')) {
    return {
      success: false,
      message: 'Format URL tidak valid. Pastikan diawali dengan https://script.google.com/macros/s/.../exec',
    };
  }

  try {
    const url = new URL(webAppUrl);
    url.searchParams.set('t', Date.now().toString());

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return {
        success: false,
        message: `Server merespon dengan status HTTP ${response.status}`,
      };
    }

    const data = await response.json();
    if (data && (data.status === 'success' || data.koperasi)) {
      return {
        success: true,
        message: 'Koneksi ke Google Apps Script Koperasi Patuh Pacu berhasil terhubung!',
        data: data.data,
      };
    }

    return {
      success: true,
      message: 'Berhasil terhubung ke endpoint Apps Script.',
      data: data,
    };
  } catch (err: any) {
    // Note: Due to Google Apps Script CORS redirection, standard fetch in browser can throw if CORS headers aren't forwarded
    return {
      success: false,
      message: `Tidak dapat menghubungi Apps Script (${err.message || 'CORS / Network'}). Pastikan izin Web App disetel ke "Anyone" (Siapa saja).`,
    };
  }
}

/**
 * Kirim aksi data ke Apps Script via POST
 */
export async function pushToAppscript(webAppUrl: string, action: string, data: any): Promise<boolean> {
  if (!webAppUrl) return false;
  try {
    await fetch(webAppUrl, {
      method: 'POST',
      mode: 'no-cors', // Apps script redirect often requires no-cors in browser
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action, data }),
    });
    return true;
  } catch (e) {
    console.warn('Gagal sync ke Apps Script', e);
    return false;
  }
}
