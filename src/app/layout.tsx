import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Footer from "@/components/layout/Footer";

// ⚡ [유지] 이건 있어야 시간이 실시간으로 흐릅니다.
export const dynamic = "force-dynamic";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.trendit.ai.kr"),
  title: {
    template: "%s | 트렌드IT",
    default: "트렌드IT - 대한민국 No.1 테크 뉴스 & 앱 랭킹",
  },
  description: "가장 빠른 IT 뉴스, 실시간 앱 랭킹, AI 및 테크 트렌드 분석을 제공합니다.",
  keywords: ["IT뉴스", "테크", "AI", "앱랭킹", "스타트업", "트렌드IT", "TrendIT"],
  openGraph: {
    title: "트렌드IT - 기술의 흐름을 읽다",
    description: "오늘의 IT 이슈와 실시간 앱 랭킹을 한눈에 확인하세요.",
    url: "https://www.trendit.ai.kr",
    siteName: "트렌드IT",
    locale: "ko_KR",
    type: "website",
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: "트렌드IT 미리보기",
      },
    ],
  },
  icons: {
    icon: '/fabicon.ico',
    apple: '/fabicon.ico',
    shortcut: '/fabicon.ico',
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: "구글-서치콘솔-코드-입력", 
    other: {
      "naver-site-verification": "네이버-웹마스터도구-코드-입력",
    },
  },

  // ⭐ [추가] 트위터 카드 설정
  twitter: {
    card: "summary_large_image", // 이미지를 크게 보여줌
    title: "트렌드IT - 대한민국 No.1 IT 뉴스",
    description: "오늘의 IT 이슈와 실시간 앱 랭킹을 한눈에 확인하세요.",
    images: ["/logo.png"], // 대표 이미지
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${inter.variable} ${playfair.variable} bg-[#F8F9FA] text-slate-900 antialiased font-sans`}>
        
        {/* ❌ 여기에 있던 NewsTicker 삭제! */}
        
        {children} {/* 여기에 메인 페이지(헤더 포함)가 들어옵니다 */}

        <Footer />
      </body>
    </html>
  );
}