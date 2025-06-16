## 기능

- 소환사 닉네임과 태그로 플레이어 정보 조회
- 티어, 랭크, 승률, 주 포지션, 주 챔피언 정보 표시
- 10명의 플레이어 정보 기반 밸런스 팀 생성
- 모던한 UI/UX 제공

## 기술 스택

- **프레임워크**: Next.js 15.2.4
- **언어**: TypeScript
- **스타일링**: Tailwind CSS
- **UI 컴포넌트**: Radix UI
- **상태 관리**: React Hooks
- **폼 관리**: React Hook Form + Zod
- **API**: Riot Games API

## 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가한다:

```env
RIOT_API_KEY=YOUR_RIOT_API_KEY
```

Riot API 키는 [Riot Developer Portal](https://developer.riotgames.com/)에서 발급받을 수 있다.

### 3. 개발 서버 실행

```bash
npm run dev
```

개발 서버는 `http://localhost:3000`에서 실행된다.

### 4. 프로덕션 빌드

```bash
npm run build
npm start
```

## 사용 방법

1. 웹 페이지 접속 후 10명의 소환사 닉네임과 태그를 입력한다
2. 각 플레이어의 "조회" 버튼을 클릭하여 정보를 가져온다
3. 모든 플레이어 정보가 조회되면 "팀 밸런싱 시작" 버튼이 활성화된다
4. 버튼을 클릭하면 균형 잡힌 두 팀으로 나누어 결과를 표시한다

## API 엔드포인트

- `GET /api/player?gameName={닉네임}&tagLine={태그}`: 플레이어 정보 조회

## 프로젝트 구조

```
├── app/
│   ├── api/
│   │   └── player/
│   │       └── route.ts          # 플레이어 정보 API
│   │   ├── page.tsx                  # 메인 페이지
│   │   ├── layout.tsx                # 레이아웃
│   │   └── globals.css               # 글로벌 스타일
│   ├── components/
│   │   └── ui/                       # UI 컴포넌트
│   ├── lib/
│   │   └── riot-api.ts               # Riot API 클라이언트
│   ├── hooks/                        # 커스텀 훅
│   └── styles/                       # 스타일 파일
└── public/                       # 정적 파일
```

## 주의사항

- Riot API 키는 개발용 키를 사용하며, 24시간마다 만료된다
- API 호출 제한이 있으므로 과도한 요청은 피해야 한다
- 소환사 정보 조회 시 정확한 닉네임과 태그를 입력해야 한다
