import type { Metadata } from "next";
import { Inter, Noto_Sans_TC, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ClientErrorBoundary } from "@/components/ClientErrorBoundary";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const notoSansTC = Noto_Sans_TC({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-sans-tc",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-plus-jakarta-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TLI Connect - Break Language Barriers. Unlock Asian Markets",
  description: "Join TLI Connect's cross-cultural learning community. Master Chinese language, culture, and business skills with Taiwan's pioneer language institute since 1956.",
  keywords: "Chinese language learning, Mandarin classes, Taiwan language school, cross-cultural training, business Chinese, TLI",
  authors: [{ name: "TLI Connect" }],
  creator: "TLI Connect",
  publisher: "TLI Connect",
  robots: "index, follow",
  openGraph: {
    title: "TLI Connect - Break Language Barriers. Unlock Asian Markets",
    description: "Join TLI Connect's cross-cultural learning community. Master Chinese language, culture, and business skills with Taiwan's pioneer language institute since 1956.",
    type: "website",
    locale: "en_US",
    alternateLocale: "zh_TW",
    siteName: "TLI Connect",
  },
  twitter: {
    card: "summary_large_image",
    title: "TLI Connect - Break Language Barriers. Unlock Asian Markets",
    description: "Join TLI Connect's cross-cultural learning community. Master Chinese language, culture, and business skills.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body
        className={`${inter.variable} ${notoSansTC.variable} ${plusJakartaSans.variable} antialiased`}
      >
        <ClientErrorBoundary>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ClientErrorBoundary>
      </body>
    </html>
  );
}
