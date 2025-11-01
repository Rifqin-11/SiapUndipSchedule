# 🧪 Testing Guide - Google Calendar Integration

## 📝 Checklist Testing

### ✅ Setup & Configuration

- [ ] File `.env` sudah diupdate dengan credentials
- [ ] Google Cloud Project sudah dibuat
- [ ] Google Calendar API sudah diaktifkan
- [ ] OAuth Consent Screen sudah dikonfigurasi
- [ ] OAuth Client ID sudah dibuat
- [ ] Redirect URI sudah ditambahkan
- [ ] Server sudah direstart

### ✅ Schedule Page Testing

#### Connect to Google Calendar

- [ ] Tombol "Hubungkan Google Calendar" muncul
- [ ] Klik tombol redirect ke Google OAuth
- [ ] Login berhasil
- [ ] Callback redirect ke /schedule
- [ ] Token tersimpan di localStorage
- [ ] Tombol berubah jadi "Google Calendar" dengan ikon hijau
- [ ] Notifikasi sukses muncul

#### Export Schedule

- [ ] Klik tombol "Google Calendar" (yang sudah connected)
- [ ] Menu dropdown muncul
- [ ] Klik "Ekspor Jadwal ke Calendar"
- [ ] Dialog export muncul
- [ ] Slider jumlah minggu berfungsi (1-20)
- [ ] Jumlah mata kuliah ditampilkan
- [ ] Klik "Ekspor Sekarang"
- [ ] Loading state muncul
- [ ] Notifikasi sukses dengan jumlah event
- [ ] Buka Google Calendar → Event muncul

#### Verify Schedule Events in Google Calendar

- [ ] Event muncul di tanggal & waktu yang benar
- [ ] Judul = Nama mata kuliah
- [ ] Lokasi = Ruangan
- [ ] Deskripsi lengkap (Dosen, Meeting)
- [ ] Warna biru
- [ ] Recurring (berulang setiap minggu)
- [ ] Reminder 30 & 10 menit

#### Disconnect

- [ ] Klik "Google Calendar" → "Putuskan Koneksi"
- [ ] Token dihapus dari localStorage
- [ ] Tombol kembali ke "Hubungkan Google Calendar"
- [ ] Notifikasi berhasil disconnect

### ✅ Tasks Page Testing

#### Connect to Google Calendar

- [ ] Tombol "Hubungkan Google Calendar" muncul
- [ ] Klik tombol redirect ke Google OAuth
- [ ] Login berhasil
- [ ] Callback redirect ke /tasks
- [ ] Token tersimpan di localStorage
- [ ] Tombol berubah jadi "Google Calendar" dengan ikon hijau

#### Export Tasks

- [ ] Klik tombol "Google Calendar"
- [ ] Menu dropdown muncul
- [ ] Klik "Ekspor Tugas ke Calendar"
- [ ] Dialog export muncul
- [ ] Jumlah tugas belum selesai ditampilkan
- [ ] Klik "Ekspor Sekarang"
- [ ] Loading state muncul
- [ ] Notifikasi sukses dengan jumlah event
- [ ] Buka Google Calendar → Event tugas muncul

#### Verify Task Events in Google Calendar

- [ ] Event tugas muncul dengan emoji 📝
- [ ] Tanggal & waktu sesuai deadline
- [ ] Deskripsi lengkap (Tugas, Mata kuliah, Status)
- [ ] Warna sesuai prioritas:
  - [ ] High = Merah
  - [ ] Medium = Kuning
  - [ ] Low = Hijau
- [ ] Reminder 1 hari & 1 jam

### ✅ Error Handling

#### OAuth Errors

- [ ] User deny access → Error message muncul
- [ ] Invalid credentials → Error message jelas
- [ ] Redirect URI mismatch → Error handling proper

#### API Errors

- [ ] No internet → Error notification
- [ ] Invalid token → Auto redirect to reconnect
- [ ] API quota exceeded → Error message informatif

#### UI/UX Errors

