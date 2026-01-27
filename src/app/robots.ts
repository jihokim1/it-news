import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
const baseUrl = "https://www.trendit.ai.kr";

return {
rules: {
    userAgent: "*", // 모든 로봇 허용
    allow: "/",
    disallow: ["/admin/", "/api/"], // 관리자 페이지 막음
},
sitemap: `${baseUrl}/sitemap.xml`, // 지도 위치 알려줌
};
}