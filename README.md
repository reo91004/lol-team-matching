# 롤 내전 밸런스 매칭 시스템 백엔드

이 프로젝트는 롤 내전 밸런스 매칭 시스템의 Riot API 호출을 처리하는 백엔드 서버입니다.

## 설치

1.  Node.js (버전 18 이상 권장)를 설치합니다.
2.  프로젝트 루트 디렉토리에서 다음 명령어를 실행하여 필요한 패키지를 설치합니다:
    ```bash
    npm install
    ```

## 실행

다음 명령어를 사용하여 서버를 시작합니다:

1.  **환경 변수 설정:**
    프로젝트 루트 디렉토리에 `.env` 파일을 생성하고 다음 내용을 추가합니다. `YOUR_RIOT_API_KEY` 부분을 실제 Riot API 키로 교체해야 합니다. 이 키는 개발용 키를 사용하며, 만료될 수 있습니다. ([Riot Developer Portal](https://developer.riotgames.com/)에서 발급)

    ```dotenv
    RIOT_API_KEY=YOUR_RIOT_API_KEY
    ```

2.  **서버 시작:**
    ```bash
    npm start
    ```

서버는 기본적으로 `http://localhost:3000` 에서 실행됩니다.

## API 엔드포인트

- `GET /api/summoner/:summonerName`: 지정된 소환사명을 사용하여 Riot API에서 소환사 정보 및 랭크 정보를 조회합니다.
- `GET /api/ddragon/champions`: 최신 Data Dragon 버전 및 가공된 챔피언 데이터를 반환합니다. (서버 시작 시 캐싱)
- `GET /api/riotid/:gameName/:tagLine`: Riot ID(게임 이름 + 태그라인)를 사용하여 Riot API에서 소환사 정보, 랭크 정보, 상위 챔피언 숙련도 ID를 조회합니다.

## 데이터베이스 설정 (MongoDB on Ubuntu)

이 애플리케이션은 등록된 플레이어 정보를 저장하기 위해 MongoDB를 사용합니다.

1.  **MongoDB 설치:**
    Ubuntu 터미널에서 다음 명령어를 실행하여 MongoDB를 설치합니다.

    ```bash
    sudo apt update
    sudo apt install -y mongodb
    ```

2.  **MongoDB 서비스 확인/시작:**
    설치가 완료되면 MongoDB 서비스가 자동으로 시작됩니다. 상태를 확인하려면 다음 명령어를 사용합니다.

    ```bash
    sudo systemctl status mongodb
    ```

    만약 실행 중이 아니라면 다음 명령어로 시작합니다.

    ```bash
    sudo systemctl start mongodb
    ```

    부팅 시 자동으로 시작되도록 설정하려면 다음 명령어를 사용합니다.

    ```bash
    sudo systemctl enable mongodb
    ```

3.  **데이터베이스 연결:**
    백엔드 서버(`server.js`)는 기본적으로 로컬 MongoDB 인스턴스(`mongodb://localhost:27017`)의 `lol_team_matcher` 데이터베이스에 연결을 시도합니다. 별도의 설정은 필요하지 않지만, 다른 호스트나 포트, 데이터베이스 이름을 사용하려면 `server.js` 파일 내의 `MONGODB_URI`와 `DB_NAME` 상수를 수정해야 합니다.

## 배포 노트 (외부 접속 설정)

백엔드 서버를 로컬 네트워크 외부(예: GitHub Pages에서 호스팅되는 프론트엔드)에서 접속하려면 추가 설정이 필요합니다.

1.  **공인 IP 확인:** 백엔드 서버를 실행하는 컴퓨터(예: 우분투 노트북)의 공인 IP 주소를 확인합니다. (예: 웹 브라우저에서 "what is my ip" 검색)
2.  **포트 포워딩:** 가정/사무실의 공유기(라우터) 설정에서 외부 포트(예: 3000)의 TCP 트래픽을 백엔드 서버 컴퓨터의 내부 IP 주소 및 포트(예: 192.168.0.15:3000)로 전달하도록 포트 포워딩 규칙을 설정합니다. (설정 방법은 공유기 모델마다 다릅니다.)
3.  **방화벽:** 백엔드 서버 컴퓨터의 방화벽(예: Ubuntu `ufw`)에서 해당 포트(예: 3000/tcp)의 인바운드 연결을 허용합니다.
4.  **프론트엔드 URL 수정:** `index.html` 파일 내의 `backendUrl` 변수 값을 확인한 공인 IP 주소와 포트 번호로 변경합니다. (예: `http://123.45.67.89:3000`)
5.  **CORS 설정 (권장):** 보안을 위해 `server.js`의 `corsOptions`에서 `origin` 값을 프론트엔드가 호스팅되는 실제 주소(예: GitHub Pages URL)로 설정하여 해당 주소의 요청만 허용하는 것이 좋습니다.
6.  **유동 IP 주의 (DDNS 권장):** 일반적인 인터넷 회선은 공인 IP가 변경될 수 있습니다 (유동 IP). IP가 변경될 때마다 프론트엔드 코드를 수정하는 것은 번거로우므로, 고정된 도메인 이름을 유동 IP에 연결해주는 DDNS(Dynamic DNS) 서비스를 (예: No-IP, Dynu) 사용하는 것을 강력히 권장합니다. DDNS 사용 시 `backendUrl`에는 DDNS 도메인 이름을 사용합니다. (예: `http://my-lol-backend.ddns.net:3000`)
7.  **HTTPS (필수):** 실제 외부에 서비스를 공개할 경우, HTTP 대신 HTTPS를 사용하여 통신을 암호화해야 합니다. 이를 위해서는 도메인 구매, SSL/TLS 인증서 발급(Let's Encrypt 등), Nginx나 Caddy 같은 리버스 프록시 설정 등이 필요합니다. 현재 설정은 개발 및 테스트용입니다.
