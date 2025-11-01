# 🔄 Quick Guide - Google Calendar Auto-Sync

## 🚀 Quick Start

### 1. Connect Google Calendar (Sekali saja)

1. Buka halaman **User** (`/user`)
2. Scroll ke section **"Calendar Integration"**
3. Klik **"Connect Google Calendar"**
4. Login dengan akun Google
5. ✅ Selesai! Auto-sync sudah aktif

### 2. Use Normally (Semuanya Otomatis!)

Semua aksi ini **otomatis sync ke Google Calendar**:

| Aksi | Lokasi | Auto-Sync |
|------|--------|-----------|
| ➕ Add Subject | ManageSubjects / Schedule | ✅ Auto |
| ✏️ Edit Subject | ManageSubjects / Schedule | ✅ Auto |
| 📅 Record Reschedule | Schedule (klik reschedule) | ✅ Auto |
| 🎓 Upload UTS/UAS | ManageSubjects → Upload | ✅ Auto |
| 📝 Upload IRS | ManageSubjects → Upload | ✅ Auto |

**Tidak perlu export manual lagi!** Semua langsung masuk Google Calendar.

## 🎨 Event Colors

- 🔵 **Blue** - Regular classes (jadwal mingguan)
- 🔴 **Red** - UTS/UAS exams
- 🟡 **Yellow** - Reschedule classes

## ⚙️ Settings

### Check Connection Status
Buka `/user` → Lihat section "Calendar Integration"

### Disconnect
Buka `/user` → Klik "Disconnect" button

### Reconnect
Buka `/user` → Klik "Connect Google Calendar" lagi

## 📱 Requirements

- ✅ Google account
- ✅ Internet connection
- ✅ Browser dengan localStorage support

## ❓ FAQ

### Q: Apakah perlu export manual?
**A:** Tidak! Semua otomatis sync setelah connect.

### Q: Bagaimana jika saya edit jadwal?
**A:** Otomatis sync ke Google Calendar. Tidak perlu apa-apa.

### Q: Bagaimana jika saya upload UTS/UAS?
**A:** Semua jadwal ujian otomatis masuk Google Calendar dengan warna merah.

### Q: Apakah bisa disable auto-sync?
**A:** Ya, cukup disconnect di halaman User.

### Q: Event muncul duplikat, bagaimana?
**A:** Gunakan fitur "Delete All Events" di halaman ManageSubjects, lalu sync ulang.

### Q: Auto-sync tidak jalan?
**A:** 
1. Check di halaman User apakah status "Connected"
2. Try disconnect dan connect ulang
3. Clear browser cache dan login ulang

## 📊 Debug

### Check Console Logs
```javascript
// Buka DevTools Console (F12)
// Akan muncul log seperti:
"🔄 Auto-syncing subject to Google Calendar: Kalkulus"
"✅ Subject auto-synced to Google Calendar: Kalkulus"
```

### Check localStorage
```javascript
// Buka DevTools Console (F12)
localStorage.getItem("google_calendar_tokens")
localStorage.getItem("google_calendar_auto_sync") // Should be "true"
```

## 🎯 Summary

**Workflow baru**:
1. Connect sekali di halaman User
2. Gunakan aplikasi seperti biasa
3. Semua jadwal otomatis sync
4. **Zero manual work!** 🎉

---

**Developed by**: Rifqin Naufal
**Version**: 2.0 (Fully Automatic)
**Last Updated**: November 2025
