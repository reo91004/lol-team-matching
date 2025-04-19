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
    설치가 완료되면 MongoDB 서비스(`mongod`)가 자동으로 시작되는 경우가 많습니다. 상태를 확인하려면 다음 명령어를 사용합니다.

    ```bash
    sudo systemctl status mongod
    ```

    만약 실행 중이 아니라면 다음 명령어로 시작합니다.

    ```bash
    sudo systemctl start mongod
    ```

    부팅 시 자동으로 시작되도록 설정하려면 다음 명령어를 사용합니다.

    ```bash
    sudo systemctl enable mongod
    ```

    (참고: 일부 시스템에서는 서비스 이름이 `mongodb`일 수도 있습니다. `status` 명령어로 확인하세요.)

3.  **데이터베이스 연결 확인 (선택 사항):**
    `mongosh` (MongoDB Shell)을 사용하여 데이터베이스에 직접 연결하여 확인할 수 있습니다.

    ```bash
    mongosh
    ```

    쉘에 접속되면 `show dbs` 명령어로 데이터베이스 목록을 볼 수 있습니다. `Ctrl+D` 또는 `exit`로 쉘을 종료합니다.

4.  **백엔드 연결 설정:**
    백엔드 서버(`server.js`)는 기본적으로 로컬 MongoDB 인스턴스(`mongodb://localhost:27017`)의 `lol_team_matcher` 데이터베이스에 연결을 시도합니다. 별도의 설정은 필요하지 않지만, 다른 호스트나 포트, 데이터베이스 이름을 사용하려면 `server.js` 파일 내의 `MONGODB_URI`와 `DB_NAME` 상수를 수정해야 합니다.

## 배포 노트 (외부 접속 설정)

백엔드 서버를 로컬 네트워크 외부(예: GitHub Pages에서 호스팅되는 프론트엔드)에서 접속하려면 추가 설정이 필요합니다.

1.  **공인 IP 확인:** 백엔드 서버를 실행하는 컴퓨터(예: 우분투 노트북)의 공인 IP 주소를 확인합니다. (예: 웹 브라우저에서 "what is my ip" 검색)
2.  **포트 포워딩:** 가정/사무실의 공유기(라우터) 설정에서 외부 포트(예: 3000)의 TCP 트래픽을 백엔드 서버 컴퓨터의 내부 IP 주소 및 포트(예: 192.168.0.15:3000)로 전달하도록 포트 포워딩 규칙을 설정합니다. (설정 방법은 공유기 모델마다 다릅니다.)
3.  **방화벽:** 백엔드 서버 컴퓨터의 방화벽(예: Ubuntu `ufw`)에서 해당 포트(예: 3000/tcp)의 인바운드 연결을 허용합니다.
4.  **프론트엔드 URL 수정:** `index.html` 파일 내의 `backendUrl` 변수 값을 확인한 공인 IP 주소 또는 DDNS 도메인 이름과 포트 번호로 변경합니다. (예: `http://sammaru.iptime.org:3000`)
5.  **CORS 설정 (권장):** 보안을 위해 `server.js`의 `corsOptions`에서 `origin` 값을 프론트엔드가 호스팅되는 실제 주소(예: `https://blog.reo91004.com`)로 설정하여 해당 주소의 요청만 허용하는 것이 좋습니다.
6.  **유동 IP 주의 (DDNS 권장):** 일반적인 인터넷 회선은 공인 IP가 변경될 수 있습니다 (유동 IP). IP가 변경될 때마다 프론트엔드 코드를 수정하는 것은 번거로우므로, 고정된 도메인 이름을 유동 IP에 연결해주는 DDNS(Dynamic DNS) 서비스를 (예: No-IP, Dynu) 사용하는 것을 강력히 권장합니다. DDNS 사용 시 `backendUrl`에는 DDNS 도메인 이름을 사용합니다. (예: `http://sammaru.iptime.org:3000`)
7.  **HTTPS 적용 (필수):** GitHub Pages와 같이 HTTPS로 제공되는 프론트엔드(`https://blog.reo91004.com`)에서 백엔드 API를 호출하려면, 브라우저의 Mixed Content 정책 때문에 백엔드 서버 역시 **반드시 HTTPS**로 제공되어야 합니다. HTTP 백엔드 주소(`http://sammaru.iptime.org:3000`)를 사용하면 브라우저에서 요청이 차단됩니다.
    - 이를 위해서는 일반적으로 DDNS 또는 구매한 도메인 이름, 해당 도메인에 대한 SSL/TLS 인증서(예: Let's Encrypt 무료 인증서), 그리고 Nginx 또는 Caddy와 같은 리버스 프록시 서버 설정이 필요합니다. 리버스 프록시가 외부의 HTTPS 요청을 받아 내부의 Node.js 서버(HTTP)로 전달하는 방식이 일반적입니다.
    - 백엔드 서버를 HTTPS로 설정한 후에는 `index.html`의 `backendUrl`도 `https://sammaru.iptime.org:PORT` (HTTPS 포트는 보통 443)로 변경해야 하며, `server.js`의 `corsOptions.origin` 값도 `https://blog.reo91004.com`으로 설정해야 합니다.
