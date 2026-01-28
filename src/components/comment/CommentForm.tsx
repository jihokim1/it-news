'use client';

// 👇 경로 주의: 아까 만든 서버 액션 파일 경로와 일치해야 합니다.
import { createComment } from "@/app/actions/comment"; 
import { useRef } from "react";

// 👇 [핵심] 반드시 'export default'가 있어야 합니다.
export default function CommentForm({ newsId }: { newsId: number }) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-10">
      <h4 className="font-bold text-slate-900 mb-4 text-lg">
        댓글 쓰기 <span className="text-sm text-gray-500 font-normal ml-2">비회원도 작성 가능 (익명)</span>
      </h4>
      
      <form 
        ref={formRef}
        action={async (formData) => {
          await createComment(formData);
          formRef.current?.reset();
          alert("댓글이 등록되었습니다."); 
        }} 
        className="space-y-3"
      >
        <input type="hidden" name="newsId" value={newsId} />
        
        {/* 닉네임 & 비밀번호 */}
        <div className="flex gap-3">
          <input
            name="nickname"
            type="text"
            placeholder="닉네임"
            required
            className="w-1/3 p-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
          />
          <input
            name="password"
            type="password"
            placeholder="비밀번호"
            required
            className="w-1/3 p-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
          />
        </div>

        {/* 본문 */}
        <div className="flex gap-3">
          <textarea
            name="content"
            placeholder="내용을 입력하세요."
            required
            rows={3}
            className="w-full p-3 text-sm border border-gray-300 rounded-lg resize-none focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
          ></textarea>
          <button 
            type="submit" 
            className="bg-slate-900 text-white font-bold px-6 rounded-lg hover:bg-slate-800 transition-colors shrink-0"
          >
            등록
          </button>
        </div>
      </form>
    </div>
  );
}