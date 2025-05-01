import type { Metadata } from "next";
import { Inter, Noto_Sans_Arabic } from "next/font/google";
import "./globals.css";
import { Providers } from "@/providers";
import { Toaster } from "@/components/ui/toaster";
import { AuthRefresh } from "@/components/AuthRefresh";

const inter = Inter({ subsets: ["latin"] });

const notoSansArabic = Noto_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['400', '700'],
  variable: '--font-noto-sans-arabic',
});

export const metadata: Metadata = {
  title: "فروشگاه آنلاین",
  description: "فروشگاه یکپارچه برای تمام نیازهای شما",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning className={notoSansArabic.variable}>
      <body className="font-sans">
        <Providers>
          {children}
          <Toaster />
          <AuthRefresh />
        </Providers>
      </body>
    </html>
  );
}


