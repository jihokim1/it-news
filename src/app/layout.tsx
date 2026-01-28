import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Footer from "@/components/layout/Footer";
import Script from 'next/script';

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
  
  // 1. Open Graph 설정 (SNS 공유용)
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

  // 2. 트위터 카드 설정
  twitter: {
    card: "summary_large_image",
    title: "트렌드IT - 대한민국 No.1 IT 뉴스",
    description: "오늘의 IT 이슈와 실시간 앱 랭킹을 한눈에 확인하세요.",
    images: ["/logo.png"],
  },

  // 3. 파비콘 및 아이콘 설정
  icons: {
    icon: '/fabicon.ico',
    apple: '/fabicon.ico',
    shortcut: '/fabicon.ico',
  },

  // 4. 검색 엔진 수집 설정
  robots: {
    index: true,
    follow: true,
  },

  // 5. 검색 엔진 소유권 확인 (중요: 한 곳으로 통합)
  verification: {
    // 구글 서치콘솔 코드가 있다면 여기에 입력하십시오.
    google: "구글-서치콘솔-코드-입력", 
    other: {
      // 이미지에서 확인된 네이버 코드를 정확히 반영했습니다.
      "naver-site-verification": "a18f0d70591defda9dfe3ca13ffa3374d7f2e8ce",
    },
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
        {/* 2. 네이버 애널리틱스 스크립트 추가 */}
        <Script 
          src="//wcs.pstatic.net/wcslog.js" 
          strategy="afterInteractive" 
        />
        <Script id="naver-analytics" strategy="afterInteractive">
          {`
            if(!window.wcs) var wcs = {};
            if(!window.wcs_add) var wcs_add = {};
            wcs_add["wa"] = "169655d31a7a3d0";
            if(window.wcs) {
              wcs_do();
            }
          `}
        </Script>
      </body>
    </html>
  );
}