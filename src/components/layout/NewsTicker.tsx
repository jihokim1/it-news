'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronUp } from "lucide-react";

interface NewsItem {
id: number;
title: string;
category: string | null;
// [수정] 날짜가 들어와도 에러 안 나게 처리 (사용은 안 하더라도 타입은 맞춰줌)
publishedAt?: string | Date; 
}

export default function NewsTicker({ headlines }: { headlines: NewsItem[] }) {
const [index, setIndex] = useState(0);
const [isVisible, setIsVisible] = useState(true);

// 4초마다 롤링
useEffect(() => {
  if (headlines.length > 1) {
    const timer = setInterval(() => {
      setIsVisible(false); // 흐려짐
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % headlines.length); // 다음 글
        setIsVisible(true); // 나타남
      }, 300); 
    }, 4000); 
    return () => clearInterval(timer);
  }
}, [headlines.length]);

if (!headlines || headlines.length === 0) return null;

const currentNews = headlines[index];

return (
  <div className="bg-slate-800 border-b border-slate-700 h-10 text-white overflow-hidden relative">
    <div className="container mx-auto px-4 h-full flex items-center justify-center max-w-screen-xl text-xs sm:text-sm">
      
      {/* 라벨 & 빨간 점 */}
      <span className="text-blue-400 font-bold tracking-widest mr-4 shrink-0 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
        HEADLINE
      </span>

      {/* 기사 제목 */}
      <div className="flex-1 min-w-0 flex items-center justify-center sm:justify-start">
        <Link 
          href={`/news/${currentNews.category || 'general'}/${currentNews.id}`}
          className={`truncate hover:text-blue-300 transition-all duration-300 transform ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
        >
          {currentNews.title}
        </Link>
      </div>

      {/* 컨트롤러 */}
      <div className="hidden sm:flex items-center gap-3 text-slate-400 text-[10px] font-mono ml-4">
          <div className="flex items-center gap-1">
              <span className="text-white">{index + 1}</span>
              <span className="text-slate-600">/</span>
              <span>{headlines.length}</span>
          </div>
          <button onClick={() => setIndex((prev) => (prev + 1) % headlines.length)} className="hover:text-white p-1">
              <ChevronUp size={12} />
          </button>
      </div>
    </div>
  </div>
);
}