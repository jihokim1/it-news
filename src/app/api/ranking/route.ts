import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { platform, items, secretKey } = body;

    // 1. 보안 검사
    if (secretKey !== "my-secret-password-1234") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. 데이터 유효성 검사
    if (!platform || !items || !Array.isArray(items)) {
      return NextResponse.json({ error: "Invalid Data" }, { status: 400 });
    }

    // ⭐ [추가] 들어온 플랫폼 이름을 무조건 '소문자'로 변환 (Google -> google)
    // 공백도 제거(.trim())해서 실수를 방지합니다.
    const cleanPlatform = platform.toLowerCase().trim(); 

    // 3. 트랜잭션
    await prisma.$transaction(async (tx) => {
      // (1) 기존 랭킹 삭제 (소문자로 변환된 이름 사용)
      await tx.appRanking.deleteMany({
        where: { platform: cleanPlatform }, 
      });

      // (2) 새 데이터 등록
      await tx.appRanking.createMany({
        data: items.map((item: any) => ({
          platform: cleanPlatform,
          rank: item.rank,
          title: item.title,
          publisher: item.publisher,
          iconUrl: item.iconUrl || "",
          link: item.link || "",
          category: item.category || "기타", // 👈 [추가] 카테고리 저장
        })),
      });
    });

    // 4. 캐시 날리기
    revalidatePath("/ranking");

    return NextResponse.json({ success: true, count: items.length, platform: cleanPlatform });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}