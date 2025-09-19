# Responsive Fixed Header dengan Scroll Fade Effect

## Fitur yang Ditambahkan

Header yang responsive dengan behavior berbeda antara mobile dan desktop:

- **Mobile**: Fixed position dengan efek fade (opacity) yang menghilang perlahan saat scroll
- **Desktop**: Position normal tanpa fixed, mengikuti layout sidebar

## Komponen yang Dibuat/Dimodifikasi

### 1. Hook `useScrollOpacity`

- **Lokasi**: `hooks/useScrollOpacity.ts`
- **Fungsi**: Menghitung opacity berdasarkan posisi scroll
- **Parameter**:
  - `fadeDistance`: Jarak scroll (px) dimana header akan sepenuhnya hilang (default: 150px)
  - `startOffset`: Offset awal scroll sebelum fade dimulai (default: 0px)

### 2. PageHeader Component

- **Lokasi**: `components/PageHeader.tsx`
- **Perubahan**:
  - Import `useScrollOpacity` hook
  - **Mobile**: `fixed top-0 left-0 right-0 z-50` dengan background blur
  - **Desktop**: `lg:relative lg:top-auto lg:left-auto lg:right-auto lg:z-auto lg:bg-transparent`
  - Conditional opacity application - hanya apply di mobile

### 3. SimplePageHeader Component

- **Lokasi**: `components/SimplePageHeader.tsx`
- **Perubahan**:
  - Import `useScrollOpacity` hook
  - **Mobile**: `fixed top-0 left-0 right-0 z-50` dengan background blur
  - **Desktop**: `lg:relative lg:top-auto lg:left-auto lg:right-auto lg:z-auto lg:bg-transparent`
  - Conditional opacity application - hanya apply di mobile

### 4. FixedHeaderLayout Component

- **Lokasi**: `components/FixedHeaderLayout.tsx`
- **Fungsi**: Wrapper layout untuk halaman yang menggunakan fixed header
- **Features**:
  - **Mobile**: `pt-20` untuk mengakomodasi fixed header
  - **Desktop**: `lg:pt-0` - tidak ada padding karena header tidak fixed
  - Support `extraPadding` prop untuk customization

## Responsive Behavior

### Mobile (< lg breakpoint):

- **Header**: Fixed position di atas halaman
- **Background**: Semi-transparent dengan blur effect (`bg-background/95 backdrop-blur-sm`)
- **Z-Index**: `z-50` untuk berada di atas konten
- **Scroll Effect**: Opacity fade dari 100% ke 0%
- **Content**: Padding-top `pt-20` untuk menghindari overlap

### Desktop (≥ lg breakpoint):

- **Header**: Position relative, mengikuti flow normal
- **Background**: Transparent, tidak ada blur
- **Z-Index**: Auto, tidak perlu elevated
- **Scroll Effect**: Tidak ada (opacity selalu 100%)
- **Content**: Tidak ada padding-top (`lg:pt-0`)

## Konfigurasi Default

```typescript
const scrollOpacity = useScrollOpacity({
  fadeDistance: 120, // Header akan fade sepenuhnya setelah scroll 120px
  startOffset: 10, // Fade mulai setelah scroll 10px
});
```

## Halaman yang Telah Diupdate

### PageHeader:

- **Tasks page (`/tasks`)** - responsive padding `pt-20 lg:pt-0`
- **Schedule page (`/schedule`)** - via ScheduleClient component dengan responsive padding

### SimplePageHeader:

- **User profile (`/user/profile`)** - menggunakan responsive FixedHeaderLayout
- **Settings appearance (`/settings/appearance`)** - menggunakan responsive FixedHeaderLayout
- **Settings about (`/settings/about`)** - menggunakan responsive FixedHeaderLayout

### Custom Headers:

- **Homepage (`/`)** - Mobile header dengan responsive fixed positioning
  - Mobile: Fixed dengan scroll fade
  - Desktop: Tidak terpengaruh karena `lg:hidden`
- **User page (`/user`)** - Custom header dengan responsive fixed positioning
  - Mobile: Fixed dengan scroll fade dan background blur
  - Desktop: Position normal tanpa fixed effect

## Implementasi pada Halaman Baru

### Untuk halaman dengan PageHeader:

```tsx
<div className="min-h-screen bg-background">
  <PageHeader variant="tasks" />
  <div className="pt-20 lg:pt-0 mx-auto p-6">
    {/* Content - padding hanya di mobile */}
  </div>
</div>
```

### Untuk halaman dengan SimplePageHeader:

```tsx
import FixedHeaderLayout from "@/components/FixedHeaderLayout";

<div className="min-h-screen bg-background">
  <SimplePageHeader title="Page Title" icon="Icon" />
  <FixedHeaderLayout>
    {/* Content - automatic responsive padding */}
  </FixedHeaderLayout>
</div>;
```

## Customization

### Mengubah fade effect:

```typescript
const scrollOpacity = useScrollOpacity({
  fadeDistance: 200, // Fade lebih perlahan
  startOffset: 0, // Mulai fade langsung dari top
});
```

### Menambahkan extra padding:

```tsx
<FixedHeaderLayout extraPadding="pt-6 pb-12">{children}</FixedHeaderLayout>
```

## Keuntungan Responsive Design

1. **Mobile-First**: UX optimal di mobile dengan fixed header
2. **Desktop-Friendly**: Tidak mengganggu layout sidebar di desktop
3. **Consistent**: Semua header memiliki behavior yang seragam
4. **Performance**: Scroll effect hanya aktif di mobile
5. **Maintainable**: Centralized logic di components dan layouts
