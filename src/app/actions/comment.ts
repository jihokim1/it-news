'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createComment(formData: FormData) {
const newsIdStr = formData.get("newsId") as string;
const nickname = formData.get("nickname") as string;
const password = formData.get("password") as string;
const content = formData.get("content") as string;

// 유효성 검사
if (!newsIdStr || !nickname || !password || !content) {
return;
}

try {
await prisma.comment.create({
    data: {
    newsId: parseInt(newsIdStr),
    nickname,
    password,
    content,
    },
});

// 댓글 작성 후 해당 뉴스 페이지 갱신
revalidatePath(`/news/[category]/[id]`, "page"); 
} catch (error) {
console.error("댓글 작성 에러:", error);
}
}

export async function deleteComment(commentId: string, password: string) {
// 1. 댓글 찾기
const comment = await prisma.comment.findUnique({
where: { id: commentId },
});

if (!comment) {
return { success: false, error: "존재하지 않는 댓글입니다." };
}

// 2. 권한 확인 (사용자 비밀번호 OR 관리자 마스터 비밀번호)
// .env 파일에서 설정한 ADMIN_PASSWORD를 가져옵니다.
const adminMasterKey = process.env.ADMIN_PASSWORD;

// 입력한 비번이 '댓글 비번'과도 다르고, '관리자 키'와도 다르면 거부
if (comment.password !== password && password !== adminMasterKey) {
return { success: false, error: "비밀번호가 일치하지 않습니다." };
}

// 3. 삭제
try {
await prisma.comment.delete({
    where: { id: commentId },
});

// 4. 화면 갱신
revalidatePath("/news/[category]/[id]", "page");
return { success: true };

} catch (error) {
console.error("댓글 삭제 에러:", error);
return { success: false, error: "삭제 중 오류가 발생했습니다." };
}
}