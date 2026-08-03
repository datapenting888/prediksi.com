# Struktur File — Dashboard Togel

Script yang tadinya 1 file HTML raksasa sekarang dipecah jadi beberapa bagian:

```
dashboard-togel/
├── index.html          1. HTML  – struktur halaman saja
├── css/
│   └── style.css       2. CSS   – seluruh style (gabungan 3 blok <style> asli)
├── js/
│   ├── app.js           3. JavaScript – seluruh logika aplikasi (gabungan 6 blok <script> asli, urutan dipertahankan)
│   └── storage.js       4. Local Storage – modul wrapper window.AppStorage.get/set/remove
├── data/
│   └── jadwal.json      5. JSON – data Jadwal Pasaran (53 baris) hasil ekspor dari app.js
└── php/
    └── backend.php       6+7. PHP + MySQL – digabung 1 file (koneksi PDO + auto-create tabel + endpoint API)
```

Chart.js (8) dan Bootstrap (9) sudah ditambahkan lewat CDN di `index.html`
(`<link>`/`<script>` di `<head>` dan sebelum `</body>`), siap dipakai kapan
saja meskipun belum ada komponen yang memakainya di markup.

## Catatan penting — apa yang benar-benar aktif vs. disiapkan

- **index.html, css/style.css, js/app.js, js/storage.js** — 100% aktif,
  perilaku sama persis seperti file gabungan sebelumnya (Firebase real-time
  sync tetap jalan seperti biasa, tidak diganti apa pun).
- **data/jadwal.json** — berisi salinan persis data Jadwal Pasaran yang ada
  di `app.js`. File `app.js` untuk saat ini **masih memakai array bawaan
  di dalam kode**, bukan fetch dari file ini, supaya tidak mengubah urutan
  render/inisialisasi yang sudah teruji. `jadwal.json` disiapkan sebagai
  sumber data yang bisa dipakai backend PHP/MySQL, atau untuk pengembangan
  selanjutnya bila memang ingin loading datanya dibuat dinamis dari server.
- **php/backend.php** — backend **opsional/tambahan**, bukan pengganti
  Firebase. Berguna bila suatu saat ingin pindah/duplikasi penyimpanan ke
  server sendiri (hosting yang punya PHP + MySQL). Sesuaikan dulu kredensial
  database di bagian atas file sebelum dipakai. Endpoint:
  - `GET  backend.php?aksi=ambil`
  - `POST backend.php?aksi=simpan`       (body: array JSON baris jadwal)
  - `POST backend.php?aksi=toggle`       (body: `{"nama":"...","checked":true}`)
  - `POST backend.php?aksi=reset_harian`
- **Bootstrap & Chart.js** — baru di-include library-nya lewat CDN, belum
  dipasang ke elemen/grafik manapun (menghindari bentrok dengan desain
  custom yang sudah ada).

## Cara menjalankan

Karena `index.html` sekarang memuat `css/style.css` dan `js/app.js` lewat
file eksternal, buka lewat server lokal (bukan dobel-klik langsung) supaya
tidak kena batasan CORS pada beberapa browser, contoh:

```bash
cd dashboard-togel
python3 -m http.server 8080
# lalu buka http://localhost:8080
```
