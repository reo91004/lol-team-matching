const express = require("express");
const axios = require("axios");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config(); // dotenv 로드

const app = express();
const port = 3000;

// --- Riot API 설정 ---
// 환경 변수에서 API 키 로드
const RIOT_API_KEY = process.env.RIOT_API_KEY;
if (!RIOT_API_KEY) {
	console.error("Error: RIOT_API_KEY environment variable not set.");
	console.error("Please create a .env file and add RIOT_API_KEY=YOUR_KEY");
	process.exit(1);
}
const RIOT_API_BASE_URL_ACCOUNT = "https://asia.api.riotgames.com"; // 라우팅 값: americas, asia, europe
const RIOT_API_BASE_URL_PLATFORM = "https://kr.api.riotgames.com"; // 플랫폼 라우팅 값 (KR)

// --- Data Dragon 설정 ---
const DDRAGON_BASE_URL = "https://ddragon.leagueoflegends.com";
let latestDdragonVersion = null;
let championDataCache = null;

// --- MongoDB 설정 ---
const MONGODB_URI = "mongodb://localhost:27017"; // 로컬 MongoDB 주소
const DB_NAME = "lol_team_matcher";
const COLLECTION_NAME = "players";
let dbClient = null;
let playersCollection = null;

// CORS 설정 (모든 출처 허용)
app.use(cors());
app.use(express.json());

// --- 서버 시작 시 Data Dragon 정보 가져오기 ---
async function connectToMongoDB() {
	try {
		dbClient = new MongoClient(MONGODB_URI, {
			serverApi: {
				version: ServerApiVersion.v1,
				strict: true,
				deprecationErrors: true,
			},
		});
		await dbClient.connect();
		const db = dbClient.db(DB_NAME);
		playersCollection = db.collection(COLLECTION_NAME);
		console.log("Successfully connected to MongoDB.");
	} catch (error) {
		console.error("Error connecting to MongoDB:", error);
		process.exit(1); // 연결 실패 시 서버 종료
	}
}

async function initializeDataDragon() {
	try {
		console.log("Fetching latest Data Dragon version...");
		const versionResponse = await axios.get(`${DDRAGON_BASE_URL}/api/versions.json`);
		latestDdragonVersion = versionResponse.data[0]; // 최신 버전 사용
		console.log(`Latest Data Dragon version: ${latestDdragonVersion}`);

		console.log(`Fetching champion data for version ${latestDdragonVersion}...`);
		const championResponse = await axios.get(`${DDRAGON_BASE_URL}/cdn/${latestDdragonVersion}/data/ko_KR/champion.json`);
		const rawChampionData = championResponse.data.data;

		// 필요한 형식으로 챔피언 데이터 가공 및 캐싱
		championDataCache = {};
		for (const key in rawChampionData) {
			const champ = rawChampionData[key];
			championDataCache[champ.key] = {
				// championId (숫자 키)를 기준으로 매핑
				id: champ.id, // 영문 ID (이미지 경로 등에 사용)
				name: champ.name, // 한글 이름
			};
		}
		console.log("Champion data loaded and cached.");
	} catch (error) {
		console.error("Error initializing Data Dragon:", error.message);
		// 실패 시에도 서버는 계속 실행, 챔피언 데이터는 null 상태
	}
}

// --- API 엔드포인트 --- //

// Data Dragon 챔피언 정보 제공 엔드포인트
app.get("/api/ddragon/champions", (req, res) => {
	if (championDataCache && latestDdragonVersion) {
		res.json({
			version: latestDdragonVersion,
			champions: championDataCache,
		});
	} else {
		res.status(503).json({ message: "챔피언 데이터 로딩 중이거나 로딩에 실패했습니다." });
	}
});

