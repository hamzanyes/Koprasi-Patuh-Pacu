export const APPSCRIPT_CODE = `/**
 * =========================================================================
 * KOPERASI PATUH PACU - GOOGLE APPS SCRIPT BACKEND (Code.gs)
 * =========================================================================
 * Script ini berfungsi sebagai API RESTful sederhana untuk menghubungkan
 * aplikasi web Koperasi Patuh Pacu dengan Google Spreadsheet.
 * 
 * CARA MENGGUNAKAN:
 * 1. Buka Google Sheets baru di Google Drive Anda.
 * 2. Beri judul spreadsheet: "DATABASE KOPERASI PATUH PACU".
 * 3. Buka menu: Ekstensi > Apps Script.
 * 4. Hapus semua kode default dan tempelkan seluruh kode ini.
 * 5. Simpan (Ctrl+S atau ikon Disket).
 * 6. Jalankan fungsi 'inisialisasiSpreadsheet' sekali untuk membuat tabel.
 * 7. Klik 'Terapkan' (Deploy) > 'Penerapan Baru' (New Deployment).
 * 8. Pilih jenis: 'Aplikasi Web' (Web App).
 *    - Deskripsi: API Koperasi Patuh Pacu v1.0
 *    - Jalankan sebagai: Saya (Email Anda)
 *    - Siapa yang memiliki akses: Siapa saja (Anyone) -> Agar web app bisa membaca/menulis
 * 9. Salin URL Aplikasi Web (berakhiran /exec) dan tempelkan ke aplikasi Koperasi Patuh Pacu.
 */

// Konstanta Nama Sheet
const SHEET_ANGGOTA = 'ANGGOTA';
const SHEET_SIMPANAN = 'SIMPANAN';
const SHEET_PINJAMAN = 'PINJAMAN';
const SHEET_KAS = 'MUTASI_KAS';

/**
 * Inisialisasi struktur sheet dan header tabel
 */
function inisialisasiSpreadsheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Sheet Anggota
  let sheetAnggota = ss.getSheetByName(SHEET_ANGGOTA);
  if (!sheetAnggota) {
    sheetAnggota = ss.insertSheet(SHEET_ANGGOTA);
    sheetAnggota.appendRow([
      'ID', 'No Anggota', 'Nama Lengkap', 'NIK', 'No WhatsApp', 
      'Alamat', 'Jabatan', 'Status', 'Tanggal Gabung', 
      'Simpanan Pokok', 'Simpanan Wajib', 'Simpanan Sukarela'
    ]);
    sheetAnggota.getRange(1, 1, 1, 12).setBackground('#059669').setFontColor('#FFFFFF').setFontWeight('bold');
  }

  // 2. Sheet Simpanan
  let sheetSimpanan = ss.getSheetByName(SHEET_SIMPANAN);
  if (!sheetSimpanan) {
    sheetSimpanan = ss.insertSheet(SHEET_SIMPANAN);
    sheetSimpanan.appendRow([
      'ID', 'No Bukti / Kuitansi', 'Tanggal', 'No Anggota', 'Nama Anggota',
      'Jenis Simpanan', 'Jenis Transaksi', 'Jumlah (Rp)', 'Keterangan', 'Petugas'
    ]);
    sheetSimpanan.getRange(1, 1, 1, 10).setBackground('#059669').setFontColor('#FFFFFF').setFontWeight('bold');
  }

  // 3. Sheet Pinjaman
  let sheetPinjaman = ss.getSheetByName(SHEET_PINJAMAN);
  if (!sheetPinjaman) {
    sheetPinjaman = ss.insertSheet(SHEET_PINJAMAN);
    sheetPinjaman.appendRow([
      'ID', 'No Pinjaman', 'No Anggota', 'Nama Anggota', 'Tanggal Pengajuan',
      'Plafon Pinjaman', 'Jasa per Bulan (%)', 'Tenor (Bulan)', 'Tujuan', 
      'Angsuran Bulanan', 'Sisa Pokok', 'Angsuran Terbayar', 'Status'
    ]);
    sheetPinjaman.getRange(1, 1, 1, 13).setBackground('#059669').setFontColor('#FFFFFF').setFontWeight('bold');
  }

  // 4. Sheet Kas
  let sheetKas = ss.getSheetByName(SHEET_KAS);
  if (!sheetKas) {
    sheetKas = ss.insertSheet(SHEET_KAS);
    sheetKas.appendRow([
      'ID', 'Tanggal', 'Tipe', 'Kategori', 'Jumlah (Rp)', 
      'Keterangan', 'No Referensi', 'Petugas'
    ]);
    sheetKas.getRange(1, 1, 1, 8).setBackground('#059669').setFontColor('#FFFFFF').setFontWeight('bold');
  }

  return 'Inisialisasi tabel Koperasi Patuh Pacu berhasil!';
}

/**
 * Handle HTTP GET Request (Membaca seluruh data koperasi)
 */
function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Pastikan sheet ada
    let sheetAnggota = ss.getSheetByName(SHEET_ANGGOTA);
    if (!sheetAnggota) {
      inisialisasiSpreadsheet();
      sheetAnggota = ss.getSheetByName(SHEET_ANGGOTA);
    }
    
    const sheetSimpanan = ss.getSheetByName(SHEET_SIMPANAN);
    const sheetPinjaman = ss.getSheetByName(SHEET_PINJAMAN);
    const sheetKas = ss.getSheetByName(SHEET_KAS);

    const anggotaData = getSheetRows(sheetAnggota);
    const simpananData = getSheetRows(sheetSimpanan);
    const pinjamanData = getSheetRows(sheetPinjaman);
    const kasData = getSheetRows(sheetKas);

    const response = {
      status: 'success',
      koperasi: 'KOPERASI PATUH PACU',
      timestamp: new Date().toISOString(),
      data: {
        anggota: anggotaData,
        simpanan: simpananData,
        pinjaman: pinjamanData,
        kas: kasData
      }
    };

    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle HTTP POST Request (Menambah transaksi / anggota baru)
 */
function doPost(e) {
  try {
    let payload = {};
    if (e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const action = payload.action;

    if (action === 'TAMBAH_ANGGOTA') {
      const a = payload.data;
      const sheet = ss.getSheetByName(SHEET_ANGGOTA);
      sheet.appendRow([
        a.id, a.memberNo, a.name, a.nik, a.phone,
        a.address, a.role, a.status, a.joinedDate,
        a.simpananPokok, a.simpananWajib, a.simpananSukarela
      ]);
    } else if (action === 'EDIT_ANGGOTA') {
      const a = payload.data;
      const sheet = ss.getSheetByName(SHEET_ANGGOTA);
      const data = sheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] == a.id || data[i][1] == a.memberNo) {
          sheet.getRange(i + 1, 3).setValue(a.name);
          sheet.getRange(i + 1, 4).setValue(a.nik);
          sheet.getRange(i + 1, 5).setValue(a.phone);
          sheet.getRange(i + 1, 6).setValue(a.address);
          sheet.getRange(i + 1, 7).setValue(a.role);
          sheet.getRange(i + 1, 8).setValue(a.status);
          sheet.getRange(i + 1, 9).setValue(a.joinedDate);
          sheet.getRange(i + 1, 10).setValue(a.simpananPokok);
          sheet.getRange(i + 1, 11).setValue(a.simpananWajib);
          sheet.getRange(i + 1, 12).setValue(a.simpananSukarela);
          break;
        }
      }
    } else if (action === 'HAPUS_ANGGOTA') {
      const a = payload.data;
      const sheet = ss.getSheetByName(SHEET_ANGGOTA);
      const data = sheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] == a.id || data[i][1] == a.memberNo) {
          sheet.deleteRow(i + 1);
          break;
        }
      }
    } else if (action === 'SIMPANAN') {
      const s = payload.data;
      const sheet = ss.getSheetByName(SHEET_SIMPANAN);
      sheet.appendRow([
        s.id, s.receiptNo, s.date, s.memberNo, s.memberName,
        s.type, s.action, s.amount, s.note, s.officer
      ]);
    } else if (action === 'AJUKAN_PINJAMAN') {
      const p = payload.data;
      const sheet = ss.getSheetByName(SHEET_PINJAMAN);
      sheet.appendRow([
        p.id, p.loanNo, p.memberNo, p.memberName, p.applicationDate,
        p.amount, p.interestRate, p.tenorMonths, p.purpose,
        p.monthlyInstallment, p.remainingPrincipal, p.paidInstallmentsCount, p.status
      ]);
    } else if (action === 'MUTASI_KAS') {
      const k = payload.data;
      const sheet = ss.getSheetByName(SHEET_KAS);
      sheet.appendRow([
        k.id, k.date, k.type, k.category, k.amount,
        k.description, k.referenceNo, k.officer
      ]);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Data berhasil disinkronkan ke Google Sheets Koperasi Patuh Pacu'
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Helper: Ambil data tabel sebagai array of objects
 */
function getSheetRows(sheet) {
  if (!sheet) return [];
  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];
  const headers = rows[0];
  const results = [];
  
  for (let i = 1; i < rows.length; i++) {
    const obj = {};
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = rows[i][j];
    }
    results.push(obj);
  }
  return results;
}
`;
