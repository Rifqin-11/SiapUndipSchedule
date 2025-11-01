# 🔄 Google Calendar Auto-Sync

## 📖 Apa itu Auto-Sync?

Auto-Sync adalah fitur yang memungkinkan jadwal dan tugas baru otomatis ditambahkan ke Google Calendar tanpa perlu ekspor manual setiap kali.

## ✨ Keuntungan Auto-Sync

✅ **Otomatis**: Jadwal/tugas baru langsung masuk ke Google Calendar
✅ **Efisien**: Tidak perlu klik "Ekspor" setiap kali
✅ **Real-time**: Update langsung saat membuat data baru
✅ **Mudah**: Toggle ON/OFF dengan satu klik
✅ **Transparan**: Indikator status jelas di UI

## 🚀 Cara Menggunakan Auto-Sync

### 1. Hubungkan Google Calendar

Pertama kali, hubungkan akun Google Calendar Anda:

1. Buka halaman **Schedule** atau **Tasks**
2. Klik tombol **"Hubungkan Google Calendar"**
3. Login dengan akun Google
4. Berikan izin akses ke Google Calendar
5. Setelah berhasil, status akan berubah jadi "Terhubung"

### 2. Aktifkan Auto-Sync

Setelah terhubung:

1. Klik **dropdown menu** di tombol Google Calendar
2. Pilih **"Pengaturan Auto-Sync"**
3. Dialog akan muncul dengan toggle switch
4. **Toggle ON** untuk mengaktifkan auto-sync
5. Banner hijau akan muncul: "✅ Auto-sync aktif"

### 3. Mulai Gunakan!

Sekarang setiap kali Anda:

- ✨ **Menambah jadwal baru** → Otomatis masuk ke Google Calendar
- ✨ **Menambah tugas baru** → Otomatis masuk ke Google Calendar
- ✨ **Update jadwal/tugas** → Otomatis diupdate di Google Calendar

Tidak perlu ekspor manual lagi! 🎉

## 📱 Indikator Status

### Menu Dropdown

Saat auto-sync aktif, Anda akan melihat:

```
┌─────────────────────────────────┐
│ ✓ Ekspor Semua Jadwal          │
│ ⚙️ Pengaturan Auto-Sync • ON   │  ← Status indicator
│ ─────────────────────────────  │
│ Putuskan Hubungan              │
└─────────────────────────────────┘
```

### Dialog Pengaturan

Dialog auto-sync menampilkan status jelas:

**Saat AKTIF:**

```
┌──────────────────────────────────────┐
│  Pengaturan Auto-Sync               │
│                                      │
│  [ON] Auto-sync ke Google Calendar  │
│                                      │
│  ✅ Auto-sync aktif. Jadwal baru    │
│     akan otomatis ditambahkan ke    │
│     Google Calendar.                │
└──────────────────────────────────────┘
```

**Saat NONAKTIF:**

```
┌──────────────────────────────────────┐
│  Pengaturan Auto-Sync               │
│                                      │
│  [OFF] Auto-sync ke Google Calendar │
│                                      │
│  ℹ️ Anda perlu ekspor manual untuk  │
│     menambahkan jadwal ke Google    │
│     Calendar.                        │
└──────────────────────────────────────┘
```

## 🔧 Cara Kerja Teknis

### Client-Side Auto-Sync

Auto-sync berjalan di **client-side** (browser):

1. **State Management**: Preferensi tersimpan di `localStorage`
2. **Hook Integration**: `useAutoSyncSubject` & `useAutoSyncTask`
3. **Mutation Callbacks**: Triggered saat create/update berhasil
4. **API Call**: Export individual subject/task ke Google Calendar

### Flow Diagram

```
User creates new subject
     ↓
useCreateSubject mutation
     ↓
onSuccess callback
     ↓
Check: isConnected && autoSync?
     ↓ Yes
syncSubjectToCalendar()
     ↓
exportSubject() API call
     ↓
Google Calendar event created ✅
```

## 🎛️ Konfigurasi

### localStorage Keys

Auto-sync menggunakan 2 localStorage keys:

- **`google_calendar_tokens`**: OAuth tokens (access & refresh)
- **`google_calendar_auto_sync`**: Auto-sync preference (`true`/`false`)

### Persistence

