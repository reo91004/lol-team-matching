import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	console.log("테스트 API 호출됨");
	console.log("환경변수 확인:", {
		hasRiotApiKey: !!process.env.RIOT_API_KEY,
		riotApiKeyLength: process.env.RIOT_API_KEY?.length || 0,
		nodeEnv: process.env.NODE_ENV,
	});

	// 간단한 API 키 테스트 - LoL 서버 상태 확인 (API 키 필요 없음)
	try {
		const response = await fetch("https://kr.api.riotgames.com/lol/status/v4/platform-data");
		const data = await response.json();

		console.log("서버 상태 API 응답:", response.status);

		return NextResponse.json({
			success: true,
			serverStatus: data,
			apiKeyPresent: !!process.env.RIOT_API_KEY,
			apiKeyLength: process.env.RIOT_API_KEY?.length,
		});
	} catch (error) {
		console.error("서버 상태 확인 실패:", error);
		return NextResponse.json({
			success: false,
			error: String(error),
			apiKeyPresent: !!process.env.RIOT_API_KEY,
		});
	}
}
