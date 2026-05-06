import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Footer from "@/components/layout/Footer";
import Script from 'next/script';
import NaverAnalytics from "@/components/NaverAnalytics";
import { SpeedInsights } from "@vercel/speed-insights/next";

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

  twitter: {
    card: "summary_large_image",
    title: "트렌드IT - 대한민국 No.1 IT 뉴스",
    description: "오늘의 IT 이슈와 실시간 앱 랭킹을 한눈에 확인하세요.",
    images: ["/logo-v2.png"], // ⭐ [캐시 파괴]
  },

  icons: {
    icon: [
      { url: '/favicon.ico?v=2' }, 
      { url: '/logo-v2.png', sizes: '32x32', type: 'image/png' }, // ⭐ [캐시 파괴]
    ],
    apple: [
      { url: '/logo-v2.png' }, // ⭐ [캐시 파괴]
    ],
  },

  robots: {
    index: true,
    follow: true,
  },

  verification: {
    other: {
      "naver-site-verification": "a18f0d70591defda9dfe3ca13ffa3374d7f2e8ce",
    },
  },

  other: {
    "google-adsense-account": "ca-pub-3987387348804375",
    "daum-verification": "a9fa0d414f2cbc7c553f6c98057cba981e52505a9082dbe0c700cf98284e1660:5llCktz7ZGRLpLSfLaoo1w==",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const GA_MEASUREMENT_ID = 'G-XMH2R1GDEW'; 

  return (
    <html lang="ko">
      <body className={`${inter.variable} ${playfair.variable} bg-[#F8F9FA] text-slate-900 antialiased font-sans`}>
        
        {/* ⭐ [에러 소멸] 구글 애드센스: Next.js Script 꼬리표 에러를 막기 위해 순수 HTML 태그 사용 */}
        <script 
          async 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3987387348804375" 
          crossOrigin="anonymous" 
        ></script>

        {/* 메인 콘텐츠 */}
        {children}
        <SpeedInsights />
        <Footer />

        {/* --- 네이버 애널리틱스 --- */}
        <NaverAnalytics />

        {/* ⭐구글 애널리틱스(GA4): 마우스 스크롤 등 유저 반응이 있을 때(lazyOnload) 로드하여 CPU 부하 최소화 */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="lazyOnload"
        />
        <Script id="google-analytics" strategy="lazyOnload">
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