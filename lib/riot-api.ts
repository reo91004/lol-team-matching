// Riot API 호출을 위한 타입 정의
interface RiotAccount {
	puuid: string;
	gameName: string;
	tagLine: string;
}

interface RiotSummoner {
	accountId: string;
	profileIconId: number;
	revisionDate: number;
	name: string;
	id: string;
	puuid: string;
	summonerLevel: number;
}

interface RiotRank {
	leagueId: string;
	queueType: string;
	tier: string;
	rank: string;
	summonerId: string;
	summonerName: string;
	leaguePoints: number;
	wins: number;
	losses: number;
	veteran: boolean;
	inactive: boolean;
	freshBlood: boolean;
	hotStreak: boolean;
}

interface ChampionMastery {
	championId: number;
	championLevel: number;
	championPoints: number;
	lastPlayTime: number;
	championPointsSinceLastLevel: number;
	championPointsUntilNextLevel: number;
	chestGranted: boolean;
	tokensEarned: number;
	summonerId: string;
}

// 챔피언 ID를 이름으로 매핑하는 간단한 맵
const championMap: { [key: number]: string } = {
	1: "애니",
	2: "올라프",
	3: "갈리오",
	4: "트위스티드 페이트",
	5: "신 짜오",
	6: "우르곳",
	7: "르블랑",
	8: "블라디미르",
	9: "피들스틱",
	10: "케일",
	11: "마스터 이",
	12: "알리스타",
	13: "라이즈",
	14: "사이온",
	15: "시비르",
	16: "소라카",
	17: "티모",
	18: "트리스타나",
	19: "워윅",
	20: "누누와 윌럼프",
	21: "미스 포츈",
	22: "애쉬",
	23: "트린다미어",
	24: "잭스",
	25: "모르가나",
	26: "질리언",
	27: "신드라",
	28: "이블린",
	29: "트위치",
	30: "카서스",
	31: "초가스",
	32: "아무무",
	33: "람머스",
	34: "애니비아",
	35: "샤코",
	36: "문도 박사",
	37: "소나",
	38: "카사딘",
	39: "이렐리아",
	40: "잔나",
	41: "갱플랭크",
	42: "코르키",
	43: "카르마",
	44: "타릭",
	45: "베이가",
	48: "트런들",
	50: "스웨인",
	51: "케이틀린",
	53: "블리츠크랭크",
	54: "말파이트",
	55: "카타리나",
	56: "녹턴",
	57: "마오카이",
	58: "레넥톤",
	59: "자르반 4세",
	60: "엘리스",
	61: "오리아나",
	62: "오공",
	63: "브랜드",
	64: "리 신",
	67: "베인",
	68: "럼블",
	69: "카시오페아",
	72: "스카너",
	74: "하이머딩거",
	75: "나서스",
	76: "니달리",
	77: "우디르",
	78: "뽀삐",
	79: "그라가스",
	80: "판테온",
	81: "이즈리얼",
	82: "모데카이저",
	83: "요릭",
	84: "아칼리",
	85: "케넨",
	86: "가렌",
	89: "레오나",
	90: "말자하",
	91: "탈론",
	92: "리븐",
	96: "코그모",
	98: "쉔",
	99: "럭스",
	101: "제라스",
	102: "쉬바나",
	103: "아리",
	104: "그레이브즈",
	105: "피즈",
	106: "볼리베어",
	107: "렝가",
	110: "베인",
	111: "노틸러스",
	112: "빅토르",
	113: "세주아니",
	114: "피오라",
	115: "지글러",
	117: "룰루",
	119: "드레이븐",
	120: "헤카림",
	121: "카직스",
	122: "다리우스",
	126: "제이스",
	127: "리산드라",
	131: "다이애나",
	133: "퀸",
	134: "신드라",
	136: "오른",
	141: "케인",
	142: "아지르",
	143: "자이라",
	145: "카이사",
	147: "세라핀",
	150: "나르",
	154: "자크",
	157: "야스오",
	161: "벨코즈",
	163: "탈리야",
	164: "카밀",
	166: "아크샨",
	200: "킨드레드",
	201: "브라움",
	202: "진",
	203: "킨드레드",
	222: "징크스",
	223: "타릭",
	234: "비에고",
	235: "세나",
	236: "루시안",
	238: "제드",
	240: "클레드",
	245: "에코",
	254: "바이",
	266: "아트록스",
	267: "나미",
	268: "아지르",
	412: "쓰레쉬",
	// 자주 사용되는 챔피언들만 매핑, 실제로는 Riot API의 챔피언 데이터를 사용해야 함
};

