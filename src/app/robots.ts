import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
const baseUrl = "https://www.trendit.ai.kr";

return {
rules: {
    userAgent: "*", // 모든 로봇 허용
    allow: "/",
    disallow: ["/admin/", "/api/"], 
},
sitemap: `${baseUrl}/sitemap.xml`, // 지도 위치 알려줌
};
}