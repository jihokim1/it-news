import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Footer from "@/components/layout/Footer";

// 1. 폰트 설정
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

// ⭐ [SEO 최적화 핵심] 메타데이터 설정
export const metadata: Metadata = {
  // 1. 사이트 도메인 (필수: 그래야 카톡 공유 시 이미지가 안 깨집니다)
  metadataBase: new URL("https://www.trendit.ai.kr"),

  // 2. 사이트 제목 (검색 결과에 노출되는 방식)
  title: {
    template: "%s | 트렌드IT", // 서브 페이지: "기사 제목 | 트렌드IT"
    default: "트렌드IT - 대한민국 No.1 테크 뉴스 & 앱 랭킹", // 메인 페이지 제목
  },

  // 3. 사이트 설명 (구글/네이버 검색 결과 아래 나오는 텍스트)
  description: "가장 빠른 IT 뉴스, 실시간 앱 랭킹, AI 및 테크 트렌드 분석을 제공합니다.",

  // 4. 키워드 (검색 로봇이 좋아하는 단어들)
  keywords: ["IT뉴스", "테크", "AI", "앱랭킹", "스타트업", "트렌드IT", "TrendIT"],

  // 5. 오픈 그래프 (카카오톡, 페이스북 공유 시 보이는 썸네일)
  openGraph: {
    title: "트렌드IT - 기술의 흐름을 읽다",
    description: "오늘의 IT 이슈와 실시간 앱 랭킹을 한눈에 확인하세요.",
    url: "https://www.trendit.ai.kr",
    siteName: "트렌드IT",
    locale: "ko_KR",
    type: "website",
    images: [
      {
        url: '/opengraph-image.png', // 👈 public 폴더에 있는 파일명
        width: 1200,
        height: 630,
        alt: "트렌드IT 미리보기",
      },
    ],
  },

  // 6. 파비콘 설정 (브라우저 탭 아이콘)
  icons: {
    icon: '/fabicon.ico',      // 👈 public 폴더의 파비콘
    apple: '/fabicon.ico',     // 아이폰 홈 화면 추가용
    shortcut: '/fabicon.ico',
  },

  // 7. 검색 로봇 수집 허용
  robots: {
    index: true,
    follow: true,
  },

  // 8. 소유권 확인 (나중에 구글 서치콘솔/네이버 웹마스터도구 코드 받으면 여기에 넣으세요)
  verification: {
    google: "구글-서치콘솔-코드-입력", 
    other: {
      "naver-site-verification": "네이버-웹마스터도구-코드-입력",
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
      {/* 폰트 변수를 body에 등록 */}
      <body className={`${inter.variable} ${playfair.variable} bg-[#F8F9FA] text-slate-900 antialiased font-sans`}>
        {children}

        {/* 푸터 추가 */}
        <Footer />

      </body>
    </html>
  );
}