import { prisma } from "@/lib/prisma";
import CommentItem from "./CommentItem"; // 👈 방금 만든 컴포넌트 불러오기

export default async function CommentList({ newsId }: { newsId: number }) {
// DB에서 해당 기사의 댓글만 최신순으로 가져오기
const comments = await prisma.comment.findMany({
where: { newsId },
orderBy: { createdAt: "desc" }, 
});

return (
<div className="space-y-6">
    <div className="flex items-center gap-2 border-b border-gray-200 pb-3 mb-4">
    <h4 className="font-bold text-slate-900 text-xl">전체 댓글</h4>
    <span className="text-blue-600 font-bold text-xl">{comments.length}</span>
    </div>

    {comments.length === 0 ? (
    <div className="text-center py-10 bg-white border border-dashed border-gray-200 rounded-xl">
        <p className="text-gray-400">등록된 댓글이 없습니다. 첫 번째 댓글을 남겨주세요!</p>
    </div>
    ) : (
    <ul className="space-y-4">
        {comments.map((comment) => (
        // 👇 기존의 긴 li 태그 코드를 이거 한 줄로 교체합니다.
        <CommentItem key={comment.id} comment={comment} />
        ))}
    </ul>
    )}
</div>
);
}