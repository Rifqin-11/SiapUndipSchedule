import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./(root)/globals.css";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import DynamicThemeColor from "@/components/DynamicThemeColor";
import { QueryProvider } from "@/components/query-provider";

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
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  userScalable: false,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
    {/* Minimal critical CSS for above-the-fold to reduce LCP render-blocking impact.
            Keep it tiny and safe: basic background, container sizing, and simple utility fallbacks. */}
        <style dangerouslySetInnerHTML={{ __html: `
          /* Critical minimal styles (inlined) */
          html,body{height:100%;margin:0}
          body{min-height:100vh;background:#ffffff;color:#0f172a}
          .min-h-screen{min-height:100vh}
          .bg-background{background:#f8fafc}
          /* Basic layout fallback for header / main container */
          .site-header{height:64px}
          .container{max-width:1024px;margin-left:auto;margin-right:auto;padding:0 16px}
        ` }} />

        {/* Preload built Next CSS assets as non-blocking (preload-as-style + onload -> rel=stylesheet)
            This ensures CSS starts downloading early while avoiding blocking the rendering critical path. */}
        <link rel="preload" href="/_next/static/css/579ef732daa8f3fd.css" as="style" />
        <link rel="preload" href="/_next/static/css/7e7d96b1e6991756.css" as="style" />
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            try{document.querySelectorAll('link[rel="preload"][as="style"]').forEach(function(l){l.onload=function(){l.rel='stylesheet'};});}catch(e){}
          })();
        `}} />
        <noscript>
          <link rel="stylesheet" href="/_next/static/css/579ef732daa8f3fd.css" />
          <link rel="stylesheet" href="/_next/static/css/7e7d96b1e6991756.css" />
        </noscript>
        {/* Make Next-injected chunk CSS non-blocking to avoid render-blocking CSS chains reported by Lighthouse.
            This script converts <link rel="stylesheet" href="/_next/static/chunks/..."> into
            preload-as-style + onload -> rel=stylesheet. It also observes mutations so late-inserted links
            are handled. Tradeoff: may cause a brief unstyled flash for very early content; consider inlining
            critical CSS if that's a problem. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){
              function shouldHandleHref(h){try{if(!h) return false; var loc = window.location; if(h.indexOf('/_next/static/')!==-1) return true; // Next generated css
                // handle same-origin css files (absolute or relative)
                if(h.indexOf(loc.origin)===0 && h.endsWith('.css')) return true;
                if(h.indexOf('/')===0 && h.endsWith('.css')) return true;
                return false;}catch(e){return false}}
              function makeNonBlocking(l){try{if(l.rel==='stylesheet'&&shouldHandleHref(l.href)){l.rel='preload';l.as='style';l.onload=function(){this.rel='stylesheet'};l.setAttribute('data-nonblocking','true')}catch(e){}
              }
              try{Array.prototype.slice.call(document.querySelectorAll('link[rel="stylesheet"]')).forEach(function(l){ if(shouldHandleHref(l.href)) makeNonBlocking(l) }); }catch(e){}
              var mo=new MutationObserver(function(records){records.forEach(function(r){r.addedNodes&&r.addedNodes.forEach(function(n){try{if(n&&n.tagName==='LINK'&&n.rel==='stylesheet'&&shouldHandleHref(n.href)) makeNonBlocking(n)}catch(e){} })})});
              try{mo.observe(document.head||document.getElementsByTagName('head')[0],{childList:true,subtree:false})}catch(e){}
            })();`,
          }}
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Fonts loaded via next/font (Inter) - avoid external render-blocking requests to fonts.googleapis.com */}
        <link rel="icon" type="image/png" sizes="196x196" href="/icon.png" />

        {/* PWA Meta Tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="SIAP UNDIP" />

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
              disableTransitionOnChange={false}
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
