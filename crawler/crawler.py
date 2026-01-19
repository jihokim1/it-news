import time
import random
import requests
import re
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium_stealth import stealth
from bs4 import BeautifulSoup

API_URL = "http://localhost:3000/api/ranking"
SECRET_KEY = "my-secret-password-1234"

LIMIT_ALL = 50
LIMIT_CAT = 25

def random_sleep(min_sec=1.5, max_sec=3):
    time.sleep(random.uniform(min_sec, max_sec))

def clean_title(text):
    if not text: return ""
    text = re.sub(r'\d+(\.\d+)?(star|별표|review).*$', '', text)
    return text.strip()

# ==========================================
# 1. 구글 플레이 (화면 줌아웃 방식)
# ==========================================
def get_google_data():
    print("🤖 구글 플레이 수집 중... (시각적 안정화 모드)")
    
    target_urls = [
        {"name": "전체", "url": "https://play.google.com/store/apps?device=phone"}, 
        {"name": "게임", "url": "https://play.google.com/store/games?device=phone"},
        {"name": "금융", "url": "https://play.google.com/store/apps/category/FINANCE?device=phone"},
        {"name": "소셜", "url": "https://play.google.com/store/apps/category/SOCIAL?device=phone"},
        {"name": "엔터", "url": "https://play.google.com/store/apps/category/ENTERTAINMENT?device=phone"},
        {"name": "생활", "url": "https://play.google.com/store/apps/category/LIFESTYLE?device=phone"},
    ]

    chrome_options = Options()
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    # ⭐ 수정: 무리한 창 크기 조절 삭제 -> 표준 크기로 변경
    chrome_options.add_argument("--window-size=1920,1080") 
    
    chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
    chrome_options.add_experimental_option('useAutomationExtension', False)
    
    driver = None
    all_data = []

    try:
        driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
        
        stealth(driver,
            languages=["ko-KR", "ko"],
            vendor="Google Inc.",
            platform="Win32",
            webgl_vendor="Intel Inc.",
            renderer="Intel Iris OpenGL Engine",
            fix_hairline=True,
        )

        for target in target_urls:
            print(f"   ➡️ [Google] '{target['name']}' 스캔 중...")
            try:
                driver.get(target['url'])
                time.sleep(3)

                # ⭐ 핵심 기술: 창 크기 대신 자바스크립트로 화면 배율을 50%로 축소
                # 이러면 한 화면에 앱이 엄청 많이 보여서 스크롤 효과가 극대화됨
                driver.execute_script("document.body.style.zoom='50%'")
                time.sleep(1)

                # 스크롤 
                for _ in range(8):
                    driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
                    time.sleep(1.5)

                soup = BeautifulSoup(driver.page_source, "html.parser")
                links = soup.find_all('a', href=True)
                
                seen_ids = set()
                current_rank = 1 
                target_limit = LIMIT_ALL if target['name'] == "전체" else LIMIT_CAT

                for link in links:
                    href = link['href']
                    if "/store/apps/details?id=" not in href: continue
                    
                    app_id = href.split("id=")[-1]
                    if app_id in seen_ids: continue
                    if current_rank > target_limit: break
                    
                    seen_ids.add(app_id)
                    
                    try:
                        title = link.get_text().strip()
                        if not title:
                            parent = link.find_parent('div')
                            if parent:
                                t_elem = parent.select_one('.Epkrse') or parent.select_one('.IbE0S') or parent.select_one('.ubGTjb')
                                if t_elem: title = t_elem.get_text().strip()
                        
                        title = clean_title(title)
                        if not title: continue 

                        img_tag = link.find('img')
                        if not img_tag:
                            parent = link.find_parent('div')
                            if parent: img_tag = parent.find('img')
                        
                        icon_url = ""
                        if img_tag:
                            icon_url = img_tag.get('src') or img_tag.get('data-src') or ""

                        all_data.append({
                            "rank": current_rank,
                            "title": title,
                            "publisher": "Google Play",
                            "iconUrl": icon_url,
                            "link": "https://play.google.com" + href,
                            "category": target['name']
                        })
                        current_rank += 1
                    except: continue
                
                print(f"      ✅ {target['name']} {current_rank-1}개 확보")

            except Exception as e:
                print(f"      ❌ {target['name']} 에러: {e}")
                continue

    except Exception as e:
        print(f"❌ 구글 브라우저 에러: {e}")
    finally:
        if driver: driver.quit()
        
    return all_data

# ==========================================
# 2. 애플 앱스토어 (동일 유지)
# ==========================================
def get_apple_data():
    print("🍎 애플 데이터 수집 중...")
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    
    genres = [
        {"code": "", "name": "전체"}, 
        {"code": "/genre=6014", "name": "게임"},
        {"code": "/genre=6015", "name": "금융"},
        {"code": "/genre=6005", "name": "소셜"},
        {"code": "/genre=6016", "name": "엔터"},
        {"code": "/genre=6012", "name": "생활"},
    ]
    all_data = []
    
    for genre in genres:
        target_limit = LIMIT_ALL if genre['name'] == "전체" else LIMIT_CAT
        req_limit = target_limit + 20 
        url = f"https://itunes.apple.com/kr/rss/topfreeapplications/limit={req_limit}{genre['code']}/json"
        
        try:
            res = requests.get(url, headers=headers)
            data = res.json()
            entries = data.get('feed', {}).get('entry', [])
            
            current_rank = 1
            for entry in entries:
                if current_rank > target_limit: break

                try:
                    name_obj = entry.get('im:name', {})
                    title = name_obj.get('label', '이름 없음')
                    
                    artist_obj = entry.get('im:artist', {})
                    publisher = artist_obj.get('label', 'Apple App Store')
                    
                    images = entry.get('im:image', [])
                    icon_url = images[-1]['label'] if images else ""
                    
                    link_obj = entry.get('link', {})
                    if isinstance(link_obj, list):
                        link = link_obj[0].get('attributes', {}).get('href', '#')
                    elif isinstance(link_obj, dict):
                        link = link_obj.get('attributes', {}).get('href', '#')
                    else: link = "#"

                    all_data.append({
                        "rank": current_rank,
                        "title": clean_title(title),
                        "publisher": publisher,
                        "iconUrl": icon_url,
                        "link": link,
                        "category": genre['name']
                    })
                    current_rank += 1
                except: continue
            print(f"   ✅ [Apple] {genre['name']} {current_rank-1}개 완료")
        except: continue
    return all_data

def send_to_server(platform, data):
    if not data: return
    try:
        requests.post(API_URL, json={"secretKey": SECRET_KEY, "platform": platform, "items": data})
        print(f"🚀 [{platform}] 총 {len(data)}개 서버 전송 완료!")
    except Exception as e:
        print(f"❌ 전송 실패: {e}")

if __name__ == "__main__":
    print("🚀 크롤러 V8 (검은 화면 해결 + 데이터 꽉 채움)...")
    send_to_server("apple", get_apple_data())
    send_to_server("google", get_google_data())
    print("🎉 끝!")