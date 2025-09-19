import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./(root)/globals.css";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/components/query-provider";
import { Toaster } from "@/components/ui/sonner";
import DynamicThemeColor from "@/components/DynamicThemeColor";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SIAP UNDIP Schedule",
  description: "Schedule management app for UNDIP students",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#141414" },
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  userScalable: true, // Allow scaling for better keyboard support
  minimumScale: 1,
  maximumScale: 5, // Allow some scaling to prevent keyboard issues
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=5, user-scalable=yes, viewport-fit=cover"
        />
        <link rel="icon" type="image/png" sizes="196x196" href="/icon.png" />

        {/* PWA Meta Tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="SIAP UNDIP" />

        {/* iOS Keyboard Support */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="apple-touch-fullscreen" content="yes" />
        <meta name="apple-mobile-web-app-orientations" content="portrait" />

        {/* iOS Keyboard Fix Script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
                  // Detect when virtual keyboard appears
                  let initialViewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;

                  function handleViewportChange() {
                    if (window.visualViewport) {
                      const currentHeight = window.visualViewport.height;
                      const heightDifference = initialViewportHeight - currentHeight;

                      if (heightDifference > 150) {
                        // Keyboard is likely open
                        document.body.classList.add('keyboard-open');
                        document.documentElement.style.setProperty('--keyboard-height', heightDifference + 'px');
                      } else {
                        // Keyboard is likely closed
                        document.body.classList.remove('keyboard-open');
                        document.documentElement.style.removeProperty('--keyboard-height');
                      }
                    }
                  }

                  if (window.visualViewport) {
                    window.visualViewport.addEventListener('resize', handleViewportChange);
                  }

                  // Focus management for inputs
                  document.addEventListener('focusin', function(e) {
                    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                      setTimeout(function() {
                        e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }, 300);
                    }
                  });
                }
              })();
            `,
          }}
        />

        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" href="/apple-icon-180.png" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-icon-180.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="192x192"
          href="/manifest-icon-192.maskable.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="512x512"
          href="/manifest-icon-512.maskable.png"
        />

        {/* Additional PWA Meta Tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="SIAP UNDIP" />
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta name="theme-color" content="#ffffff" />
        <meta
          name="theme-color"
          media="(prefers-color-scheme: dark)"
          content="#141414"
        />
      </head>
      <body className={inter.className}>
        <QueryProvider>
          <AuthProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <DynamicThemeColor />
              <div className="min-h-screen bg-background">{children}</div>
              <Toaster />
            </ThemeProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