// API 키를 가져오는 함수 (실행 시점에 환경변수 확인)
function getApiKey(): string {
	const apiKey = process.env.RIOT_API_KEY;
	if (!apiKey) {
		console.error("RIOT_API_KEY가 설정되지 않았습니다.");
		console.log(
			"현재 환경변수들:",
			Object.keys(process.env).filter((key) => key.includes("RIOT"))
		);
		throw new Error("RIOT_API_KEY가 설정되지 않았습니다. .env.local 파일에 RIOT_API_KEY를 추가해주세요.");
	}
	console.log("API 키 길이:", apiKey.length);
	return apiKey;
}

// 계정 정보 조회 (닉네임#태그로 PUUID 가져오기)
export async function getAccountByRiotId(gameName: string, tagLine: string): Promise<RiotAccount> {
	console.log(`계정 조회 시도: ${gameName}#${tagLine}`);

	const url = `https://asia.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
	console.log("Account API URL:", url);

	const response = await fetch(url, {
		headers: {
			"X-Riot-Token": getApiKey(),
		},
	});

	console.log("Account API 응답 상태:", response.status);

	if (!response.ok) {
		const errorText = await response.text();
		console.error("Account API 에러 응답:", errorText);
		throw new Error(`계정을 찾을 수 없습니다: ${response.status} - ${errorText}`);
	}

	const data = await response.json();
	console.log("Account API 응답 데이터:", data);
	return data;
}

// 소환사 정보 조회 (PUUID로 소환사 정보 가져오기)
export async function getSummonerByPuuid(puuid: string): Promise<RiotSummoner> {
	console.log("소환사 조회 시도:", puuid);

	const url = `https://kr.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`;
	console.log("Summoner API URL:", url);

	const response = await fetch(url, {
		headers: {
			"X-Riot-Token": getApiKey(),
		},
	});

	console.log("Summoner API 응답 상태:", response.status);

	if (!response.ok) {
		const errorText = await response.text();
		console.error("Summoner API 에러 응답:", errorText);
		throw new Error(`소환사 정보를 가져올 수 없습니다: ${response.status} - ${errorText}`);
	}

	const data = await response.json();
	console.log("Summoner API 응답 데이터:", data);
	return data;
}

// 랭크 정보 조회
export async function getRankBySummonerId(summonerId: string): Promise<RiotRank[]> {
	const response = await fetch(`https://kr.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}`, {
		headers: {
			"X-Riot-Token": getApiKey(),
		},
	});

	if (!response.ok) {
		throw new Error(`랭크 정보를 가져올 수 없습니다: ${response.status}`);
	}

	return response.json();
}

// 챔피언 숙련도 조회
export async function getChampionMasteryBySummonerId(summonerId: string): Promise<ChampionMastery[]> {
	const response = await fetch(`https://kr.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/${summonerId}`, {
		headers: {
			"X-Riot-Token": getApiKey(),
		},
	});

	if (!response.ok) {
		throw new Error(`챔피언 숙련도 정보를 가져올 수 없습니다: ${response.status}`);
	}

	return response.json();
}

