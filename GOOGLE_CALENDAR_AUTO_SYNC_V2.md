# 🔄 Google Calendar Auto-Sync - Fully Automatic Integration

## 📋 Overview

Sistem auto-sync Google Calendar yang **sepenuhnya otomatis** tanpa perlu export manual. Semua perubahan jadwal akan langsung tersinkronisasi ke Google Calendar.

## ✨ Fitur Auto-Sync

### 🎯 Trigger Otomatis

Auto-sync akan **otomatis** berjalan saat:

1. **➕ Add Subject** - Menambah mata kuliah baru
2. **✏️ Edit Subject** - Mengupdate jadwal mata kuliah
3. **📅 Record Reschedule** - Menambah jadwal reschedule
4. **🎓 Upload Kartu UTS/UAS** - Upload kartu ujian
5. **📝 Save IRS** - Menyimpan jadwal IRS

### 🔐 Koneksi Google Calendar

Button koneksi Google Calendar sekarang ada di **Halaman User** (`/user`):

- **Connect** - Hubungkan dengan Google Calendar
- **Auto-sync diaktifkan otomatis** saat connect
- **Disconnect** - Putuskan koneksi dan nonaktifkan auto-sync

## 🏗️ Struktur Implementasi

### 1️⃣ Hook Auto-Sync

**File**: `hooks/useAutoSyncSubject.ts`

```typescript
export function useAutoSyncSubject() {
  const syncSubjectToCalendar = async (subject: Subject) => {
    // Only sync if connected and auto-sync is enabled
    if (!isConnected || !tokens || !isAutoSyncEnabled) {
      return;
    }

    // Silent auto-sync ke Google Calendar
    const response = await fetch("/api/google-calendar/export-subject", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, tokens }),
    });
  };

  return { syncSubjectToCalendar, isAutoSyncEnabled };
}
```

### 2️⃣ Integrasi di Mutations

#### Add/Edit Subject (ManageSubjects.tsx & ScheduleClient.tsx)

```typescript
const { syncSubjectToCalendar } = useAutoSyncSubject();

const createSubjectMutation = useCreateSubject({
  onAutoSyncSuccess: (subject) => {
    syncSubjectToCalendar(subject); // 🔄 Auto-sync saat add
  },
});

const updateSubjectMutation = useUpdateSubject({
  onAutoSyncSuccess: (subject) => {
    syncSubjectToCalendar(subject); // 🔄 Auto-sync saat edit
  },
});
```

#### Record Reschedule (RescheduleModal.tsx)

```typescript
const { syncSubjectToCalendar } = useAutoSyncSubject();

const handleSubmit = async () => {
  const result = await fetch(`/api/subjects/${subjectId}/reschedule`, {
    method: "POST",
    body: JSON.stringify(formData),
  });

  if (result.success) {
    // 🔄 Auto-sync subject yang sudah diupdate dengan reschedule baru
    syncSubjectToCalendar(result.subject);
  }
};
```

#### Upload UTS/UAS (UploadExamCard.tsx)

```typescript
const { syncSubjectToCalendar } = useAutoSyncSubject();

const submitExamSchedule = async () => {
  const response = await fetch("/api/subjects/exam-schedule", {
    method: "POST",
    body: JSON.stringify({ exams, periodStartDate, periodEndDate, examType }),
  });

  const result = await response.json();

  if (result.success) {
    // 🔄 Auto-sync semua exam subjects yang baru dibuat
    for (const subject of result.insertedSubjects) {
      await syncSubjectToCalendar(subject);
    }

    // 🔄 Auto-sync regular subjects yang jadwalnya berubah (replaced meetings)
    for (const subject of result.updatedSubjects) {
      await syncSubjectToCalendar(subject);
    }
  }
};
```

### 3️⃣ API Updates

#### Reschedule API (`app/api/subjects/[id]/reschedule/route.ts`)

```typescript
export async function POST(request, { params }) {
  // ... add reschedule logic ...

  // Fetch updated subject untuk auto-sync
  const updatedSubject = await db.collection("subjects").findOne({
    _id: new ObjectId(id),
    userId: decoded.userId,
  });

  return NextResponse.json({
    success: true,
    subject: updatedSubject, // ✅ Return subject for auto-sync
  });
}
```

#### Exam Schedule API (`app/api/subjects/exam-schedule/route.ts`)

```typescript
export async function POST(request) {
  // ... insert exam schedules ...
  // ... update regular subjects with replaced meetings ...

  // Fetch inserted exam subjects
  const insertedSubjects = await db
    .collection("subjects")
    .find({ _id: { $in: insertedIds } })
    .toArray();

  // Fetch updated regular subjects
  const updatedSubjects = await db
    .collection("subjects")
    .find({
      userId: decoded.userId,
      specificDate: { $exists: false },
      meetingDates: { $exists: true },
    })
    .toArray();

  return NextResponse.json({
    success: true,
    insertedSubjects, // ✅ Exam subjects for auto-sync
    updatedSubjects, // ✅ Updated regular subjects for auto-sync
  });
}
```

