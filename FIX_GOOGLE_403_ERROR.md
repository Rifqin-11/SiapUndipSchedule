# 🔧 Fix Error 403: access_denied - Production Deployment

## ❌ Error yang Anda Alami:

```
Error 403: access_denied
siapUndipSchedule has not completed the Google verification process.
The app is currently being tested, and can only be accessed by developer-approved testers.
```

**URL Production:** https://schedule.rifqinaufal11.studio/

---

## ⚡ LANGKAH WAJIB (Lakukan Sekarang!)

### 1️⃣ Update Redirect URI di Google Cloud Console

1. **Buka Google Cloud Console:**

   - https://console.cloud.google.com/

2. **Pilih Project Anda**

3. **Buka Credentials:**

   - Sidebar → **APIs & Services** → **Credentials**

4. **Edit OAuth 2.0 Client ID:**
   - Klik pada OAuth Client ID yang sudah ada
   - Di bagian **"Authorized redirect URIs"**
   - **TAMBAHKAN** (jangan hapus yang lama):
     ```
     https://schedule.rifqinaufal11.studio/api/auth/google/callback
     ```
   - **KEEP ALSO** (untuk development):
     ```
     http://localhost:3000/api/auth/google/callback
     ```
   - Klik **"Save"**

### 2️⃣ File .env Sudah Diupdate ✅

File `.env` sudah saya update dengan redirect URI production:

```env
GOOGLE_REDIRECT_URI=https://schedule.rifqinaufal11.studio/api/auth/google/callback
```

### 3️⃣ Tambahkan Test Users

Karena app masih dalam mode "Testing", Anda HARUS menambahkan test users:

1. **Buka OAuth Consent Screen:**

   - https://console.cloud.google.com/apis/credentials/consent

2. **Scroll ke "Test users"**

3. **Klik "+ ADD USERS"**

4. **Masukkan email yang ingin Anda izinkan:**

   ```
   your-email@gmail.com
   teman1@gmail.com
   teman2@gmail.com
   ```

   (Maksimal 100 test users)

5. **Klik "Save"**

### 4️⃣ Redeploy ke Vercel/Production

**Push ke GitHub:**

```bash
git add .
git commit -m "Fix: Update Google Calendar redirect URI for production"
git push origin main
```

**Atau jika sudah terhubung dengan Vercel:**

- Vercel akan auto-deploy setelah push
- Atau manual redeploy di Vercel dashboard

**Set Environment Variable di Vercel:**

```
GOOGLE_CLIENT_ID=1027523820316-jkll98ciln481tc2a387b7uk7pkgoj0l.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_REDIRECT_URI=https://schedule.rifqinaufal11.studio/api/auth/google/callback
```

---

## 🎯 2 PILIHAN JANGKA PANJANG

### ✅ **Opsi 1: Tetap Pakai "Testing" Mode** (Recommended untuk sekarang)

**Kelebihan:**

- ✅ Cepat, langsung bisa pakai
- ✅ Tidak perlu verifikasi Google (4-6 minggu)
- ✅ Cukup untuk testing dan penggunaan pribadi

**Kekurangan:**

- ❌ Hanya 100 test users maksimal
- ❌ Setiap user harus ditambahkan manual
- ❌ Muncul warning screen "App not verified" saat login

**Cara Pakai:**

1. Tambahkan semua user yang ingin pakai sebagai test users
2. User klik "Continue" saat muncul warning screen
3. Selesai!

**Warning Screen yang Akan Muncul:**

```
⚠️ Google hasn't verified this app
This app hasn't been verified by Google yet...
[Continue] [Back to safety]
```

→ Klik **"Continue"** untuk lanjut

---

### ✅ **Opsi 2: Publish App (Production Ready)**

Jika ingin app bisa dipakai semua orang tanpa tambah test user:

#### **Langkah-langkah:**

**1. Buat Halaman Privacy Policy & Terms**

Buat 2 file baru:

**File:** `app/(root)/privacy/page.tsx`

```tsx
export default function PrivacyPage() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <div className="space-y-4 text-sm">
        <p className="text-muted-foreground">Last updated: November 1, 2025</p>

        <section>
          <h2 className="text-xl font-semibold mb-2">1. Introduction</h2>
          <p>
            SIAP UNDIP Schedule ("we", "our", or "us") respects your privacy.
            This Privacy Policy explains how we collect, use, and protect your
            information when you use our service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">2. What Data We Access</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <strong>Google Calendar:</strong> We access your Google Calendar
              to create and manage events for your class schedule and tasks.
            </li>
            <li>We DO NOT access any other Google services or data.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">
            3. How We Use Your Data
          </h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Create calendar events for your class schedule</li>
            <li>Create calendar events for your tasks and assignments</li>
            <li>Set up automatic reminders for classes and deadlines</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">
            4. Data Storage and Security
          </h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              Your Google Calendar access tokens are stored ONLY in your
              browser's localStorage
            </li>
            <li>We do NOT store your tokens on our servers</li>
            <li>We do NOT share your data with any third parties</li>
            <li>All communication with Google APIs is encrypted via HTTPS</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">5. Your Rights</h2>
          <p>You can:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Disconnect your Google Calendar at any time</li>
            <li>Revoke access via your Google Account settings</li>
            <li>Delete calendar events we created</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">6. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, contact us at:
            your-email@gmail.com
          </p>
        </section>
      </div>
    </div>
  );
}
```

