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

// 4. 기사 저장/수정 통합 액션
export async function saveNews(formData: FormData) {
const isPinned = formData.get("isPinned") === "true"; // 문자열 "true" 체크
const idStr = formData.get("id") as string;
const title = formData.get("title") as string;
const category = formData.get("category") as string;
const importance = formData.get("importance") as string;
const summary = formData.get("summary") as string;
const content = formData.get("content") as string;
const thumbnailUrl = formData.get("thumbnailUrl") as string;
const reporterName = formData.get("reporterName") as string;
const reporterEmail = formData.get("reporterEmail") as string;
const tags = formData.get("tags") as string;

// 👇 [1. 여기 추가] 폼에서 날짜 문자열 가져오기
const publishedAtStr = formData.get("publishedAt") as string;

// 👇 [2. 여기 추가] 값이 있으면 Date 변환, 없으면 현재 시간(즉시 발행)
// 폼에서 값을 안 보내면 빈 문자열("")이 오므로, 이때는 new Date()가 됨
const publishedAt = publishedAtStr ? new Date(publishedAtStr) : new Date();

const finalImageUrl = thumbnailUrl || null;

// 저장할 데이터 객체
const dataToSave = {
title,
category,
importance,
summary,
content,
imageUrl: finalImageUrl,
reporterName,
reporterEmail,
tags,
// 👇 [3. 여기 추가] DB에 저장할 날짜 필드
publishedAt,

// 👇 [4. 여기 추가] 메인 고정 여부 (이게 빠져있어서 저장이 안 되었습니다)
isPinned, 
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

// (Create일 때 리다이렉트 처리)
revalidatePath("/");
revalidatePath(`/news/${category}`);
revalidatePath("/admin/news");
redirect("/admin/news");
}

// (Update일 때 리다이렉트 처리)
revalidatePath("/");
revalidatePath(`/news/${category}`); // 혹시 모르니 여기도 추가
revalidatePath("/admin/news");
redirect("/admin/news");
}

// 5. [수정됨] 모바일 뉴스 '더보기' 기능 (예약 발행 필터링 적용)
export async function getMoreNews(category: string, page: number) {
const pageSize = 20;

// 카테고리 디코딩
const decodedCategory = decodeURIComponent(category);

const now = new Date();
const kstNow = new Date(now.getTime() + (9 * 60 * 60 * 1000));

// ⭐ [핵심 수정] 어떤 경우든 '현재 시간보다 이전에 발행된(lte)' 글만 가져오기
const whereCondition = (category === "ALL")
? {
    publishedAt: { lte: kstNow } // 전체보기: 예약글 제외
    }
: {
    category: {
        contains: decodedCategory,
        mode: 'insensitive' as const,
    },

    publishedAt: { lte: kstNow }
    // publishedAt: { lte: new Date() } // 카테고리별 보기: 예약글 제외
    };

try {
const news = await prisma.news.findMany({
    where: whereCondition,
    // 👇 [정렬 변경] 작성일(createdAt) -> 발행일(publishedAt) 기준 내림차순
    orderBy: { publishedAt: "desc" }, 
    take: pageSize,
    skip: (page - 1) * pageSize,
    });

return news;
} catch (error) {
console.error("뉴스 더보기 로딩 실패:", error);
return [];
}
}