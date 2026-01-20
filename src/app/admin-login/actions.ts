"use server"; // ★ 중요: 이 코드는 서버에서만 실행됩니다.

import { cookies } from "next/headers";

// [수정] 이제 코드가 아니라 .env 파일에서 비밀번호를 몰래 가져옵니다.
// 만약 .env에 없으면 임시로 "1234"를 씁니다.
const SECRET_PASSWORD = process.env.ADMIN_PASSWORD || "1234"; 

export async function setAdminSession(password: string) {
// 1. 비밀번호가 맞는지 확인
if (password === SECRET_PASSWORD) {

// 2. 맞으면 'admin_session'이라는 쿠키(입장권)를 구워줌
// (await cookies()) -> Next.js 15에서는 await 필수
const cookieStore = await cookies();

cookieStore.set("admin_session", "true", {
    httpOnly: true, // 자바스크립트로 탈취 불가능하게 설정
    secure: process.env.NODE_ENV === "production", // https에서만 작동
    maxAge: 60 * 60 * 24, // 24시간 동안 유효
    path: "/", // 사이트 전체에서 유효
});

return true; // 성공
}

return false; // 실패
}

// 로그아웃 기능
export async function deleteAdminSession() {
const cookieStore = await cookies();
cookieStore.delete("admin_session");
}