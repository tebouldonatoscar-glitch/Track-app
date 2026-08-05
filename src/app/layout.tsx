import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import OnlineStatusBanner from "@/components/OnlineStatusBanner";

export const metadata: Metadata = {
  title: "NutriScan",
  description: "Scan de codes-barres alimentaires, analyse nutritionnelle et suivi des macros",
  manifest: "manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "NutriScan",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased">
        <ServiceWorkerRegister />
        <OnlineStatusBanner />
        <div className="mx-auto min-h-screen max-w-md pb-24">{children}</div>
        <BottomNav />
      </body>
    </html>
  );
}
