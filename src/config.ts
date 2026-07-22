/**
 * CONFIGURATION GLOBAL / KONFIGURASI GLOBAL
 * 
 * Silakan edit file ini untuk mengatur URL Google Apps Script Web App secara permanen.
 * Karena file ini berada di dalam kode sumber (codebase/GitHub), pengaturan di bawah ini
 * akan langsung diterapkan untuk SEMUA perangkat (HP siswa, laptop, tablet, dll.)
 * yang membuka aplikasi ini tanpa perlu mengisi ulang URL di setiap perangkat.
 */

export const GLOBAL_CONFIG = {
  // 1. URL Web App Google Apps Script (Wajib diisi agar data tersimpan otomatis ke Google Sheets)
  // Masukkan URL Web App yang Anda dapatkan setelah menyebarkan (deploy) Google Apps Script Anda.
  defaultGoogleSheetUrl: "https://script.google.com/macros/s/AKfycbxoKqF8Gg0WpWshLzW03mGj6D3uV-TqG8bM5X7v32hPzHkP5Y-B_QJ0f9f3g-25QsQ/exec", // <-- GANTI URL INI DENGAN URL WEB APP ANDA

  // 2. Kredensial Default Panel Guru / Admin
  defaultAdminId: "admin",
  defaultAdminPass: "admin123",

  // 3. Tema Standar Aplikasi ('mint' | 'ocean' | 'sunset' | 'cosmic' | 'lavender')
  defaultTheme: "mint" as const
};
