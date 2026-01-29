"use client";

import Script from "next/script";

export default function NaverAnalytics() {
return (
<>
    <Script
    src="//wcs.pstatic.net/wcslog.js"
    strategy="afterInteractive"
    onLoad={() => {
        // 스크립트 로드가 끝나면 자동으로 실행됩니다.
        // @ts-ignore
        if (!window.wcs_add) window.wcs_add = {};
        // @ts-ignore
        window.wcs_add["wa"] = "169655d31a7a3d0";
        // @ts-ignore
        if (window.wcs) {
        // @ts-ignore
        window.wcs_do();
        }
    }}
    />
</>
);
}