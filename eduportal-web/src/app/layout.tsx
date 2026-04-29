import type { Metadata, Viewport } from "next";
import "./globals.css";
import PWARegistration from "@/components/school/PWARegistration";

export const metadata: Metadata = {
  title: "EduPortal | The Multi-Tenant School Ecosystem",
  description: "Next-generation NEP 2020 compliant school management platform with AI-driven academic tools.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#8B5CF6",
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
    <html lang="en">
      <body className="antialiased bg-[var(--bg-dark)]">
        <PWARegistration />
        {children}
      </body>
    </html>
  );
}

