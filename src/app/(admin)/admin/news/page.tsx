import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { deleteImageAction } from "./write/actions"; 
// 👇 [1. 추가] 방금 만든 삭제 버튼 컴포넌트 가져오기
import DeleteNewsButton from "./DeleteNewsButton"; 

// 🗑️ 삭제 기능 (이미지 + DB 동시 삭제)
async function deleteNews(formData: FormData) {
"use server";
const id = Number(formData.get("id"));

// 1. 삭제하기 전에 기사 정보를 먼저 조회 (이미지 URL 확인용)
const news = await prisma.news.findUnique({
where: { id },
select: { imageUrl: true }, 
});

// 2. 이미지가 있다면 스토리지에서 삭제
if (news?.imageUrl) {
await deleteImageAction(news.imageUrl);
}

// 3. DB 데이터 삭제
await prisma.news.delete({ where: { id } });

revalidatePath("/admin/news");
}

// 📌 고정(Pin) 토글 기능
async function togglePin(formData: FormData) {
"use server";
const id = Number(formData.get("id"));
const currentStatus = formData.get("currentStatus") === "true"; 

await prisma.news.update({
where: { id },
data: { isPinned: !currentStatus }, 
});
revalidatePath("/admin/news");
}

interface Props {
searchParams: Promise<{ page?: string }>;
}

export default async function NewsManagePage({ searchParams }: Props) {
const params = await searchParams;
const currentPage = Number(params.page) || 1;
const pageSize = 10;

const [totalCount, newsList] = await Promise.all([
prisma.news.count(),
prisma.news.findMany({
    orderBy: { createdAt: "desc" },
    take: pageSize,
    skip: (currentPage - 1) * pageSize,
}),
]);

const totalPages = Math.ceil(totalCount / pageSize);
const hasPrev = currentPage > 1;
const hasNext = currentPage < totalPages;

return (
<div className="space-y-6 pb-10">
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
    <div>
        <h1 className="text-2xl font-black text-slate-900">뉴스 기사 관리</h1>
        <p className="text-slate-500 text-sm mt-1">총 {totalCount.toLocaleString()}개의 기사가 등록되어 있습니다.</p>
    </div>
    <Link 
        href="/admin/news/write" 
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-lg shadow-blue-200"
    >
        + 새 기사 작성하기
    </Link>
    </div>

    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden overflow-x-auto">
    <table className="w-full text-sm text-left min-w-[1000px]">
        <thead className="bg-gray-50 text-slate-500 font-bold uppercase text-xs">
        <tr>
            <th className="px-6 py-4 w-[60px] text-center">고정</th>
            <th className="px-6 py-4">제목</th>
            <th className="px-6 py-4 text-center">카테고리</th>
            <th className="px-6 py-4 text-center">조회수</th>
            <th className="px-6 py-4 text-center">작성일</th>
            <th className="px-6 py-4 text-right">관리</th>
        </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
        {newsList.length > 0 ? (
            newsList.map((news) => (
            <tr key={news.id} className={`transition-colors ${news.isPinned ? 'bg-purple-50/50' : 'hover:bg-gray-50'}`}>
                
                {/* 핀 고정 버튼 */}
                <td className="px-6 py-4 text-center">
                <form action={togglePin}>
                    <input type="hidden" name="id" value={news.id} />
                    <input type="hidden" name="currentStatus" value={news.isPinned ? "true" : "false"} />
                    <button 
                        type="submit"
                        title={news.isPinned ? "고정 해제하기" : "상단에 고정하기"}
                        className={`p-2 rounded-full transition-all hover:scale-110 ${
                            news.isPinned 
                            ? "bg-purple-100 text-purple-600 shadow-sm" 
                            : "text-gray-300 hover:bg-gray-100 hover:text-gray-500"
                        }`}
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    </button>
                </form>
                </td>

                <td className="px-6 py-4">
                <div className="flex flex-col">
                    <Link 
                    href={`/news/${news.category || 'ai'}/${news.id}`} 
                    target="_blank"
                    className="font-bold text-slate-900 hover:text-blue-600 text-base block max-w-md truncate"
                    >
                    {news.title}
                    </Link>
                    <div className="flex gap-2 mt-1">
                        {news.importance === 'high' && (
                            <span className="text-[10px] text-red-600 font-bold bg-red-50 px-1.5 py-0.5 rounded inline-block">🔥 헤드라인</span>
                        )}
                        {news.isPinned && (
                            <span className="text-[10px] text-purple-600 font-bold bg-purple-50 px-1.5 py-0.5 rounded inline-block">📌 메인고정됨</span>
                        )}
                    </div>
                </div>
                </td>
                <td className="px-6 py-4 text-center">
                <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold uppercase">
                    {news.category || "-"}
                </span>
                </td>
                <td className="px-6 py-4 text-center font-bold text-slate-600">
                {(news.views || 0).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-center text-slate-400">
                {new Date(news.createdAt).toLocaleDateString()}
                </td>
                
                {/* 관리 버튼 영역 */}
                <td className="px-6 py-4 text-right">
                <div className="flex justify-end items-center gap-2">
                    <Link 
                    href={`/admin/news/write?id=${news.id}`} 
                    className="bg-white border border-gray-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600 px-3 py-1.5 rounded-lg font-bold text-xs transition-colors"
                    >
                    수정
                    </Link>
                    
                    {/* 👇 [2. 변경됨] 기존 폼 대신 새로 만든 버튼 컴포넌트 사용 */}
                    <DeleteNewsButton id={Number(news.id)} deleteAction={deleteNews} />
                    
                </div>
                </td>
            </tr>
            ))
        ) : (
            <tr>
            <td colSpan={6} className="py-20 text-center text-gray-400">
                등록된 기사가 없습니다.
            </td>
            </tr>
        )}
        </tbody>
    </table>
    </div>

    {/* 페이지네이션 */}
    {totalPages > 1 && (
    <div className="flex justify-center items-center gap-4 pt-4">
        <Link
        href={`/admin/news?page=${currentPage - 1}`}
        className={`px-4 py-2 rounded-lg font-bold text-sm border ${
            !hasPrev 
            ? "bg-gray-100 text-gray-400 pointer-events-none border-transparent" 
            : "bg-white text-slate-600 hover:bg-slate-50 border-gray-200"
        }`}
        >
        ← 이전
        </Link>

        <span className="text-sm font-bold text-slate-600">
        {currentPage} / {totalPages} 페이지
        </span>

        <Link
        href={`/admin/news?page=${currentPage + 1}`}
        className={`px-4 py-2 rounded-lg font-bold text-sm border ${
            !hasNext 
            ? "bg-gray-100 text-gray-400 pointer-events-none border-transparent" 
            : "bg-white text-slate-600 hover:bg-slate-50 border-gray-200"
        }`}
        >
        다음 →
        </Link>
    </div>
    )}
</div>
);
}