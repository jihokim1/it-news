"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setAdminSession } from "./actions"; // (3단계에서 만들 파일)

export default function AdminLoginPage() {
const [password, setPassword] = useState("");
const [error, setError] = useState("");
const router = useRouter();

const handleLogin = async (e: React.FormEvent) => {
e.preventDefault();
setError("");

// 서버 액션(로그인 처리) 호출
const success = await setAdminSession(password);

if (success) {
    router.push("/admin"); // 성공하면 대시보드로 이동
} else {
    setError("비밀번호가 틀렸습니다. 다시 시도하세요.");
}
};

return (
<div className="min-h-screen flex items-center justify-center bg-[#111111]">
    <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
    <div className="text-center mb-8">
        <h1 className="text-2xl font-black text-slate-900">TO.ADMIN</h1>
        <p className="text-slate-500 text-sm">관리자 전용 로그인</p>
    </div>

    <form onSubmit={handleLogin} className="space-y-6">
        <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">
            비밀번호
        </label>
        <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            placeholder="비밀번호를 입력하세요"
        />
        </div>

        {error && (
        <p className="text-red-500 text-xs font-bold text-center">{error}</p>
        )}

        <button
        type="submit"
        className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg hover:bg-slate-800 transition-colors"
        >
        접속하기
        </button>
    </form>
    </div>
</div>
);
}