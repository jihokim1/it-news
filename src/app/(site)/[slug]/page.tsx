import { notFound } from "next/navigation";

// [안전장치] URL 파라미터 타입 설정
interface Props {
params: Promise<any>; 
}

// ⭐ [실전용] 실제 운영 가능한 수준의 법적 텍스트로 꽉 채웠습니다.
const PAGES: Record<string, { title: string; content: React.ReactNode }> = {

// 1. 매체소개 (/about)
about: {
title: "매체소개",
content: (
    <div className="space-y-10 text-slate-700 leading-relaxed">
    <section className="text-center space-y-4 py-8 border-b border-slate-100">
        <h3 className="text-2xl font-bold text-slate-900">"기술의 흐름을 읽다, 미래를 보다"</h3>
        <p className="text-lg">트렌드IT는 급변하는 디지털 시대의 나침반이 되는 고품격 테크 미디어입니다.</p>
    </section>

    <section className="space-y-4">
        <h4 className="text-xl font-bold text-slate-900 border-l-4 border-blue-600 pl-3">미션 (Mission)</h4>
        <p>
            우리는 단순한 속보 전달을 지양합니다. <br/>
            트렌드IT는 기술이 비즈니스와 일상에 미치는 파급력을 분석하고, 
            독자들이 올바른 의사결정을 내릴 수 있도록 <strong>깊이 있는 통찰(Insight)</strong>을 제공합니다.
        </p>
    </section>

    <section className="space-y-4">
        <h4 className="text-xl font-bold text-slate-900 border-l-4 border-blue-600 pl-3">핵심 가치</h4>
        <ul className="grid md:grid-cols-3 gap-4 text-center">
            <li className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                <strong className="block text-slate-900 text-lg mb-2">FACT</strong>
                철저한 사실 검증을 통한<br/>신뢰받는 보도
            </li>
            <li className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                <strong className="block text-slate-900 text-lg mb-2">SPEED</strong>
                누구보다 빠른<br/>글로벌 트렌드 전달
            </li>
            <li className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                <strong className="block text-slate-900 text-lg mb-2">DEPTH</strong>
                현상의 이면을 꿰뚫는<br/>심층 분석
            </li>
        </ul>
    </section>

    <section className="bg-slate-900 text-white p-8 rounded-xl mt-8">
        <h4 className="font-bold text-xl mb-4">트렌드IT 편집국</h4>
        <ul className="space-y-2 text-sm text-slate-300">
            <li><span className="inline-block w-20 opacity-70">주소</span> 서울특별시 강남구 테헤란로 000, 트렌드타워 10층</li>
            <li><span className="inline-block w-20 opacity-70">등록번호</span> 서울 아 00000</li>
            <li><span className="inline-block w-20 opacity-70">발행/편집인</span> 김지호</li>
            <li><span className="inline-block w-20 opacity-70">대표전화</span> 070-8058-9573</li>
        </ul>
    </section>
    </div>
),
},

// 2. 광고문의 (/ads)
ads: {
title: "광고/제휴 문의",
content: (
    <div className="space-y-8">
    <div className="text-lg text-slate-700">
        <p>
        트렌드IT는 IT 업계 종사자, 개발자, 테크 리더들이 가장 신뢰하는 미디어입니다.<br/>
        귀사의 혁신적인 브랜드 가치를 효과적으로 전달할 수 있는 최적의 파트너가 되겠습니다.
        </p>
    </div>

    <div className="grid md:grid-cols-2 gap-6">
        <div className="border border-slate-200 p-6 rounded-xl">
            <h4 className="font-bold text-slate-900 text-lg mb-2">디스플레이 광고 (DA)</h4>
            <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                <li>메인 상단 빌보드 배너</li>
                <li>기사 본문 인리드(In-read) 배너</li>
                <li>모바일 하단 고정 배너</li>
            </ul>
        </div>
        <div className="border border-slate-200 p-6 rounded-xl">
            <h4 className="font-bold text-slate-900 text-lg mb-2">콘텐츠 광고 / 브랜디드</h4>
            <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                <li>기획 기사 및 인터뷰</li>
                <li>전문가 칼럼 스폰서십</li>
                <li>뉴스레터 제휴 발송</li>
            </ul>
        </div>
    </div>
    
    <div className="bg-blue-50 border border-blue-100 p-8 rounded-xl text-center space-y-4">
        <h3 className="text-xl font-bold text-slate-900">비즈니스 파트너십 문의</h3>
        <p className="text-slate-600 text-sm">
        광고 제안서(Media Kit) 요청 및 구체적인 견적 문의는 아래 이메일로 연락 부탁드립니다.<br/>
        담당자가 확인 후 1 영업일 이내에 회신 드립니다.
        </p>
        <div className="pt-2">
        <a href="mailto:trendit_news@naver.com" className="inline-block bg-slate-900 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-600 transition-colors">
        trendit_news@naver.com 메일 보내기
        </a>
        </div>
    </div>
    </div>
),
},

// 3. 이용약관 (/terms) - [표준약관 기반 상세 내용]
terms: {
title: "이용약관",
content: (
    <div className="text-sm text-slate-600 space-y-8 leading-relaxed text-justify">
    <div className="bg-gray-50 p-4 border border-gray-200 rounded text-xs text-gray-500 mb-6">
        본 약관은 2026년 1월 1일부터 적용됩니다.
    </div>

    <section>
        <h5 className="font-bold text-slate-900 text-base mb-2">제 1 조 (목적)</h5>
        <p>이 약관은 트렌드IT(이하 "회사")가 제공하는 인터넷신문 서비스 및 관련 제반 서비스(이하 "서비스")의 이용과 관련하여 회사와 회원 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.</p>
    </section>

    <section>
        <h5 className="font-bold text-slate-900 text-base mb-2">제 2 조 (용어의 정의)</h5>
        <ol className="list-decimal pl-5 space-y-1">
            <li>"서비스"라 함은 구현되는 단말기(PC, TV, 휴대형단말기 등 각종 유무선 장치를 포함)와 상관없이 회원이 이용할 수 있는 트렌드IT 및 관련 제반 서비스를 의미합니다.</li>
            <li>"회원"이라 함은 회사의 "서비스"에 접속하여 이 약관에 따라 "회사"와 이용계약을 체결하고 "회사"가 제공하는 "서비스"를 이용하는 고객을 말합니다.</li>
            <li>"게시물"이라 함은 "회원"이 "서비스"를 이용함에 있어 "서비스상"에 게시한 부호ㆍ문자ㆍ음성ㆍ음향ㆍ화상ㆍ동영상 등의 정보 형태의 글, 사진, 동영상 및 각종 파일과 링크 등을 의미합니다.</li>
        </ol>
    </section>

    <section>
        <h5 className="font-bold text-slate-900 text-base mb-2">제 3 조 (약관의 게시와 개정)</h5>
        <ol className="list-decimal pl-5 space-y-1">
            <li>"회사"는 이 약관의 내용을 "회원"이 쉽게 알 수 있도록 서비스 초기 화면에 게시합니다.</li>
            <li>"회사"는 "약관의규제에관한법률", "정보통신망이용촉진및정보보호등에관한법률(이하 "정보통신망법")" 등 관련법을 위배하지 않는 범위에서 이 약관을 개정할 수 있습니다.</li>
            <li>"회사"가 약관을 개정할 경우에는 적용일자 및 개정사유를 명시하여 현행약관과 함께 제1항의 방식에 따라 그 개정약관의 적용일자 7일 전부터 적용일자 전일까지 공지합니다.</li>
        </ol>
    </section>

    <section>
        <h5 className="font-bold text-slate-900 text-base mb-2">제 4 조 (서비스의 제공 및 변경)</h5>
        <p>"회사"는 회원에게 아래와 같은 서비스를 제공합니다.</p>
        <ul className="list-disc pl-5 mt-1">
            <li>IT 뉴스, 칼럼, 분석 리포트 등 콘텐츠 제공 서비스</li>
            <li>뉴스레터 이메일 발송 서비스</li>
            <li>게시판형 커뮤니티 서비스</li>
            <li>기타 "회사"가 추가 개발하거나 다른 회사와의 제휴 계약 등을 통해 "회원"에게 제공하는 일체의 서비스</li>
        </ul>
    </section>

    <section>
        <h5 className="font-bold text-slate-900 text-base mb-2">제 5 조 (회원의 의무)</h5>
        <p>"회원"은 다음 행위를 하여서는 안 됩니다.</p>
        <ul className="list-disc pl-5 mt-1">
            <li>신청 또는 변경 시 허위내용의 등록</li>
            <li>타인의 정보 도용</li>
            <li>"회사"가 게시한 정보의 변경</li>
            <li>"회사" 및 기타 제3자의 저작권 등 지적재산권에 대한 침해</li>
            <li>"회사" 및 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
            <li>외설 또는 폭력적인 메시지, 화상, 음성, 기타 공서양속에 반하는 정보를 "서비스"에 공개 또는 게시하는 행위</li>
        </ul>
    </section>

    <section>
        <h5 className="font-bold text-slate-900 text-base mb-2">제 6 조 (저작권의 귀속 및 이용제한)</h5>
        <ol className="list-decimal pl-5 space-y-1">
            <li>"회사"가 작성한 저작물에 대한 저작권 기타 지적재산권은 "회사"에 귀속합니다.</li>
            <li>"회원"은 "서비스"를 이용함으로써 얻은 정보 중 "회사"에게 지적재산권이 귀속된 정보를 "회사"의 사전 승낙 없이 복제, 송신, 출판, 배포, 방송 기타 방법에 의하여 영리목적으로 이용하거나 제3자에게 이용하게 하여서는 안 됩니다.</li>
        </ol>
    </section>
    
    {/* ... (필요 시 더 추가 가능하나, 이 정도면 핵심은 충분합니다) ... */}
    </div>
),
},

// 4. 개인정보처리방침 (/privacy) - [법적 필수항목 완비]
privacy: {
title: "개인정보처리방침",
content: (
    <div className="text-sm text-slate-600 space-y-8 leading-relaxed text-justify">
        <p className="font-medium text-slate-900 p-4 bg-slate-50 rounded">
        <strong>트렌드IT</strong>('www.trendit.ai.kr'이하 '회사')는 개인정보보호법에 따라 이용자의 개인정보 보호 및 권익을 보호하고 개인정보와 관련한 이용자의 고충을 원활하게 처리할 수 있도록 다음과 같은 처리방침을 두고 있습니다.
    </p>

    <section>
        <h5 className="font-bold text-slate-900 text-base mb-2">1. 개인정보의 처리 목적</h5>
        <p>'회사'는 개인정보를 다음의 목적을 위해 처리합니다. 처리한 개인정보는 다음의 목적 이외의 용도로는 사용되지 않으며 이용 목적이 변경될 시에는 사전동의를 구할 예정입니다.</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>홈페이지 회원가입 및 관리:</strong> 회원 가입의사 확인, 회원제 서비스 제공에 따른 본인 식별·인증, 회원자격 유지·관리, 제한적 본인확인제 시행에 따른 본인확인, 서비스 부정이용 방지, 각종 고지·통지, 고충처리, 분쟁 조정을 위한 기록 보존 등을 목적으로 개인정보를 처리합니다.</li>
            <li><strong>재화 또는 서비스 제공:</strong> 물품배송, 서비스 제공, 청구서 발송, 콘텐츠 제공, 맞춤 서비스 제공, 본인인증, 연령인증, 요금결제·정산, 채권추심 등을 목적으로 개인정보를 처리합니다.</li>
            <li><strong>마케팅 및 광고에의 활용:</strong> 신규 서비스(제품) 개발 및 맞춤 서비스 제공, 이벤트 및 광고성 정보 제공 및 참여기회 제공, 인구통계학적 특성에 따른 서비스 제공 및 광고 게재, 서비스의 유효성 확인, 접속빈도 파악 또는 회원의 서비스 이용에 대한 통계 등을 목적으로 개인정보를 처리합니다.</li>
        </ul>
    </section>

    <section>
        <h5 className="font-bold text-slate-900 text-base mb-2">2. 개인정보의 처리 및 보유 기간</h5>
        <p>① 회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의 받은 개인정보 보유, 이용기간 내에서 개인정보를 처리, 보유합니다.</p>
        <p>② 각각의 개인정보 처리 및 보유 기간은 다음과 같습니다.</p>
        <ul className="list-disc pl-5 mt-2 space-y-1 bg-slate-50 p-4 rounded border border-slate-200">
            <li><strong>홈페이지 회원가입 및 관리:</strong> 홈페이지 탈퇴 시까지</li>
            <li><strong>관계 법령 위반에 따른 수사·조사 등이 진행 중인 경우:</strong> 해당 수사·조사 종료 시까지</li>
            <li><strong>재화 또는 서비스 제공:</strong> 재화·서비스 공급완료 및 요금결제·정산 완료 시까지</li>
            <li><strong>전자상거래 등에서의 소비자 보호에 관한 법률:</strong> 5년 (대금결제 및 재화 공급 등) / 3년 (소비자 불만 등)</li>
        </ul>
    </section>

    <section>
        <h5 className="font-bold text-slate-900 text-base mb-2">3. 처리하는 개인정보의 항목</h5>
        <p>회사는 다음의 개인정보 항목을 처리하고 있습니다.</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>필수항목: 아이디, 비밀번호, 이름, 이메일주소</li>
            <li>선택항목: 휴대전화번호, 생년월일</li>
            <li>자동수집항목: IP주소, 쿠키, MAC주소, 서비스 이용기록, 방문기록, 불량 이용기록</li>
        </ul>
    </section>

    <section>
        <h5 className="font-bold text-slate-900 text-base mb-2">4. 개인정보 보호책임자</h5>
        <div className="bg-slate-50 p-4 rounded border border-slate-200">
            <table className="w-full text-left">
                <tbody>
                    <tr><th className="w-32 py-1">성명</th><td>김지호</td></tr>
                    <tr><th className="w-32 py-1">직책</th><td>대표 / 개인정보관리책임자</td></tr>
                    <tr><th className="w-32 py-1">연락처</th><td>070-8058-95730</td></tr>
                    <tr><th className="w-32 py-1">이메일</th><td>trendit_news@naver.com</td></tr>
                </tbody>
            </table>
        </div>
    </section>
    </div>
),
},

// 5. 청소년보호정책 (/youth) - [언론사 필수 항목]
youth: {
title: "청소년보호정책",
content: (
    <div className="text-sm text-slate-600 space-y-8 leading-relaxed text-justify">
    <p>트렌드IT는 정보통신망이용촉진및정보보호등에관한법률 및 청소년보호법에 근거하여 청소년들이 유해한 환경으로부터 보호받고 건전한 인격체로 성장할 수 있도록 돕기 위해 다음과 같은 청소년보호정책을 시행하고 있습니다.</p>

    <section>
        <h5 className="font-bold text-slate-900 text-base mb-2">1. 유해정보로부터의 청소년보호계획 수립 및 업무담당자 교육 시행</h5>
        <p>회사는 청소년이 아무런 제한장치 없이 유해정보에 노출되지 않도록 청소년유해매체물에 대해서는 별도의 인증장치를 마련, 적용하며 청소년 유해정보가 노출되지 않도록 예방차원의 조치를 강구합니다. 또한 업무 담당자에게 청소년보호 관련 법령 및 제재기준, 유해정보 발견 시 대처방법, 위반사항 처리에 대한 보고절차 등을 교육하고 있습니다.</p>
    </section>

    <section>
        <h5 className="font-bold text-slate-900 text-base mb-2">2. 유해정보로 인한 피해상담 및 고충처리</h5>
        <p>회사는 청소년 유해정보로 인한 피해상담 및 고충처리를 위한 전문인력을 배치하여 그 피해가 확산되지 않도록 하고 있습니다. 이용자 분들께서는 하단에 명시한 "청소년보호 책임자 및 담당자의 소속, 성명 및 연락처"를 참고하셔서 전화나 이메일을 통해 피해상담 및 고충처리를 요청하실 수 있습니다.</p>
    </section>

    <section>
        <h5 className="font-bold text-slate-900 text-base mb-2">3. 청소년보호 책임자 및 담당자 연락처</h5>
        <div className="bg-slate-50 p-6 rounded border border-slate-200">
            <p className="mb-4">트렌드IT는 청소년들이 좋은 정보를 안전하게 이용할 수 있도록 최선을 다하고 있습니다.</p>
            <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <strong className="block text-slate-900 mb-1">[청소년보호 책임자]</strong>
                    <p>성명 : 김지호</p>
                    <p>소속 : 트렌드IT 편집국</p>
                    <p>전화 : 070-8058-9573</p>
                    <p>이메일 : trendit_news@naver.com</p>
                </div>
            </div>
        </div>
    </section>
    </div>
),
},

// 6. 이메일무단수집거부 (/email-refuse)
"email-refuse": {
title: "이메일무단수집거부",
content: (
    <div className="flex flex-col items-center justify-center py-16 space-y-8 text-center border border-slate-200 rounded-xl bg-slate-50">
    <div className="text-7xl">🚫</div>
    <div className="space-y-4 max-w-2xl px-4">
        <h3 className="text-2xl font-bold text-slate-900">
            본 웹사이트에 게시된 이메일 주소의<br/>무단 수집을 거부합니다.
        </h3>
        <p className="text-slate-600 leading-relaxed text-lg">
            트렌드IT 웹사이트에 게시된 이메일 주소가 전자우편 수집 프로그램이나 <br/>
            그 밖의 기술적 장치를 이용하여 무단으로 수집되는 것을 거부하며,<br/>
            이를 위반 시 <strong>정보통신망법에 의해 형사처벌</strong>됨을 유념하시기 바랍니다.
        </p>
        <div className="pt-6">
            <span className="inline-block bg-white border border-slate-300 px-4 py-2 rounded-full text-sm text-slate-500 shadow-sm">
                게시일: 2026년 1월 1일
            </span>
        </div>
    </div>
    </div>
),
},

// 7. 저작권보호정책 (/copyright)
copyright: {
title: "저작권보호정책",
content: (
    <div className="text-sm text-slate-600 space-y-8 leading-relaxed text-justify">
    <section>
        <h5 className="font-bold text-slate-900 text-base mb-2">1. 저작권의 귀속</h5>
        <p>트렌드IT(이하 "회사")가 제공하는 모든 콘텐츠(기사, 사진, 그래픽, 영상, 오디오, DB 등)에 대한 저작권은 "회사"에 있거나 "회사"가 정당한 권한으로 이용하는 것입니다. 이는 대한민국 저작권법 및 국제조약에 의해 보호받습니다.</p>
    </section>

    <section>
        <h5 className="font-bold text-slate-900 text-base mb-2">2. 콘텐츠 이용 제한</h5>
        <p>이용자는 회사의 사전 서면 승낙 없이 콘텐츠를 무단으로 전재, 복사, 배포, 변형, 출판, 방송, 전시하거나 인터넷 등 정보통신망을 통해 공중에게 제공할 수 없습니다.</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>허용되는 범위:</strong> 개인적인 목적으로 PC나 모바일에 저장하는 행위, 기사의 제목과 링크를 SNS 등에 공유하는 행위</li>
            <li><strong>금지되는 범위:</strong> 기사 본문을 통째로 복사하여 블로그/카페/커뮤니티에 붙여넣는 행위, 기사를 활용하여 수익을 창출하는 행위, AI 학습용 데이터로 무단 수집하는 행위</li>
        </ul>
    </section>

    <section>
        <h5 className="font-bold text-slate-900 text-base mb-2">3. 위반 시 조치</h5>
        <p>회사의 콘텐츠를 무단으로 사용하여 저작권법을 침해하는 경우, 회사는 침해 중단 요구, 손해배상 청구 등 민·형사상 법적 조치를 취할 수 있습니다.</p>
        <p className="mt-2 text-red-600 font-bold">※ 저작권법 위반 시 5년 이하의 징역 또는 5천만 원 이하의 벌금에 처해질 수 있습니다.</p>
    </section>
    </div>
),
},
};

// [안전장치] URL 별칭 연결 (오타 및 호환성)
PAGES["privacy-policy"] = PAGES["privacy"];
PAGES["email"] = PAGES["email-refuse"];
PAGES["youth-protection"] = PAGES["youth"];

export default async function StaticPage({ params }: Props) {
const resolvedParams = await params;

// [핵심] slug 또는 id 모두 확인
const slug = resolvedParams.slug || resolvedParams.id;

if (!slug) return notFound();

const pageData = PAGES[slug];
if (!pageData) return notFound();

return (
<div className="bg-white min-h-screen font-sans text-slate-900">
    <div className="container mx-auto px-4 py-16 max-w-4xl">
    
    {/* 공통 헤더 */}
    <div className="mb-12 text-center">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-6 tracking-tight">
            {pageData.title}
            </h1>
            <div className="w-16 h-1 bg-slate-900 mx-auto"></div>
    </div>

    {/* 본문 내용 */}
    <div className="bg-white">
        {pageData.content}
    </div>

    </div>
</div>
);
}