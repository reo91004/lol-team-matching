import { NextResponse } from "next/server";

export async function GET() {
	const apiKey = process.env.RIOT_API_KEY;

	if (!apiKey) {
		return NextResponse.json({ error: "API 키가 없습니다" }, { status: 500 });
	}

	try {
		// 가장 간단한 API 호출 - 챔피언 목록 조회 (매우 안정적)
		console.log("API 키 테스트 시작");
		console.log("API 키 앞 10자리:", apiKey.substring(0, 10));
		console.log("API 키 길이:", apiKey.length);
		console.log("RGAPI- 시작 여부:", apiKey.startsWith("RGAPI-"));

		const response = await fetch("https://ddragon.leagueoflegends.com/cdn/13.24.1/data/ko_KR/champion.json");
		const data = await response.json();

		console.log("챔피언 데이터 API 응답:", response.status);

		// 이제 실제 Riot API로 간단한 테스트
		const riotResponse = await fetch("https://kr.api.riotgames.com/lol/platform/v3/champion-rotations", {
			headers: {
				"X-Riot-Token": apiKey,
			},
		});

		console.log("Riot API 응답 상태:", riotResponse.status);

		if (riotResponse.ok) {
			const riotData = await riotResponse.json();
			return NextResponse.json({
				success: true,
				message: "API 키가 정상 작동합니다",
				championRotation: riotData,
				apiKeyValid: true,
			});
		} else {
			const errorText = await riotResponse.text();
			console.error("Riot API 에러:", errorText);
			return NextResponse.json({
				success: false,
				message: "API 키 테스트 실패",
				error: errorText,
				status: riotResponse.status,
			});
		}
	} catch (error) {
		console.error("API 테스트 에러:", error);
		return NextResponse.json({
			success: false,
			error: String(error),
		});
	}
}
