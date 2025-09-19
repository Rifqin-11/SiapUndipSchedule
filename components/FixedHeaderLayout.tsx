"use client";

import React from "react";

interface FixedHeaderLayoutProps {
  children: React.ReactNode;
  /** Tambahan padding-top jika diperlukan */
  extraPadding?: string;
}

/**
 * Wrapper layout untuk halaman yang menggunakan fixed header
 * Menambahkan padding-top yang sesuai untuk mengakomodasi fixed header di mobile
 * Di desktop (lg+), tidak ada padding karena header tidak fixed
 */
export default function FixedHeaderLayout({
  children,
  extraPadding = "",
}: FixedHeaderLayoutProps) {
  return <div className={`pt-20 lg:pt-0 ${extraPadding}`}>{children}</div>;
}
