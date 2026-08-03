/* ============================================================
   storage.js — Modul Local Storage
   Wrapper sederhana di atas window.localStorage supaya seluruh
   akses baca/tulis penyimpanan lokal browser terpusat di satu
   tempat (memudahkan ganti mekanisme penyimpanan di masa depan
   tanpa mengubah kode di app.js).

   Dipakai sebagai: window.AppStorage.get(key, default)
                    window.AppStorage.set(key, value)
                    window.AppStorage.remove(key)

   Catatan: app.js saat ini masih memakai localStorage.getItem/
   setItem langsung untuk fitur yang sudah berjalan (Jadwal
   Pasaran, Shio, dll) supaya tidak mengubah perilaku yang sudah
   teruji. Modul ini disiapkan untuk fitur BARU ke depannya, atau
   untuk migrasi bertahap bila diperlukan.
   ============================================================ */
(function (window) {
  'use strict';

  function get(key, defaultValue) {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null || raw === undefined) return defaultValue !== undefined ? defaultValue : null;
      try {
        return JSON.parse(raw);
      } catch (e) {
        // Bukan JSON, kembalikan sebagai string mentah
        return raw;
      }
    } catch (e) {
      console.error('[AppStorage] Gagal membaca key "' + key + '":', e);
      return defaultValue !== undefined ? defaultValue : null;
    }
  }

  function set(key, value) {
    try {
      const toStore = typeof value === 'string' ? value : JSON.stringify(value);
      window.localStorage.setItem(key, toStore);
      return true;
    } catch (e) {
      console.error('[AppStorage] Gagal menyimpan key "' + key + '":', e);
      return false;
    }
  }

  function remove(key) {
    try {
      window.localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.error('[AppStorage] Gagal menghapus key "' + key + '":', e);
      return false;
    }
  }

  function has(key) {
    try {
      return window.localStorage.getItem(key) !== null;
    } catch (e) {
      return false;
    }
  }

  window.AppStorage = { get, set, remove, has };
})(window);
