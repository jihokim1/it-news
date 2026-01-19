'use client';

import { useState } from "react";
import { deleteComment } from "@/app/actions/comment";
import { X, Trash2 } from "lucide-react"; // 아이콘

interface CommentProps {
comment: {
id: string;
nickname: string;
content: string;
createdAt: Date;
};
}

export default function CommentItem({ comment }: CommentProps) {
const [isDeleting, setIsDeleting] = useState(false); // 삭제 모드 토글
const [password, setPassword] = useState("");

const handleDelete = async () => {
if (!password) return alert("비밀번호를 입력해주세요.");

// 확인 창
if (!confirm("정말 삭제하시겠습니까?")) return;

const result = await deleteComment(comment.id, password);

if (result.success) {
    alert("삭제되었습니다.");
    setIsDeleting(false);
} else {
    alert(result.error); // "비밀번호가 틀렸습니다" 등
}
};

// 날짜 포맷
const dateStr = new Date(comment.createdAt).toLocaleString('ko-KR', {
month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false
});

return (
<li className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm transition-all hover:border-gray-300 group">
    <div className="flex justify-between items-start mb-2">
    <div className="flex items-center gap-2">
        <span className="font-bold text-slate-900 text-sm">
        {comment.nickname}
        </span>
        <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
        익명
        </span>
    </div>
    
    <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400 font-mono">
        {dateStr}
        </span>
        {/* 삭제 버튼 (X 아이콘) */}
        <button 
        onClick={() => setIsDeleting(!isDeleting)}
        className="text-gray-300 hover:text-red-500 transition-colors p-1"
        title="댓글 삭제"
        >
        <X size={14} />
        </button>
    </div>
    </div>

    <p className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">
    {comment.content}
    </p>

    {/* 👇 삭제 비밀번호 입력창 (버튼 눌렀을 때만 나옴) */}
    {isDeleting && (
    <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-red-100 flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
        <span className="text-xs font-bold text-red-500 shrink-0">삭제하기:</span>
        <input
        type="password"
        placeholder="비밀번호"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="flex-1 min-w-0 text-xs p-2 border border-gray-300 rounded focus:outline-none focus:border-red-500"
        />
        <button
        onClick={handleDelete}
        className="bg-red-500 text-white text-xs font-bold px-3 py-2 rounded hover:bg-red-600 shrink-0"
        >
        확인
        </button>
        <button
        onClick={() => setIsDeleting(false)}
        className="text-gray-500 text-xs font-bold px-2 py-2 hover:text-gray-700 shrink-0"
        >
        취소
        </button>
    </div>
    )}
</li>
);
}