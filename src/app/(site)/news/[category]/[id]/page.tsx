import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { NewsSidebar } from "@/components/news/NewsSidebar";
import CommentForm from "@/components/comment/CommentForm";
import CommentList from "@/components/comment/CommentList";

interface Props {
  params: Promise<{ category: string; id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const news = await prisma.news.findUnique({ where: { id: Number(id) } });
  if (!news) return {};
  
  return {
    title: news.title,
    description: news.summary || news.title,
    keywords: news.tags || "",
    openGraph: {
      title: news.title,
      description: news.summary || news.title,
      images: news.imageUrl ? [news.imageUrl] : [],
    },
  };
}

export default async function NewsDetailPage({ params }: Props) {
  const { id, category } = await params;
  const newsId = Number(id);

  if (isNaN(newsId)) return notFound();

  let news;
  try {
    const [updatedNews] = await prisma.$transaction([
      prisma.news.update({ where: { id: newsId }, data: { views: { increment: 1 } } }),
      prisma.newsView.create({ data: { newsId: newsId } }),
    ]);
    news = updatedNews;
  } catch (error) {
    return notFound();
  }

  // 관련 기사 가져오기
  const relatedNews = await prisma.news.findMany({
    where: { id: { not: newsId } },
    take: 15,
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, category: true },
  });

  const dateString = new Date(news.createdAt).toLocaleDateString("ko-KR", {
    year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
  });

  const safeContent = news.content.replace(/contenteditable/g, 'data-disabled');
  const tagsArray = news.tags ? news.tags.split(",").map(t => t.trim()) : [];
  const summaryLines = news.summary ? news.summary.split("\n") : [];

  return (
    <div className="bg-gray-50 min-h-screen pb-20 font-sans">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-16 py-12">
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* [왼쪽] 기사 본문 영역 */}
            <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                
                <header className="px-8 pt-10 pb-6 border-b border-gray-100">
                    <Link href={`/news/${category}`}>
                        <span className="inline-block text-blue-600 font-black text-sm mb-3 uppercase hover:underline cursor-pointer transition-colors">
                            {news.category || "NEWS"}
                        </span>
                    </Link>
                    
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight mb-6">
                        {news.title}
                    </h1>

                    {summaryLines.length > 0 && (
                        <div className="mb-8">
                            {summaryLines.map((line, idx) => (
                                <p key={idx} className="text-lg md:text-xl font-medium text-gray-700 leading-relaxed mb-1">
                                    {line}
                                </p>
                            ))}
                        </div>
                    )}

                    <div className="flex justify-between items-end text-gray-400 text-sm border-t border-gray-100 pt-4">
                        <span>{dateString}</span>
                    </div>
                </header>

                <article className="px-8 py-8">
                <div className="view-content max-w-3xl mx-auto text-gray-800 leading-8 text-lg" dangerouslySetInnerHTML={{ __html: safeContent }} />
                </article>

                <div className="px-8 mt-8 pb-10">
                    
                    {/* 1. 기자 정보 카드 */}
                    <div className="border-t border-b border-gray-200 py-6 flex justify-between items-center bg-gray-50/50 rounded-lg px-4 -mx-4 mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 text-2xl shadow-sm">
                                👤
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-gray-900">{news.reporterName || "이정혁 기자"}</h4>
                                <p className="text-sm text-gray-500">{news.reporterEmail || "indisnews1@gmail.com"}</p>
                            </div>
                        </div>
                    </div>

                    {/* 2. 태그 영역 */}
                    {tagsArray.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-10">
                            {tagsArray.map((tag, idx) => (
                                <span key={idx} className="bg-blue-50 text-blue-600 border border-blue-100 text-sm px-3 py-1.5 rounded-full font-bold">
                                    #{tag.replace(/^#/, '')}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* 3. 관련 기사 섹션 (선 제거됨) */}
                    <div className="mb-12 pt-4">
                        <h3 className="text-lg font-bold mb-4 text-slate-900">관련기사</h3>
                        <ul className="space-y-2"> 
                            {relatedNews.map((item) => (
                                <li key={item.id}>
                                    <Link 
                                        href={`/news/${item.category || 'general'}/${item.id}`} 
                                        className="block text-[15px] text-slate-700 hover:text-blue-600 hover:underline transition-colors truncate"
                                    >
                                        <span className="text-gray-300 mr-2 text-xs">└</span>
                                        {item.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* 4. 댓글 영역 */}
                    <div className="pt-10 border-t border-gray-200">
                        <CommentForm newsId={news.id} />
                        <div className="mt-8">
                            <CommentList newsId={news.id} />
                        </div>
                    </div>

                    {/* 5. 저작권 푸터 */}
                    <div className="mt-12 text-xs text-gray-400 font-medium border-t border-gray-100 pt-6">
                        저작권자 © 트렌드IT 무단전재 및 재배포, AI학습 및 활용 금지
                    </div>
                </div>
            </div>

            {/* [오른쪽] 사이드바 */}
            <aside className="lg:col-span-1">
                <NewsSidebar />
            </aside>

        </div>
      </div>

      <style>{`
          .view-content {
             font-family: -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Pretendard", "Malgun Gothic", sans-serif;
             font-size: 18px;
             line-height: 1.8;
             letter-spacing: -0.02em;
             color: #1f2937;
          }
          .news-image-container {
            display: table;
            width: fit-content;
            max-width: 100%;
            margin: 40px auto;
          }
          .news-image-container img {
            display: block;
            width: auto;
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          }
          .view-content p { margin-bottom: 1.5rem; }
          .view-content h1, .view-content h2, .view-content h3 {
             font-weight: 800; margin-top: 2.5em; margin-bottom: 1em; color: #111827;
          }
          .view-content blockquote {
             border-left: 4px solid #3b82f6;
             padding-left: 1rem;
             margin-left: 0;
             font-style: italic;
             color: #4b5563;
             background: #f9fafb;
             padding: 1rem;
             border-radius: 0 8px 8px 0;
          }
          .view-content a {
             color: #2563eb;
             text-decoration: underline;
             text-underline-offset: 4px;
          }
        `}</style>
    </div>
  );
}