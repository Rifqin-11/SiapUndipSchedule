# 🔧 Troubleshooting Google Calendar Auto-Sync

## ❌ Problem: Auto-sync tidak bekerja

Jika auto-sync tidak bekerja (jadwal baru/reschedule tidak masuk Google Calendar), ikuti langkah-langkah berikut:

## 📋 Checklist Debugging

### Step 1: Cek Koneksi Google Calendar

1. **Buka halaman User** → `/user`
2. **Scroll ke section "Calendar Integration"**
3. **Cek status:**
   - ✅ Harus tertulis "Auto-sync aktif" dengan check icon hijau
   - ❌ Jika tertulis "Tidak terhubung", berarti belum connect

**Jika belum terhubung:**
```
1. Klik tombol "Connect"
2. Login dengan Google account
3. Authorize aplikasi
4. Tunggu redirect kembali ke aplikasi
5. Cek lagi status → harus "Auto-sync aktif"
```

### Step 2: Cek localStorage

1. **Buka Browser DevTools** (tekan F12)
2. **Pergi ke tab "Console"**
3. **Copy paste script ini:**

```javascript
// Quick check
const tokens = localStorage.getItem("google_calendar_tokens");
const autoSync = localStorage.getItem("google_calendar_auto_sync");

console.log("Tokens:", tokens ? "✅ Found" : "❌ Not found");
console.log("Auto-sync:", autoSync === "true" ? "✅ Enabled" : "❌ Disabled");

if (!tokens || autoSync !== "true") {
  console.error("❌ Auto-sync not configured properly!");
  console.log("💡 Go to /user and click 'Connect Google Calendar'");
} else {
  console.log("✅ Auto-sync configured correctly!");
}
```

**Expected Output:**
```
Tokens: ✅ Found
Auto-sync: ✅ Enabled
✅ Auto-sync configured correctly!
```

**Jika NOT Found:**
```
Solution: Connect Google Calendar di /user page
```

**Jika Disabled:**
```
Solution: Disconnect dan reconnect Google Calendar untuk enable auto-sync
```

### Step 3: Test Auto-Sync

#### Test Add Subject:

1. **Add new subject** (ManageSubjects atau Schedule page)
2. **Buka Console** (F12)
3. **Lihat log messages:**

```
Expected logs:
🔍 Auto-sync check: {hasTokens: true, autoSyncEnabled: true, subjectName: "..."}
🔄 Auto-syncing subject to Google Calendar: ...
✅ Subject auto-synced to Google Calendar: ...
```

**Jika muncul:**
```
⏭️ Skipping auto-sync (not connected or disabled)
```
→ Auto-sync belum enabled, pergi ke Step 1

**Jika muncul:**
```
❌ Failed to auto-sync subject: ...
```
→ Ada error di API, cek Step 4

#### Test Reschedule:

1. **Klik reschedule pada subject**
2. **Isi form reschedule**
3. **Klik "Record Reschedule"**
4. **Buka Console** (F12)
5. **Lihat log messages** (sama seperti di atas)

### Step 4: Cek API Response

1. **Buka DevTools → Network tab**
2. **Add subject atau record reschedule**
3. **Cari request ke:**
   - `/api/google-calendar/export-subject` (untuk add/edit)
   - `/api/subjects/[id]/reschedule` (untuk reschedule)

4. **Klik request tersebut**
5. **Lihat Response:**

**Success Response:**
```json
{
  "success": true,
  "event": {...}
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Token expired" atau "Invalid credentials"
}
```

**Jika token expired:**
```
Solution: Disconnect dan reconnect Google Calendar
```

### Step 5: Cek Google Calendar

1. **Buka Google Calendar** → https://calendar.google.com
2. **Pastikan menggunakan akun yang sama** dengan yang di-connect
3. **Cek events:**
   - 🔵 **Blue events** = Regular classes
   - 🔴 **Red events** = UTS/UAS
   - 🟡 **Yellow events** = Reschedules

4. **Jika tidak muncul:**
   - Refresh page (Ctrl + R)
   - Cek filter calendar (pastikan calendar aktif)
   - Tunggu 1-2 menit (kadang ada delay)

## 🔄 Reset Auto-Sync (Nuclear Option)

Jika semua langkah di atas gagal:

### Option 1: Soft Reset (Recommended)

1. Buka `/user`
2. Klik "Disconnect"
3. Refresh page (Ctrl + R)
4. Klik "Connect Google Calendar"
5. Login dan authorize
6. Test add subject lagi

### Option 2: Hard Reset (Clear Everything)

