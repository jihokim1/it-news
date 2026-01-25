import Link from "next/link";
import Image from "next/image";

export default function Footer() {
const currentYear = new Date().getFullYear();

return (
  <footer className="bg-slate-900 text-gray-400 text-sm mt-auto">
    
    {/* 1. 상단 메뉴바 */}
    <div className="border-b border-gray-800">
      <div className="container mx-auto px-4 max-w-screen-xl">
        <ul className="flex flex-wrap gap-x-6 gap-y-2 py-4 text-xs md:text-sm font-bold text-gray-300">
          <li><Link href="/about" className="hover:text-white transition-colors">매체소개</Link></li>
          <li><Link href="/ads" className="hover:text-white transition-colors">광고문의</Link></li>
          <li><Link href="/terms" className="hover:text-white transition-colors">이용약관</Link></li>
          <li><Link href="/privacy" className="hover:text-white transition-colors">개인정보처리방침</Link></li>
          <li><Link href="/youth" className="hover:text-white transition-colors">청소년보호정책</Link></li>
          <li><Link href="/email-refuse" className="hover:text-white transition-colors">이메일무단수집거부</Link></li>
          <li><Link href="/copyright" className="hover:text-white transition-colors">저작권보호정책</Link></li>
        </ul>
      </div>
    </div>

    {/* 2. 하단 정보 영역 */}
    <div className="container mx-auto px-4 py-8 max-w-screen-xl flex flex-col md:flex-row gap-8 items-start">
      
      {/* 로고 */}
      <div className="shrink-0">
          <h2 className="text-2xl font-black text-white tracking-tighter uppercase">TRENDIT</h2>
      </div>

      {/* 회사 정보 */}
      <div className="flex-1 space-y-2 text-xs md:text-[13px] leading-relaxed">
          <p>
              <span className="font-bold text-gray-300">제호:</span> 트렌드IT (TrendIT) <span className="mx-2 text-gray-700">|</span> 
              <span className="font-bold text-gray-300">발행인·편집인:</span> 김지호 <span className="mx-2 text-gray-700">|</span> 
              <span className="font-bold text-gray-300">청소년보호책임자:</span> 황선희
          </p>
          <p>
            <span className="font-bold text-gray-300">발행일:</span> 2026.01.01 <span className="mx-2 text-gray-700">|</span>
            <span className="font-bold text-gray-300">전화:</span> 070-8058-9573
              {/* <span className="font-bold text-gray-300">등록번호:</span> 서울 아 00000 <span className="mx-2 text-gray-700">|</span>
            <span className="font-bold text-gray-300">전화:</span> 070-8058-9573 */}
          </p>
          <p>
              <span className="font-bold text-gray-300">주소:</span> 서울특별시 용산구 새창로 124-9
          </p>
          
          {/* ⭐ [핵심 기능] 저작권 문구 수정 */}
          <p className="pt-4 text-gray-500">
              Copyright 
              {/* 여기에 비밀 링크를 걸었습니다.
                  © 심볼을 누르면 /admin-login 페이지로 이동합니다.
                  평소엔 티 안 나게 하되, 마우스 올리면 살짝 흰색으로 변하게 했습니다.
              */}
              <Link href="/admin-login" className="mx-1 hover:text-white transition-colors cursor-default md:cursor-pointer">
                ©
              </Link> 
              {currentYear} TRENDIT Corp. All rights reserved.
          </p>
          
          <p className="text-[10px] text-gray-600 mt-1">
              본 사이트의 기사는 저작권법의 보호를 받습니다. 무단 전재 및 복사, 배포 등을 금지합니다.
          </p>
      </div>

    </div>
  </footer>
);
}