# 🚀 Quick Start - Integrasi Google Calendar

## Ringkasan Singkat

Aplikasi Jadwal Kuliah UNDIP sekarang dapat tersinkronisasi dengan Google Calendar! Anda dapat mengekspor:

- ✅ Jadwal kuliah mingguan (14 minggu)
- ✅ Semua tugas yang belum selesai
- ✅ Dengan pengingat otomatis

---

## 📋 Langkah Cepat Setup (5 Menit)

### 1️⃣ Buat Google Cloud Project

```
1. Buka https://console.cloud.google.com/
2. Klik "New Project"
3. Nama: "Jadwal Kuliah"
4. Klik "Create"
```

### 2️⃣ Aktifkan Google Calendar API

```
1. Klik "Enable APIs and Services"
2. Cari "Google Calendar API"
3. Klik "Enable"
```

### 3️⃣ Setup OAuth Consent Screen

```
1. Klik "OAuth consent screen"
2. Pilih "External"
3. App name: "Jadwal Kuliah"
4. Isi email support & developer
5. Add Scopes:
   - https://www.googleapis.com/auth/calendar
   - https://www.googleapis.com/auth/calendar.events
6. Add Test Users: (email Anda)
```

### 4️⃣ Buat Credentials

```
1. Klik "Credentials" → "Create Credentials"
2. Pilih "OAuth client ID"
3. Application type: "Web application"
4. Authorized redirect URIs:
   http://localhost:3000/api/auth/google/callback
5. COPY Client ID & Client Secret
```

### 5️⃣ Update .env File

```env
GOOGLE_CLIENT_ID=paste_client_id_disini
GOOGLE_CLIENT_SECRET=paste_client_secret_disini
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

### 6️⃣ Restart Server

```bash
npm run dev
```

---

## 💡 Cara Pakai

### Di Halaman Schedule:

1. Klik tombol **"Hubungkan Google Calendar"**
2. Login dengan Google & berikan izin
3. Klik **"Google Calendar"** → **"Ekspor Jadwal"**
4. Pilih jumlah minggu (default: 14)
5. Klik **"Ekspor Sekarang"**

### Di Halaman Tasks:

1. Klik tombol **"Hubungkan Google Calendar"** (jika belum)
2. Klik **"Google Calendar"** → **"Ekspor Tugas"**
3. Klik **"Ekspor Sekarang"**

---

## 🎯 Yang Akan Terjadi

### Jadwal Kuliah akan menjadi:

- 📅 Event berulang setiap minggu
- 🔔 Reminder 30 & 10 menit sebelumnya
- 📍 Lokasi: Ruangan kuliah
- 👨‍🏫 Info: Nama dosen & meeting ke-

### Tugas akan menjadi:

- 📝 Event dengan emoji 📝
- 🔴 Warna berdasarkan prioritas (Merah/Kuning/Hijau)
- ⏰ Reminder 1 hari & 1 jam sebelum deadline
- 📚 Info: Mata kuliah & deskripsi

---

## ❓ Problem Solving

### "redirect_uri_mismatch"

➡️ Cek redirect URI di Google Console = di .env

### "access_denied"

➡️ Pastikan sudah tambahkan email sebagai test user

### Event tidak muncul

➡️ Refresh Google Calendar & tunggu beberapa detik

### Token expired

➡️ Klik "Putuskan Koneksi" lalu hubungkan lagi

---

## 📱 Bonus: Sync ke HP

Setelah ekspor ke Google Calendar:

1. Install Google Calendar app di HP
2. Login dengan akun yang sama
3. Jadwal & tugas otomatis muncul di HP! 📲

---

## 🎉 Selesai!

Sekarang jadwal kuliah dan tugas Anda akan:

- ✅ Tersinkron di semua device
- ✅ Ada reminder otomatis
- ✅ Bisa dilihat bersama event lain di Google Calendar

**Happy organizing! 🚀**

---

📖 Untuk dokumentasi lengkap, lihat: [GOOGLE_CALENDAR_SETUP.md](./GOOGLE_CALENDAR_SETUP.md)