- Preferensi auto-sync **tersimpan permanen** di browser
- Tetap aktif setelah reload/restart browser
- Per-device (harus diaktifkan di tiap device)

## 🛠️ Troubleshooting

### Auto-Sync Tidak Bekerja?

**1. Cek Koneksi Google Calendar**

```
✅ Connected   → Auto-sync bisa bekerja
❌ Not Connected → Hubungkan terlebih dahulu
```

**2. Cek Status Auto-Sync**

```
Menu → Pengaturan Auto-Sync → Pastikan toggle ON
```

**3. Cek Browser Console**

```javascript
// Buka Developer Tools (F12)
// Cek localStorage
localStorage.getItem("google_calendar_auto_sync"); // Should be "true"
localStorage.getItem("google_calendar_tokens"); // Should exist
```

**4. Cek Network Tab**

```
Buat jadwal baru → Network tab → Lihat request ke:
- POST /api/subjects
- POST /api/google-calendar/export-subject ✅
```

### Token Expired?

Jika token expired:

1. Disconnect Google Calendar
2. Connect ulang
3. Aktifkan auto-sync lagi

### Error Notifications?

Auto-sync **tidak menampilkan error toast** untuk menghindari gangguan UX. Error hanya di-log ke console:

```javascript
console.error("Auto-sync failed:", error);
```

Untuk debugging, buka Developer Console (F12).

## 📊 Perbandingan: Manual vs Auto-Sync

| Aspek           | Manual Export          | Auto-Sync           |
| --------------- | ---------------------- | ------------------- |
| **Kecepatan**   | Harus klik "Ekspor"    | Otomatis instant    |
| **Effort**      | Perlu action manual    | Zero effort         |
| **Konsistensi** | Bisa lupa              | Selalu sync         |
| **Batch**       | Export semua sekaligus | Individual per item |
| **Kendali**     | Full control           | Toggle ON/OFF       |

## 🔐 Keamanan & Privacy

### Data Flow

```
Your Browser → Google Calendar API → Your Google Account
```

- ✅ Tidak ada server perantara
- ✅ Token disimpan di browser Anda saja
- ✅ Tidak ada pihak ketiga
- ✅ Data langsung ke Google

### Permissions

Auto-sync menggunakan scope yang sama:

```
https://www.googleapis.com/auth/calendar.events
```

**Izin yang diberikan:**

- ✅ Create calendar events
- ✅ Update calendar events
- ✅ Read calendar events

**TIDAK bisa:**

- ❌ Delete your calendars
- ❌ Access other Google services
- ❌ Share your data

## 💡 Tips & Best Practices

### 1. Aktifkan Auto-Sync Sejak Awal

Begitu connect Google Calendar, langsung aktifkan auto-sync untuk pengalaman terbaik.

### 2. Gunakan di Multiple Devices

Aktifkan auto-sync di **semua device** yang Anda pakai:

- Laptop untuk input jadwal
- HP untuk cek jadwal on-the-go

### 3. Kombinasi dengan Manual Export

- **Auto-sync**: Untuk jadwal/tugas baru
- **Manual export**: Untuk batch export semua jadwal existing

### 4. Monitor di Google Calendar

Buka Google Calendar sesekali untuk memastikan events ter-sync dengan benar.

### 5. Disable Jika Tidak Digunakan

Jika sedang tidak butuh auto-sync, toggle OFF untuk menghemat API calls.

## 📈 Roadmap

Fitur auto-sync akan terus dikembangkan:

- [x] ✅ Client-side auto-sync (DONE)
- [ ] Server-side webhook auto-sync
- [ ] Selective auto-sync (pilih subject tertentu)
- [ ] Auto-sync delete (hapus event saat hapus jadwal)
- [ ] Two-way sync (sync dari Google Calendar ke app)
- [ ] Conflict resolution
- [ ] Offline queue untuk auto-sync

## 🎉 Kesimpulan

Auto-Sync membuat integrasi Google Calendar menjadi **seamless** dan **effortless**. Anda fokus ke jadwal kuliah, biarkan auto-sync yang mengurus sinkronisasi!

**Aktifkan sekarang dan nikmati pengalaman otomatis! 🚀**

---

**Status: ✅ IMPLEMENTED & READY TO USE**

Dokumentasi ini dibuat untuk versi auto-sync yang sudah fully implemented.