### 4️⃣ UI Components

#### Google Calendar Connect (GoogleCalendarConnect.tsx)

Komponen minimalis di halaman User:

```tsx
<GoogleCalendarConnect />
```

Fitur:

- ✅ Connect/Disconnect button
- ✅ Auto-enable auto-sync saat connect
- ✅ Status indicator (connected/disconnected)
- ✅ Informasi auto-sync triggers

#### User Page (`app/(root)/user/page.tsx`)

```tsx
import dynamic from "next/dynamic";

const GoogleCalendarConnect = dynamic(
  () => import("@/components/GoogleCalendarConnect"),
  { ssr: false }
);

// ...

<div className="space-y-3">
  <h2>Calendar Integration</h2>
  <GoogleCalendarConnect />
</div>;
```

## 🔄 Flow Auto-Sync

### 1. User Connect Google Calendar

```
User Page → Click "Connect" → Google OAuth → Auto-sync enabled
```

### 2. Add Subject

```
Add Subject → Save → createSubjectMutation.onAutoSyncSuccess()
→ syncSubjectToCalendar() → Silent sync to Google Calendar
```

### 3. Record Reschedule

```
Record Reschedule → Submit → API returns updated subject
→ syncSubjectToCalendar() → Silent sync to Google Calendar
```

### 4. Upload UTS/UAS

```
Upload Kartu → Submit → API returns inserted + updated subjects
→ Loop through all subjects → syncSubjectToCalendar()
→ Silent sync all to Google Calendar
```

## 🎨 User Experience

### ✅ Keuntungan Auto-Sync Otomatis

1. **🚀 Zero Manual Work**

   - Tidak perlu klik "Export to Calendar" manual
   - Tidak perlu pilih minggu atau range
   - Tidak perlu confirm dialog

2. **⚡ Real-time Sync**

   - Jadwal langsung masuk Google Calendar
   - Update otomatis saat ada perubahan
   - Reschedule langsung tersinkronisasi

3. **🔕 Silent Operation**

   - Tidak mengganggu dengan toast notification berlebihan
   - Console log untuk debugging saja
   - Error ditangani secara silent (tidak mengganggu user)

4. **🎯 Smart Sync**
   - Hanya sync jika connected dan auto-sync enabled
   - Check localStorage untuk status
   - Tidak sync jika tidak diperlukan

## 📊 Technical Details

### Storage

```typescript
// LocalStorage keys
"google_calendar_tokens"; // OAuth tokens
"google_calendar_auto_sync"; // true/false
```

### API Endpoints

```typescript
POST / api / google - calendar / export - subject; // Single subject sync
POST / api / google - calendar / export - schedule; // Bulk subjects sync
POST / api / google - calendar / delete - all; // Delete all events
```

### Event Types

1. **Blue Events** - Regular classes (meetingDates)
2. **Red Events** - UTS/UAS exams (specificDate + examType)
3. **Yellow Events** - Reschedules (reschedules array)

## 🛠️ Maintenance

### Debug Auto-Sync

```typescript
// Check console logs
console.log("🔄 Auto-syncing subject to Google Calendar:", subject.name);
console.log("✅ Subject auto-synced to Google Calendar:", subject.name);
console.error("Failed to auto-sync subject:", data.error);
```

### Check Auto-Sync Status

```typescript
const { isAutoSyncEnabled } = useAutoSyncSubject();
console.log("Auto-sync enabled:", isAutoSyncEnabled);
```

### Test Auto-Sync

1. Connect Google Calendar di User page
2. Add new subject → Check Google Calendar
3. Record reschedule → Check Google Calendar
4. Upload UTS/UAS → Check Google Calendar
5. Verify all events appear correctly

## 📝 Migration Notes

### Changes from Previous Version

| Before                | After                          |
| --------------------- | ------------------------------ |
| Manual export button  | Automatic sync                 |
| Week slider selection | Uses meetingDates directly     |
| Export dialog         | Silent background sync         |
| Schedule page button  | User page button only          |
| Tasks integration     | ❌ Removed (subjects only)     |
| ManageSubjects button | ❌ Removed (User page only)    |
| Manual week selection | ✅ Automatic from meetingDates |

### Button Location

- ❌ **Removed from**: Schedule page
- ❌ **Removed from**: ManageSubjects page
- ❌ **Removed from**: Tasks page
- ✅ **Now only at**: User page (`/user`)

## 🎯 Summary

Auto-sync Google Calendar sekarang **sepenuhnya otomatis**:

✅ Connect sekali di User page
✅ Auto-sync enabled otomatis
✅ Semua perubahan jadwal langsung sync
✅ Tidak perlu export manual lagi
✅ Silent operation (tidak mengganggu)
✅ Real-time synchronization

**User hanya perlu connect Google Calendar sekali, dan semua jadwal akan otomatis tersinkronisasi selamanya!** 🎉
