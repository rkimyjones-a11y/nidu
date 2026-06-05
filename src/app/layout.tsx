import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { InstallPWAProvider } from "@/components/InstallPWA";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nidú · Planifica las comidas de tu familia",
  description:
    "Planifica las comidas semanales de tu familia teniendo en cuenta gustos, restricciones y disponibilidad.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Nidú",
    statusBarStyle: "default",
  },
  icons: {
    apple: "/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#16a34a",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <InstallPWAProvider>{children}</InstallPWAProvider>
      </body>
    </html>
  );
}
