"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Supabase 클라이언트
const supabase = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 1. [필수 추가] 클라이언트에서 수정할 데이터 불러오기
export async function getNewsById(id: number) {
const news = await prisma.news.findUnique({
where: { id },
});
return news;
}

// 2. 이미지 삭제 액션
export async function deleteImageAction(imageUrl: string) {
try {
const urlObj = new URL(imageUrl);
const pathParts = urlObj.pathname.split("/news-images/");

if (pathParts.length < 2) {
    return { success: false, error: "경로 분석 실패" };
}

const fileName = decodeURIComponent(pathParts[1]);

const { error } = await supabase
    .storage
    .from("news-images")
    .remove([fileName]);

if (error) {
    return { success: false, error: error.message };
}

return { success: true };
} catch (error) {
console.error("서버 오류:", error);
return { success: false, error: "서버 오류 발생" };
}
}

// 3. 이미지 업로드 액션 (에디터용)
export async function uploadImageAction(formData: FormData) {
const file = formData.get("file") as File;
if (!file) throw new Error("파일 없음");

const fileExt = file.name.split(".").pop();
const fileName = `editor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

const { error } = await supabase.storage
.from("news-images")
.upload(fileName, Buffer.from(await file.arrayBuffer()), {
    contentType: file.type,
    upsert: false,
});

if (error) throw new Error(error.message);

const { data } = supabase.storage.from("news-images").getPublicUrl(fileName);
return data.publicUrl;
}

// 4. 기사 저장/수정 통합 액션 (기자 정보 & 태그 추가됨)
export async function saveNews(formData: FormData) {
const idStr = formData.get("id") as string;
const title = formData.get("title") as string;
const category = formData.get("category") as string;
const importance = formData.get("importance") as string;
const summary = formData.get("summary") as string;
const content = formData.get("content") as string;
const thumbnailUrl = formData.get("thumbnailUrl") as string;

// 👇 [추가된 부분] 폼에서 넘어온 기자 정보와 태그 수신
const reporterName = formData.get("reporterName") as string;
const reporterEmail = formData.get("reporterEmail") as string;
const tags = formData.get("tags") as string;

const finalImageUrl = thumbnailUrl || null;

// 저장할 데이터 객체 미리 만들기
const dataToSave = {
title,
category,
importance, 
summary,
content,
imageUrl: finalImageUrl,
// DB 필드에 매핑
reporterName,
reporterEmail,
tags
};

if (idStr) {
// 수정 (Update)
await prisma.news.update({
    where: { id: Number(idStr) },
    data: dataToSave,
});
} else {
// 신규 (Create)
await prisma.news.create({
    data: {
    ...dataToSave,
    views: 0,
    },
});
// 메인 페이지 캐시를 즉시 무효화하여 새로운 기사가 보이게 합니다.
revalidatePath("/"); 
// 해당 카테고리 목록 페이지도 갱신합니다.
revalidatePath(`/news/${category}`);
// 관리자 목록 페이지를 갱신합니다.
revalidatePath("/admin/news");

// 페이지 이동
redirect("/admin/news");

}

revalidatePath("/admin/news");
redirect("/admin/news");
}

// 5. [추가] 모바일 뉴스 '더보기' 기능 (PC/모바일 공용 데이터 조회)
export async function getMoreNews(category: string, page: number) {
    const pageSize = 20; 
    
// 카테고리 디코딩
const decodedCategory = decodeURIComponent(category);

// ⭐ [핵심 수정] 카테고리가 'ALL'이면 조건 없이({}) 검색, 아니면 필터링
const whereCondition = (category === "ALL") 
    ? {} 
    : {
        category: {
        contains: decodedCategory,
        mode: 'insensitive' as const,
        },
    };

try {
    const news = await prisma.news.findMany({
    where: whereCondition,
    orderBy: { createdAt: "desc" },
    take: pageSize,
    skip: (page - 1) * pageSize,
    });

    return news;
} catch (error) {
    console.error("뉴스 더보기 로딩 실패:", error);
    return [];
}
}
