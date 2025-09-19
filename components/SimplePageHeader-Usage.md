# SimplePageHeader - Penggunaan dengan Server vs Client Components

## Masalah yang Dipecahkan

Error `Only plain objects can be passed to Client Components from Server Components` terjadi ketika kita mencoba melewatkan React component (seperti Lucide icon) dari Server Component ke Client Component.

## Solusi

Komponen `SimplePageHeader` sekarang mendukung dua cara penggunaan:

### 1. **Server Components** (layout.tsx, page.tsx tanpa "use client")

Gunakan **string** untuk icon:

```tsx
// ✅ BENAR - Server Component
import SimplePageHeader from "@/components/SimplePageHeader";

export default function AppearanceLayout({ children }) {
  return (
    <div>
      <SimplePageHeader
        title="Appearance"
        icon="Palette" // ← String, bukan component
        iconColor="text-purple-600"
      />
      {children}
    </div>
  );
}
```

### 2. **Client Components** (page.tsx dengan "use client")

Bisa gunakan **string** atau **komponen icon** langsung:

```tsx
// ✅ BENAR - Client Component
"use client";

import { User } from "lucide-react";
import SimplePageHeader from "@/components/SimplePageHeader";

export default function ProfilePage() {
  return (
    <div>
      {/* Opsi 1: Gunakan komponen icon langsung */}
      <SimplePageHeader
        title="Profile"
        icon={User} // ← Komponen icon
        iconColor="text-green-600"
        backUrl="/user"
      />

      {/* Opsi 2: Atau gunakan string */}
      <SimplePageHeader
        title="Profile"
        icon="User" // ← String
        iconColor="text-green-600"
      />
    </div>
  );
}
```

## Icon yang Tersedia (String)

Icon yang bisa digunakan sebagai string:

- `"User"`
- `"Settings"`
- `"Shield"`
- `"Bell"`
- `"Calendar"`
- `"Book"`
- `"Palette"`
- `"Home"`
- `"FileText"`
- `"Upload"`
- `"BarChart3"`
- `"Clock"`
- `"MapPin"`

## Contoh Error dan Solusi

### ❌ Error - Server Component dengan icon component

```tsx
// SALAH - Server Component
import { Palette } from "lucide-react";

export default function Layout() {
  return (
    <SimplePageHeader
      icon={Palette} // ← Error! Server Component tidak bisa pass object
    />
  );
}
```

### ✅ Solusi - Server Component dengan icon string

```tsx
// BENAR - Server Component
export default function Layout() {
  return (
    <SimplePageHeader
      icon="Palette" // ← Solusi! Gunakan string
    />
  );
}
```

## Menambah Icon Baru

Jika butuh icon baru, tambahkan di `iconMap` dalam `SimplePageHeader.tsx`:

```tsx
import { NewIcon } from "lucide-react";

const iconMap = {
  // ... icon yang sudah ada
  NewIcon, // ← Tambahkan di sini
};
```

Kemudian gunakan sebagai string: `icon="NewIcon"`
