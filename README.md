# 맛있는 집 — 연습용 음식점 소개

브라우저만으로 동작하는 정적 페이지입니다. **파스타 메뉴 홈**, **메뉴 상세**, **직접 사진으로 메뉴 만들기** 화면으로 나뉩니다.

## 페이지 구성

| 파일 | 설명 |
|------|------|
| `index.html` | 홈 — 파스타 메뉴 카드(사진 클릭 시 상세로 이동) |
| `detail.html?id=…` | 상세 — 메뉴 설명·그 메뉴만의 리뷰 작성 |
| `manage.html` | 관리 — 직접 음식 사진 업로드, 메뉴별 리뷰 |

## 실행 방법

1. `index.html`을 브라우저로 엽니다.  
2. 또는 VS Code / Cursor의 **Live Server** 등으로 로컬에서 띄웁니다.

> 홈의 파스타 이미지는 인터넷(Unsplash)에서 불러옵니다.

## 데이터 저장

사진·리뷰는 **이 브라우저의 `localStorage`**에만 저장되며, 서버나 다른 기기와는 공유되지 않습니다.

## 파일 개요

- `pastas.js` — 홈/상세에 쓰는 파스타 메뉴 데이터  
- `home.js`, `detail.js`, `app.js` — 각 화면 동작  
- `styles.css` — 스타일

## Git — 복사해서 푸시 (Ctrl+C / Ctrl+V)

1. GitHub에서 빈 저장소를 만듭니다.  
2. **`COPY-PASTE.txt`** 를 열어 **맨 위 `$URL` 한 줄만** 본인 저장소 주소로 바꾼 뒤, **그 파일 안의 코드 블록 전체**를 PowerShell에 붙여넣고 Enter 하면 `add → commit → push` 까지 됩니다.  
3. 또는 `push-to-github.ps1` 안의 `$GitHubRepoUrl` 만 수정한 뒤 같은 폴더에서 `.\push-to-github.ps1` 를 실행해도 됩니다.

수동으로 하려면:

```bash
git remote add origin https://github.com/사용자명/저장소명.git
git push -u origin main
```

---

연습용 데모 프로젝트입니다.
