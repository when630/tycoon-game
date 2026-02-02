# Railway 배포 가이드

Railway(railway.app)를 사용하여 Forge Tycoon (Frontend + Backend + DB)을 한 번에 배포하는 방법입니다.

## 1. 개요
*   **Repository**: 이 GitHub 저장소를 사용합니다.
*   **Services**: Railway 프로젝트 내에 3개의 서비스(MySQL, Backend, Frontend)를 생성합니다.

## 2. GitHub 저장소 준비
1.  이 코드가 GitHub에 푸시되어 있어야 합니다.

## 3. Railway 프로젝트 생성
1.  [Railway](https://railway.app/) 로그인 후 "New Project" -> "Provision MySQL" 선택.
2.  MySQL 서비스가 생성됩니다.

## 4. Backend 서비스 배포
1.  프로젝트 뷰에서 우클릭(또는 "New" 버튼) -> "GitHub Repo" 선택 -> `tycoon-game` 저장소 선택.
2.  **설정 (Settings)**:
    *   **Root Directory**: `/backend`
    *   **Variables** (MySQL 서비스의 변수(Variables) 탭을 참고하여 입력):
        *   `DB_HOST`: `${{ MySQL.MYSQLHOST }}` (Railway 변수 참조 기능 사용)
        *   `DB_PORT`: `${{ MySQL.MYSQLPORT }}`
        *   `DB_NAME`: `${{ MySQL.MYSQLDATABASE }}`
        *   `DB_USER`: `${{ MySQL.MYSQLUSER }}`
        *   `DB_PASSWORD`: `${{ MySQL.MYSQLPASSWORD }}`
        *   `PORT`: `8080` (기본값, 자동 감지됨)
3.  자동으로 빌드 및 배포가 시작됩니다. 성공하면 생성된 **Domain** (예: `backend-production.up.railway.app`)을 복사해둡니다.

## 5. Frontend 서비스 배포
1.  같은 프로젝트에서 "New" -> "GitHub Repo" -> `tycoon-game` 저장소 다시 선택.
2.  **설정 (Settings)**:
    *   **Root Directory**: `/frontend`
    *   **Build Command**: `npm run build`
    *   **Start Command**: `npm start`
    *   **Variables**:
        *   `VITE_API_URL`: `https://backend-production.up.railway.app` (위에서 복사한 Backend 도메인, `https://` 포함)
3.  배포가 완료되면 생성된 Frontend 도메인으로 접속합니다.

## 6. 완료!
이제 Frontend 도메인 주소를 친구들에게 공유하여 게임을 즐기세요!
