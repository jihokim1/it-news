import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google"; // 폰트 가져오기
import "./globals.css";
import Footer from "@/components/layout/Footer";

// 1. 폰트 설정
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "트랜드IT(Trend IT)",
  description: "가장 빠른 IT 트렌드와 앱 랭킹",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      {/* 폰트 변수를 body에 등록 */}
      <body className={`${inter.variable} ${playfair.variable} bg-[#F8F9FA] text-slate-900 antialiased font-sans`}>
        {children}

        {/* 푸터 추가 */}
        <Footer />
      </body>
    </html>
  );
}