# 📅 Integrasi Google Calendar - Panduan Setup

## Fitur yang Tersedia

Aplikasi jadwal kuliah ini sekarang dapat terintegrasi dengan Google Calendar untuk:

1. **Ekspor Jadwal Kuliah** - Ekspor seluruh jadwal kuliah mingguan sebagai event berulang
2. **Ekspor Tugas** - Ekspor semua tugas yang belum selesai dengan reminder otomatis
3. **Sinkronisasi Otomatis** - Setiap event akan memiliki:
   - Pengingat otomatis (30 menit & 10 menit untuk jadwal, 1 hari & 1 jam untuk tugas)
   - Warna yang berbeda berdasarkan prioritas
   - Informasi lengkap (dosen, ruangan, deskripsi tugas)

---

## 🚀 Langkah Setup Google Calendar API

### 1. Buat Project di Google Cloud Console

1. Kunjungi [Google Cloud Console](https://console.cloud.google.com/)
2. Login dengan akun Google Anda
3. Klik **"Select a project"** di bagian atas, lalu **"New Project"**
4. Beri nama project (contoh: "Jadwal Kuliah UNDIP")
5. Klik **"Create"**

### 2. Aktifkan Google Calendar API

1. Di dashboard project, klik **"Enable APIs and Services"**
2. Cari **"Google Calendar API"**
3. Klik pada hasil pencarian
4. Klik tombol **"Enable"**

### 3. Buat OAuth 2.0 Credentials

#### A. Konfigurasi OAuth Consent Screen

1. Di sidebar kiri, klik **"OAuth consent screen"**
2. Pilih **"External"** (untuk testing) atau **"Internal"** (jika menggunakan Google Workspace)
3. Klik **"Create"**
4. Isi informasi:
   - **App name**: Jadwal Kuliah UNDIP
   - **User support email**: Email Anda
   - **Developer contact**: Email Anda
5. Klik **"Save and Continue"**
6. Di halaman **"Scopes"**, klik **"Add or Remove Scopes"**
7. Cari dan pilih:
   - `https://www.googleapis.com/auth/calendar`
   - `https://www.googleapis.com/auth/calendar.events`
8. Klik **"Update"** lalu **"Save and Continue"**
9. Di halaman **"Test users"** (jika External), tambahkan email Anda sebagai test user
10. Klik **"Save and Continue"** lalu **"Back to Dashboard"**

#### B. Buat OAuth Client ID

1. Di sidebar kiri, klik **"Credentials"**
2. Klik **"Create Credentials"** → **"OAuth client ID"**
3. Pilih **Application type**: **"Web application"**
4. Beri nama: "Jadwal Kuliah Web Client"
5. Di **"Authorized redirect URIs"**, tambahkan:

   ```
   http://localhost:3000/api/auth/google/callback
   ```

   Untuk production, tambahkan juga:

   ```
   https://your-domain.com/api/auth/google/callback
   ```

6. Klik **"Create"**
7. **PENTING**: Copy **Client ID** dan **Client Secret** yang muncul

### 4. Update File .env

Buka file `.env` di root project Anda dan update nilai berikut:

```env
# Google Calendar API
GOOGLE_CLIENT_ID=1027523820316-jkll98ciln481tc2a387b7uk7pkgoj0l.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

Ganti:

- `your_client_id_here` dengan **Client ID** dari langkah 3B
- `your_client_secret_here` dengan **Client Secret** dari langkah 3B

**UNTUK PRODUCTION:**

```env
GOOGLE_REDIRECT_URI=https://your-domain.com/api/auth/google/callback
```

### 5. Restart Development Server

```bash
npm run dev
```

---

## 📖 Cara Menggunakan

### Menghubungkan dengan Google Calendar

1. **Di Halaman Schedule atau Tasks:**

   - Klik tombol **"Hubungkan Google Calendar"** atau **"Calendar"**

2. **Proses OAuth:**

   - Anda akan diarahkan ke halaman login Google
   - Pilih akun Google Anda
   - Review dan setujui permissions yang diminta
   - Anda akan diarahkan kembali ke aplikasi

3. **Status Terhubung:**
   - Tombol akan berubah menjadi **"Google Calendar"** dengan ikon hijau
   - Sekarang Anda dapat mengekspor jadwal dan tugas

### Mengekspor Jadwal Kuliah

1. Klik tombol **"Google Calendar"** (yang sudah terhubung)
2. Pilih **"Ekspor Jadwal ke Calendar"**
3. Atur jumlah minggu yang ingin diekspor (default: 14 minggu)
4. Klik **"Ekspor Sekarang"**
5. Tunggu proses selesai (akan muncul notifikasi sukses)
6. Buka Google Calendar Anda untuk melihat jadwal yang telah ditambahkan

### Mengekspor Tugas

1. Di halaman Tasks, klik tombol **"Google Calendar"**
2. Pilih **"Ekspor Tugas ke Calendar"**
3. Klik **"Ekspor Sekarang"**
4. Semua tugas yang belum selesai akan ditambahkan ke Google Calendar

### Memutuskan Koneksi

1. Klik tombol **"Google Calendar"**
2. Pilih **"Putuskan Koneksi"**
3. Koneksi akan terputus dan token akan dihapus dari browser

---

## 🎨 Detail Event di Google Calendar

### Jadwal Kuliah

- **Judul**: Nama mata kuliah
- **Deskripsi**: Kode, Ruangan, Dosen
- **Lokasi**: Ruangan kuliah
- **Warna**: Biru (untuk semua jadwal kuliah)
- **Recurring**: Event berulang setiap minggu
- **Reminder**: 30 menit dan 10 menit sebelum kelas

### Tugas

- **Judul**: 📝 [Nama Tugas]
- **Deskripsi**: Deskripsi tugas, mata kuliah, prioritas
- **Warna**:
  - 🔴 Merah: Prioritas tinggi
  - 🟡 Kuning: Prioritas sedang
  - 🟢 Hijau: Prioritas rendah
- **Reminder**: 1 hari dan 1 jam sebelum deadline

---

## 🔒 Keamanan & Privacy

- **Token disimpan lokal**: Access token disimpan di localStorage browser Anda, tidak di server
- **Refresh token**: Otomatis refresh saat token expired
- **Permissions minimal**: Hanya meminta akses ke Google Calendar, tidak ada akses lain
- **Hapus kapan saja**: Anda dapat memutuskan koneksi kapan saja
- **No data sharing**: Aplikasi tidak mengirim data Anda ke pihak ketiga

---

## 🐛 Troubleshooting

### Error: "redirect_uri_mismatch"

**Solusi**:

- Pastikan redirect URI di Google Cloud Console sama persis dengan yang di `.env`
- Jangan lupa tambahkan protocol (`http://` atau `https://`)
- Restart development server setelah mengubah `.env`

### Error: "access_denied"

**Solusi**:

- Pastikan OAuth consent screen sudah dikonfigurasi dengan benar
- Jika menggunakan "External", tambahkan email Anda sebagai test user
- Coba logout dari Google dan login ulang

### Error: "Token expired"

**Solusi**:

- Klik "Putuskan Koneksi" lalu hubungkan kembali
- Clear localStorage browser: `localStorage.removeItem('google_calendar_tokens')`

### Event tidak muncul di Google Calendar

**Solusi**:

- Check koneksi internet Anda
- Refresh halaman Google Calendar
- Pastikan menggunakan akun Google yang sama
- Cek console browser untuk error messages

### Error: "Failed to export"

**Solusi**:

- Pastikan Google Calendar API sudah diaktifkan
- Check quota API di Google Cloud Console
- Pastikan credentials valid dan tidak expired

---

## 📝 Notes

- **Free Tier**: Google Calendar API memiliki quota gratis yang cukup untuk penggunaan personal
- **Rate Limiting**: Jika ekspor banyak event sekaligus, mungkin perlu beberapa detik
- **Timezone**: Semua event menggunakan timezone Asia/Jakarta
- **Update Events**: Saat ini belum support update otomatis, jika ada perubahan jadwal perlu ekspor ulang

---

## 🎯 Fitur Mendatang (Coming Soon)

- ✅ Ekspor jadwal & tugas ✅ **DONE**
- ⏳ Auto-sync dengan webhook
- ⏳ Two-way sync (update dari Google Calendar ke app)
- ⏳ Pilih event spesifik untuk diekspor
- ⏳ Edit event langsung dari app
- ⏳ Hapus event dari Google Calendar

---

## 📞 Support

Jika mengalami masalah atau butuh bantuan, silakan:

1. Check dokumentasi ini terlebih dahulu
2. Lihat console browser untuk error messages
3. Contact developer untuk support lebih lanjut

---

**Selamat menggunakan fitur integrasi Google Calendar! 🎉**
