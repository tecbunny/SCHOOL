import type { Metadata, Viewport } from "next";
import "./globals.css";
import PWARegistration from "@/components/school/PWARegistration";
import GlobalChatDrawer from "@/features/chat/GlobalChatDrawer";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export const metadata: Metadata = {
  metadataBase: new URL("https://eduportal.ssph01.internal"),
  title: "EduPortal | The Multi-Tenant School Ecosystem",
  description: "Next-generation NEP 2020 compliant school management platform with AI-driven academic tools.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
  openGraph: {
    title: "EduPortal | The Multi-Tenant School Ecosystem",
    description: "Next-generation NEP 2020 compliant school management platform with AI-driven academic tools.",
    url: "https://eduportal.ssph01.internal",
    siteName: "EduPortal",
    images: [
      {
        url: "/icon.png",
        width: 512,
        height: 512,
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "EduPortal | The Multi-Tenant School Ecosystem",
    description: "Next-generation NEP 2020 compliant school management platform with AI-driven academic tools.",
    images: ["/icon.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#1e3a5f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-[var(--bg-dark)]">
        <ErrorBoundary>
          <PWARegistration />
          {children}
          <GlobalChatDrawer />
        </ErrorBoundary>
      </body>
    </html>
  );
}

