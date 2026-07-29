import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "fx-SMART | Gelişmiş Bilimsel Hesap Makinesi",
  description: "Gelişmiş 2D/3D grafik çizimi, yerel hafıza ve yapay zeka destekli adım adım soru çözücü içeren bilimsel hesap makinesi.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="dark">
      <body className="min-h-screen bg-fx-bg text-fx-text font-fx-mono antialiased">
        {children}
      </body>
    </html>
  );
}