// Riot ID 기반 소환사 정보 조회 엔드포인트
app.get("/api/riotid/:gameName/:tagLine", async (req, res) => {
	const gameName = encodeURIComponent(req.params.gameName);
	const tagLine = encodeURIComponent(req.params.tagLine);

	try {
		console.log(`Fetching account data for: ${decodeURIComponent(gameName)}#${decodeURIComponent(tagLine)}`);
		// 1. Riot ID로 puuid 조회 (ACCOUNT-V1)
		const accountApiUrl = `${RIOT_API_BASE_URL_ACCOUNT}/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`;
		const accountResponse = await axios.get(accountApiUrl, {
			headers: { "X-Riot-Token": RIOT_API_KEY },
		});
		const puuid = accountResponse.data.puuid;
		console.log(`PUUID: ${puuid}`);

		if (!puuid) {
			return res.status(404).json({ message: "PUUID를 찾을 수 없습니다." });
		}

		// 2. puuid로 소환사 정보 조회 (SUMMONER-V4)
		console.log(`Fetching summoner data using PUUID: ${puuid}`);
		const summonerApiUrl = `${RIOT_API_BASE_URL_PLATFORM}/lol/summoner/v4/summoners/by-puuid/${puuid}`;
		const summonerResponse = await axios.get(summonerApiUrl, {
			headers: { "X-Riot-Token": RIOT_API_KEY },
		});
		const summonerData = summonerResponse.data;
		const summonerId = summonerData.id;
		const summonerLevel = summonerData.summonerLevel;
		const profileIconId = summonerData.profileIconId;
		const summonerNameFromApi = summonerData.name; // API에서 받은 소환사 이름

		console.log(`Summoner ID: ${summonerId}, Level: ${summonerLevel}, Name: ${summonerNameFromApi}`);

		// 3. 소환사 랭크 정보 조회 (LEAGUE-V4)
		const leagueApiUrl = `${RIOT_API_BASE_URL_PLATFORM}/lol/league/v4/entries/by-summoner/${summonerId}`;
		console.log(`Fetching league data for summoner ID: ${summonerId}`);
		const leagueResponse = await axios.get(leagueApiUrl, {
			headers: { "X-Riot-Token": RIOT_API_KEY },
		});
		const leagueData = leagueResponse.data;

		const soloRankData = leagueData.find((entry) => entry.queueType === "RANKED_SOLO_5x5");
		let tier = "UNRANKED";
		let rank = "I";

		if (soloRankData) {
			tier = soloRankData.tier;
			rank = soloRankData.rank;
			console.log(`Solo Rank: ${tier} ${rank}`);
		} else {
			console.log("Solo Rank data not found, assuming UNRANKED.");
		}

		// 4. 챔피언 숙련도 정보 조회 (상위 3개)
		let mainChampions = [];
		try {
			// puuid 기반의 /top 엔드포인트 사용 (기본값: 상위 3개)
			const masteryApiUrl = `${RIOT_API_BASE_URL_PLATFORM}/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}/top`;
			console.log(`Fetching top champion mastery data using PUUID: ${puuid}`);
			const masteryResponse = await axios.get(masteryApiUrl, {
				headers: { "X-Riot-Token": RIOT_API_KEY },
			});
			// /top 엔드포인트는 이미 정렬된 상위 챔피언 목록 반환
			mainChampions = masteryResponse.data.map((mastery) => mastery.championId);
			console.log("Top Champion IDs from /top endpoint:", mainChampions);
		} catch (masteryError) {
			// 숙련도 정보 조회 실패 시 오류 로그만 남기고 계속 진행 (챔피언 정보 없이 응답)
			console.error("Error fetching champion mastery data:", masteryError.response ? JSON.stringify(masteryError.response.data, null, 2) : masteryError.message);
		}

		// 5. 클라이언트에 반환할 데이터 구성
		const responseData = {
			name: summonerNameFromApi, // API에서 받은 이름 사용
			level: summonerLevel,
			profileIconId: profileIconId,
			tier: tier,
			rank: convertRomanToNumber(rank),
			preferredLanes: [],
			mainChampions: mainChampions,
		};

		res.json(responseData);
	} catch (error) {
		console.error("Error processing Riot ID request:", error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
		if (error.response) {
			let message = "Riot API 에러 발생";
			if (error.response.data && error.response.data.status) {
				message = error.response.data.status.message;
			}
			res.status(error.response.status).json({ message: message });
		} else {
			res.status(500).json({ message: "서버 내부 오류 발생" });
		}
	}
});

// --- 플레이어 관리 API --- //

// 플레이어 추가
app.post("/api/players", async (req, res) => {
	if (!playersCollection) return res.status(503).json({ message: "Database not connected" });
	try {
		const newPlayer = req.body;
		// 중복 닉네임 체크
		const existingPlayer = await playersCollection.findOne({ name: newPlayer.name });
		if (existingPlayer) {
			return res.status(409).json({ message: "이미 등록된 닉네임입니다." });
		}
		// 최대 플레이어 수 체크 (DB 기준)
		const count = await playersCollection.countDocuments();
		if (count >= 10) {
			return res.status(400).json({ message: "플레이어는 최대 10명까지만 등록할 수 있습니다." });
		}

		const result = await playersCollection.insertOne(newPlayer);
		res.status(201).json(result);
	} catch (error) {
		console.error("Error adding player:", error);
		res.status(500).json({ message: "플레이어 추가 중 오류 발생" });
	}
});

// 모든 플레이어 조회
app.get("/api/players", async (req, res) => {
	if (!playersCollection) return res.status(503).json({ message: "Database not connected" });
	try {
		const players = await playersCollection.find({}).toArray();
		res.json(players);
	} catch (error) {
		console.error("Error fetching players:", error);
		res.status(500).json({ message: "플레이어 목록 조회 중 오류 발생" });
	}
});

// 특정 플레이어 삭제 (이름 기준)
app.delete("/api/players/:playerName", async (req, res) => {
	if (!playersCollection) return res.status(503).json({ message: "Database not connected" });
	try {
		const playerName = req.params.playerName;
		const result = await playersCollection.deleteOne({ name: playerName });
		if (result.deletedCount === 1) {
			res.status(200).json({ message: "플레이어 삭제 완료" });
		} else {
			res.status(404).json({ message: "삭제할 플레이어를 찾을 수 없습니다." });
		}
	} catch (error) {
		console.error("Error deleting player:", error);
		res.status(500).json({ message: "플레이어 삭제 중 오류 발생" });
	}
});

// 모든 플레이어 삭제 (초기화)
app.delete("/api/players", async (req, res) => {
	if (!playersCollection) return res.status(503).json({ message: "Database not connected" });
	try {
		await playersCollection.deleteMany({});
		res.status(200).json({ message: "모든 플레이어 삭제 완료" });
	} catch (error) {
		console.error("Error resetting players:", error);
		res.status(500).json({ message: "플레이어 목록 초기화 중 오류 발생" });
	}
});

// 로마 숫자 랭크를 숫자로 변환하는 헬퍼 함수
function convertRomanToNumber(roman) {
	switch (roman) {
		case "I":
			return 1;
		case "II":
			return 2;
		case "III":
			return 3;
		case "IV":
			return 4;
		default:
			return 1;
	}
}

// 서버 시작 및 초기화
async function startServer() {
	await connectToMongoDB(); // DB 연결 먼저 시도
	await initializeDataDragon(); // 그 다음 Data Dragon 정보 로드
	app.listen(port, () => {
		console.log(`Server listening at http://localhost:${port}`);
	});
}

startServer(); // 서버 시작 함수 호출