// 챔피언별 주요 포지션 매핑
const championRoleMap: { [key: number]: string } = {
	// Top 라이너들
	1: "Mid", // 애니
	3: "Mid", // 갈리오
	86: "Top", // 가렌
	122: "Top", // 다리우스
	126: "Top", // 제이스
	24: "Top", // 잭스
	58: "Top", // 레넥톤
	92: "Top", // 리븐
	266: "Top", // 아트록스
	150: "Top", // 나르
	164: "Top", // 카밀
	114: "Top", // 피오라

	// 정글러들
	64: "Jungle", // 리 신
	121: "Jungle", // 카직스
	104: "Jungle", // 그레이브즈
	60: "Jungle", // 엘리스
	77: "Jungle", // 우디르
	56: "Jungle", // 녹턴
	120: "Jungle", // 헤카림
	254: "Jungle", // 바이
	141: "Jungle", // 케인
	200: "Jungle", // 킨드레드

	// 미드 라이너들
	103: "Mid", // 아리
	157: "Mid", // 야스오
	238: "Mid", // 제드
	91: "Mid", // 탈론
	84: "Mid", // 아칼리
	99: "Mid", // 럭스
	61: "Mid", // 오리아나
	131: "Mid", // 다이애나
	245: "Mid", // 에코
	134: "Mid", // 신드라

	// ADC들
	22: "ADC", // 애쉬
	51: "ADC", // 케이틀린
	222: "ADC", // 징크스
	67: "ADC", // 베인
	21: "ADC", // 미스 포츈
	81: "ADC", // 이즈리얼
	119: "ADC", // 드레이븐
	202: "ADC", // 진
	145: "ADC", // 카이사
	236: "ADC", // 루시안

	// 서포터들
	412: "Support", // 쓰레쉬
	25: "Support", // 모르가나
	89: "Support", // 레오나
	37: "Support", // 소나
	16: "Support", // 소라카
	53: "Support", // 블리츠크랭크
	111: "Support", // 노틸러스
	117: "Support", // 룰루
	201: "Support", // 브라움
	267: "Support", // 나미
	235: "Support", // 세나
};

// 포지션을 추정하는 함수 (챔피언 기반)
function estimateMainRole(championMasteries: ChampionMastery[]): string {
	if (!championMasteries.length) {
		return "Mid"; // 기본값
	}

	// 가장 숙련도가 높은 챔피언들을 확인하여 포지션 추정
	const topChampions = championMasteries.slice(0, 3); // 상위 3개 챔피언
	const roleCounts: { [key: string]: number } = {};

	topChampions.forEach((mastery) => {
		const role = championRoleMap[mastery.championId];
		if (role) {
			roleCounts[role] = (roleCounts[role] || 0) + 1;
		}
	});

	// 가장 많이 나온 포지션 반환
	const mostPlayedRole = Object.entries(roleCounts).reduce((a, b) => (roleCounts[a[0]] > roleCounts[b[0]] ? a : b))?.[0];

	return mostPlayedRole || "Mid"; // 찾지 못하면 기본값
}

// 플레이어 데이터를 종합적으로 가져오는 함수
export async function getPlayerData(gameName: string, tagLine: string) {
	try {
		// 1. 계정 정보 조회
		const account = await getAccountByRiotId(gameName, tagLine);

		// 2. 소환사 정보 조회
		const summoner = await getSummonerByPuuid(account.puuid);

		// 3. 랭크 정보 조회
		const ranks = await getRankBySummonerId(summoner.id);
		const soloRank = ranks.find((rank) => rank.queueType === "RANKED_SOLO_5x5");

		// 4. 챔피언 숙련도 조회
		const masteries = await getChampionMasteryBySummonerId(summoner.id);
		const topMastery = masteries[0]; // 가장 숙련도가 높은 챔피언

		// 티어 이름 매핑 (Riot API -> UI)
		const tierMapping: { [key: string]: string } = {
			IRON: "Iron",
			BRONZE: "Bronze",
			SILVER: "Silver",
			GOLD: "Gold",
			PLATINUM: "Platinum",
			EMERALD: "Emerald",
			DIAMOND: "Diamond",
			MASTER: "Master",
			GRANDMASTER: "Grandmaster",
			CHALLENGER: "Challenger",
			UNRANKED: "Unranked",
		};

		// 데이터 정리
		const rawTier = soloRank?.tier || "UNRANKED";
		const tier = tierMapping[rawTier] || "Unranked";
		const rank = soloRank?.rank || "";
		const wins = soloRank?.wins || 0;
		const losses = soloRank?.losses || 0;
		const winRate = wins + losses > 0 ? Math.round((wins / (wins + losses)) * 100) : 0;
		const mainChampion = championMap[topMastery?.championId] || "알 수 없음";
		const mainRole = estimateMainRole(masteries);

		return {
			tier,
			rank,
			mainRole,
			mainChampion,
			winRate,
			isSearched: true,
		};
	} catch (error) {
		console.error("플레이어 데이터 조회 중 오류:", error);
		throw error;
	}
}
