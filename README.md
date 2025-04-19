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