**File:** `app/(root)/terms/page.tsx`

```tsx
export default function TermsPage() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <div className="space-y-4 text-sm">
        <p className="text-muted-foreground">Last updated: November 1, 2025</p>

        <section>
          <h2 className="text-xl font-semibold mb-2">1. Acceptance of Terms</h2>
          <p>
            By accessing and using SIAP UNDIP Schedule, you accept and agree to
            be bound by these Terms of Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">
            2. Description of Service
          </h2>
          <p>
            SIAP UNDIP Schedule is a web application designed to help students
            manage their academic schedules and tasks. The service includes:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Class schedule management</li>
            <li>Task and assignment tracking</li>
            <li>Google Calendar integration</li>
            <li>QR code attendance system</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">
            3. User Responsibilities
          </h2>
          <p>You agree to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Provide accurate information</li>
            <li>Keep your account credentials secure</li>
            <li>Use the service in accordance with applicable laws</li>
            <li>Not misuse or abuse the service</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">4. Disclaimer</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              This application is NOT officially affiliated with Universitas
              Diponegoro (UNDIP)
            </li>
            <li>
              The service is provided "as is" without warranties of any kind
            </li>
            <li>
              We are not responsible for any inaccuracies in schedule data
            </li>
            <li>You are responsible for verifying your schedule information</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">
            5. Limitation of Liability
          </h2>
          <p>
            We shall not be liable for any indirect, incidental, special, or
            consequential damages arising from your use of the service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">6. Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. Continued
            use of the service constitutes acceptance of modified terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">7. Contact</h2>
          <p>
            For questions about these Terms, contact us at: your-email@gmail.com
          </p>
        </section>
      </div>
    </div>
  );
}
```

**2. Update OAuth Consent Screen di Google Cloud Console**

1. Buka: https://console.cloud.google.com/apis/credentials/consent
2. Isi semua field:
   - **App name:** SIAP UNDIP Schedule
   - **User support email:** your-email@gmail.com
   - **App logo:** Upload logo 120x120px
   - **Application home page:** https://schedule.rifqinaufal11.studio
   - **Application privacy policy:** https://schedule.rifqinaufal11.studio/privacy
   - **Application terms of service:** https://schedule.rifqinaufal11.studio/terms
3. Klik **"Save and Continue"**

**3. Publish App**

1. Klik tombol **"PUBLISH APP"**
2. Klik **"Prepare for verification"**
3. **SUBMIT** untuk Google review

**4. Tunggu Approval**

- ⏱️ **Waktu review:** 4-6 minggu
- 📧 Google akan email jika butuh info tambahan
- 🎥 Mungkin diminta video demo

---

## 🚀 KESIMPULAN & REKOMENDASI

### Untuk Sekarang (Solusi Cepat):

1. ✅ **Update Redirect URI di Google Console** (WAJIB!)
2. ✅ **Tambahkan Test Users** untuk semua user yang ingin pakai
3. ✅ **Redeploy** dengan environment variable yang benar
4. ✅ User klik **"Continue"** saat muncul warning

### Untuk Masa Depan (Jika Ingin Production):

1. 📄 Buat halaman Privacy & Terms
2. 📝 Submit app untuk verification
3. ⏳ Tunggu 4-6 minggu
4. ✅ App bisa dipakai semua orang

---

## 📋 Checklist Sekarang:

- [ ] Update Redirect URI di Google Console
- [ ] Tambahkan email Anda sebagai test user
- [ ] Tambahkan email teman/user lain sebagai test user
- [ ] Redeploy dengan .env yang sudah diupdate
- [ ] Test login di production URL
- [ ] Klik "Continue" saat muncul warning
- [ ] Export jadwal ke Google Calendar
- [ ] Verify events muncul di Google Calendar

---

## ❓ FAQ

**Q: Apakah aman pakai "Testing" mode?**
A: Ya, aman! Hanya muncul warning screen, tapi fungsinya sama.

**Q: Berapa lama proses verification?**
A: 4-6 minggu, tapi tidak urgent jika hanya untuk personal use.

**Q: Bisa tambah test user tanpa batas?**
A: Maksimal 100 test users dalam testing mode.

**Q: User lain harus apa saat login?**
A: Klik "Advanced" → "Go to siapUndipSchedule (unsafe)" → "Continue"

---

**Status:** 🟡 Testing Mode (Butuh Test Users)
**Target:** 🟢 Published (Semua orang bisa pakai)

**Langkah pertama:** Update Redirect URI sekarang! 🚀
