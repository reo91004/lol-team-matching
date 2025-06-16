import { NextRequest, NextResponse } from "next/server";
import { getPlayerData } from "@/lib/riot-api";

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const gameName = searchParams.get("gameName");
	const tagLine = searchParams.get("tagLine");

	console.log("API 요청:", { gameName, tagLine });
	console.log("API 키 존재 여부:", !!process.env.RIOT_API_KEY);

	if (!gameName || !tagLine) {
		return NextResponse.json({ error: "게임 이름과 태그가 필요합니다." }, { status: 400 });
	}

	if (!process.env.RIOT_API_KEY) {
		console.error("RIOT_API_KEY가 설정되지 않았습니다.");
		return NextResponse.json({ error: "API 키가 설정되지 않았습니다." }, { status: 500 });
	}

	try {
		const playerData = await getPlayerData(gameName, tagLine);
		console.log("플레이어 데이터 조회 성공:", playerData);
		return NextResponse.json(playerData);
	} catch (error) {
		console.error("API 오류 상세:", error);

		// 에러 타입에 따른 구체적인 응답
		if (error instanceof Error) {
			if (error.message.includes("404")) {
				return NextResponse.json({ error: "소환사를 찾을 수 없습니다. 닉네임과 태그를 확인해주세요." }, { status: 404 });
			} else if (error.message.includes("403")) {
				return NextResponse.json({ error: "API 키가 유효하지 않습니다." }, { status: 403 });
			} else if (error.message.includes("429")) {
				return NextResponse.json({ error: "API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요." }, { status: 429 });
			}
		}

		return NextResponse.json({ error: "플레이어 데이터를 가져올 수 없습니다.", details: error instanceof Error ? error.message : String(error) }, { status: 500 });
	}
}
