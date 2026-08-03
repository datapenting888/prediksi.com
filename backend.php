<?php
/* ============================================================
   backend.php — PHP + MySQL digabung dalam satu file
   ------------------------------------------------------------
   Backend OPSIONAL/TAMBAHAN untuk data "Jadwal Pasaran".
   Firebase yang sudah berjalan di index.html TIDAK diganti oleh
   file ini — ini disiapkan sebagai alternatif/cadangan bila ke
   depannya ingin pindah/duplikasi penyimpanan ke server sendiri
   (misal hosting yang mendukung PHP + MySQL, tanpa Firebase).

   Cara pakai singkat:
   1) Sesuaikan kredensial di bagian KONFIGURASI DATABASE di bawah.
   2) Akses file ini lewat browser sekali saja (atau lewat endpoint
      ?aksi=setup) untuk otomatis membuat tabel jika belum ada.
   3) Endpoint yang tersedia:
        GET  backend.php?aksi=ambil        -> ambil semua data jadwal (JSON)
        POST backend.php?aksi=simpan       -> simpan/replace semua data
                                               (body: JSON array baris jadwal)
        POST backend.php?aksi=toggle       -> centang/uncentang 1 baris
                                               (body: {"nama": "...", "checked": true})
        POST backend.php?aksi=reset_harian -> hapus semua centang (dipanggil
                                               otomatis tiap pergantian hari
                                               bila mau dijadwalkan lewat cron)
   ============================================================ */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}

/* ------------------------------------------------------------
   1) KONFIGURASI DATABASE — sesuaikan dengan hosting Anda
   ------------------------------------------------------------ */
$DB_HOST = 'localhost';
$DB_NAME = 'smb_group';
$DB_USER = 'root';
$DB_PASS = '';
$DB_CHARSET = 'utf8mb4';

/* ------------------------------------------------------------
   2) KONEKSI (PDO)
   ------------------------------------------------------------ */
function getKoneksi() {
  global $DB_HOST, $DB_NAME, $DB_USER, $DB_PASS, $DB_CHARSET;
  $dsn = "mysql:host={$DB_HOST};dbname={$DB_NAME};charset={$DB_CHARSET}";
  try {
    $pdo = new PDO($dsn, $DB_USER, $DB_PASS, [
      PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
      PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    return $pdo;
  } catch (PDOException $e) {
    kirimError('Koneksi database gagal: ' . $e->getMessage(), 500);
  }
}

function kirimError($pesan, $kode = 400) {
  http_response_code($kode);
  echo json_encode(['sukses' => false, 'error' => $pesan]);
  exit;
}

/* ------------------------------------------------------------
   3) SKEMA TABEL (dibuat otomatis kalau belum ada)
   ------------------------------------------------------------
   CREATE TABLE jadwal_pasaran (
     id         INT AUTO_INCREMENT PRIMARY KEY,
     nama       VARCHAR(100) NOT NULL,
     tutup      VARCHAR(100) DEFAULT '',
     result     VARCHAR(100) DEFAULT '',
     jadwal     VARCHAR(150) DEFAULT '',
     checked    TINYINT(1)   DEFAULT 0,
     urutan     INT          DEFAULT 0,
     updated_at DATETIME     DEFAULT CURRENT_TIMESTAMP
                              ON UPDATE CURRENT_TIMESTAMP
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
   ------------------------------------------------------------ */
function pastikanTabel($pdo) {
  $pdo->exec("
    CREATE TABLE IF NOT EXISTS jadwal_pasaran (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      nama       VARCHAR(100) NOT NULL,
      tutup      VARCHAR(100) DEFAULT '',
      result     VARCHAR(100) DEFAULT '',
      jadwal     VARCHAR(150) DEFAULT '',
      checked    TINYINT(1)   DEFAULT 0,
      urutan     INT          DEFAULT 0,
      updated_at DATETIME     DEFAULT CURRENT_TIMESTAMP
                              ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  ");
}

/* ------------------------------------------------------------
   4) ROUTING SEDERHANA
   ------------------------------------------------------------ */
$pdo = getKoneksi();
pastikanTabel($pdo);

$aksi = $_GET['aksi'] ?? '';

switch ($aksi) {

  case 'setup':
    echo json_encode(['sukses' => true, 'pesan' => 'Tabel jadwal_pasaran siap.']);
    break;

  case 'ambil':
    $stmt = $pdo->query('SELECT nama, tutup, result, jadwal, checked FROM jadwal_pasaran ORDER BY urutan ASC, id ASC');
    $rows = $stmt->fetchAll();
    foreach ($rows as &$r) { $r['checked'] = (bool) $r['checked']; }
    echo json_encode(['sukses' => true, 'data' => $rows]);
    break;

  case 'simpan':
    $body = json_decode(file_get_contents('php://input'), true);
    if (!is_array($body)) kirimError('Body harus berupa array JSON baris jadwal.');

    $pdo->beginTransaction();
    try {
      $pdo->exec('DELETE FROM jadwal_pasaran');
      $stmt = $pdo->prepare(
        'INSERT INTO jadwal_pasaran (nama, tutup, result, jadwal, checked, urutan) VALUES (:nama, :tutup, :result, :jadwal, :checked, :urutan)'
      );
      foreach ($body as $i => $row) {
        $stmt->execute([
          ':nama'    => $row['nama'] ?? '',
          ':tutup'   => $row['tutup'] ?? '',
          ':result'  => $row['result'] ?? '',
          ':jadwal'  => $row['jadwal'] ?? '',
          ':checked' => !empty($row['checked']) ? 1 : 0,
          ':urutan'  => $i,
        ]);
      }
      $pdo->commit();
      echo json_encode(['sukses' => true, 'jumlah' => count($body)]);
    } catch (Exception $e) {
      $pdo->rollBack();
      kirimError('Gagal menyimpan: ' . $e->getMessage(), 500);
    }
    break;

  case 'toggle':
    $body = json_decode(file_get_contents('php://input'), true);
    if (empty($body['nama'])) kirimError('Field "nama" wajib diisi.');
    $stmt = $pdo->prepare('UPDATE jadwal_pasaran SET checked = :checked WHERE nama = :nama');
    $stmt->execute([
      ':checked' => !empty($body['checked']) ? 1 : 0,
      ':nama'    => $body['nama'],
    ]);
    echo json_encode(['sukses' => true]);
    break;

  case 'reset_harian':
    // Cocok dijadwalkan lewat cron job tengah malam, sebagai pengganti/
    // pelengkap logika reset-per-hari yang sudah ada di app.js.
    $pdo->exec('UPDATE jadwal_pasaran SET checked = 0');
    echo json_encode(['sukses' => true, 'pesan' => 'Semua centang direset.']);
    break;

  default:
    kirimError('Aksi tidak dikenal. Gunakan ?aksi=ambil|simpan|toggle|reset_harian|setup');
}
