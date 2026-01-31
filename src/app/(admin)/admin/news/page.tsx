import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { deleteImageAction } from "./write/actions"; 
import DeleteNewsButton from "./DeleteNewsButton"; 
import { format } from "date-fns"; // 🟢 날짜 포맷팅용 추가


export const dynamic = "force-dynamic";
// 🗑️ 삭제 기능 (이미지 + DB 동시 삭제) - [로직 유지]
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

// 📌 고정(Pin) 토글 기능 - [로직 유지]
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
    // 🟢 [수정됨] 작성일(createdAt)이 아니라 게시일(publishedAt) 기준으로 정렬해야 예약된 글이 관리하기 쉽습니다.
    orderBy: { publishedAt: "desc" },
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
            {/* 🟢 [수정됨] 작성일 -> 상태 및 게시일 */}
            <th className="px-6 py-4 text-center">상태 / 게시일</th>
            <th className="px-6 py-4 text-right">관리</th>
        </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
        {newsList.length > 0 ? (
            newsList.map((news) => {
            /// 1. 서버의 현재 시간을 가져옵니다.
                const now = new Date();
                
                // 2. 서버가 UTC 기준이라면 한국 시간(KST)으로 9시간을 더해줍니다.
                const kstNow = new Date(now.getTime() + (9 * 60 * 60 * 1000));

                // 3. 기사의 발행 시간과 '보정된 한국 현재 시간'을 비교합니다.
                const isReservation = new Date(news.publishedAt).getTime() > kstNow.getTime();
            return (
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
                        {news.isPinned ? "📌" : "★"}
                    </button>
                    </form>
                </td>

                <td className="px-6 py-4">
                    <div className="flex flex-col">
                    <Link 
                        href={`/admin/news/write?id=${news.id}`} 
                        className="font-bold text-slate-900 hover:text-blue-600 text-base block max-w-md truncate"
                    >
                        {news.title}
                    </Link>
                    <div className="flex gap-2 mt-1">
                        {news.importance === 'high' && (
                        <span className="text-[10px] text-red-600 font-bold bg-red-50 px-1.5 py-0.5 rounded inline-block">🔥 헤드라인</span>
                        )}
                        {/* 🟢 [추가됨] 예약 상태 뱃지 */}
                        {isReservation && (
                            <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded inline-block animate-pulse">⏳ 예약대기</span>
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
                    {(news.views || 0).toLocaleString()} {/* views -> viewCount 확인 필요 (보통 스키마에 따라 다름) */}
                </td>

                {/* 🟢 [수정됨] 게시일 표시 (예약이면 시간까지, 아니면 날짜만) */}
                <td className="px-6 py-4 text-center">
                <span className={`text-sm ${isReservation ? 'text-blue-600 font-bold' : 'text-slate-400 font-medium'}`}>
                        {format(new Date(news.publishedAt), "yyyy.MM.dd HH:mm")}
                    </span>
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
                    
                    {/* 삭제 버튼 컴포넌트 */}
                    <DeleteNewsButton id={Number(news.id)} deleteAction={deleteNews} />
                    
                    </div>
                </td>
                </tr>
            );
            })
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