```javascript
// Buka Console (F12) dan run:
localStorage.removeItem("google_calendar_tokens");
localStorage.removeItem("google_calendar_auto_sync");
console.log("✅ Cleared Google Calendar data");
console.log("💡 Now go to /user and connect again");
```

Lalu:
1. Refresh page (Ctrl + R)
2. Pergi ke `/user`
3. Connect Google Calendar
4. Test lagi

## 🐛 Common Issues

### Issue 1: "Auto-sync aktif" tapi tidak sync

**Penyebab:** Token expired atau invalid

**Solution:**
```
1. Disconnect di /user
2. Connect ulang
3. Test add subject
```

### Issue 2: Console log "⏭️ Skipping auto-sync"

**Penyebab:** localStorage tidak terdeteksi di component

**Solution:**
```
1. Hard refresh (Ctrl + Shift + R)
2. Clear browser cache
3. Disconnect dan connect ulang
```

### Issue 3: Events tidak muncul di Google Calendar

**Penyebab:** Wrong Google account atau calendar tidak aktif

**Solution:**
```
1. Cek akun Google yang login di aplikasi
2. Cek akun Google yang dibuka di calendar.google.com
3. Pastikan kedua akun SAMA
4. Refresh Google Calendar
```

### Issue 4: Duplicate events

**Penyebab:** Multiple sync atau re-add subject

**Solution:**
```
1. Gunakan "Delete All Events" di ManageSubjects
2. Disconnect Google Calendar
3. Connect ulang
4. Events akan di-sync ulang dari awal
```

### Issue 5: API Error 401/403

**Penyebab:** Token expired atau invalid OAuth

**Solution:**
```
1. Check .env file:
   - GOOGLE_CLIENT_ID
   - GOOGLE_CLIENT_SECRET
   - GOOGLE_REDIRECT_URI
2. Verify OAuth consent screen di Google Cloud Console
3. Disconnect dan connect ulang
```

## 📞 Debug Commands

### Check Full Status:
```javascript
// Copy ke Console
const tokens = localStorage.getItem("google_calendar_tokens");
const autoSync = localStorage.getItem("google_calendar_auto_sync");

console.log("=== Google Calendar Status ===");
console.log("Tokens:", tokens ? "✅ Found" : "❌ Missing");
console.log("Auto-sync:", autoSync === "true" ? "✅ Enabled" : "❌ Disabled");

if (tokens) {
  try {
    const parsed = JSON.parse(tokens);
    const expired = parsed.expiry_date && Date.now() > parsed.expiry_date;
    console.log("Token expired:", expired ? "❌ YES" : "✅ NO");
  } catch (e) {
    console.error("❌ Invalid token format");
  }
}
console.log("==============================");
```

### Force Sync Test:
```javascript
// Copy ke Console (ganti subjectData dengan subject real)
const subjectData = {
  name: "Test Subject",
  day: "Monday",
  startTime: "08:00",
  endTime: "10:00",
  room: "A101",
  lecturer: ["Test"],
  meetingDates: ["2024-11-04", "2024-11-11"],
};

const tokens = JSON.parse(localStorage.getItem("google_calendar_tokens"));

fetch("/api/google-calendar/export-subject", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ subject: subjectData, tokens }),
})
  .then(r => r.json())
  .then(data => console.log("Result:", data))
  .catch(e => console.error("Error:", e));
```

## ✅ Expected Behavior

**After connect:**
1. Status di /user: "✅ Auto-sync aktif"
2. Add subject → Console log "🔄 Auto-syncing..."
3. API call ke `/api/google-calendar/export-subject`
4. Console log "✅ Subject auto-synced"
5. Event muncul di Google Calendar dalam 1-2 menit

**If NOT working:**
→ Follow troubleshooting steps above

## 📝 Notes

- Auto-sync berjalan **silent** (no toast notification)
- Check **Console logs** untuk debugging
- Check **Network tab** untuk API calls
- Auto-sync **hanya jalan jika connected dan enabled**
- Token bisa expired, perlu reconnect secara berkala

## 💡 Pro Tips

1. **Always check Console logs** saat testing
2. **Keep Network tab open** untuk monitor API calls
3. **Use same Google account** di aplikasi dan calendar
4. **Refresh Google Calendar** setelah add subject
5. **Wait 1-2 minutes** untuk sync complete

## 🎯 Quick Fix (90% Cases)

```
1. Pergi ke /user
2. Klik "Disconnect" (jika sudah connect)
3. Refresh page (Ctrl + R)
4. Klik "Connect Google Calendar"
5. Login dan authorize
6. Test add subject
7. Check Console logs
8. Check Google Calendar
```

Jika masih tidak bekerja setelah quick fix, ikuti troubleshooting lengkap di atas.
