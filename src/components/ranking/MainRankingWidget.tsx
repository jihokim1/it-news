import { prisma } from "@/lib/prisma";
import RankingWidgetClient from "./RankingWidgetClient";

export async function MainRankingWidget() {
  // 1. 구글 데이터 (카테고리가 '전체'인 것 중에서 TOP 5)
  const googleData = await prisma.appRanking.findMany({
    where: { 
        platform: "google",
        category: { contains: "게임" } // 👈 이 필터가 핵심!
    },
    orderBy: { rank: "asc" },
    take: 5,
  });

  // 2. 애플 데이터 (카테고리가 '전체'인 것 중에서 TOP 5)
  const appleData = await prisma.appRanking.findMany({
    where: { 
        platform: "apple",
        category: { contains: "전체" } // 👈 여기도 추가
    },
    orderBy: { rank: "asc" },
    take: 5,
  });

  return (
    <RankingWidgetClient 
        googleData={googleData} 
        appleData={appleData} 
    />
  );
}