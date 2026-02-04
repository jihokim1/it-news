import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Footer from "@/components/layout/Footer";
import Script from 'next/script';
import NaverAnalytics from "@/components/NaverAnalytics";

// ⚡ [유지] 이건 있어야 시간이 실시간으로 흐릅니다.
export const dynamic = "force-dynamic";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  metadataBase: new URL("https://trendit.ai.kr"),
  title: {
    template: "%s | 트렌드IT",
    default: "트렌드IT - 대한민국 No.1 IT 뉴스 & 앱 랭킹",
  },
  description: "가장 빠른 IT 뉴스, 실시간 앱 랭킹, AI 및 테크 트렌드 분석을 제공합니다.",
  keywords: ["IT뉴스", "테크", "AI", "앱랭킹", "스타트업", "트렌드IT", "TrendIT"],
  
  // 1. Open Graph 설정 (SNS 공유용)
  openGraph: {
    title: "트렌드IT - 기술의 흐름을 읽다",
    description: "오늘의 IT 이슈와 실시간 앱 랭킹을 한눈에 확인하세요.",
    url: "https://trendit.ai.kr",
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
    icon: [
      { url: '/favicon.ico' },
      { url: '/logo.png', sizes: '32x32', type: 'image/png' }, // PNG 로고도 함께 명시
    ],
    apple: [
      { url: '/logo.png' }, // 아이폰 홈 화면 추가 시 로고가 나오도록 설정
    ],
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
  // 박사님의 GA4 측정 ID
  const GA_MEASUREMENT_ID = 'G-XMH2R1GDEW'; 

  return (
    <html lang="ko">
      <body className={`${inter.variable} ${playfair.variable} bg-[#F8F9FA] text-slate-900 antialiased font-sans`}>
      <head>

      <meta name="google-adsense-account" content="ca-pub-3987387348804375" />
        {/* 구글 애드센스 스크립트 */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3987387348804375"
          crossOrigin="anonymous"
          strategy="afterInteractive" // 페이지 로드 후 부드럽게 불러옵니다.
        />

        {/* 3. Daum 웹마스터도구 인증 (robots.txt 대신 여기에 넣으세요) */}
        {/* robots.txt에 있던 PIN 번호를 아래 content에 넣으시면 됩니다 */}
        <meta name="daum-verification" content="a9fa0d414f2cbc7c553f6c98057cba981e52505a9082dbe0c700cf98284e1660:5llCktz7ZGRLpLSfLaoo1w==" />
      </head>
        {children}

        <Footer />

        {/* --- 네이버 애널리틱스 --- */}
        <NaverAnalytics />

        {/* --- 구글 애널리틱스 (GA4) --- */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
      </body>
    </html>
  );
}