- [ ] No subjects → Error message "Tidak ada jadwal"
- [ ] No tasks → Error message "Tidak ada tugas"
- [ ] Already connected → Skip auth flow

### ✅ Cross-Browser Testing

- [ ] Chrome ✅
- [ ] Firefox ✅
- [ ] Safari ✅
- [ ] Edge ✅

### ✅ Mobile Testing

- [ ] iOS Safari ✅
- [ ] Android Chrome ✅
- [ ] Responsive layout ✅
- [ ] Touch interactions ✅

---

## 🎯 Test Scenarios

### Scenario 1: First Time User

```
1. User buka halaman Schedule
2. Lihat tombol "Hubungkan Google Calendar"
3. Klik tombol
4. Login dengan Google
5. Approve permissions
6. Redirect kembali ke app
7. Lihat notifikasi sukses
8. Tombol berubah jadi "Google Calendar" ✅
```

### Scenario 2: Export Full Schedule

```
1. User sudah terhubung
2. Klik "Google Calendar" → "Ekspor Jadwal"
3. Set jumlah minggu = 14
4. Klik "Ekspor Sekarang"
5. Tunggu loading
6. Lihat notifikasi: "Berhasil mengekspor X jadwal"
7. Buka Google Calendar
8. Verify semua event muncul dengan benar ✅
```

### Scenario 3: Export Tasks

```
1. User sudah terhubung
2. Punya 5 tugas (3 pending, 2 completed)
3. Klik "Ekspor Tugas ke Calendar"
4. Dialog show: "3 tugas belum selesai akan diekspor"
5. Klik "Ekspor Sekarang"
6. Notifikasi: "Berhasil mengekspor 3 tugas"
7. Buka Google Calendar
8. Verify 3 event tugas muncul (exclude completed) ✅
```

### Scenario 4: Reconnect After Token Expired

```
1. Token expired (simulate by editing localStorage)
2. Try to export
3. Error: "Token invalid"
4. Klik "Putuskan Koneksi"
5. Klik "Hubungkan" lagi
6. Login & approve
7. Token baru tersimpan
8. Export berhasil ✅
```

### Scenario 5: Multiple Devices

```
Device 1 (Laptop):
1. Connect & export schedule

Device 2 (Phone):
1. Open Google Calendar app
2. Login same account
3. Verify events muncul di HP
4. Test notification di HP ✅
```

---

## 🐛 Common Issues & Solutions

### Issue 1: redirect_uri_mismatch

**Test**: Verify redirect URI

```
Expected: http://localhost:3000/api/auth/google/callback
Google Console: Must match exactly
Solution: Check .env & Google Console
```

### Issue 2: Events not showing

**Test**: Check event creation

```
1. Open browser console
2. Check API response
3. Verify token validity
4. Check Google Calendar refresh
Solution: Wait 30 seconds, then refresh
```

### Issue 3: Wrong timezone

**Test**: Verify event times

```
Expected: Asia/Jakarta
Check: Event time in Google Calendar
Solution: Verify timezone in API calls
```

---

## 📊 Performance Testing

### Load Testing

- [ ] Export 1 subject → < 2 seconds
- [ ] Export 10 subjects → < 10 seconds
- [ ] Export 20 subjects → < 20 seconds
- [ ] Export 50 tasks → < 30 seconds

### Memory Testing

- [ ] No memory leaks after multiple exports
- [ ] localStorage size < 50KB
- [ ] Browser responsive during export

### Network Testing

- [ ] Works with slow 3G
- [ ] Handles network interruption
- [ ] Retry failed requests

---

## ✅ Final Checklist

Before going to production:

- [ ] All test scenarios passed
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Responsive on all devices
- [ ] Cross-browser compatible
- [ ] Error handling complete
- [ ] Loading states implemented
- [ ] User feedback (notifications) clear
- [ ] Documentation complete
- [ ] Environment variables secured
- [ ] OAuth consent screen published (if public)

---

## 🎉 Testing Complete!

Jika semua checklist ✅, fitur siap digunakan!

**Next**: Update production environment variables
