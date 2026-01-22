import type { Metadata } from "next";
import "./globals.css";
import SessionProvider from "@/components/providers/SessionProvider";

export const metadata: Metadata = {
  title: "BY TRANG | Thời trang Việt Nam",
  description: "BY TRANG - Thương hiệu thời trang Việt Nam từ năm 2002. Áo dài, đầm dự tiệc, trang phục công sở cao cấp.",
  keywords: ["BY TRANG", "thời trang Việt Nam", "áo dài", "Huế", "đầm dự tiệc"],
  openGraph: {
    title: "BY TRANG | Thời trang Việt Nam",
    description: "BY TRANG - Thương hiệu thời trang Việt Nam từ năm 2002",
    type: "website",
    locale: "vi_VN",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        <meta charSet="utf-8" />
      </head>
      <body className="font-sans antialiased">
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
