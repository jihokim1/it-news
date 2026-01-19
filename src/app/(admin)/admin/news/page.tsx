import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { revalidatePath } from "next/cache";

// 삭제 기능
async function deleteNews(formData: FormData) {
"use server";
const id = Number(formData.get("id"));
await prisma.news.delete({ where: { id } });
revalidatePath("/admin/news");
}

interface Props {
// Next.js 15: searchParams는 Promise입니다.
searchParams: Promise<{ page?: string }>;
}

export default async function NewsManagePage({ searchParams }: Props) {
// 1. 현재 페이지 번호 계산 (기본값 1)
const params = await searchParams;
const currentPage = Number(params.page) || 1;
const pageSize = 10; // 한 페이지당 20개

// 2. 데이터 가져오기 (총 개수 + 현재 페이지 데이터)
const [totalCount, newsList] = await Promise.all([
prisma.news.count(),
prisma.news.findMany({
    orderBy: { createdAt: "desc" },
    take: pageSize,                  // 20개만 가져오기
    skip: (currentPage - 1) * pageSize, // 앞쪽 데이터 건너뛰기
}),
]);

// 페이지 계산
const totalPages = Math.ceil(totalCount / pageSize);
const hasPrev = currentPage > 1;
const hasNext = currentPage < totalPages;

return (
<div className="space-y-6 pb-10">
    <div className="flex justify-between items-center">
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

    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
    <table className="w-full text-sm text-left">
        <thead className="bg-gray-50 text-slate-500 font-bold uppercase text-xs">
        <tr>
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
            <tr key={news.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                <Link 
                    href={`/news/${news.category || 'ai'}/${news.id}`} 
                    target="_blank"
                    className="font-bold text-slate-900 hover:text-blue-600 text-base block max-w-md truncate"
                >
                    {news.title}
                </Link>
                {news.importance === 'high' && (
                    <span className="text-[10px] text-red-600 font-bold bg-red-50 px-1.5 py-0.5 rounded mt-1 inline-block">🔥 헤드라인</span>
                )}
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
                <td className="px-6 py-4 text-right">
                <div className="flex justify-end items-center gap-2">
                    <Link 
                    href={`/admin/news/write?id=${news.id}`} 
                    className="bg-white border border-gray-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600 px-3 py-1.5 rounded-lg font-bold text-xs transition-colors"
                    >
                    수정
                    </Link>
                    
                    <form action={deleteNews}>
                    <input type="hidden" name="id" value={news.id} />
                    <button className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg font-bold text-xs transition-colors">
                        삭제
                    </button>
                    </form>
                </div>
                </td>
            </tr>
            ))
        ) : (
            <tr>
            <td colSpan={5} className="py-20 text-center text-gray-400">
                등록된 기사가 없습니다.
            </td>
            </tr>
        )}
        </tbody>
    </table>
    </div>

    {/* 👇 [핵심] 페이지네이션 컨트롤 */}
    {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 pt-4">
        {/* 이전 버튼 */}
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

        {/* 다음 버튼 */}
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